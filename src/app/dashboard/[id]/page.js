'use client';
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { formatTimeAgo } from "../../utils/formatTime";

export default function BlogPostPage() {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [comments, setComments] = useState([]);
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
        const response = await axios.get(`http://localhost:8000/api/blog/${id}`);
        setPost(response.data);
        setComments(response.data.comments || []);
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
          const response = await axios.get("http://localhost:8000/api/auth/me", {
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
    router.back(); // Navigate back to the previous page
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
        `http://localhost:8000/api/blog/${id}/comments`,
        { content: newComment },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const commentResponse = await axios.get(`http://localhost:8000/api/blog/${id}`);
      setComments(commentResponse.data.comments);
      setNewComment(""); // Reset comment input
    } catch (error) {
      setCommentError("Failed to submit comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    setDeletingCommentId(commentId); // Set the comment as deleting

    try {
      const token = localStorage.getItem("token");

      // Send DELETE request to the backend to delete the comment
      await axios.delete(`http://localhost:8000/api/blog/comment/${commentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Update the UI by removing the deleted comment
      setComments((prevComments) =>
        prevComments.filter((comment) => comment._id !== commentId)
      );
    } catch (error) {
      setError("Failed to delete the comment. Please try again.");
    } finally {
      setDeletingCommentId(null); // Reset deleting state
    }
  };

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
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={handleBack}
          className="bg-gray-200 text-gray-800 px-4 py-2 rounded shadow-lg hover:bg-gray-300 transition duration-200"
        >
          Back
        </button>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {post && (
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold mb-6">{post.title}</h1>
          <p className="text-gray-600 mb-4 whitespace-pre-wrap">{post.content}</p>
          <p className="text-sm text-gray-500">By {post.author.name}</p>
          <p className="text-xs text-gray-400 mt-2">
            {formatTimeAgo(post.createdAt)}
          </p>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Comments</h2>

        <form onSubmit={handleCommentSubmit} className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
            rows="4"
            placeholder="Write a comment..."
          />
          {commentError && <p className="text-red-500 text-sm">{commentError}</p>}
          <button
            type="submit"
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 transition duration-200"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Post Comment"}
          </button>
        </form>

        {/* Display Comments */}
        <div className="space-y-4">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment._id} className="p-4 border rounded-lg flex flex-col justify-between">
                <div>
                  <p className="text-gray-800">{comment.content}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    By {comment.author?.name || "anonymous"} &middot;{" "}
                    {formatTimeAgo(comment.createdAt)}
                  </p>
                </div>

                {/* Delete Button */}
                {loggedInUser?.username === comment.author?.username && (
                  <button
                    onClick={() => handleDeleteComment(comment._id)}
                    className="self-end mt-2 text-red-500 hover:text-red-700"
                    disabled={deletingCommentId === comment._id}
                  >
                    {deletingCommentId === comment._id ? "Deleting..." : "Delete"}
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
  );
}
