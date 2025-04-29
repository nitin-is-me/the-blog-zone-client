'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter, useParams } from 'next/navigation';

export default function EditBlogPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { id } = useParams();

  useEffect(() => {
    // Fetch the existing post details
    const fetchPost = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return setError("You must be logged in to edit post");
      }

      try {
        const response = await axios.get(`https://the-blog-zone-server.vercel.app/api/blog/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const post = response.data;
        setTitle(post.title);
        setContent(post.content);
        setIsPrivate(post.private);
        setLoading(false);
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to fetch post details.');
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const handleBack = () => {
    router.push('/dashboard'); // Navigate back to the dashboard
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to edit a post.');
        return;
      }

      setIsSubmitting(true);

      await axios.put(
        `https://the-blog-zone-server.vercel.app/api/blog/edit/${id}`,
        { title, content, private: isPrivate },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      router.back();
    } catch (error) {
      setError('Failed to update the blog post.');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-500 border-opacity-70"></div>
          <p className="mt-4 text-gray-300">Loading edit page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-300">
      <div className="max-w-4xl mx-auto p-6 bg-gray-900 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={handleBack}
            className="bg-gray-800 text-gray-300 px-4 py-2 rounded shadow-lg hover:bg-gray-700 transition duration-200"
          >
            Back
          </button>
        </div>

        <h2 className="text-2xl font-bold text-center mb-6">Edit Blog Post</h2>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-gray-300 focus:outline-none focus:ring focus:ring-indigo-500"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-gray-300 focus:outline-none focus:ring focus:ring-indigo-500"
              rows="5"
              required
            ></textarea>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Privacy</label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value={false}
                  checked={!isPrivate}
                  onChange={() => setIsPrivate(false)}
                  className="mr-2"
                />
                Public
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value={true}
                  checked={isPrivate}
                  onChange={() => setIsPrivate(true)}
                  className="mr-2"
                />
                Private
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white p-2 rounded flex justify-center items-center hover:bg-indigo-700 transition duration-200"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-6 w-6 border-t-4 border-white"></div>
            ) : (
              'Update Post'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
