// src/hooks/useWordPressData.js
import { useState, useEffect } from 'react';
import { fetchPosts } from '../services/api';

export function useWordPressData(page = 1, perPage = 10) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        const response = await fetchPosts(page, perPage);
        setData(Array.isArray(response) ? response : []);
        
        // If response has pagination info
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages || 1);
        }
        
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, [page, perPage]);

  return { data, loading, error, totalPages };
}

export default useWordPressData;
