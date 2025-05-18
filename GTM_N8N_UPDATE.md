// Adding GTM support to workflow 
  
To update the n8n workflow with GTM support, you need to: 
  
1. Access the n8n workflow at http://localhost:5678/workflow/4CoggHF1MBJV6Txm  
 
2. Update content retrieval and form submission Function nodes to include GTM data  
 
3. For content retrieval, add this to the transformation function:  
 
4. For form submissions, add this to the function node: 
5. Go to your n8n container and restart the service: 
docker restart n8n-restored 
