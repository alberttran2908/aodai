# Move images downloaded as "aodai__<name>" from Downloads into the game's assets folders.
# motif_*.png -> motifs, other .png -> placements, .jpg -> textures (originals in assets_src/),
# then rebuilds the web-sized copies in assets/.
# Duplicate "(1)" copies are discarded.
$src = Join-Path $env:USERPROFILE 'Downloads'
$root = Split-Path $PSScriptRoot -Parent
foreach ($f in Get-ChildItem $src -Filter 'aodai__*') {
  if ($f.Name -match '\(\d+\)') { Remove-Item $f.FullName -Confirm:$false; continue }
  $name = $f.Name.Substring(7)
  if ($name.StartsWith('motif_')) { $dir = 'assets_src\motifs'; $name = $name.Substring(6) }
  elseif ($f.Extension -eq '.png') { $dir = 'assets_src\placements' }
  else { $dir = 'assets_src\textures' }
  $destDir = Join-Path $root $dir
  New-Item -ItemType Directory -Force $destDir | Out-Null
  Move-Item $f.FullName (Join-Path $destDir $name) -Force
  Write-Output "$dir\$name"
}
& (Join-Path $PSScriptRoot 'optimize-assets.ps1')
