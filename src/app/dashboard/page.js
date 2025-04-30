"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatTimeAgo } from "../utils/formatTime";

export default function Dashboard() {

  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [deletingPostId, setDeletingPostId] = useState(null);
  const router = useRouter();

  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("title");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);

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
          setUserLoading(false);
        }
      } else {
        setUserLoading(false);
      }
    };

    const fetchPosts = async () => {
      try {
        const response = await axios.get("https://the-blog-zone-server.vercel.app/api/blog");
        setPosts(response.data);
        setFilteredPosts(response.data); // Initialize filtered posts with all posts
      } catch (error) {
        setError("Failed to fetch blog posts.");
      } finally {
        setPostsLoading(false);
      }
    };

    setUserLoading(true);
    setPostsLoading(true);

    fetchCurrentUser();
    fetchPosts();
  }, []);

  // Set overall loading state
  const [userLoading, setUserLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);

  const overallLoading = userLoading || postsLoading;

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
        case "author":
          return post.Blogger.name.toLowerCase().includes(query);
        default:
          return true;
      }
    });

    setFilteredPosts(filtered);
  }, [searchQuery, searchField, posts]);

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
        <div className="flex items-center gap-4">
          <Link
            href="/profile"
            className="text-gray-300 hover:text-indigo-400 transition duration-200"
          >
            <i className="bi bi-person-circle text-2xl"></i>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-indigo-500">The Blog Zone</h1>
        </div>
        <div className="flex gap-2 sm:gap-4">

          <Link
            href="/dashboard/private"
            className="text-sm bg-indigo-600 px-3 py-1.5 rounded-full shadow hover:bg-indigo-700 transition duration-200"
          >
            Private
          </Link>

          <button
            onClick={() => setIsSearchVisible(!isSearchVisible)}
            className="bg-gray-800 text-gray-300 px-2 py-1 rounded shadow-lg hover:bg-gray-700 transition duration-200 flex items-center gap-2"
          >
            <i className={`bi ${isSearchVisible ? "bi-x" : "bi-search"}`}></i>
            {isSearchVisible ? "Close" : "Search"}
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

        {/* Search Section - Collapsible */}
        {isSearchVisible && (
          <section className="mb-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative w-full sm:w-3/4">
                <input
                  type="text"
                  placeholder="Search posts..."
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

              {/* Combobox for selecting search field */}
              <div className="relative w-full sm:w-1/4">
                <button
                  onClick={toggleDropdown}
                  className="w-full flex items-center justify-between bg-gray-800 border border-gray-700 rounded-lg py-2 px-4 text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <span className="capitalize">
                    {searchField === "title" ? "Title" :
                      searchField === "content" ? "Content" : "Author"}
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
                      <li
                        className={`py-2 px-4 cursor-pointer hover:bg-gray-700 ${searchField === 'author' ? 'bg-indigo-900 text-indigo-300' : ''}`}
                        onClick={() => selectSearchField('author')}
                      >
                        Author
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

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Posts Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <div
                key={post.id}
                className="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300 relative flex flex-col justify-between"
              >
                {/* Post Content */}
                <div>
                  <h3 className="text-2xl font-semibold text-gray-300 mb-3">{post.title}</h3>
                  <p className="text-gray-400 mb-4">{post.content.substring(0, 100)}...</p>
                  <p className="text-sm text-gray-500">
                    By {post.Blogger.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">{formatTimeAgo(post.createdAt)}</p>
                  <Link
                    href={`/dashboard/${post.id}`}
                    className="text-indigo-500 hover:text-indigo-400 mt-4 inline-block font-medium"
                  >
                    Read More
                  </Link>
                </div>

                {/* Edit Button */}
                {currentUser?.username === post.Blogger.username && (
                  <div className="absolute bottom-4 right-4 flex gap-6">
                    <button
                      onClick={() => router.push(`/dashboard/edit-blog/${post.id}`)}
                      className="text-indigo-500 shadow-md hover:text-indigo-400 transition duration-200"
                    >
                      Edit
                    </button>
                    {/* Delete Button */}
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
            ))
          ) : (
            <div className="col-span-1 sm:col-span-2 lg:col-span-3 text-center py-8 text-gray-400">
              <p className="text-lg">No posts found matching your search.</p>
              <button
                onClick={() => setSearchQuery("")}
                className="mt-4 text-indigo-500 hover:text-indigo-400"
              >
                Clear search
              </button>
            </div>
          )}
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
