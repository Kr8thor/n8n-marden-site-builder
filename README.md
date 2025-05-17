# Marden Site Builder - N8N Workflow

This repository contains a complete N8N workflow for connecting a frontend application to a WordPress backend. The workflow provides a set of API endpoints that make it easy to integrate WordPress content into any frontend application.

## Features

- Content retrieval from WordPress
- Post listing with pagination and category filtering
- WordPress menu retrieval
- JWT authentication handling
- Token validation
- Form submission processing
- Content synchronization

## Endpoints

### Content Endpoints

- `GET /webhook/content` - Get all posts with full content
- `GET /webhook/list-posts` - List posts with pagination and filtering
- `GET /webhook/get-menus` - Get WordPress menus

### Authentication Endpoints

- `POST /webhook/auth` - Authenticate with WordPress
- `POST /webhook/auth/validate` - Validate JWT token

### Form Handling

- `POST /webhook/forms/submit` - Submit form data to WordPress

### Content Synchronization

- `POST /webhook/sync-content` - Sync content and invalidate frontend cache

## Installation

1. Import the workflow JSON file into your N8N instance
2. Configure WordPress credentials in the workflow
3. Activate the workflow

## Configuration

You need to update the following credentials in the workflow:

1. WordPress API credentials for authentication
2. The shared secret for form submission

## Requirements

- N8N v1.0.0 or later
- WordPress with REST API enabled
- JWT Authentication for WP REST API plugin

## License

MIT