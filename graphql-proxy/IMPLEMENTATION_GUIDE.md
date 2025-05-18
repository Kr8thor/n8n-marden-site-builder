# WordPress GraphQL Proxy Implementation Guide

This guide provides detailed step-by-step instructions for implementing the WordPress GraphQL Proxy Server for the Marden SEO website integration.

## Implementation Stages

### Stage 1: Server Preparation

1. **Prepare the Server Environment**
   
   SSH into your server and ensure you have the necessary tools:
   
   ```bash
   # Update system packages
   sudo apt update
   sudo apt upgrade -y
   
   # Install required packages
   sudo apt install -y git curl build-essential
   ```

2. **Install Node.js**
   
   ```bash
   # Install Node.js 16.x
   curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
   sudo apt install -y nodejs
   
   # Verify installation
   node -v
   npm -v
   ```

3. **Install PM2 for Process Management**
   
   ```bash
   # Install PM2 globally
   sudo npm install -g pm2
   ```

### Stage 2: GraphQL Proxy Server Deployment

1. **Create Directory for the Proxy Server**
   
   ```bash
   mkdir -p /var/www/graphql-proxy
   cd /var/www/graphql-proxy
   ```

2. **Deploy the Files**
   
   Option A: Copy files from this repository
   ```bash
   # Copy all files to the server
   cp -r /path/to/graphql-proxy-server/* /var/www/graphql-proxy/
   ```
   
   Option B: Clone from GitHub
   ```bash
   git clone https://github.com/Kr8thor/n8n-marden-site-builder.git .
   ```

3. **Install Dependencies**
   
   ```bash
   npm install
   ```

4. **Configure Environment**
   
   ```bash
   # Copy example environment file
   cp .env.example .env
   
   # Edit as needed
   nano .env
   ```
   
   Update these values:
   - `PORT`: The port the proxy will run on (default: 3000)
   - `GRAPHQL_ENDPOINT`: Your WordPress GraphQL endpoint URL
   - `DEBUG_MODE`: Set to 'false' for production

5. **Start the Server with PM2**
   
   ```bash
   # Start the proxy server
   pm2 start ecosystem.config.js
   
   # Save the current PM2 configuration
   pm2 save
   
   # Configure PM2 to start on boot
   pm2 startup
   ```

6. **Test the Proxy Server**
   
   ```bash
   # Run the test script
   npm test
   
   # Or test individual endpoints
   curl http://localhost:3000/health
   curl http://localhost:3000/graphql-proxy/content
   ```

### Stage 3: Apache Configuration

1. **Enable Required Apache Modules**
   
   ```bash
   sudo a2enmod proxy proxy_http headers rewrite
   ```

2. **Create Apache Configuration**
   
   ```bash
   # Copy the configuration file
   sudo cp apache-config.conf /etc/apache2/sites-available/wordpress-graphql-proxy.conf
   
   # Include it in your site configuration
   sudo nano /etc/apache2/sites-available/mardenseo.com.conf
   ```
   
   Add this line to your site configuration:
   ```apache
   Include /etc/apache2/sites-available/wordpress-graphql-proxy.conf
   ```

3. **Test and Restart Apache**
   
   ```bash
   # Test the configuration
   sudo apache2ctl configtest
   
   # Restart Apache
   sudo systemctl restart apache2
   ```

4. **Test Through Apache**
   
   ```bash
   # Test that the proxy is accessible through Apache
   curl https://mardenseo.com/api/myapp/v1/content
   ```

### Stage 4: WordPress Configuration

1. **Install Required WordPress Plugins**
   
   Via WordPress Admin:
   - Install and activate the WPGraphQL plugin
   - Install the WPGraphQL JWT Authentication plugin
   - Install WPGraphQL for Advanced Custom Fields (if using ACF)

2. **Configure JWT Authentication**
   
   Edit wp-config.php and add:
   ```php
   define('GRAPHQL_JWT_AUTH_SECRET_KEY', 'your-strong-secret-key'); // Change this to a secure key
   define('JWT_AUTH_CORS_ENABLE', true);
   ```

3. **Add Custom Code to WordPress**
   
   Add the contents of wordpress-integration.php to your theme's functions.php file or create a custom plugin.

