"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatTimeAgo } from "../utils/formatTime";

export default function Profile() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("personal");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    newUsername: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      let token = localStorage.getItem("token");
      if (!token) {
        router.push("/");
        return;
      }

      try {
        const response = await axios.get("https://the-blog-zone-server.vercel.app/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setCurrentUser(response.data);
        setFormData({
          name: response.data.name || "",
          username: response.data.username || "",
          newUsername: response.data.username || "",
          newPassword: "",
          confirmPassword: ""
        });
      } catch (error) {
        console.error("Failed to fetch user info:", error);
        setError("Failed to load user information. Please try again.");

        // If unauthorized, remove token and redirect
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          router.push("/");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUsernameChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    // Validate for spaces in real-time
    if (/\s/.test(value)) {
      setUsernameError("Spaces are not allowed in username");
    } else {
      setUsernameError("");
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    // Validate for spaces in real-time
    if (/\s/.test(value)) {
      setPasswordError("Spaces are not allowed in password");
    } else {
      setPasswordError("");
    }
  };

  const updateProfile = async (e) => {
  e.preventDefault();
  setUpdating(true);
  setError("");
  setSuccess("");

  if (/\s/.test(formData.newUsername)) {
    setError("Username cannot contain spaces");
    setUpdating(false);
    return;
  }

  let token = localStorage.getItem("token");
  try {
    const trimmedName = formData.name.trim();
    const payload = {
      name: trimmedName
    };

    // Only include newUsername in the payload if it's different from the current username
    if (formData.newUsername !== formData.username) {
      payload.newUsername = formData.newUsername;
    }

    const response = await axios.put(
      "https://the-blog-zone-server.vercel.app/api/auth/updateProfile",
      payload,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    // Store the new token (to update our username in jwt stored locally)
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
    }
    
    // Update all relevant state
    const updatedUser = {
      ...currentUser,
      name: trimmedName,
    };

    // Only update username if it was changed
    if (formData.newUsername !== formData.username) {
      updatedUser.username = formData.newUsername;
    }

    setCurrentUser(updatedUser);

    setFormData(prev => ({
      ...prev,
      name: trimmedName,
      username: updatedUser.username,
      newUsername: updatedUser.username
    }));

    setSuccess("Profile updated successfully!");

  } catch (error) {
    console.error("Failed to update profile:", error);
    setError(error.response?.data?.message || "Failed to update profile. Please try again.");

    // If the error is due to an invalid token, redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      router.push("/");
    }
  } finally {
    setUpdating(false);
  }
};

  const updatePassword = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (/\s/.test(formData.newPassword)) {
      setError("Password cannot contain spaces");
      return;
    }

    setUpdating(true);
    setError("");
    setSuccess("");

    const token = localStorage.getItem("token");
    try {
      await axios.put(
        "https://the-blog-zone-server.vercel.app/api/auth/changePassword",
        {
          newPassword: formData.newPassword
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setSuccess("Password updated successfully!");
      setFormData(prev => ({
        ...prev,
        newPassword: "",
        confirmPassword: ""
      }));
    } catch (error) {
      console.error("Failed to update password:", error);
      setError(error.response?.data?.message || "Failed to update password. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-500"></div>
          <p className="mt-4 text-gray-300 text-lg font-medium">Loading profile...</p>
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
            href="/dashboard"
            className="text-gray-300 hover:text-indigo-400 transition duration-200"
          >
            <i className="bi bi-arrow-left text-xl"></i>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-indigo-500">Profile Settings</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6">
        {/* User Profile Banner */}
        <div className="mb-8 bg-gray-800 rounded-lg p-6 shadow-lg">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center text-4xl text-indigo-400">
              {currentUser?.name?.charAt(0).toUpperCase() || "A"}
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-bold text-gray-200">{currentUser?.name}</h2>
              <p className="text-gray-400">@{currentUser?.username}</p>
              <small className="text-gray-400">Member since: {formatTimeAgo(currentUser.createdAt).split(",")[0].trim()}</small>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-700">
          <div className="flex">
            <button
              onClick={() => setActiveTab("personal")}
              className={`py-2 px-4 ${activeTab === "personal"
                ? "text-indigo-400 border-b-2 border-indigo-400"
                : "text-gray-400 hover:text-gray-300"
                }`}
            >
              Personal Information
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`py-2 px-4 ${activeTab === "security"
                ? "text-indigo-400 border-b-2 border-indigo-400"
                : "text-gray-400 hover:text-gray-300"
                }`}
            >
              Security
            </button>
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          {error && (
            <div className="mb-4 bg-red-900/50 border border-red-800 text-red-200 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 bg-green-900/50 border border-green-800 text-green-200 px-4 py-3 rounded">
              {success}
            </div>
          )}

          {activeTab === "personal" && (
            <form onSubmit={updateProfile} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="currentUsername" className="block text-sm font-medium text-gray-400 mb-1">
                  Current Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-not-allowed opacity-70"
                  disabled
                />
              </div>

              <div>
                <label htmlFor="newUsername" className="block text-sm font-medium text-gray-400 mb-1">
                  New Username
                </label>
                <input
                  type="text"
                  id="newUsername"
                  name="newUsername"
                  value={formData.newUsername}
                  onChange={handleUsernameChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
                {usernameError && (
                  <div className="text-red-500 text-sm mt-1">{usernameError}</div>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex justify-center"
                  disabled={updating || usernameError}
                >
                  {updating ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  ) : (
                    "Update Profile"
                  )}
                </button>
              </div>
            </form>
          )}

          {activeTab === "security" && (
            <form onSubmit={updatePassword} className="space-y-4">
              <div className="relative">
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-400 mb-1">
                  New Password
                </label>
                <input
                  type={showNewPassword ? "text" : "password"}
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={toggleNewPasswordVisibility}
                  className="absolute right-3 top-8 text-gray-400 hover:text-gray-300"
                  aria-label={showNewPassword ? "Hide password" : "Show password"}
                >
                  {showNewPassword ? (
                    <i className="bi bi-eye-slash-fill"></i>
                  ) : (
                    <i className="bi bi-eye-fill"></i>
                  )}
                </button>
              </div>

              <div className="relative">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-400 mb-1">
                  Confirm New Password
                </label>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute right-3 top-8 text-gray-400 hover:text-gray-300"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
                    <i className="bi bi-eye-slash-fill"></i>
                  ) : (
                    <i className="bi bi-eye-fill"></i>
                  )}
                </button>
              </div>

              {passwordError && (
                <div className="text-red-500 text-sm">{passwordError}</div>
              )}

              <div>
                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex justify-center"
                  disabled={updating || passwordError}
                >
                  {updating ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  ) : (
                    "Change Password"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
