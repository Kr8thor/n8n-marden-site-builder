# Marden SEO Integration - README

This repository contains a React+Vite frontend that integrates with a WordPress backend using n8n as middleware, as well as a direct GraphQL proxy server implementation.

## Project Structure

```
├── graphql-proxy/         # GraphQL Proxy Server implementation
│   ├── graphql-proxy-server.js # Main server file
│   ├── package.json       # Dependencies
│   ├── ecosystem.config.js # PM2 configuration
│   └── wordpress-integration.php # WordPress integration code
├── src/
│   ├── components/         # Reusable components
│   │   ├── ContactForm.jsx # Contact form with n8n integration
│   │   ├── Navbar.jsx      # Navigation with dynamic menu from WordPress
│   │   └── ProtectedRoute.jsx # Auth guard for protected routes
│   ├── contexts/
│   │   └── AuthContext.jsx # Authentication state management
│   ├── hooks/
│   │   └── useWordPressData.js # Custom hook for fetching WordPress data
│   ├── pages/
│   │   ├── BlogPage.jsx    # Blog listing page
│   │   ├── ContactPage.jsx # Contact page
│   │   ├── DashboardPage.jsx # Protected dashboard page
│   │   └── LoginPage.jsx   # Authentication page
│   ├── services/
│   │   └── api.js          # API service for n8n communication
│   ├── App.jsx             # Main app component with routing
│   └── main.jsx            # Entry point
├── vite.config.js          # Vite configuration with proxy to n8n
└── package.json            # Dependencies and scripts
```

## Features

- **Content Integration**: Fetches and displays WordPress posts
- **Authentication**: JWT-based authentication with WordPress
- **Form Submission**: Contact form that submits to WordPress
- **Dynamic Menu**: Fetches navigation menu from WordPress
- **Protected Routes**: Authentication-protected areas

## Integration Options

### 1. n8n Middleware (Original Implementation)

Uses n8n workflows to connect the React frontend with WordPress backend.

### 2. GraphQL Proxy Server (New Implementation)

A lightweight Node.js server that transforms existing API requests into WordPress GraphQL queries without requiring frontend changes.

#### GraphQL Proxy Features:
- **Zero Frontend Changes**: Works with your existing frontend code
- **GraphQL Performance**: Leverages the efficiency of GraphQL
- **Debug Mode**: Includes mock data for development and testing
- **Production Ready**: Includes PM2 configuration and Apache setup

## Setup Instructions

### Prerequisites

1. WordPress site with REST API or GraphQL API enabled
2. Node.js and npm installed
3. For n8n option: n8n instance running with the integration workflows

### Frontend Installation

1. Clone the repository:
```bash
git clone https://github.com/Kr8thor/n8n-marden-site-builder.git
cd n8n-marden-site-builder
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the project root:
```
VITE_API_URL=http://localhost:5678
```

4. Start the development server:
```bash
npm run dev
```

### n8n Workflow Setup

1. Import the following workflows into your n8n instance:
   - WordPress-React Integration: Basic REST API integration
   - WordPress-GraphQL Integration: Advanced GraphQL-based integration
   - Marden SEO Website Deployment: Deployment automation workflow

2. Activate the integration workflows

### GraphQL Proxy Server Setup

1. Navigate to the graphql-proxy directory:
```bash
cd graphql-proxy
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your settings
```

4. Start the server:
```bash
# For development
npm run dev

# For production with PM2
npm install -g pm2
pm2 start ecosystem.config.js
```

5. Configure Apache to proxy requests to the GraphQL proxy server:
```apache
# Include the apache-config.conf file in your Apache configuration
```

For detailed installation and configuration instructions, see the [GraphQL Proxy Implementation Guide](graphql-proxy/IMPLEMENTATION_GUIDE.md).

### WordPress Setup

1. Install and configure the required WordPress plugins:
   - JWT Authentication for WP REST API
   - Advanced Custom Fields (ACF)
   - WP REST API Controller
   - WP REST Cache
   - WPGraphQL (for GraphQL integration)

2. Add the necessary code to your theme's functions.php file (see implementation guide)

## Development

- **API Service**: Modify `src/services/api.js` to adapt to your API endpoints
- **Styling**: The project uses Tailwind CSS for styling
- **Deployment**: Use the n8n deployment workflow to automate the build and deployment process

## Deployment

To deploy the application:

1. Build the frontend:
```bash
npm run build
```

2. Deploy the built files to your server:
   - Option 1: Use the n8n deployment workflow
   - Option 2: Use the GraphQL proxy server with Apache

## Credits

This integration was built using:

- React
- Vite
- WordPress REST/GraphQL API
- n8n automation platform
- Node.js Express (for GraphQL proxy)