4. **Test GraphQL Endpoint**
   
   ```bash
   # Test the GraphQL endpoint directly
   curl -X POST https://mardenseo.com/graphql \
     -H "Content-Type: application/json" \
     -d '{"query": "{ posts { nodes { id title } } }"}'
   ```

### Stage 5: Security and Monitoring

1. **Secure the Server**
   
   ```bash
   # Configure firewall
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw allow 22/tcp
   sudo ufw enable
   
   # Set proper file permissions
   sudo chown -R www-data:www-data /var/www/graphql-proxy
   ```

2. **Setup Monitoring**
   
   ```bash
   # Monitor the proxy server
   pm2 monit
   
   # View logs
   pm2 logs wordpress-graphql-proxy
   ```

3. **Setup Regular Backups**
   
   ```bash
   # Create a backup script
   nano /var/www/graphql-proxy/backup.sh
   ```
   
   Add this content:
   ```bash
   #!/bin/bash
   TIMESTAMP=$(date +%Y%m%d%H%M%S)
   BACKUP_DIR="/var/backups/graphql-proxy"
   mkdir -p $BACKUP_DIR
   tar -czf $BACKUP_DIR/graphql-proxy-$TIMESTAMP.tar.gz /var/www/graphql-proxy
   ```
   
   Make it executable and schedule with cron:
   ```bash
   chmod +x /var/www/graphql-proxy/backup.sh
   sudo crontab -e
   # Add this line to run daily at 3 AM
   0 3 * * * /var/www/graphql-proxy/backup.sh
   ```

## Testing Your Implementation

After completing all stages, perform these tests to verify the implementation:

1. **Health Check**
   ```bash
   curl https://mardenseo.com/api/myapp/v1/health
   ```

2. **Content Endpoint**
   ```bash
   curl https://mardenseo.com/api/myapp/v1/content
   ```

3. **Menu Endpoint**
   ```bash
   curl https://mardenseo.com/api/myapp/v1/menu
   ```

4. **Form Submission Test**
   ```bash
   curl -X POST https://mardenseo.com/api/myapp/v1/form-submission \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","email":"test@example.com","message":"This is a test message"}'
   ```

5. **Authentication Test**
   ```bash
   curl -X POST https://mardenseo.com/api/myapp/v1/auth \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"your-password"}'
   ```

6. **Frontend Integration Test**
   
   Access your website and use browser developer tools to:
   - Verify API calls to endpoints
   - Check that content is loading correctly
   - Test form submissions
   - Test authentication

## Troubleshooting

If you encounter issues during implementation, check these common problems:

1. **Permission Issues**
   ```bash
   # Check file ownership and permissions
   ls -la /var/www/graphql-proxy/
   # Set correct permissions
   sudo chown -R www-data:www-data /var/www/graphql-proxy/
   ```

2. **Proxy Connection Errors**
   ```bash
   # Check if proxy server is running
   pm2 status
   # Check logs
   pm2 logs wordpress-graphql-proxy
   # Restart if needed
   pm2 restart wordpress-graphql-proxy
   ```

3. **Apache Configuration**
   ```bash
   # Check Apache error logs
   sudo tail -f /var/log/apache2/error.log
   # Verify configuration
   sudo apache2ctl -t
   ```

4. **GraphQL Endpoint Issues**
   ```bash
   # Test GraphQL endpoint directly
   curl -X POST https://mardenseo.com/graphql \
     -H "Content-Type: application/json" \
     -d '{"query": "{ generalSettings { title } }"}'
   ```

If problems persist, enable debug mode in the proxy server by setting `DEBUG_MODE=true` in the .env file and restarting the proxy server to get more detailed logs.

## Maintenance Procedures

### Updating the Proxy Server

```bash
# Pull latest changes
cd /var/www/graphql-proxy
git pull

# Install any new dependencies
npm install

# Restart the proxy server
pm2 restart wordpress-graphql-proxy
```

### Monitoring Server Health

```bash
# Check server status
pm2 status

# Monitor resources
pm2 monit

# Check logs
pm2 logs wordpress-graphql-proxy
```

### Restarting Services

```bash
# Restart proxy server
pm2 restart wordpress-graphql-proxy

# Restart Apache
sudo systemctl restart apache2
```
