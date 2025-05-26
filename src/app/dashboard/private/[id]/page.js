'use client';
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { formatTimeAgo } from "../../../utils/formatTime";

export default function BlogPostPage() {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loggedInUser, setLoggedInUser] = useState(null); // state for logged-in user
  const router = useRouter();
  const { id } = useParams();

  useEffect(() => {
    if (!id) return;

    const fetchPost = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return setError("You must be logged in to see this private post");
      }
      try {
        const response = await axios.get(`https://the-blog-zone-server.vercel.app/api/blog/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPost(response.data);
      } catch (error) {
        setError(error.response?.data?.message || "Failed to fetch the blog post.");
      } finally {
        setLoading(false);
      }
    };

    // Fetch the logged-in user details
    const fetchLoggedInUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await axios.get("https://the-blog-zone-server.vercel.app/api/auth/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setLoggedInUser(response.data);
        } catch (error) {
          console.error("Failed to fetch user data.");
        }
      }
    };

    fetchPost();
    fetchLoggedInUser();
  }, [id]);

  const handleBack = () => {
    router.push("/dashboard/private");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-500 border-opacity-70"></div>
          <p className="mt-4 text-gray-300">Loading post...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-300">
      <div className="max-w-4xl mx-auto p-6 bg-gray-900">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={handleBack}
            className="bg-gray-800 text-gray-300 px-4 py-2 rounded shadow-lg hover:bg-gray-700 transition duration-200"
          >
            Back
          </button>
        </div>

        {error && <p className="text-red-500">{error}</p>}

        {post && (
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold text-gray-100 mb-6 break-words">{post.title}</h1>
            <p className="text-gray-400 mb-4 whitespace-pre-wrap break-words">{post.content}</p>
            <p className="text-xs text-gray-500 mt-2 break-words">{formatTimeAgo(post.createdAt)}</p>
          </div>
        )}

      </div>
    </div>
  );
}
