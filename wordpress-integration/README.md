# WordPress-React Integration n8n Workflow

This document describes the n8n workflow that serves as middleware for integrating a React frontend with a WordPress backend.

## Overview

The workflow provides API endpoints that the React frontend uses to interact with WordPress:

1. **Content API** - Retrieves posts and pages from WordPress
2. **Form Submission API** - Handles contact form submissions
3. **Authentication API** - Manages JWT authentication
4. **Menu API** - Retrieves the navigation menu structure

## Endpoints

### Content API Endpoint

**URL:** `/myapp/v1/content`  
**Method:** `GET`  
**Description:** Retrieves posts from WordPress, transforms the data for the frontend.

**Process Flow:**
1. Webhook receives request
2. WordPress node retrieves posts with embedded content (media, authors, terms)
3. Function node transforms the WordPress data into a frontend-friendly format
4. Response is returned with appropriate caching headers

### Form Submission API

**URL:** `/myapp/v1/form-submission`  
**Method:** `POST`  
**Description:** Validates and forwards form submissions to WordPress.

**Process Flow:**
1. Webhook receives form data
2. Function node validates the form data (required fields, email format)
3. If validation passes, request is forwarded to WordPress
4. Success or error response is returned

**Security Features:**
- API Secret validation
- Rate limiting (5 submissions per hour per IP)
- Input validation
- Error handling

### Authentication API

**URL:** `/myapp/v1/auth`  
**Method:** `POST`  
**Description:** Authenticates users with WordPress JWT.

**Process Flow:**
1. Webhook receives username/password
2. Request is forwarded to WordPress JWT authentication endpoint
3. If successful, JWT token is returned
4. Success or error response is returned

### Menu API Endpoint

**URL:** `/myapp/v1/menu`  
**Method:** `GET`  
**Description:** Retrieves menu structure from WordPress.

**Process Flow:**
1. Webhook receives request
2. Request is forwarded to WordPress menu endpoint
3. Function node formats the menu data for the frontend
4. Response is returned with caching headers

## Security Considerations

1. **API Secret** - All requests from the frontend include an API secret
2. **Rate Limiting** - Prevents abuse of the form submission endpoint
3. **CORS Headers** - Configured to allow only the specific frontend domain
4. **Input Validation** - All form data is validated before processing
5. **Error Handling** - Graceful error handling prevents exposing sensitive information

## Caching Strategy

1. **Content API** - 5-minute cache (Cache-Control: public, max-age=300)
2. **Menu API** - 15-minute cache (Cache-Control: public, max-age=900)
3. **Form and Auth APIs** - No caching (dynamic endpoints)

## Maintenance and Troubleshooting

### Common Issues

1. **WordPress Connection Fails**
   - Check WordPress credentials
   - Verify WordPress site is accessible
   - Check that WP REST API is properly configured

2. **Form Submissions Not Working**
   - Verify the custom endpoint is registered in WordPress
   - Check API secret configuration matches between n8n and frontend
   - Verify CORS headers allow the frontend domain

3. **Authentication Issues**
   - Ensure JWT Authentication plugin is installed and configured
   - Verify the WordPress JWT secret key configuration

### Monitoring

1. Monitor workflow execution logs in n8n
2. Check for rate limiting incidents
3. Review error responses for patterns

## Frontend Integration

The React frontend interacts with these endpoints using the `wordpress-integration.js` library, which handles:

1. API requests with appropriate headers
2. Error handling and retries
3. Caching on the client side
4. Authentication token management

## Emergency Procedures

In case of issues:

1. An emergency shutoff script is available (`wordpress-emergency-shutoff.js`)
2. The integration can be disabled from the admin panel (`?admin=true`)
3. Rate limits can be adjusted in the workflow