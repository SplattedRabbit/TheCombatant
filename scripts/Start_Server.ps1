# Start_Server.ps1
# Ein installationsfreier Webserver für Windows (Nutzt natives PowerShell)

$port = 8080
$url = "http://localhost:$port/"
$projectRoot = Split-Path $PSScriptRoot -Parent

# Lokale Netzwerk-IPs ermitteln (ohne 127.0.0.1)
$ips = [System.Net.Dns]::GetHostAddresses([System.Net.Dns]::GetHostName()) | 
    Where-Object { $_.AddressFamily -eq 'InterNetwork' } | 
    Select-Object -ExpandProperty IPAddressToString |
    Where-Object { $_ -notmatch '^127\.' }

Clear-Host
Write-Host "===================================================" -ForegroundColor Yellow
Write-Host "   🏰 D&D 3.5e Combat App Web Server (Zero-Install)  " -ForegroundColor Yellow
Write-Host "===================================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "Der Webserver wird gestartet..." -ForegroundColor Green
Write-Host "Lokale Adresse: $url" -ForegroundColor Cyan
if ($ips) {
    Write-Host "Netzwerk-Adressen (für dein Tablet im selben WLAN):" -ForegroundColor Yellow
    foreach ($ip in $ips) {
        Write-Host "  👉 http://${ip}:${port}/" -ForegroundColor Cyan
    }
}
Write-Host "Tipp: Schliesse dieses Fenster, um den Server zu STOPPEN." -ForegroundColor DarkGray
Write-Host ""

# HTTP-Listener initialisieren
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($url)

# Versuche die Netzwerk-IPs als Listener-Präfixe zu registrieren
if ($ips) {
    foreach ($ip in $ips) {
        try {
            $listener.Prefixes.Add("http://${ip}:${port}/")
        } catch {
            # Berechtigungseinschränkung ignorieren, wir informieren den Nutzer beim Startfehler
        }
    }
}

try {
    $listener.Start()
} catch {
    Write-Host "[FEHLER] Konnte den Server nicht starten!" -ForegroundColor Red
    Write-Host "Falls eine Berechtigung fehlt (Access Denied), starte diese Batch-Datei bitte" -ForegroundColor Yellow
    Write-Host "einmal per Rechtsklick -> 'Als Administrator ausführen'." -ForegroundColor Yellow
    Write-Host "Oder Port $port ist bereits belegt (z. B. durch eine andere Instanz)." -ForegroundColor Red
    Write-Host ""
    Read-Host "Drücke Enter zum Beenden..."
    exit 1
}

# Browser automatisch öffnen
try {
    Start-Process $url
} catch {
    Write-Host "Konnte Browser nicht automatisch öffnen. Bitte surfe manuell zu: $url" -ForegroundColor Yellow
}

Write-Host "Server läuft und wartet auf Anfragen..." -ForegroundColor Green
Write-Host ""

# Request-Handler-Schleife
while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        # Pfad dekodieren (z. B. Leerzeichen %20 wiederherstellen)
        $localPath = [System.Uri]::UnescapeDataString($request.Url.LocalPath)
        
        # Routing-Logik für React-Migration
        # Wenn root angefragt wird, liefere standardmäßig die React index-react.html aus dist/
        if ($localPath -eq "/") {
            $relativePath = "index-react.html"
        } else {
            $relativePath = $localPath.TrimStart('/')
        }
        
        # Prüfe zuerst, ob die Datei im dist/ Verzeichnis liegt (z. B. index-react.html oder assets/)
        $filePath = Join-Path $projectRoot "dist/$relativePath"
        if (!(Test-Path $filePath -PathType Leaf)) {
            # Fallback auf das Root-Verzeichnis (für spells, peerjs, manifest, etc.)
            $filePath = Join-Path $projectRoot $relativePath
        }

        if (Test-Path $filePath -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            
            # Korrekten MIME-Type setzen (wichtig für ES6 Module .js)
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $mime = switch ($ext) {
                ".html" { "text/html; charset=utf-8" }
                ".css"  { "text/css; charset=utf-8" }
                ".js"   { "application/javascript; charset=utf-8" }
                ".json" { "application/json; charset=utf-8" }
                ".png"  { "image/png" }
                ".jpg"  { "image/jpeg" }
                ".jpeg" { "image/jpeg" }
                ".svg"  { "image/svg+xml" }
                ".txt"  { "text/plain; charset=utf-8" }
                ".ico"  { "image/x-icon" }
                default { "application/octet-stream" }
            }
            
            $response.ContentType = $mime
            $response.Headers.Add("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
            $response.Headers.Add("Pragma", "no-cache")
            $response.Headers.Add("Expires", "0")
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
            Write-Host "[200 OK] $localPath" -ForegroundColor Green
        } else {
            $response.StatusCode = 404
            $errBytes = [System.Text.Encoding]::UTF8.GetBytes("Datei nicht gefunden: $localPath")
            $response.ContentType = "text/plain; charset=utf-8"
            $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
            Write-Host "[404 NOT FOUND] $localPath" -ForegroundColor Red
        }
        $response.OutputStream.Close()
    } catch {
        Write-Host "[WARN] Verbindungsfehler: $_" -ForegroundColor Yellow
        try {
            if ($null -ne $response) {
                $response.StatusCode = 500
                $errBytes = [System.Text.Encoding]::UTF8.GetBytes("Internal Server Error: $_")
                $response.ContentType = "text/plain; charset=utf-8"
                $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
                $response.OutputStream.Close()
            }
        } catch {
            # Ignorieren, falls die Verbindung bereits tot ist
        }
    }
}
