/**
 * WordPress Integration for Marden SEO
 * Provides seamless API connections between React frontend and WordPress backend
 * via n8n middleware
 */

(function() {
    const API_BASE_URL = 'https://api.mardenseo.com'; // Change to your n8n webhook URL
    const API_SECRET = 'marden-api-secret'; // This should be secured in production
    
    /**
     * Makes API requests to n8n middleware
     * @param {string} endpoint - API endpoint path
     * @param {Object} options - Request options
     * @returns {Promise} - Fetch promise
     */
    async function apiRequest(endpoint, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            'X-API-SECRET': API_SECRET
        };
        
        // Add authentication token if available
        const token = localStorage.getItem('auth_token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                ...headers,
                ...(options.headers || {})
            }
        });
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({
                message: `API error: ${response.status} ${response.statusText}`
            }));
            throw new Error(error.message || 'Unknown API error');
        }
        
        return response.json();
    }
    
    /**
     * WordPress integration API
     */
    window.WordPressAPI = {
        /**
         * Fetch posts from WordPress
         * @param {number} page - Page number
         * @param {number} perPage - Items per page
         * @returns {Promise} - Posts data
         */
        getPosts: async (page = 1, perPage = 10) => {
            return apiRequest('/api/content', {
                method: 'GET',
                params: { page, per_page: perPage }
            });
        },
        
        /**
         * Submit contact form data
         * @param {Object} formData - Form data to submit
         * @returns {Promise} - Submission result
         */
        submitContactForm: async (formData) => {
            return apiRequest('/api/forms/submit', {
                method: 'POST',
                body: JSON.stringify(formData)
            });
        },
        
        /**
         * Authenticate user
         * @param {string} username - WordPress username
         * @param {string} password - WordPress password
         * @returns {Promise} - Authentication result with token
         */
        login: async (username, password) => {
            const result = await apiRequest('/api/auth', {
                method: 'POST',
                body: JSON.stringify({ username, password })
            });
            
            if (result.token) {
                localStorage.setItem('auth_token', result.token);
            }
            
            return result;
        },
        
        /**
         * Logout user
         */
        logout: () => {
            localStorage.removeItem('auth_token');
        }
    };
    
    /**
     * Auto-initialize forms
     */
    document.addEventListener('DOMContentLoaded', () => {
        // Find all forms with data-wp-form attribute
        const forms = document.querySelectorAll('[data-wp-form="contact"]');
        
        forms.forEach(form => {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const submitButton = form.querySelector('[type="submit"]');
                const originalButtonText = submitButton.textContent;
                submitButton.textContent = 'Sending...';
                submitButton.disabled = true;
                
                // Get form data
                const formData = {};
                const formElements = form.querySelectorAll('input, textarea, select');
                formElements.forEach(element => {
                    if (element.name) {
                        formData[element.name] = element.value;
                    }
                });
                
                try {
                    const result = await window.WordPressAPI.submitContactForm(formData);
                    
                    // Show success message
                    const successMessage = document.createElement('div');
                    successMessage.className = 'form-success-message';
                    successMessage.textContent = 'Thank you for your message! We\'ll get back to you soon.';
                    form.appendChild(successMessage);
                    
                    // Reset form
                    form.reset();
                } catch (error) {
                    // Show error message
                    const errorMessage = document.createElement('div');
                    errorMessage.className = 'form-error-message';
                    errorMessage.textContent = error.message || 'Something went wrong. Please try again.';
                    form.appendChild(errorMessage);
                } finally {
                    submitButton.textContent = originalButtonText;
                    submitButton.disabled = false;
                }
            });
        });
    });
})();
