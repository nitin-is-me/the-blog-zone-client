'use client';
import axios from 'axios';
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();

    // Validate fields
    if (/\s/.test(username)) {
      setUsernameError("Spaces are not allowed");
      return;
    }

    if (/\s/.test(password)) {
      setPasswordError("Spaces are not allowed");
      return;
    }

    // Trim name (but allow spaces between words)
    const trimmedName = name.trim();

    setLoading(true);
    setError("");

    try {
      const response = await axios.post("https://the-blog-zone-server.vercel.app/api/auth/signup", {
        username,
        name: trimmedName,
        password,
      });

      if (response.status === 201 && response.data.token) {
        localStorage.setItem("token", response.data.token);
        router.push("/dashboard");
      } else {
        setError("Error signing up. Please try again.");
      }
    } catch (error) {
      setError(error.response?.data || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setUsername(value);
    setUsernameError(/\s/.test(value) ? "Spaces are not allowed" : "");
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordError(/\s/.test(value) ? "Spaces are not allowed" : "");
  };

  const handleNameChange = (e) => {
    // No validation needed for name - just update state
    setName(e.target.value);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const isFormValid = () => {
    return username && password && name && !usernameError && !passwordError;
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-indigo-500 mb-6 text-center">Sign Up</h2>
        {error && (
          <p className="text-red-500 mb-4 text-center">{error}</p>
        )}
        <form onSubmit={handleSignup}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-2">Name (displayed to others)</label>
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              className="w-full p-3 rounded bg-gray-700 text-gray-200 border border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-2">Username (must be unique)</label>
            <input
              type="text"
              value={username}
              onChange={handleUsernameChange}
              className="w-full p-3 rounded bg-gray-700 text-gray-200 border border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
            {usernameError && (
              <p className="text-red-500 text-sm mt-1">{usernameError}</p>
            )}
          </div>
          <div className="mb-6 relative">
            <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={handlePasswordChange}
                className="w-full p-3 rounded bg-gray-700 text-gray-200 border border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none pr-10"
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-300"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <i className="bi bi-eye-slash-fill"></i>
                ) : (
                  <i className="bi bi-eye-fill"></i>
                )}
              </button>
            </div>
            {passwordError && (
              <p className="text-red-500 text-sm mt-1">{passwordError}</p>
            )}
          </div>
          <button
            type="submit"
            className={`w-full flex justify-center items-center bg-indigo-600 text-white p-3 rounded-lg font-medium ${loading || !isFormValid() ? "opacity-70 cursor-not-allowed" : "hover:bg-indigo-700"
              }`}
            disabled={loading || !isFormValid()}
          >
            {loading ? (
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                ></path>
              </svg>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>
        <p className="mt-4 text-center text-gray-400">
          Already have an account?{" "}
          <Link href="/login" className="text-indigo-500 hover:text-indigo-400">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
