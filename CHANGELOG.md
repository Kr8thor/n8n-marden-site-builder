# Changelog

## 2025-05-17

### Fixed
- Fixed broken connections between nodes
- Replaced incompatible node types with supported n8n nodes
- Converted `Function` nodes to supported `Code` nodes
- Replaced WordPress-specific nodes with standard HTTP Request nodes
- Fixed webhook response nodes to use proper respondToWebhook type
- Updated authentication flow to use proper HTTP headers
- Added proper error handling in form submission flow
- Fixed single post retrieval endpoint

### Changed
- Simplified workflow structure for better maintainability
- Improved JSON data handling and transformation
- Updated API response formats for better frontend integration
- Added cache control headers for performance optimization
- Enhanced form validation and sanitization
- Improved hierarchical menu structure transformation

### Added
- Detailed documentation on each endpoint
- Improved error responses with meaningful status codes
- Better handling of WordPress API responses
- Support for pagination and filtering in post listings