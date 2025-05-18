const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const GRAPHQL_ENDPOINT = process.env.GRAPHQL_ENDPOINT || 'https://mardenseo.com/graphql';
const DEBUG_MODE = process.env.DEBUG_MODE === 'true' || false;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(morgan('dev'));

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Request logging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const logEntry = `${timestamp} - ${req.method} ${req.url}\n`;
  fs.appendFileSync(path.join(logsDir, 'requests.log'), logEntry);
  next();
});

// GraphQL client
const graphqlClient = axios.create({
  baseURL: GRAPHQL_ENDPOINT,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add token to authenticated requests
graphqlClient.interceptors.request.use(config => {
  const token = req.headers.authorization;
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
});

// Mock data for testing
const mockData = {
  posts: [
    {
      id: 'post-1',
      title: 'Sample Post 1',
      slug: 'sample-post-1',
      content: '<p>This is sample content for post 1.</p>',
      excerpt: 'This is sample content for post 1.',
      featuredImage: 'https://via.placeholder.com/800x400',
      author: 'John Doe',
      date: '2025-05-15T10:30:00',
      categories: [
        {
          id: 'category-1',
          name: 'News',
          slug: 'news'
        }
      ],
      tags: [
        {
          id: 'tag-1',
          name: 'Featured',
          slug: 'featured'
        }
      ]
    },
    {
      id: 'post-2',
      title: 'Sample Post 2',
      slug: 'sample-post-2',
      content: '<p>This is sample content for post 2.</p>',
      excerpt: 'This is sample content for post 2.',
      featuredImage: 'https://via.placeholder.com/800x400',
      author: 'Jane Smith',
      date: '2025-05-14T09:15:00',
      categories: [
        {
          id: 'category-2',
          name: 'Marketing',
          slug: 'marketing'
        }
      ],
      tags: [
        {
          id: 'tag-2',
          name: 'Important',
          slug: 'important'
        }
      ]
    }
  ],
  menu: {
    id: 'menu-1',
    name: 'Primary Menu',
    items: [
      {
        id: 'menu-item-1',
        label: 'Home',
        url: '/',
        path: '/',
        children: []
      },
      {
        id: 'menu-item-2',
        label: 'About',
        url: '/about',
        path: '/about',
        children: [
          {
            id: 'menu-item-3',
            label: 'Team',
            url: '/about/team',
            path: '/about/team'
          }
        ]
      },
      {
        id: 'menu-item-4',
        label: 'Services',
        url: '/services',
        path: '/services',
        children: []
      },
      {
        id: 'menu-item-5',
        label: 'Contact',
        url: '/contact',
        path: '/contact',
        children: []
      }
    ]
  }
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    debug: DEBUG_MODE
  });
});

// Content endpoint
app.get('/graphql-proxy/content', async (req, res) => {
  try {
    // Use mock data in debug mode
    if (DEBUG_MODE) {
      console.log('Using mock data for content (debug mode)');
      return res.json({
        posts: mockData.posts,
        pagination: {
          hasNextPage: false,
          endCursor: null
        }
      });
    }

    const response = await graphqlClient.post('', {
      query: `
        query GetPosts {
          posts(first: 10) {
            nodes {
              id
              title
              slug
              content
              excerpt
              date
              featuredImage {
                node {
                  sourceUrl
                }
              }
              author {
                node {
                  name
                }
              }
              categories {
                nodes {
                  id
                  name
                  slug
                }
              }
              tags {
                nodes {
                  id
                  name
                  slug
                }
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      `
    });
    
    // Transform data to match frontend expectations
    const posts = response.data.data.posts.nodes.map(post => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt,
      featuredImage: post.featuredImage?.node?.sourceUrl || null,
      author: post.author?.node?.name || null,
      date: post.date,
      categories: post.categories?.nodes.map(cat => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug
      })) || [],
      tags: post.tags?.nodes.map(tag => ({
        id: tag.id,
        name: tag.name,
        slug: tag.slug
      })) || []
    }));
    
    res.json({
      posts,
      pagination: {
        hasNextPage: response.data.data.posts.pageInfo.hasNextPage,
        endCursor: response.data.data.posts.pageInfo.endCursor
      }
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ 
      error: 'Failed to fetch posts',
      message: error.message
    });
  }
});

