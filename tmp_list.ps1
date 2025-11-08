$wc = Get-Content -LiteralPath 'app\trips\new\page.tsx'; $wc | Select-Object -First 300 | ForEach-Object { $_ };
