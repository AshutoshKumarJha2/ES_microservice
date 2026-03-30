function Wait-ForService($url) {
    Write-Host "Waiting for $url ..."
    do {
        try {
            $response = Invoke-WebRequest $url -UseBasicParsing -TimeoutSec 5
            $status = $response.StatusCode
        } catch {
            $status = 0
        }
        if ($status -ne 200) {
            Write-Host "Service not yet ready.....retrying in 5 seconds"
            Start-Sleep -Seconds 5
        }
    } while ($status -ne 200)
    Write-Host "Service at $url is UP"
}

$root = "$($PWD.Path)\backend"
$first = $true

function Start-Service($title, $folder) {
    $path = "$root\$folder"

    # Write a small launcher script into the service folder
    $launcher = "$path\~launch.ps1"
    Set-Content -Path $launcher -Value "Set-Location '$path'; .\mvnw spring-boot:run"

    if ($script:first) {
        wt new-tab --title $title powershell -NoExit -File $launcher
        $script:first = $false
        Start-Sleep -Seconds 2
    } else {
        wt --window 0 new-tab --title $title powershell -NoExit -File $launcher
    }
}

Write-Host "Starting Eureka....."
Start-Service "Eureka Server" "service-registry"
Wait-ForService "http://localhost:6969/actuator/health"

Write-Host "Starting Config Server....."
Start-Service "Config Server" "config-server"
Wait-ForService "http://localhost:6971/actuator/health"

Write-Host "Starting Api Gateway....."
Start-Service "Api Gateway" "api-gateway"

Write-Host "Starting Auth Manager....."
Start-Service "Auth Manager" "auth-manager"

Write-Host "Starting Event Manager....."
Start-Service "Event Manager" "event-manager"

Write-Host "Starting Expense Manager....."
Start-Service "Expense Manager" "expense-manager"

Write-Host "Starting Log Manager....."
Start-Service "Log Manager" "log-manager"

Write-Host "Starting Engagement Manager....."
Start-Service "Engagement Manager" "engagement-manager"

Write-Host "Starting Vendor Manager....."
Start-Service "Vendor Manager" "vendor-manager"

Write-Host "Starting Venue Manager....."
Start-Service "Venue Manager" "venue-manager"