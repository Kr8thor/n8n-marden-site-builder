#!/bin/bash
# Start script for WordPress GraphQL Proxy Server

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "PM2 is not installed. Installing..."
    npm install -g pm2
fi

# Start the server with PM2
echo "Starting WordPress GraphQL Proxy Server..."
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save

echo "Server started successfully!"
echo "To monitor: pm2 monit"
echo "To view logs: pm2 logs wordpress-graphql-proxy"
