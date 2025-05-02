'use client';

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSourceVisible, setIsSourceVisible] = useState(false);
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

  const handleButtonClick = (type) => {
    setButtonLoading((prev) => ({ ...prev, [type]: true }));
    router.push(`/${type}`);
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
    <div className="flex flex-col justify-between min-h-screen bg-gray-900">
      {/* Main Content */}
      <div className="flex justify-center items-center flex-grow">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg text-center max-w-md w-full">
          <h1 className="text-4xl font-bold text-indigo-500 mb-6">Welcome to The Blog Zone</h1>
          <p className="text-gray-400 mb-6">
            Dive into a world of creativity, ideas, and stories. Share yours or explore what others have to say.
          </p>
          {isAuthenticated ? (
            <button
              disabled={buttonLoading.dashboard}
              onClick={() => handleButtonClick("dashboard")}
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
                onClick={() => handleButtonClick("login")}
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
                onClick={() => handleButtonClick("signup")}
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

          {/* Updated Footer */}
          <footer className="pt-4 text-center">
            <p className="text-gray-400 text-sm">
              An open source project by{" "}
              <a
                href="https://github.com/nitin-is-me"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                @nitin-is-me
              </a>
            </p>

            <div className="mt-2">
              <button
                onClick={() => setIsSourceVisible(!isSourceVisible)}
                className="text-sm text-gray-500 hover:text-indigo-400 transition-colors flex items-center mx-auto"
              >
                <span>View Source Code</span>
                <svg
                  className={`ml-1 h-4 w-4 transition-transform duration-200 ${isSourceVisible ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isSourceVisible && (
                <div className="mt-2 flex justify-center gap-4 animate-fadeIn">
                  <a
                    href="https://github.com/nitin-is-me/the-blog-zone-client"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-sm text-gray-400 hover:text-indigo-400 transition-colors"
                  >
                    <svg className="h-4 w-4 mr-1" viewBox="0 0 16 16" fill="currentColor">
                      <path fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
                    </svg>
                    Frontend
                  </a>
                  <a
                    href="https://github.com/nitin-is-me/the-blog-zone-server"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-sm text-gray-400 hover:text-indigo-400 transition-colors"
                  >
                    <svg className="h-4 w-4 mr-1" viewBox="0 0 16 16" fill="currentColor">
                      <path fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
                    </svg>
                    Backend
                  </a>
                </div>
              )}
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
