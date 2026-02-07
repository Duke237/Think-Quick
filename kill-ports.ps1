# Kill ports 5000 and 5001
Write-Host "Finding processes on ports 5000 and 5001..."

$ports = @(5000, 5001)

foreach ($port in $ports) {
    $process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($process) {
        $pid = $process.OwningProcess
        Write-Host "Killing process $pid on port $port"
        Stop-Process -Id $pid -Force
        Write-Host "Port $port is now free"
    } else {
        Write-Host "Port $port is already free"
    }
}

Write-Host "Done!"