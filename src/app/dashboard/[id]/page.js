'use client';
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";

export default function BlogPostPage() {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const { id } = useParams();

  useEffect(() => {
    if (!id) return;

    const fetchPost = async () => {
      try {
        const response = await axios.get(`https://the-blog-zone-server.vercel.app/api/blog/${id}`);
        setPost(response.data);
      } catch (error) {
        setError("Failed to fetch the blog post.");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-opacity-70"></div>
          <p className="mt-4 text-gray-600">Loading post...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-4xl mx-auto p-6">
      {error && <p className="text-red-500">{error}</p>}

      {post && (
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold mb-6">{post.title}</h1>
          <p className="text-gray-600 mb-4">{post.content}</p>
          <p className="text-sm text-gray-400">By {post.author.name}</p>
        </div>
      )}
    </div>
  );
}
