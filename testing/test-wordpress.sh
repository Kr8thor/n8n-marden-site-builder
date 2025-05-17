#!/bin/bash
# Test WordPress endpoints

echo "Testing WordPress content endpoint..."
curl -i "https://cms.mardenseo.com/wp-json/myapp/v1/content" 

echo -e "\n\nTesting WordPress form submission endpoint..."
curl -i -X POST \
  -H "Content-Type: application/json" \
  -H "X-API-SECRET: marden-api-secret" \
  -d '{"name":"Test User","email":"test@example.com","message":"This is a test"}' \
  "https://cms.mardenseo.com/wp-json/myapp/v1/form-submission"

echo -e "\n\nTesting WordPress menu endpoint..."
curl -i "https://cms.mardenseo.com/wp-json/myapp/v1/menu"
