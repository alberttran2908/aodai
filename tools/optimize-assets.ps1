# Builds the web-sized images the game loads (assets/) from the full-size originals (assets_src/).
# Originals stay untouched in assets_src/ (not published). Run again after adding new images:
#   powershell -ExecutionPolicy Bypass -File tools\optimize-assets.ps1
Add-Type -AssemblyName System.Drawing
$root = Split-Path $PSScriptRoot -Parent
$src = Join-Path $root 'assets_src'
$dst = Join-Path $root 'assets'

# longest side per folder: textures become 512px tiles in the engine; motifs and appliqués are drawn small
$sizes = @{ textures = 512; motifs = 384; placements = 640 }
$jpeg = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$qual = New-Object System.Drawing.Imaging.EncoderParameters 1
$qual.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), 86L

foreach ($folder in $sizes.Keys) {
  $in = Join-Path $src $folder; $out = Join-Path $dst $folder
  if (-not (Test-Path $in)) { continue }
  New-Item -ItemType Directory -Force $out | Out-Null
  foreach ($f in Get-ChildItem $in -File -Include *.png, *.jpg -Recurse) {
    $img = [System.Drawing.Image]::FromFile($f.FullName)
    $k = [Math]::Min(1.0, $sizes[$folder] / [Math]::Max($img.Width, $img.Height))
    $w = [int][Math]::Round($img.Width * $k); $h = [int][Math]::Round($img.Height * $k)
    $bmp = New-Object System.Drawing.Bitmap $w, $h, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.DrawImage($img, 0, 0, $w, $h)
    $target = Join-Path $out $f.Name
    if ($f.Extension -eq '.jpg') { $bmp.Save($target, $jpeg, $qual) } else { $bmp.Save($target, [System.Drawing.Imaging.ImageFormat]::Png) }
    $g.Dispose(); $bmp.Dispose(); $img.Dispose()
    '{0,-28} {1,5:N0} KB -> {2,5:N0} KB' -f "$folder\$($f.Name)", ($f.Length / 1KB), ((Get-Item $target).Length / 1KB)
  }
}
