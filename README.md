# n8n Marden Site Builder

This repository contains the n8n workflows for the Marden site integration project, implementing the middleware layer between a React+Vite frontend and a WordPress backend.

## Overview

The Marden site builder workflow provides a series of webhook endpoints that facilitate communication between the frontend and backend systems:

1. **Content Retrieval**: Fetch WordPress posts and pages with proper formatting for the React frontend
2. **Post Listing**: Get paginated lists of posts with filtering options
3. **Menu Retrieval**: Get WordPress navigation menus in a hierarchical format
4. **Authentication**: JWT-based authentication with token validation
5. **Form Submission**: Secure form submission with validation
6. **Content Synchronization**: Two-way content sync with cache invalidation

## Implementation Details

The workflow implements the architecture described in the "The seamless mesh: n8n, React+Vite, and WordPress integration" document, which provides a comprehensive overview of the integration approach.

### Key Features

- **Authentication Flow**: JWT-based authentication with secure token handling
- **Content Transformation**: WordPress content is transformed into optimized JSON for the React frontend
- **Security Measures**: API key validation, form data sanitization, and rate limiting
- **Error Handling**: Comprehensive error handling for all API endpoints
- **Caching Strategy**: Cache-Control headers for improved performance

## Setup Instructions

1. Import the workflow into your n8n instance
2. Update the placeholder credentials:
   - `YOUR_WORDPRESS_CREDENTIAL_ID`: Set up WordPress credentials in n8n
   - `YOUR_SHARED_SECRET_HERE`: Configure a shared secret for form submissions
   - `YOUR_CONTENT_SYNC_API_KEY`: Set up an API key for content synchronization
3. Configure your WordPress site with the required plugins and REST API settings
4. Update the React frontend to use these webhook endpoints

## Webhook Endpoints

The workflow provides the following endpoints:

- `/webhook/content`: Get all WordPress content
- `/webhook/list-posts`: Get paginated list of posts
- `/webhook/get-menus`: Get navigation menus
- `/webhook/auth`: Authenticate with WordPress
- `/webhook/auth/validate`: Validate JWT tokens
- `/webhook/forms/submit`: Submit form data
- `/webhook/sync-content`: Synchronize content updates
- `/webhook/post`: Get a single post by ID

## Maintenance

Regular maintenance should include:

- Updating WordPress credentials when they change
- Monitoring for any authentication or API errors
- Updating security tokens periodically
- Adding new endpoints as needed for additional functionality

## License

This project is licensed under the MIT License - see the LICENSE file for details.