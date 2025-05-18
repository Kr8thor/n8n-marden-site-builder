// src/pages/BlogPage.jsx
import { useState } from 'react';
import { useWordPressData } from '../hooks/useWordPressData';

function BlogPage() {
  const [page, setPage] = useState(1);
  const { data: posts, loading, error, totalPages } = useWordPressData(page);
  
  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  
  return (
    <div className="blog-page">
      <h1 className="text-3xl font-bold mb-8">Blog</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map(post => (
          <article key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {post.featuredImage && (
              <img 
                src={post.featuredImage} 
                alt={post.title} 
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-6">
              <h2 className="text-xl font-bold mb-2">{post.title}</h2>
              <div 
                className="text-gray-600 mb-4 line-clamp-3" 
                dangerouslySetInnerHTML={{ __html: post.excerpt }} 
              />
              <div className="flex justify-between text-sm text-gray-500 mb-4">
                <span>By {post.author}</span>
                <span>{new Date(post.date).toLocaleDateString()}</span>
              </div>
              <a 
                href={`/post/${post.slug}`}
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Read more
              </a>
            </div>
          </article>
        ))}
      </div>
      
      {totalPages > 1 && (
        <div className="pagination flex justify-center mt-8">
          <button 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-200 rounded-l disabled:opacity-50"
          >
            Previous
          </button>
          <div className="px-4 py-2 bg-gray-100">
            Page {page} of {totalPages}
          </div>
          <button 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-gray-200 rounded-r disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default BlogPage;
