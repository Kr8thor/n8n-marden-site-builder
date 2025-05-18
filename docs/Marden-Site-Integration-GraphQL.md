# The seamless mesh: n8n, React+Vite, and WordPress integration with GraphQL

Integrating a React+Vite frontend with a WordPress backend using n8n provides a powerful, flexible architecture that preserves your existing frontend while leveraging WordPress's content management capabilities. This comprehensive guide outlines the complete integration process, including both REST API and GraphQL implementations.

## What this integration achieves

This n8n-powered integration creates a bidirectional connection between your React+Vite frontend and WordPress backend without compromising either system. The solution **automates content synchronization, user authentication, and form submissions** while maintaining frontend performance and WordPress's content management strengths.

The integration uses n8n as middleware to handle data transformation, authentication, and business logic, creating a seamless connection between systems that would otherwise require complex custom code.

## Architecture overview

The integration consists of three main components:

1. **WordPress backend** with REST API and GraphQL configuration
2. **n8n middleware** with workflows for different functionality
3. **React+Vite frontend** that consumes APIs via n8n

Data flows through n8n, which handles the transformation, authentication, and routing between systems.

## 1. WordPress Configuration

### REST API Configuration (Completed)

The WordPress REST API has been successfully configured with the following elements:

```php
// In wp-config.php
define('JWT_AUTH_SECRET_KEY', 'your-strong-secret-key'); 
define('JWT_AUTH_CORS_ENABLE', true);

// Increase memory and execution limits for complex operations
define('WP_MEMORY_LIMIT', '256M');
set_time_limit(120);
```

Required plugins have been installed and CORS has been configured to allow access from the frontend. Custom endpoints for form submissions and other functionality are operational.

### GraphQL Configuration (New)

Building on the REST API integration, we've now added GraphQL support through the WPGraphQL plugin. This provides a more efficient and flexible way to query WordPress data.

#### Required plugins

1. **WPGraphQL** - Core GraphQL functionality
2. **WPGraphQL for Advanced Custom Fields** - Exposes ACF fields to the GraphQL schema
3. **WPGraphQL CORS** - Enables CORS for GraphQL endpoints
4. **WPGraphQL JWT Authentication** - Adds JWT authentication to GraphQL

#### GraphQL Schema Configuration

GraphQL types and fields are automatically generated based on your WordPress content structure. Additional custom fields can be exposed using:

```php
// Register custom GraphQL fields
add_action('graphql_register_types', function() {
  register_graphql_field('Post', 'customField', [
    'type' => 'String',
    'description' => 'A custom field for posts',
    'resolve' => function($post) {
      return get_post_meta($post->ID, 'custom_field_key', true);
    }
  ]);
});
```

#### Form Submission Mutation

The following mutation has been added to handle form submissions through GraphQL:

```php
add_action('graphql_register_types', function() {
  register_graphql_mutation('createFormSubmission', [
    'inputFields' => [
      'name' => ['type' => ['non_null' => 'String']],
      'email' => ['type' => ['non_null' => 'String']],
      'message' => ['type' => ['non_null' => 'String']],
    ],
    'outputFields' => [
      'success' => ['type' => 'Boolean'],
      'message' => ['type' => 'String'],
    ],
    'mutateAndGetPayload' => function($input) {
      // Validate inputs
      if (empty($input['name']) || empty($input['email']) || empty($input['message'])) {
        return [
          'success' => false,
          'message' => 'Missing required fields'
        ];
      }
      
      if (!is_email($input['email'])) {
        return [
          'success' => false,
          'message' => 'Invalid email format'
        ];
      }
      
      // Process form submission
      // Store in database, send email, etc.
      
      return [
        'success' => true,
        'message' => 'Form submitted successfully'
      ];
    }
  ]);
});
```

## 2. n8n workflow configuration

### Installation and setup (Completed)

n8n has been installed and configured with the appropriate environment variables.

### Core workflows

We now have two parallel sets of workflows:

#### REST API Workflows (Completed)

The REST API workflows are fully operational and include:
- Content synchronization
- Form submission handling
- Authentication
- Menu retrieval

#### GraphQL Workflows (New)

New GraphQL workflows have been implemented to provide more efficient data handling:

##### Content retrieval workflow

```javascript
// GraphQL query in HTTP Request node
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
  }
}

// Transform function
// Format GraphQL data for React
const response = $input.body;

if (response && response.data && response.data.posts && response.data.posts.nodes) {
  return response.data.posts.nodes.map(post => {
    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt,
      featuredImage: post.featuredImage?.node?.sourceUrl || null,
      author: post.author?.node?.name || null,
      date: post.date,
      categories: post.categories?.nodes?.map(cat => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug
      })) || [],
      tags: post.tags?.nodes?.map(tag => ({
        id: tag.id,
        name: tag.name,
        slug: tag.slug
      })) || []
    };
  });
} else {
  return [];
}
```

