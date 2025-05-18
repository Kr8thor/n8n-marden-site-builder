#!/bin/bash
# WordPress GraphQL Proxy Installation Script

# Ensure script is run as a non-root user with sudo privileges
if [ "$(id -u)" -eq 0 ]; then
  echo "This script should not be run as root directly."
  echo "Please run as a regular user with sudo privileges."
  exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
  echo "Node.js is not installed. Installing..."
  curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
  echo "npm is not installed. Installing..."
  sudo apt-get install -y npm
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d 'v' -f 2)
NODE_MAJOR_VERSION=$(echo $NODE_VERSION | cut -d '.' -f 1)

if [ "$NODE_MAJOR_VERSION" -lt 16 ]; then
  echo "Node.js version $NODE_VERSION is less than the required version 16."
  echo "Please upgrade Node.js and try again."
  exit 1
fi

echo "Node.js version $NODE_VERSION is installed."

# Install dependencies
echo "Installing dependencies..."
npm install

# Install PM2 globally
echo "Installing PM2..."
sudo npm install -g pm2

# Set up environment
echo "Setting up environment variables..."
if [ ! -f ".env" ]; then
  cp .env.example .env
  echo "Please edit the .env file with your settings."
  nano .env
fi

# Set up logs directory
echo "Creating logs directory..."
mkdir -p logs

# Set up Apache configuration
echo "Setting up Apache configuration..."
if command -v apache2 &> /dev/null; then
  # If Apache is installed
  if [ -d "/etc/apache2/sites-available" ]; then
    sudo cp apache-config.conf /etc/apache2/sites-available/wordpress-graphql-proxy.conf
    echo "Apache configuration file copied."
    echo "Please include it in your site configuration and restart Apache."
    echo "Example: sudo a2enmod proxy proxy_http headers rewrite"
    echo "         sudo systemctl restart apache2"
  else
    echo "Apache configuration directory not found."
    echo "Please manually copy apache-config.conf to your Apache configuration directory."
  fi
else
  echo "Apache does not appear to be installed."
  echo "Please manually copy apache-config.conf to your web server configuration."
fi

# Start the server with PM2
echo "Starting the server with PM2..."
pm2 start ecosystem.config.js
pm2 save

# Set up PM2 to start on boot
echo "Setting up PM2 to start on boot..."
pm2 startup

echo "Installation complete!"
echo ""
echo "To verify the installation, run: npm test"
echo "To monitor the server, run: pm2 monit"
echo ""
echo "Don't forget to:"
echo "1. Configure WordPress with the WPGraphQL plugin"
echo "2. Add the code from wordpress-integration.php to your theme's functions.php"
echo "3. Configure JWT authentication in wp-config.php"
echo "4. Test all endpoints through Apache"
