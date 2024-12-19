'use client';
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
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
          setCurrentUser(response.data); // Assuming the server returns user details
        } catch (error) {
          console.error("Failed to fetch user info:", error);
        }
      }
    };

    const fetchPosts = async () => {
      try {
        const response = await axios.get("https://the-blog-zone-server.vercel.app/api/blog");
        setPosts(response.data);
      } catch (error) {
        setError("Failed to fetch blog posts.");
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
    fetchPosts();
  }, []);

  const handleDelete = async (postId) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`https://the-blog-zone-server.vercel.app/api/blog/delete/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPosts(posts.filter((post) => post._id !== postId)); // Update the UI
    } catch (error) {
      console.error("Failed to delete post:", error);
      setError("Could not delete the post. Try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-opacity-70"></div>
          <p className="mt-4 text-gray-600">Loading posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold">The Blog Zone</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded shadow-lg hover:bg-red-600 transition duration-200"
        >
          Logout
        </button>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {posts.map((post) => (
          <div key={post._id} className="bg-white p-6 rounded-lg shadow-lg relative">
            <h2 className="text-xl font-bold mb-4">{post.title}</h2>
            <p className="text-gray-600 mb-4">{post.content.substring(0, 100)}...</p>
            <p className="text-sm text-gray-400">By {post.author.name}</p>
            <Link
              href={`/dashboard/${post._id}`}
              className="text-blue-500 hover:text-blue-700 mt-4 inline-block"
            >
              Read More
            </Link>
            {/* check if the post author's username matches the logged in user */}
            {currentUser?.username === post.author.username && (
              <button
                onClick={() => handleDelete(post._id)}
                className="absolute bottom-4 right-4 text-red-500 hover:text-red-700 transition duration-200"
              >
                Delete
              </button>
            )}
          </div>
        ))}
      </div>

      <Link
        href="/dashboard/create-blog"
        className="fixed bottom-6 right-6 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition duration-200"
      >
        <span className="text-2xl">+</span>
      </Link>
    </div>
  );
}