// Authentication endpoint
app.post('/graphql-proxy/auth', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }
    
    // Use mock data in debug mode
    if (DEBUG_MODE) {
      console.log('Using mock data for authentication (debug mode)');
      
      // Simple validation for testing
      if (username === 'admin' && password === 'password') {
        return res.json({
          success: true,
          token: 'mock-jwt-token',
          user: {
            id: 'user-1',
            name: 'Admin User',
            email: 'admin@example.com'
          }
        });
      } else {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }
    }
    
    const response = await graphqlClient.post('', {
      query: `
        mutation Login($username: String!, $password: String!) {
          login(input: {username: $username, password: $password}) {
            authToken
            user {
              id
              name
              email
            }
          }
        }
      `,
      variables: {
        username,
        password
      }
    });
    
    if (response.data.data?.login) {
      const { authToken, user } = response.data.data.login;
      
      res.json({
        success: true,
        token: authToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Authentication failed'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({
      success: false,
      message: error.response?.data?.errors?.[0]?.message || 'Authentication failed'
    });
  }
});

// Form submission endpoint
app.post('/graphql-proxy/form', async (req, res) => {
  try {
    const formData = req.body;
    
    // Validate form data
    const errors = [];
    if (!formData.name || formData.name.trim() === '') {
      errors.push('Name is required');
    }
    
    if (!formData.email || formData.email.trim() === '') {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push('Email format is invalid');
    }
    
    if (!formData.message || formData.message.trim() === '') {
      errors.push('Message is required');
    }
    
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    
    // Use mock data in debug mode
    if (DEBUG_MODE) {
      console.log('Using mock data for form submission (debug mode)');
      console.log('Form data:', formData);
      
      return res.json({
        success: true,
        message: 'Form submitted successfully (debug mode)'
      });
    }
    
    const response = await graphqlClient.post('', {
      query: `
        mutation CreateFormSubmission($name: String!, $email: String!, $message: String!) {
          createFormSubmission(input: {name: $name, email: $email, message: $message}) {
            success
            message
          }
        }
      `,
      variables: {
        name: formData.name,
        email: formData.email,
        message: formData.message
      }
    });
    
    if (response.data.data?.createFormSubmission) {
      res.json(response.data.data.createFormSubmission);
    } else {
      res.status(400).json({
        success: false,
        message: 'Form submission failed'
      });
    }
  } catch (error) {
    console.error('Form submission error:', error);
    res.status(500).json({
      success: false,
      message: error.response?.data?.errors?.[0]?.message || 'Form submission failed'
    });
  }
});

// Menu retrieval endpoint
app.get('/graphql-proxy/menu', async (req, res) => {
  try {
    // Use mock data in debug mode
    if (DEBUG_MODE) {
      console.log('Using mock data for menu (debug mode)');
      return res.json({
        success: true,
        menu: mockData.menu
      });
    }
    
    const response = await graphqlClient.post('', {
      query: `
        query GetMenu {
          menus(where: {location: PRIMARY}) {
            nodes {
              id
              name
              menuItems {
                nodes {
                  id
                  label
                  url
                  path
                  parentId
                  childItems {
                    nodes {
                      id
                      label
                      url
                      path
                    }
                  }
                }
              }
            }
          }
        }
      `
    });
    
    if (response.data.data.menus.nodes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Menu not found'
      });
    }
    
    const menu = response.data.data.menus.nodes[0];
    const menuItems = menu.menuItems.nodes;
    
    // Create a hierarchical menu structure
    const itemsByParentId = {};
    menuItems.forEach(item => {
      const parentId = item.parentId || 'root';
      if (!itemsByParentId[parentId]) {
        itemsByParentId[parentId] = [];
      }
      itemsByParentId[parentId].push(item);
    });
    
    const buildMenuTree = (parentId) => {
      const children = itemsByParentId[parentId] || [];
      return children.map(item => ({
        id: item.id,
        label: item.label,
        url: item.url,
        path: item.path,
        children: buildMenuTree(item.id)
      }));
    };
    
    res.json({
      success: true,
      menu: {
        id: menu.id,
        name: menu.name,
        items: buildMenuTree('root')
      }
    });
  } catch (error) {
    console.error('Menu fetch error:', error);
    res.status(500).json({
      success: false,
      message: error.response?.data?.errors?.[0]?.message || 'Failed to fetch menu'
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`GraphQL proxy server running on port ${PORT}`);
  console.log(`Debug mode: ${DEBUG_MODE ? 'ON' : 'OFF'}`);
});

module.exports = app; // Export for testing
