'use client';
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { formatTimeAgo } from "../../../utils/formatTime";

export default function BlogPostPage() {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [Comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [commentError, setCommentError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null); // state for logged-in user
  const [deletingCommentId, setDeletingCommentId] = useState(null); // state to track deleting comment
  const router = useRouter();
  const { id } = useParams();

  useEffect(() => {
    if (!id) return;

    const fetchPost = async () => {
      try {
        const response = await axios.get(`https://the-blog-zone-server.vercel.app/api/blog/${id}`);
        setPost(response.data);
        setComments(response.data.Comments || []);
      } catch (error) {
        setError("Failed to fetch the blog post.");
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

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!newComment.trim()) {
      setCommentError("Comment cannot be empty.");
      return;
    }

    setCommentError("");
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token"); // Assuming token is stored in localStorage
      const response = await axios.post(
        `https://the-blog-zone-server.vercel.app/api/blog/${id}/comments`,
        { content: newComment },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const commentResponse = await axios.get(`https://the-blog-zone-server.vercel.app/api/blog/${id}`);
      setComments(commentResponse.data.Comments);
      setNewComment(""); // Reset comment input
    } catch (error) {
      setCommentError(error?.response?.message || "Failed to submit comment. If you aren't logged in, please do.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this comment?");
    if (!confirmDelete) {
      return;
    }

    setDeletingCommentId(commentId); // Set the comment as deleting

    try {
      const token = localStorage.getItem("token");

      // Send DELETE request to the backend to delete the comment
      await axios.delete(`https://the-blog-zone-server.vercel.app/api/blog/comment/${commentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Update the UI by removing the deleted comment
      setComments((prevComments) =>
        prevComments.filter((comment) => comment.id !== commentId)
      );
    } catch (error) {
      setError("Failed to delete the comment. Please try again.");
    } finally {
      setDeletingCommentId(null); // Reset deleting state
    }
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
            <h1 className="text-3xl font-bold text-gray-100 mb-6">{post.title}</h1>
            <p className="text-gray-400 mb-4 whitespace-pre-wrap">{post.content}</p>
            <p className="text-sm text-gray-500">By {post.Blogger.name}</p>
            <p className="text-xs text-gray-500 mt-2">{formatTimeAgo(post.createdAt)}</p>
          </div>
        )}

        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-100 mb-4">Comments</h2>

          <form onSubmit={handleCommentSubmit} className="mb-6">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="bg-gray-900 text-gray-200 w-full p-3 border border-gray-700 rounded-lg focus:outline-none focus:ring focus:ring-indigo-500"
              rows="4"
              placeholder="Write a comment..."
            />
            {commentError && <p className="text-red-500 text-sm">{commentError}</p>}
            <button
              type="submit"
              className="mt-2 bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700 transition duration-200"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Post Comment"}
            </button>
          </form>

          {/* Display Comments */}
          <div className="space-y-4">
            {Comments.length > 0 ? (
              Comments.map((comment) => (
                <div key={comment.id} className="p-4 rounded-lg bg-gray-800 flex flex-col justify-between">
                  <div>
                    <p className="text-gray-300">{comment.content}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      By {comment.Blogger?.name || "anonymous"} &middot;{" "}
                      {formatTimeAgo(comment.createdAt)}
                    </p>
                  </div>

                  {/* Delete Button */}
                  {loggedInUser?.username === comment.Blogger?.username && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="self-end mt-2 text-red-500 hover:text-red-700"
                      disabled={deletingCommentId === comment.id}
                    >
                      {deletingCommentId === comment.id ? "Deleting..." : "Delete"}
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500">No comments yet. Be the first to comment!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
