// Vải cộng đồng: reads the "vai-cong-dong" GitHub Discussions category and publishes every post that has
// enough votes AND the maintainer's approval label into community/ (the picture + community/fabrics.json),
// which the game loads at start. Run by .github/workflows/community-fabrics.yml (Node 20, no packages).
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises';

const { GITHUB_TOKEN, REPO } = process.env;
const MIN_VOTES = Number(process.env.MIN_VOTES || 10);
const APPROVE = process.env.APPROVE_LABEL || 'duyet';
const CATEGORY = 'vai-cong-dong';
const OUT = 'community';
const MAX_BYTES = 4 * 1024 * 1024;
const [owner, name] = (REPO || '').split('/');
if (!GITHUB_TOKEN || !owner || !name) { console.error('Need GITHUB_TOKEN and REPO=owner/name'); process.exit(1); }

async function gql(query, variables) {
  const r = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: `bearer ${GITHUB_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables })
  });
  const j = await r.json();
  if (j.errors) throw new Error(JSON.stringify(j.errors));
  return j.data;
}

// ---- the posts ----
const cats = await gql(`query($o:String!,$n:String!){repository(owner:$o,name:$n){discussionCategories(first:50){nodes{id slug}}}}`, { o: owner, n: name });
const cat = cats.repository.discussionCategories.nodes.find((c) => c.slug === CATEGORY);
if (!cat) { console.log(`No "${CATEGORY}" category yet — nothing to publish.`); process.exit(0); }

const posts = [];
for (let after = null; ;) {
  const d = await gql(`query($o:String!,$n:String!,$c:ID!,$a:String){repository(owner:$o,name:$n){discussions(first:50,after:$a,categoryId:$c){
    pageInfo{hasNextPage endCursor}
    nodes{number title url body upvoteCount author{login} labels(first:20){nodes{name}} reactions(content:THUMBS_UP){totalCount}}}}}`,
  { o: owner, n: name, c: cat.id, a: after });
  const page = d.repository.discussions;
  posts.push(...page.nodes);
  if (!page.pageInfo.hasNextPage) break;
  after = page.pageInfo.endCursor;
}

// ---- what a post must carry ----
const SETTING = /```aodai-fabric\s*([\s\S]*?)```/;
const IMAGE = [
  /(https:\/\/github\.com\/user-attachments\/assets\/[0-9a-f-]+)/i,
  /!\[[^\]]*\]\((https:\/\/[^)\s]+)\)/,
  /<img[^>]+src="(https:\/\/[^"]+)"/i
];
const IMG_HOST = /^https:\/\/([\w-]+\.)*(github\.com|githubusercontent\.com)\//i;
function setting(body) {
  const m = SETTING.exec(body || ''); if (!m) return null;
  try {
    const s = JSON.parse(m[1]);
    const ok = /^[a-z]+$/.test(s.m) && /^[a-z]+$/.test(s.b) && ['full', 'tint'].includes(s.c) && ['deu', 'guong'].includes(s.l) && [0, 1, 2].includes(s.z);
    return ok ? { m: s.m, b: s.b, c: s.c, l: s.l, z: s.z } : null; // the game checks names again
  } catch (e) { return null; }
}
function imageUrl(body) { for (const re of IMAGE) { const m = re.exec(body || ''); if (m && IMG_HOST.test(m[1])) return m[1]; } return null; }
// sniff the real file type from its first bytes (never trust the header alone)
function kind(buf) {
  if (buf[0] === 0xff && buf[1] === 0xd8) return 'jpg';
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return 'png';
  if (buf.slice(0, 4).toString() === 'RIFF' && buf.slice(8, 12).toString() === 'WEBP') return 'webp';
  return null;
}
async function download(url) {
  const r = await fetch(url, { headers: { Authorization: `token ${GITHUB_TOKEN}` }, redirect: 'follow' });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const buf = Buffer.from(await r.arrayBuffer());
  if (buf.length > MAX_BYTES) throw new Error('too large');
  const ext = kind(buf); if (!ext) throw new Error('not a PNG/JPEG/WebP image');
  return { buf, ext };
}

// ---- publish ----
await mkdir(OUT, { recursive: true });
const have = new Set(await readdir(OUT));
const list = [], keep = new Set(['fabrics.json', 'README.md']);
for (const p of posts) {
  const votes = Math.max(p.upvoteCount || 0, p.reactions.totalCount || 0);
  const approved = p.labels.nodes.some((l) => l.name === APPROVE);
  if (!approved || votes < MIN_VOTES) continue;
  const d = setting(p.body), url = imageUrl(p.body);
  if (!d || !url) { console.log(`#${p.number}: missing settings block or picture — skipped`); continue; }
  let file = [...have].find((f) => f.startsWith(`${p.number}.`));
  if (!file) {
    try { const { buf, ext } = await download(url); file = `${p.number}.${ext}`; await writeFile(`${OUT}/${file}`, buf); }
    catch (e) { console.log(`#${p.number}: ${e.message} — skipped`); continue; }
  }
  keep.add(file);
  list.push({ id: p.number, file, title: p.title.replace(/^Vải:\s*/i, '').slice(0, 48), author: p.author ? p.author.login : '', votes, url: p.url, d });
}
// pictures of posts that lost their approval leave the game too
for (const f of have) if (!keep.has(f)) await rm(`${OUT}/${f}`);
list.sort((a, b) => b.votes - a.votes);
await writeFile(`${OUT}/fabrics.json`, JSON.stringify(list, null, 1) + '\n');
console.log(`Published ${list.length} community fabric(s).`);
