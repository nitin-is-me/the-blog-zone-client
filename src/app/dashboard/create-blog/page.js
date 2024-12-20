'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function CreateBlogPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleBack = () => {
    router.back(); // Navigate back to the previous page
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to create a post.');
        return;
      }

      const response = await axios.post(
        'https://the-blog-zone-server.vercel.app/api/blog/create',
        { title, content },
        {
          headers: {
            Authorization: `Bearer ${token}`, // attaching token cuz the API requires it
          },
        }
      );

      setSuccess('Blog post created successfully!');
      setTitle('');
      setContent('');
      setError('');
      setTimeout(() => router.push('/dashboard'), 2000); // Redirect after success
    } catch (error) {
      setError('Failed to create blog post.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-16">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={handleBack}
          className="bg-gray-200 text-gray-800 px-4 py-2 rounded shadow-lg hover:bg-gray-300 transition duration-200"
        >
          Back
        </button>
        <h2 className="text-2xl font-bold">Create a New Blog Post</h2>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            rows="5"
            required
          ></textarea>
        </div>

        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
          Create Post
        </button>
      </form>
    </div>
  );
}
