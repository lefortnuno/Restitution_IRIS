@echo off

set ACCESS_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxODAzNTAyNDcxLCJpYXQiOjE3NzE5NjY0NzEsImp0aSI6IjMxYTQ3NTNjMTZiMjQxODRhYjZhMjY3NjU2MjRhMGZjIiwidXNlcl9pZCI6MX0.ZA5BKfDopdbbl4KYD0PLLF15TibAXnbCuh6KPZyWbLg

powershell -NoProfile -ExecutionPolicy Bypass -Command "$token = '%ACCESS_TOKEN%'; $data = Get-Content restt.json | ConvertFrom-Json; foreach ($item in $data) { $json = $item | ConvertTo-Json -Depth 20; Invoke-RestMethod -Uri 'http://192.168.56.1:1234/api/restitutions/' -Method Post -Headers @{ Authorization = \"Bearer $token\" } -ContentType 'application/json' -Body $json }"

pause