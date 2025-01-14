"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatTimeAgo } from "../utils/formatTime";

export default function Dashboard() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await axios.get("https://the-blog-zone-server.vercel.app/api/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setCurrentUser(response.data);
        } catch (error) {
          console.error("Failed to fetch user info:", error);
        } finally {
          setUserLoading(false); // Set userLoading to false after fetching
        }
      } else {
        setUserLoading(false); // If no token, set userLoading to false
      }
    };
  
    const fetchPosts = async () => {
      try {
        const response = await axios.get("https://the-blog-zone-server.vercel.app/api/blog");
        setPosts(response.data);
      } catch (error) {
        setError("Failed to fetch blog posts.");
      } finally {
        setPostsLoading(false); // Set postsLoading to false after fetching
      }
    };
  
    setUserLoading(true); // Reset loading states before starting fetches
    setPostsLoading(true);
  
    fetchCurrentUser();
    fetchPosts();
  }, []);

  // Set overall loading state
  const [userLoading, setUserLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);

  const overallLoading = userLoading || postsLoading;

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

  const handleLogout = async () => {
    setLogoutLoading(true);
    localStorage.removeItem("token");
    router.push("/");
  };

  if (overallLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-500"></div>
          <p className="mt-4 text-gray-300 text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-300">
      {/* Top Navigation */}
      <header className="bg-gray-800 py-2 px-4 flex justify-between items-center shadow-md sticky top-0 z-10">
        <h1 className="text-xl sm:text-2xl font-bold text-indigo-500">The Blog Zone</h1>
        <div className="flex gap-2 sm:gap-4">
          <Link
            href="/dashboard/private"
            className="text-sm bg-indigo-600 px-3 py-1.5 rounded-full shadow hover:bg-indigo-700 transition duration-200"
          >
            Private Posts
          </Link>
          <button
            onClick={handleLogout}
            className="text-sm bg-red-500 px-3 py-1.5 rounded-full shadow hover:bg-red-600 transition duration-200 flex items-center"
            disabled={logoutLoading}
          >
            {logoutLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
            ) : (
              // "Logout"
              <i className="bi bi-box-arrow-right text-white"></i>
            )}
          </button>
        </div>
      </header>




      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6">
        {/* Welcome Section */}
        <section className="mb-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-200">Welcome, {currentUser?.name || "Guest"}!</h2>
          <p className="text-lg text-gray-400 mt-2">
            Explore the latest blog posts or share your thoughts with the community.
          </p>
        </section>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Posts Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div
              key={post._id}
              className="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300 relative flex flex-col justify-between"
            >
              {/* Post Content */}
              <div>
                <h3 className="text-2xl font-semibold text-gray-300 mb-3">{post.title}</h3>
                <p className="text-gray-400 mb-4">{post.content.substring(0, 100)}...</p>
                <p className="text-sm text-gray-500">
                  By {post.author.name}
                </p>
                <p className="text-xs text-gray-500 mt-2">{formatTimeAgo(post.createdAt)}</p>
                <Link
                  href={`/dashboard/${post._id}`}
                  className="text-indigo-500 hover:text-indigo-400 mt-4 inline-block font-medium"
                >
                  Read More
                </Link>
              </div>

              {/* Delete Button */}
              {/* Edit Button */}
              {currentUser?.username === post.author.username && (
                <div className="absolute bottom-4 right-4 flex gap-6">
                  <button
                    onClick={() => router.push(`/dashboard/edit-blog/${post._id}`)}
                    className="text-indigo-500 shadow-md hover:text-indigo-400 transition duration-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(post._id)}
                    className="text-red-500 shadow-md hover:text-red-400 transition duration-200"
                  >
                    Delete
                  </button>
                </div>
              )}

            </div>
          ))}
        </section>

      </main>

      {/* Floating Action Button */}
      <Link
        href="/dashboard/create-blog"
        className="fixed bottom-6 right-6 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition transform hover:scale-110"
      >
        <span className="text-2xl">+</span>
      </Link>
    </div>
  );
}
