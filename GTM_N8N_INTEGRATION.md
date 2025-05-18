# GTM Integration with n8n and React  
  
This document explains how to integrate Google Tag Manager with your n8n workflow to enhance tracking between WordPress and React.  
  
## n8n Workflow Updates  
  
When using n8n as middleware between WordPress and React, you need to forward GTM dataLayer events. Add these Function nodes to your workflow: 
  
### 1. Form Submission Tracking  
  
Add this code to your form processing workflow:  
  
```javascript  
// Send GTM event data to frontend  
const gtmEventData = {  
  event: 'formSubmission',  
  
### 2. Content View Tracking  
  
Add this to your content retrieval workflow: 
