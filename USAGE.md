# Usage Guide for Marden Site Builder Workflow

This guide explains how to use the Marden Site Builder workflow to integrate WordPress with a frontend application.

## Prerequisites

1. An N8N instance (v1.0.0 or later)
2. WordPress with REST API enabled
3. JWT Authentication for WP REST API plugin installed and configured on your WordPress site

## Importing the Workflow

1. Download the `marden-site-builder-workflow.json` file from this repository
2. Go to your N8N instance
3. Click "Workflows" in the left sidebar
4. Click "Import from File" button
5. Select the downloaded JSON file
6. Click "Import" button

## Configuration

Before using the workflow, you need to configure the following:

### 1. WordPress Credentials

1. Go to the N8N dashboard
2. Click "Credentials" in the left sidebar
3. Click "New" button
4. Select "WordPress API"
5. Enter your WordPress site URL
6. Enter your WordPress username and password
7. Save the credentials
8. Update all WordPress nodes in the workflow to use these credentials

### 2. Shared Secret

The form submission endpoint uses a shared secret for security. You need to:

1. Choose a strong secret key
2. Update the "Validate Form Data" node with your secret key
3. Configure your frontend application to send this secret in the `x-api-secret` header

## Using the Endpoints

### Content Retrieval

```
GET /webhook/content?siteUrl=https://your-wordpress-site.com
```

This endpoint returns all posts with full content and metadata.

### Post Listing

```
GET /webhook/list-posts?siteUrl=https://your-wordpress-site.com&page=1&per_page=10&category=1
```

Parameters:
- `page`: Page number (default: 1)
- `per_page`: Posts per page (default: 10)
- `category`: Category ID for filtering (optional)

### Menu Retrieval

```
GET /webhook/get-menus?siteUrl=https://your-wordpress-site.com
```

Returns all menus and their items from WordPress.

### Authentication

```
POST /webhook/auth
```

Request body:
```json
{
  "siteUrl": "https://your-wordpress-site.com",
  "username": "your_username",
  "password": "your_password"
}
```

Returns a JWT token for authenticated requests.

### Token Validation

```
POST /webhook/auth/validate
```

Request headers:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

Request body:
```json
{
  "siteUrl": "https://your-wordpress-site.com",
  "token": "YOUR_JWT_TOKEN"
}
```

### Form Submission

```
POST /webhook/forms/submit
```

Request headers:
```
x-api-secret: YOUR_SHARED_SECRET
```

Request body:
```json
{
  "siteUrl": "https://your-wordpress-site.com",
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Hello there!"
}
```

### Content Synchronization

```
POST /webhook/sync-content
```

Request body:
```json
{
  "siteUrl": "https://your-wordpress-site.com",
  "frontendUrl": "https://your-frontend-app.com",
  "post_id": 123
}
```

This endpoint fetches the latest content for a specific post and triggers a cache invalidation on the frontend.

## Security Considerations

- Use HTTPS for all API endpoints
- Keep your JWT secret key secure
- Regularly rotate your shared secret
- Consider adding rate limiting to your N8N instance

## Troubleshooting

If you encounter issues:

1. Check the N8N execution logs
2. Verify your WordPress credentials
3. Ensure the JWT Authentication plugin is correctly configured
4. Check that all webhook paths are correctly configured

## Customization

You can extend this workflow by:

1. Adding more endpoints for different WordPress content types
2. Implementing custom authentication methods
3. Adding data transformation for specific frontend requirements
4. Integrating with additional services like email notifications