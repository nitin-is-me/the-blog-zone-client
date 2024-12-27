'use client';

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState({
    login: false,
    signup: false,
    dashboard: false,
  });

  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await axios.get("https://the-blog-zone-server.vercel.app/api/auth/verifyToken", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.status === 200) {
            setIsAuthenticated(true);
          }
        } catch (error) {
          console.error("Token verification failed:", error);
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleLoginClick = () => {
    setButtonLoading({ ...buttonLoading, login: true });
    router.push("/login");
  };

  const handleSignupClick = () => {
    setButtonLoading({ ...buttonLoading, signup: true });
    router.push("/signup");
  };

  const handleDashboardClick = () => {
    setButtonLoading({ ...buttonLoading, dashboard: true });
    router.push("/dashboard");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-500"></div>
          <p className="mt-4 text-gray-300 text-lg font-medium">Checking your status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg text-center max-w-md w-full">
        <h1 className="text-4xl font-bold text-indigo-500 mb-6">Welcome to The Blog Zone</h1>
        <p className="text-gray-400 mb-6">
          Dive into a world of creativity, ideas, and stories. Share yours or explore what others have to say.
        </p>
        {isAuthenticated ? (
          <button
            disabled={buttonLoading.dashboard}
            onClick={handleDashboardClick}
            className="block bg-indigo-600 mx-auto text-white text-lg font-medium py-3 px-6 rounded-lg shadow-md hover:bg-indigo-700 transition duration-200"
          >
            {buttonLoading.dashboard ? (
              <div className="animate-spin rounded-full h-6 w-6 border-t-4 border-white"></div>
            ) : (
              "Go to Dashboard"
            )}
          </button>
        ) : (
          <div className="flex justify-center gap-4">
            <button
              disabled={buttonLoading.login}
              onClick={handleLoginClick}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white text-lg font-medium py-3 px-6 rounded-lg shadow-md hover:bg-blue-700 transition duration-200"
            >
              {buttonLoading.login ? (
                <div className="animate-spin rounded-full h-6 w-6 border-t-4 border-white"></div>
              ) : (
                "Login"
              )}
            </button>
            <button
              disabled={buttonLoading.signup}
              onClick={handleSignupClick}
              className="flex items-center justify-center gap-2 bg-indigo-600 text-white text-lg font-medium py-3 px-6 rounded-lg shadow-md hover:bg-indigo-700 transition duration-200"
            >
              {buttonLoading.signup ? (
                <div className="animate-spin rounded-full h-6 w-6 border-t-4 border-white"></div>
              ) : (
                "Sign Up"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
