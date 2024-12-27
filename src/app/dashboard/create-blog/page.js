'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function CreateBlogPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // Track the submission process
  const router = useRouter();

  const handleBack = () => {
    router.push("/dashboard"); // Navigate back to the previous page
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to create a post.');
        return;
      }

      setIsSubmitting(true); // Set submitting state to true

      const response = await axios.post(
        'https://the-blog-zone-server.vercel.app/api/blog/create',
        { title, content, private: isPrivate },
        {
          headers: {
            Authorization: `Bearer ${token}`, // attaching token because the API requires it
          },
        }
      );

      setTitle('');
      setContent('');
      setError('');
      router.push('/dashboard'); // Redirect after success
    } catch (error) {
      setError('Failed to create blog post.');
      setIsSubmitting(false);
    }
  };

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

        <h2 className="text-2xl font-bold text-center mb-6">Create a New Blog Post</h2>

        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-500 mb-4">{success}</p>}

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
              <div className="animate-spin rounded-full h-6 w-6 border-t-4 border-white border-opacity-70"></div>
            ) : (
              "Create Post"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
