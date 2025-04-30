"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { formatTimeAgo } from "../../utils/formatTime";
import { useRouter } from "next/navigation";

export default function PrivatePosts() {

  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [deletingPostId, setDeletingPostId] = useState(null);

  // Search states
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("title");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
        setFilteredPosts(response.data); // Initialize filtered posts with all posts
      } catch (error) {
        setError(error.response?.data?.message || "Failed to fetch private posts.");
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
    fetchPrivatePosts();
  }, []);

  // Filter posts based on search query and field
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPosts(posts);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = posts.filter(post => {
      switch (searchField) {
        case "title":
          return post.title.toLowerCase().includes(query);
        case "content":
          return post.content.toLowerCase().includes(query);
        default:
          return true;
      }
    });

    setFilteredPosts(filtered);
  }, [searchQuery, searchField, posts]);

  // Reset search query when search panel is closed
  useEffect(() => {
    if (!isSearchVisible) {
      setSearchQuery("");
    }
  }, [isSearchVisible]);

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
      const updatedPosts = posts.filter((post) => post.id !== postId);
      setPosts(updatedPosts);
      setFilteredPosts(updatedPosts); // Update filtered posts as well
    } catch (error) {
      console.error("Failed to delete post:", error);
      setError("Could not delete the post. Try again.");
    } finally {
      setDeletingPostId(null);
    }
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Handle field selection
  const selectSearchField = (field) => {
    setSearchField(field);
    setIsDropdownOpen(false);
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
    <div className="max-w-7xl mx-auto p-6 bg-gray-900 min-h-screen">

      <div className="flex justify-between items-center mb-6">
        <button
          onClick={handleBack}
          className="bg-gray-800 text-gray-300 px-4 py-2 rounded shadow-lg hover:bg-gray-700 transition duration-200"
        >
          Back
        </button>

        <button
          onClick={() => setIsSearchVisible(!isSearchVisible)}
          className="bg-gray-800 text-gray-300 px-4 py-2 rounded shadow-lg hover:bg-gray-700 transition duration-200 flex items-center gap-2"
        >
          <i className={`bi ${isSearchVisible ? "bi-x" : "bi-search"}`}></i>
          {isSearchVisible ? "Close" : "Search"}
        </button>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-gray-200">My Private Posts</h1>
      </div>

      {/* Search Section - Collapsible */}
      {isSearchVisible && (
        <section className="mb-8 animate-fade-in">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative w-full sm:w-3/4">
              <input
                type="text"
                placeholder="Search your private posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-4 text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-300"
                >
                  ×
                </button>
              )}
            </div>

            {/* Combobox for selecting search field - only title and content */}
            <div className="relative w-full sm:w-1/4">
              <button
                onClick={toggleDropdown}
                className="w-full flex items-center justify-between bg-gray-800 border border-gray-700 rounded-lg py-2 px-4 text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <span className="capitalize">
                  {searchField === "title" ? "Title" : "Content"}
                </span>
                <svg
                  className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              {isDropdownOpen && (
                <div className="absolute w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-20">
                  <ul>
                    <li
                      className={`py-2 px-4 cursor-pointer hover:bg-gray-700 ${searchField === 'title' ? 'bg-indigo-900 text-indigo-300' : ''}`}
                      onClick={() => selectSearchField('title')}
                    >
                      Title
                    </li>
                    <li
                      className={`py-2 px-4 cursor-pointer hover:bg-gray-700 ${searchField === 'content' ? 'bg-indigo-900 text-indigo-300' : ''}`}
                      onClick={() => selectSearchField('content')}
                    >
                      Content
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Search results counter */}
          <div className="mt-4 text-sm text-gray-400">
            {searchQuery ? `Found ${filteredPosts.length} post${filteredPosts.length !== 1 ? 's' : ''}` : ''}
          </div>
        </section>
      )}

      {error && <p className="text-red-500">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredPosts.length === 0 ? (
          searchQuery ? (
            <p className="text-gray-400 text-center col-span-full">
              No posts found matching your search.
              <button
                onClick={() => setSearchQuery("")}
                className="ml-2 text-indigo-500 hover:text-indigo-400"
              >
                Clear search
              </button>
            </p>
          ) : (
            <p className="text-gray-400 text-center col-span-full">No private posts, create one!</p>
          )
        ) : (
          filteredPosts.map((post) => (
            <div key={post.id} className="bg-gray-800 p-6 rounded-lg shadow-lg relative">
              <h2 className="text-2xl font-semibold text-gray-300 mb-4">{post.title}</h2>
              <p className="text-gray-400 mb-4">{post.content.substring(0, 100)}...</p>
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
