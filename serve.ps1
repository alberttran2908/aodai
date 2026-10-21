# Minimal static file server for local testing (no Node/Python needed)
# Usage: powershell -ExecutionPolicy Bypass -File serve.ps1 [-Port 8080]
# Also accepts POST /upload?path=assets/... with a base64 body (dev tool for importing generated art).
param([int]$Port = 8080)
$root = $PSScriptRoot
$assets = [IO.Path]::GetFullPath((Join-Path $root 'assets'))
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Host "Serving $root at http://localhost:$Port/"
$types = @{ '.html' = 'text/html; charset=utf-8'; '.js' = 'text/javascript; charset=utf-8'; '.css' = 'text/css'; '.png' = 'image/png'; '.jpg' = 'image/jpeg'; '.jpeg' = 'image/jpeg'; '.webp' = 'image/webp'; '.json' = 'application/json'; '.svg' = 'image/svg+xml'; '.md' = 'text/plain; charset=utf-8' }
while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  $req = $ctx.Request; $res = $ctx.Response
  $res.Headers.Add('Access-Control-Allow-Origin', '*')
  $res.Headers.Add('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  $res.Headers.Add('Access-Control-Allow-Headers', '*')
  $res.Headers.Add('Access-Control-Allow-Private-Network', 'true')
  try {
    if ($req.HttpMethod -eq 'OPTIONS') { $res.StatusCode = 204 }
    elseif ($req.Url.AbsolutePath -eq '/__assets') {
      $files = @(); if (Test-Path $assets) { $files = Get-ChildItem $assets -Recurse -File | ForEach-Object { 'assets/' + $_.FullName.Substring($assets.Length + 1).Replace('\', '/') } }
      $msg = [Text.Encoding]::UTF8.GetBytes((ConvertTo-Json @($files) -Compress))
      $res.ContentType = 'application/json'; $res.Headers.Add('Cache-Control', 'no-store')
      $res.OutputStream.Write($msg, 0, $msg.Length)
    }
    elseif ($req.HttpMethod -eq 'POST' -and $req.Url.AbsolutePath -eq '/upload') {
      $rel = $req.QueryString['path']
      $dest = [IO.Path]::GetFullPath((Join-Path $root $rel))
      if (-not $dest.StartsWith($assets + [IO.Path]::DirectorySeparatorChar)) { $res.StatusCode = 403 }
      else {
        $reader = New-Object IO.StreamReader($req.InputStream)
        $b64 = $reader.ReadToEnd() -replace '^data:[^,]*,', ''
        $bytes = [Convert]::FromBase64String($b64)
        New-Item -ItemType Directory -Force (Split-Path $dest) | Out-Null
        [IO.File]::WriteAllBytes($dest, $bytes)
        Write-Host "Saved $rel ($($bytes.Length) bytes)"
        $msg = [Text.Encoding]::UTF8.GetBytes("ok $($bytes.Length)")
        $res.OutputStream.Write($msg, 0, $msg.Length)
      }
    } else {
      $path = [Uri]::UnescapeDataString($req.Url.AbsolutePath.TrimStart('/'))
      if ($path -eq '') { $path = 'index.html' }
      $file = [IO.Path]::GetFullPath((Join-Path $root $path))
      if ($file.StartsWith($root) -and (Test-Path $file -PathType Leaf)) {
        $bytes = [IO.File]::ReadAllBytes($file)
        $ext = [IO.Path]::GetExtension($file).ToLower()
        $res.ContentType = if ($types.ContainsKey($ext)) { $types[$ext] } else { 'application/octet-stream' }
        $res.Headers.Add('Cache-Control', 'no-store')
        $res.OutputStream.Write($bytes, 0, $bytes.Length)
      } else { $res.StatusCode = 404 }
    }
  } catch { $res.StatusCode = 500; Write-Host $_ }
  $res.Close()
}
