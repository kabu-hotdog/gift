# Download and install the Google Fonts used in flyer-knowhow.md §7.5 (per-user, no admin rights needed).
# Usage: powershell -File scripts/install-fonts.ps1
# Usage (subset): powershell -File scripts/install-fonts.ps1 -Names "Klee One SemiBold","Yomogi"

param(
    [string[]]$Names
)

$fonts = @(
    @{ Name = "Shippori Mincho";      File = "ShipporiMincho-Regular.ttf";   Url = "https://raw.githubusercontent.com/google/fonts/main/ofl/shipporimincho/ShipporiMincho-Regular.ttf" },
    @{ Name = "Klee One SemiBold";    File = "KleeOne-SemiBold.ttf";         Url = "https://raw.githubusercontent.com/google/fonts/main/ofl/kleeone/KleeOne-SemiBold.ttf" },
    @{ Name = "Yomogi";               File = "Yomogi-Regular.ttf";          Url = "https://raw.githubusercontent.com/google/fonts/main/ofl/yomogi/Yomogi-Regular.ttf" },
    @{ Name = "Great Vibes";          File = "GreatVibes-Regular.ttf";      Url = "https://raw.githubusercontent.com/google/fonts/main/ofl/greatvibes/GreatVibes-Regular.ttf" },
    @{ Name = "Dela Gothic One";      File = "DelaGothicOne-Regular.ttf";   Url = "https://raw.githubusercontent.com/google/fonts/main/ofl/delagothicone/DelaGothicOne-Regular.ttf" },
    @{ Name = "Zen Maru Gothic";      File = "ZenMaruGothic-Regular.ttf";   Url = "https://raw.githubusercontent.com/google/fonts/main/ofl/zenmarugothic/ZenMaruGothic-Regular.ttf" },
    @{ Name = "Zen Kaku Gothic New";  File = "ZenKakuGothicNew-Regular.ttf";Url = "https://raw.githubusercontent.com/google/fonts/main/ofl/zenkakugothicnew/ZenKakuGothicNew-Regular.ttf" }
)

if ($Names) {
    $fonts = $fonts | Where-Object { $Names -contains $_.Name }
}

$fontDir = Join-Path $env:LOCALAPPDATA "Microsoft\Windows\Fonts"
if (-not (Test-Path $fontDir)) { New-Item -ItemType Directory -Force -Path $fontDir | Out-Null }
$regPath = "HKCU:\Software\Microsoft\Windows NT\CurrentVersion\Fonts"

foreach ($f in $fonts) {
    $dest = Join-Path $fontDir $f.File
    Write-Output "Downloading $($f.Name)..."
    Invoke-WebRequest -Uri $f.Url -OutFile $dest -UseBasicParsing

    # Register per-user (no admin needed). Value name must match the font's actual family name.
    $regName = "$($f.Name) (TrueType)"
    New-ItemProperty -Path $regPath -Name $regName -Value $dest -PropertyType String -Force | Out-Null
    Write-Output "Installed: $($f.Name) -> $dest"
}

Write-Output ""
Write-Output "Done. Restart PowerPoint (and Claude Code if it's running) for the new fonts to be picked up."
Write-Output "If a font doesn't appear, log off/on once - some apps only re-read HKCU font registrations at logon."
