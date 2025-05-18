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
- **Single Post Fetching**: Fetch single post details with metadata

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

## Implementation Details

This workflow has been carefully redesigned to ensure all nodes are using supported types and connections are properly established. Key changes include:

1. Using standard HTTP Request nodes for WordPress API calls with Basic Auth
2. Using Code nodes (replaces Function nodes) for data transformation
3. Using proper respondToWebhook nodes for API responses
4. Implementing secure form validation and submission
5. Adding proper error handling and response formatting

## Installation

1. Import the workflow JSON file into your N8N instance
2. Configure HTTP Basic Auth credentials for WordPress API access
3. Activate the workflow

## Configuration

You need to update the following credentials in the workflow:

1. Configure WordPress Basic Auth credentials in n8n
2. Update `YOUR_SHARED_SECRET_HERE` for form submissions
3. Review and customize API endpoints as needed

## Requirements

- N8N v1.0.0 or later
- WordPress with REST API enabled
- JWT Authentication for WP REST API plugin

## License

MIT