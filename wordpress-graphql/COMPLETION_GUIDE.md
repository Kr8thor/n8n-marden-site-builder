# WordPress GraphQL Integration - Completion Guide

Based on our testing, there are two main issues that need to be addressed to complete the WordPress GraphQL integration:

1. No Primary Menu exists in WordPress
2. The `submitForm` mutation doesn't exist in the WordPress GraphQL schema

This document provides instructions to fix these issues and complete the integration.

## 1. Create Primary Menu in WordPress

To create the Primary Menu in WordPress, you have two options:

### Option A: Use the Menu Creation Script

1. Upload the `create-menu.php` file to your WordPress root directory
2. Access the script by visiting `https://cms.mardenseo.com/create-menu.php?key=marden-seo-2025` in your browser
3. The script will create the Primary Menu with the following items:
   - Home
   - About
   - Services
   - Blog
   - Contact
4. **Important**: Delete the script after use for security reasons

### Option B: Create Menu Manually in WordPress Admin

1. Log in to WordPress Admin at `https://cms.mardenseo.com/wp-admin/`
2. Go to Appearance → Menus
3. Click "Create a new menu"
4. Enter "Primary Menu" for the name
5. Add the following Custom Links:
   - Home: URL = "/" and Label = "Home"
   - About: URL = "/about/" and Label = "About"
   - Services: URL = "/services/" and Label = "Services"
   - Blog: URL = "/blog/" and Label = "Blog"
   - Contact: URL = "/contact/" and Label = "Contact"
6. Under "Menu Settings" at the bottom, check "Primary" or "Primary Menu"
7. Click "Save Menu"

## 2. Add Form Submission Mutation to WordPress

To add the form submission mutation to WordPress, you have two options:

### Option A: Use the Setup Script

1. Upload the `setup-form-submission.php` file to your WordPress root directory
2. Access the script by visiting `https://cms.mardenseo.com/setup-form-submission.php?key=marden-seo-2025` in your browser
3. Choose one of the installation methods (Add to functions.php or Create Plugin)
4. The script will add the necessary code to enable the `submitForm` mutation
5. **Important**: Delete the script after use for security reasons

### Option B: Install the Plugin Manually

1. Create a folder named `marden-graphql-form-submission` in the WordPress plugins directory (`wp-content/plugins/`)
2. Create a file named `marden-graphql-form-submission.php` in that folder
3. Copy and paste the plugin code from the `marden-graphql-form-submission.php` file
4. Activate the plugin from the WordPress admin dashboard (Plugins → Installed Plugins)

## 3. Verify the Integration

After completing the steps above, you should verify that the integration is working properly:

1. Run the test scripts:
   ```
   node test-menu.js
   node test-form.js
   ```

2. You should see:
   - Primary Menu exists
   - submitForm mutation exists in the schema
   - Form submission test result: Success

3. Once verified, ensure the GraphQL proxy server is using the correct mutation format:
   - Check that the proxy server is using `submitForm` instead of `createFormSubmission`
   - Confirm DEBUG_MODE is set to false in the .env file

4. Test the full integration through Apache:
   - Test the content endpoint: `https://mardenseo.com/api/myapp/v1/content`
   - Test the menu endpoint: `https://mardenseo.com/api/myapp/v1/menu`
   - Test the form submission endpoint with a proper POST request

## 4. Restart the GraphQL Proxy Server

After making all changes, restart the GraphQL proxy server:

```bash
# Stop the current process (if running)
# Find the process ID first
ps -ef | grep graphql-proxy-server.js

# Kill the process
kill -9 [PROCESS_ID]

# Start the server again
cd /path/to/graphql-proxy
node graphql-proxy-server.js &
```

## 5. Final Checks

1. Verify that the React+Vite frontend can access WordPress content through the proxy
2. Check that form submissions are working correctly
3. Confirm that the Primary Menu is displayed correctly on the frontend
4. Monitor the server logs for any errors or warnings

If all steps are completed successfully, the WordPress GraphQL integration should be fully functional.
