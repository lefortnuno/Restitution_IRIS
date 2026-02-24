#!/bin/bash
 
echo "=== Inject Data ==="
TOKEN=$(curl -s -X POST http://localhost:8000/token/ \
-H "Content-Type: application/json" \
-d '{"username":"trofel","password":"Trofel.@#"}' | jq -r .access)

echo "Token OK"

jq -c '.[]' /home/ubuntu/aws_restitution/restt.json | while read row; do
    curl -s -X POST http://localhost:8000/api/restitutions/ \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "$row"
done

echo "=== DONE ==="