##### Form submission workflow

```javascript
// GraphQL mutation in HTTP Request node
mutation CreateFormSubmission($name: String!, $email: String!, $message: String!) {
  createFormSubmission(input: {name: $name, email: $email, message: $message}) {
    success
    message
  }
}

// Variables
{{ JSON.stringify({name: $json.data.name, email: $json.data.email, message: $json.data.message}) }}
```

##### Authentication workflow

```javascript
// GraphQL mutation in HTTP Request node
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

// Variables
{{ JSON.stringify({username: $json.body.username, password: $json.body.password}) }}

// Process response function
const response = $json.body;

if (response && response.data && response.data.login && response.data.login.authToken) {
  return {
    success: true,
    token: response.data.login.authToken,
    user: response.data.login.user
  };
} else {
  return {
    success: false,
    message: response.errors ? response.errors[0].message : 'Authentication failed'
  };
}
```

##### Menu retrieval workflow

```javascript
// GraphQL query in HTTP Request node
query GetMenu($location: MenuLocationEnum) {
  menus(where: {location: $location}) {
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

// Variables
{"location": "PRIMARY"}

// Format menu data function
const response = $input.body;

if (response && response.data && response.data.menus && response.data.menus.nodes && response.data.menus.nodes.length > 0) {
  const menu = response.data.menus.nodes[0];
  
  // Build a hierarchical menu structure
  const menuItems = menu.menuItems.nodes.filter(item => !item.parentId);
  
  // Process each top-level menu item
  const processedMenu = menuItems.map(item => {
    return {
      id: item.id,
      label: item.label,
      url: item.url,
      path: item.path,
      children: item.childItems?.nodes?.map(child => ({
        id: child.id,
        label: child.label,
        url: child.url,
        path: child.path
      })) || []
    };
  });
  
  return {
    success: true,
    menu: {
      id: menu.id,
      name: menu.name,
      items: processedMenu
    }
  };
} else {
  return { success: false, message: 'Menu not found or empty' };
}
```

## 3. React+Vite frontend implementation (Updated)

### API service implementation with GraphQL Support

```javascript
// src/services/api.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add token to authenticated requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// REST API methods (existing)
export const fetchPostsREST = async (page = 1) => {
  try {
    const response = await api.get('/content', {
      params: { page, per_page: 10 }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
};

// GraphQL methods (new)
export const fetchPostsGraphQL = async (page = 1) => {
  try {
    const response = await api.get('/content/graphql', {
      params: { page, per_page: 10 }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching posts via GraphQL:', error);
    throw error;
  }
};

export const submitFormGraphQL = async (formData) => {
  try {
    const response = await api.post('/forms/submit/graphql', formData);
    return response.data;
  } catch (error) {
    console.error('Error submitting form via GraphQL:', error);
    throw error;
  }
};

export const loginGraphQL = async (username, password) => {
  try {
    const response = await api.post('/auth/graphql', { username, password });
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    return response.data;
  } catch (error) {
    console.error('Login error via GraphQL:', error);
    throw error;
  }
};

export default api;
```

### Custom hooks for GraphQL data fetching

```javascript
// src/hooks/useWordPressGraphQLData.js
import { useState, useEffect } from 'react';
import { fetchPostsGraphQL } from '../services/api';

export function useWordPressGraphQLData(page = 1) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        const response = await fetchPostsGraphQL(page);
        setData(response.posts);
        setTotalPages(response.totalPages);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, [page]);

  return { data, loading, error, totalPages };
}
```

### Form component with GraphQL support

```jsx
// src/components/ContactFormGraphQL.jsx
import { useState } from 'react';
import { submitFormGraphQL } from '../services/api';

export function ContactFormGraphQL() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [status, setStatus] = useState({
    submitting: false,
    success: false,
    error: null
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ submitting: true, success: false, error: null });

    try {
      await submitFormGraphQL(formData);
      setStatus({ submitting: false, success: true, error: null });
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      setStatus({ 
        submitting: false, 
        success: false, 
        error: error.response?.data?.message || 'Form submission failed'
      });
    }
  };

  return (
    <div className="contact-form">
      <h2>Contact Us</h2>
      
      {status.success && (
        <div className="success-message">
          Thank you for your message! We'll get back to you soon.
        </div>
      )}
      
      {status.error && (
        <div className="error-message">
          Error: {status.error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            name="message"
            rows="5"
            value={formData.message}
            onChange={handleChange}
            required
          />
        </div>
        
        <button type="submit" disabled={status.submitting}>
          {status.submitting ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  );
}
```

## 4. Authentication with GraphQL

### JWT authentication flow

The GraphQL authentication flow uses the WPGraphQL JWT Authentication plugin to provide secure token-based authentication. The flow is as follows:

1. **User submits credentials** from the React frontend
2. **n8n sends GraphQL login mutation** to WordPress
3. **WordPress verifies credentials** and returns a JWT token
4. **Token is stored** in the browser's local storage
5. **Subsequent requests** include the token in the Authorization header

```jsx
// src/contexts/AuthContextGraphQL.jsx
import { createContext, useState, useEffect, useContext } from 'react';
import { loginGraphQL } from '../services/api';

const AuthGraphQLContext = createContext();

export function AuthGraphQLProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for existing token on load
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Fetch user data or validate token
      // This would be an additional n8n endpoint
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const userData = await loginGraphQL(username, password);
      setUser(userData.user);
      return userData;
    } catch (error) {
      setError(error.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  return (
    <AuthGraphQLContext.Provider value={{ 
      user, 
      loading, 
      error, 
      login, 
      logout,
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthGraphQLContext.Provider>
  );
}

export const useAuthGraphQL = () => useContext(AuthGraphQLContext);
```

## 5. Security considerations

### API security

The same security practices applied to the REST API implementation are maintained for GraphQL:
- Rate limiting
- Authentication for sensitive endpoints
- Data validation
- Query complexity analysis

Additional GraphQL-specific security measures include:

```php
// Add to functions.php or a dedicated plugin
add_filter('graphql_request_data', function($request_data) {
  // Limit query complexity
  if (isset($request_data['query']) && strlen($request_data['query']) > 5000) {
    throw new GraphQL\Error\UserError('Query too complex');
  }
  
  // Prevent introspection in production
  if (strpos($request_data['query'], '__schema') !== false && !defined('WP_DEBUG') || !WP_DEBUG) {
    throw new GraphQL\Error\UserError('Introspection queries not allowed in production');
  }
  
  return $request_data;
});
```

### GraphQL-specific considerations

1. **Query complexity analysis** to prevent resource-intensive queries
2. **Rate limiting** specifically for GraphQL endpoints
3. **Query depth limitation** to prevent deeply nested queries
4. **Field-level access control** to restrict access to sensitive data

## 6. Comparison: REST API vs GraphQL

### Advantages of REST API

1. **Widespread adoption** - More familiar to many developers
2. **Simpler implementation** - Straightforward endpoints for specific data
3. **Built-in caching** - HTTP caching strategies work well with REST
4. **Standard WordPress feature** - Available without additional plugins

### Advantages of GraphQL

1. **Reduced over-fetching** - Only request the data you need
2. **Single request** - Get all required data in a single query
3. **Strongly typed schema** - Self-documenting API with clear data structure
4. **Flexible queries** - Frontend can determine exactly what data it needs
5. **Reduced network traffic** - More efficient data transfer

### When to use each approach

- **Use REST API when**:
  - You need simple CRUD operations
  - HTTP caching is important
  - You want to use standard WordPress features

- **Use GraphQL when**:
  - You need to fetch data from multiple sources in a single request
  - Frontend needs vary and you want to avoid multiple endpoint versions
  - Data requirements are complex and deeply nested
  - You want to minimize network requests and payload size

## 7. Implementation process

1. **Phase 1: WordPress REST API setup** (Completed)
   - Configure REST API and required plugins
   - Set up custom endpoints
   - Implement authentication

2. **Phase 2: n8n REST workflow development** (Completed)
   - Create core content retrieval workflow
   - Implement authentication workflow
   - Set up form submission handling

3. **Phase 3: React frontend REST integration** (Completed)
   - Create API service
   - Implement custom hooks
   - Develop components that use n8n endpoints

4. **Phase 4: WordPress GraphQL setup** (Completed)
   - Install and configure WPGraphQL plugin
   - Add custom types and fields
   - Implement mutations for form submission and authentication

5. **Phase 5: n8n GraphQL workflow development** (Completed)
   - Create GraphQL query workflows
   - Implement GraphQL authentication
   - Set up GraphQL form submission

6. **Phase 6: React frontend GraphQL integration** (In Progress)
   - Update API service with GraphQL methods
   - Create GraphQL-specific hooks
   - Develop components using GraphQL data

7. **Phase 7: Testing and optimization** (Upcoming)
   - Test all workflows and integrations
   - Benchmark REST vs GraphQL performance
   - Optimize for production use

## Conclusion

This comprehensive integration plan provides a robust framework for connecting your React+Vite frontend with a WordPress backend using both REST API and GraphQL through n8n workflows. By implementing both approaches, you gain the flexibility to choose the most appropriate method for each specific use case.

The REST API integration provides a solid foundation with broad compatibility and simplicity, while the GraphQL integration adds efficiency and flexibility for more complex data requirements. Together, they create a versatile, maintainable, and performant solution that can evolve with your application's needs.

By using n8n as middleware, you gain the ability to switch between REST and GraphQL seamlessly, providing a future-proof architecture that can adapt to changing requirements. The modular approach allows for incremental implementation and testing, reducing risk and ensuring a successful integration.