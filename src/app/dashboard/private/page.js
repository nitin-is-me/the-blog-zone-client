"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { formatTimeAgo } from "../../utils/formatTime";
import { useRouter } from "next/navigation";

export default function PrivatePosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [deletingPostId, setDeletingPostId] = useState(null);

  const router = useRouter();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await axios.get("https://the-blog-zone-server.vercel.app/api/auth/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setCurrentUser(response.data); // the server returns user details
        } catch (error) {
          console.error("Failed to fetch user info:", error);
        }
      }
    };

    const fetchPrivatePosts = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return setError("You must be logged in to see your private posts");
      }
      try {
        const response = await axios.get("https://the-blog-zone-server.vercel.app/api/blog/blogs/private", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPosts(response.data);
      } catch (error) {
        setError(error.response?.data?.message || "Failed to fetch private posts.");
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
    fetchPrivatePosts();
  }, []);

  const handleBack = () => {
    router.push("/dashboard"); // Navigate back to the previous page
  };

  const handleDelete = async (postId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this post?");
    if (!confirmDelete) {
      return;
    }

    setDeletingPostId(postId);
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`https://the-blog-zone-server.vercel.app/api/blog/delete/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPosts(posts.filter((post) => post.id !== postId)); // Update the UI
    } catch (error) {
      console.error("Failed to delete post:", error);
      setError("Could not delete the post. Try again.");
    } finally {
      setDeletingPostId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-opacity-70"></div>
          <p className="mt-4 text-gray-300">Loading private posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={handleBack}
          className="bg-gray-800 text-gray-300 px-4 py-2 rounded shadow-lg hover:bg-gray-700 transition duration-200"
        >
          Back
        </button>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-gray-200">My Private Posts</h1>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {posts.length === 0 ? (
          <p className="text-gray-400 text-center col-span-full">No private posts, create one!</p>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="bg-gray-800 p-6 rounded-lg shadow-lg relative">
              <h2 className="text-2xl font-semibold text-gray-300 mb-4">{post.title}</h2>
              <p className="text-gray-400 mb-4">{post.content.substring(0, 100)}...</p>
              {/* <p className="text-sm text-gray-500">By {post.Blogger.name}</p>*/}
              <p className="text-xs text-gray-500 mt-2">{formatTimeAgo(post.createdAt)}</p>

              <Link
                href={`/dashboard/private/${post.id}`}
                className="text-indigo-500 hover:text-indigo-400 mt-4 inline-block font-medium"
              >
                Read More
              </Link>

              {/* Edit Button */}
              {currentUser?.username === post.Blogger.username && (
                <div className="absolute bottom-4 right-4 flex gap-6">
                  <button
                    onClick={() => router.push(`/dashboard/edit-blog/${post.id}`)}
                    className="text-indigo-500 shadow-md hover:text-indigo-400 transition duration-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="text-red-500 shadow-md hover:text-red-700 transition duration-200"
                    disabled={deletingPostId === post.id}
                  >
                    {deletingPostId === post.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              )}

            </div>
          )))}
      </div>
    </div>
  );
}
