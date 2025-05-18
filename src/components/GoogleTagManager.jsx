// GoogleTagManager.jsx - Complete implementation 
import { useEffect } from 'react'; 
import { useLocation } from 'react-router-dom'; 
  
const GTM_ID = 'GTM-5R45LHS7'; // Your GTM container ID 
  
const GoogleTagManager = () =
  const location = useLocation(); 
   
  // Initialize GTM on component mount  
  useEffect(() =
    // Check if window exists (client-side) before executing  
    if (typeof window === 'undefined') return; 
    // Initialize dataLayer  
