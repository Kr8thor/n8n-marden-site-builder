#!/bin/bash
# Test script for n8n WordPress integration webhooks

# Configuration
N8N_HOST="localhost:5678"
WORDPRESS_URL="https://cms.mardenseo.com"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Testing n8n WordPress Integration Webhooks${NC}"
echo "---------------------------------------"

# Test content API
echo -e "\n${YELLOW}Testing Content API:${NC}"
echo "GET http://$N8N_HOST/webhook/content?siteUrl=$WORDPRESS_URL"
CONTENT_RESPONSE=$(curl -s "http://$N8N_HOST/webhook/content?siteUrl=$WORDPRESS_URL")
if [[ $CONTENT_RESPONSE == *"error"* ]]; then
    echo -e "${RED}Content API test failed${NC}"
    echo "$CONTENT_RESPONSE"
else
    echo -e "${GREEN}Content API test successful${NC}"
    # Pretty print first 200 characters of JSON response
    echo "$CONTENT_RESPONSE" | head -c 200 | jq '.' 2>/dev/null || echo "$CONTENT_RESPONSE" | head -c 200
    echo "..."
fi

# Test form submission API
echo -e "\n${YELLOW}Testing Form Submission API:${NC}"
echo "POST http://$N8N_HOST/webhook/forms/submit"
FORM_DATA='{
    "name": "Test User",
    "email": "test@example.com",
    "message": "This is a test message",
    "siteUrl": "'"$WORDPRESS_URL"'"
}'
FORM_RESPONSE=$(curl -s -X POST "http://$N8N_HOST/webhook/forms/submit" \
    -H "Content-Type: application/json" \
    -d "$FORM_DATA")
if [[ $FORM_RESPONSE == *"error"* ]]; then
    echo -e "${RED}Form Submission API test failed${NC}"
    echo "$FORM_RESPONSE"
else
    echo -e "${GREEN}Form Submission API test successful${NC}"
    echo "$FORM_RESPONSE" | jq '.' 2>/dev/null || echo "$FORM_RESPONSE"
fi

# Test authentication API
echo -e "\n${YELLOW}Testing Authentication API:${NC}"
echo "POST http://$N8N_HOST/webhook/auth"
AUTH_DATA='{
    "username": "test_user",
    "password": "test_password",
    "siteUrl": "'"$WORDPRESS_URL"'"
}'
AUTH_RESPONSE=$(curl -s -X POST "http://$N8N_HOST/webhook/auth" \
    -H "Content-Type: application/json" \
    -d "$AUTH_DATA")
if [[ $AUTH_RESPONSE == *"error"* || $AUTH_RESPONSE == *"Unauthorized"* ]]; then
    echo -e "${RED}Authentication API test failed - this is expected with test credentials${NC}"
    echo "$AUTH_RESPONSE" | jq '.' 2>/dev/null || echo "$AUTH_RESPONSE"
else
    echo -e "${GREEN}Authentication API test successful${NC}"
    echo "$AUTH_RESPONSE" | jq '.' 2>/dev/null || echo "$AUTH_RESPONSE"
fi

echo -e "\n${YELLOW}Tests completed.${NC}"
echo "Note: Auth test is expected to fail with test credentials."
echo "Use valid WordPress credentials for a full test."
