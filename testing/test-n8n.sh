#!/bin/bash
# Test n8n webhooks

echo "Testing n8n content endpoint..."
curl -i "http://localhost:5678/webhook/myapp/v1/content"

echo -e "\n\nTesting n8n form submission endpoint..."
curl -i -X POST \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","message":"This is a test"}' \
  "http://localhost:5678/webhook/myapp/v1/form-submission"

echo -e "\n\nTesting n8n menu endpoint..."
curl -i "http://localhost:5678/webhook/myapp/v1/menu"
