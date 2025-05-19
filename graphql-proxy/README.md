# WordPress GraphQL Proxy Server

A GraphQL proxy server that integrates a React+Vite frontend with a WordPress backend without requiring changes to the frontend.

## Overview

This solution provides a middleware layer that transforms API requests from your existing React+Vite frontend into GraphQL queries for WordPress. The proxy server handles all the transformation logic, ensuring your frontend receives exactly the data format it expects.

## Features

- **Content Retrieval**: Fetch WordPress posts with precise field selection
- **Authentication**: Secure JWT-based user authentication
- **Form Submission**: Process and validate form submissions
- **Menu Retrieval**: Get navigation menus with hierarchical structure
- **Debug Mode**: Mock data for testing in development environment
- **Health Check**: Monitor server status

## Prerequisites

- Node.js 16.x or later
- WordPress with WPGraphQL plugin installed
- Apache web server with proxy module enabled

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Kr8thor/n8n-marden-site-builder.git
   cd n8n-marden-site-builder
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env file with your settings
   ```

4. **Configure Apache**:
   - Copy `apache-config.conf` to your Apache configuration directory
   - Include it in your site configuration
   - Enable required modules: `proxy`, `proxy_http`, `headers`, `rewrite`
   - Restart Apache

5. **Configure WordPress**:
   - Ensure WPGraphQL plugin is installed and activated
   - Add the code from `wordpress-integration.php` to your theme's functions.php
   - Configure JWT authentication in wp-config.php (see wordpress-integration.php)

## Usage

### Development Mode

```bash
# Start with nodemon for auto-restart on changes
npm run dev
```

### Production Mode

```bash
# Using PM2 (recommended)
npm install -g pm2
pm2 start ecosystem.config.js

# OR using Node directly
npm start
```

### Testing

```bash
# Run the test script
npm test
```

## Endpoints

| Frontend Path | Proxy Path | Description |
|---------------|------------|-------------|
| `/api/myapp/v1/content` | `/graphql-proxy/content` | Fetch content from WordPress |
| `/api/myapp/v1/auth` | `/graphql-proxy/auth` | User authentication |
| `/api/myapp/v1/form-submission` | `/graphql-proxy/form` | Form submission |
| `/api/myapp/v1/menu` | `/graphql-proxy/menu` | Fetch navigation menus |

## Deployment Checklist

- [ ] Node.js installed on production server
- [ ] Dependencies installed (`npm install`)
- [ ] Environment variables configured (.env file)
- [ ] PM2 installed and configured for auto-start
- [ ] Apache configured with proxy settings
- [ ] WordPress plugins installed and configured
- [ ] Firewall allowing necessary ports
- [ ] HTTPS/SSL configured for production
- [ ] Monitoring set up (PM2 or other solution)

## Troubleshooting

### Common Issues

1. **Proxy Connection Errors**:
   - Check if the proxy server is running (`pm2 status`)
   - Verify port configuration in .env file
   - Ensure Apache proxy module is enabled

2. **WordPress GraphQL Issues**:
   - Verify WPGraphQL plugin is active
   - Check GraphQL endpoint is accessible
   - Test GraphQL queries directly using GraphiQL

3. **Authentication Failures**:
   - Check JWT configuration in wp-config.php
   - Verify user credentials
   - Check token expiration settings

## Monitoring and Maintenance

- **Logs**: Check logs in the `logs` directory
- **PM2 Monitoring**: Use `pm2 monit` to monitor performance
- **Health Check**: Access `/health` endpoint to verify server status

## License

MIT License
