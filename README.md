# Marden Site Builder - N8N Workflow

This repository contains a complete N8N workflow for connecting a React+Vite frontend application to a WordPress backend. The workflow provides a set of API endpoints that make it easy to integrate WordPress content into any frontend application.

## Overview

The Marden site builder workflow implements the middleware layer between a React+Vite frontend and a WordPress backend, following the architecture described in the "The seamless mesh: n8n, React+Vite, and WordPress integration" document.

## Features

- **Content Retrieval**: Fetch WordPress posts and pages with proper formatting for the React frontend
- **Post Listing**: Get paginated lists of posts with filtering options
- **Menu Retrieval**: Get WordPress navigation menus in a hierarchical format
- **Authentication**: JWT-based authentication with token validation
- **Form Submission**: Secure form submission with validation
- **Content Synchronization**: Two-way content sync with cache invalidation

## Endpoints

### Content Endpoints

- `GET /webhook/content` - Get all posts with full content
- `GET /webhook/list-posts` - List posts with pagination and filtering
- `GET /webhook/get-menus` - Get WordPress menus
- `GET /webhook/post` - Get a single post by ID

### Authentication Endpoints

- `POST /webhook/auth` - Authenticate with WordPress
- `POST /webhook/auth/validate` - Validate JWT token

### Form Handling

- `POST /webhook/forms/submit` - Submit form data to WordPress

### Content Synchronization

- `POST /webhook/sync-content` - Sync content and invalidate frontend cache

## Implementation Details

The workflow implements several key features:

- **Authentication Flow**: JWT-based authentication with secure token handling
- **Content Transformation**: WordPress content is transformed into optimized JSON for the React frontend
- **Security Measures**: API key validation, form data sanitization, and rate limiting
- **Error Handling**: Comprehensive error handling for all API endpoints
- **Caching Strategy**: Cache-Control headers for improved performance

## Installation

1. Import the workflow JSON file into your N8N instance
2. Configure WordPress credentials in the workflow
3. Activate the workflow

## Configuration

You need to update the following credentials in the workflow:

1. `YOUR_WORDPRESS_CREDENTIAL_ID`: Set up WordPress credentials in n8n
2. `YOUR_SHARED_SECRET_HERE`: Configure a shared secret for form submissions
3. `YOUR_CONTENT_SYNC_API_KEY`: Set up an API key for content synchronization

## Requirements

- N8N v1.0.0 or later
- WordPress with REST API enabled
- JWT Authentication for WP REST API plugin
- Advanced Custom Fields (ACF) for exposing custom fields
- WP REST API Controller for fine-grained API endpoint control
- WP REST Cache for API performance optimization

## Maintenance

Regular maintenance should include:

- Updating WordPress credentials when they change
- Monitoring for any authentication or API errors
- Updating security tokens periodically
- Adding new endpoints as needed for additional functionality

## License

MIT