import { useState, useEffect } from "react";
import axios from "axios";
import { useAuthContext } from "@/auth";

// Additional CSS for dark mode AI content
const aiContentDarkStyles = `
  .dark .analysis-container {
    color: #B5B7C8 !important;
  }
  
  .dark .analysis-container h1,
  .dark .analysis-container h2,
  .dark .analysis-container h3,
  .dark .analysis-container h4,
  .dark .analysis-container h5,
  .dark .analysis-container h6,
  .dark .analysis-container strong {
    color: #F5F5F5 !important;
  }
  
  .dark .analysis-container p,
  .dark .analysis-container li,
  .dark .analysis-container span {
    color: #B5B7C8 !important;
  }
  
  .dark .analysis-container table {
    border-color: #363843 !important;
  }
  
  .dark .analysis-container th {
    background-color: #26272F !important;
    color: #F5F5F5 !important;
    border-color: #363843 !important;
  }
  
  .dark .analysis-container td {
    border-color: #363843 !important;
  }
  
  .dark .analysis-container tr:nth-child(even) {
    background-color: #1F2129 !important;
  }
  
  .dark .analysis-container tr:nth-child(odd) {
    background-color: #26272F !important;
  }
  
  .dark .analysis-container a {
    color: #2D88FF !important;
  }
  
  .dark .analysis-container .card,
  .dark .analysis-container .chart-container,
  .dark .analysis-container .box {
    background-color: #26272F !important;
    border-color: #363843 !important;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2) !important;
  }
`;

const AIAnalysis = () => {
  const [analysisHtml, setAnalysisHtml] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(
    "Our AI analysis service is temporarily unavailable. Please try again later."
  );
  const [hasError, setHasError] = useState(false);
  const { auth } = useAuthContext();

  useEffect(() => {
    const fetchAIAnalysis = async () => {
      try {
        setLoading(true);
        setHasError(false);

        // Check for auth before proceeding
        if (!auth?.token || !auth?.id) {
          setErrorMessage(
            "Please sign in to view AI analysis of your utility data."
          );
          setHasError(true);
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `${import.meta.env.VITE_APP_API_URL}/user-expenses/Get-AI-Response?userId=${auth.id}`,
          {
            headers: {
              Authorization: `Bearer ${auth.token}`,
            },
          }
        );

        // Check if the response is actually an error message
        if (
          response.data &&
          typeof response.data === "string" &&
          (response.data.includes("ServiceUnavailable") ||
            response.data.includes("Error") ||
            response.data.includes("error"))
        ) {
          console.error("Error in response data:", response.data);
          setHasError(true);
          setLoading(false);
          return;
        }

        // Clean up the HTML content by removing the first and last lines
        let cleanedHtml = response.data;
        if (cleanedHtml) {
          // Split by line breaks
          const lines = cleanedHtml.split("\n");

          // Remove first line if it's ```html and last line if it's ```
          if (lines.length > 2) {
            if (lines[0].trim() === "```html") {
              lines.shift(); // Remove first line
            }
            if (lines[lines.length - 1].trim() === "```") {
              lines.pop(); // Remove last line
            }
            cleanedHtml = lines.join("\n");
          }

          // Final check to make sure we're not rendering error messages as HTML
          if (
            cleanedHtml.includes("ServiceUnavailable") ||
            cleanedHtml.includes("Error:") ||
            cleanedHtml.includes('"error"')
          ) {
            console.error("Error content in HTML:", cleanedHtml);
            setHasError(true);
            setLoading(false);
            return;
          }
        }

        // Set the cleaned HTML content
        setAnalysisHtml(cleanedHtml);
      } catch (error) {
        console.error("Error fetching AI analysis:", error);

        // Log the specific error details to console for debugging
        if (error.response) {
          console.error("Error response data:", error.response.data);
          console.error("Error response status:", error.response.status);
        }

        // Set error state but don't expose actual message
        setHasError(true);

        // Set specific error messages based on status codes if needed
        if (error.response && error.response.status === 503) {
          setErrorMessage(
            "Our AI service is currently busy. Please try again in a few minutes."
          );
        } else if (error.response && error.response.status === 401) {
          setErrorMessage(
            "Your session has expired. Please sign in again to view the analysis."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch attempt
    fetchAIAnalysis();
  }, [auth?.token, auth?.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <style>{aiContentDarkStyles}</style>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-3 text-gray-600 dark:text-gray-300">
          Analyzing your utility data...
        </p>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="text-center p-8 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800">
        <style>{aiContentDarkStyles}</style>
        <svg
          className="w-12 h-12 text-red-400 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
        <h3 className="text-lg font-medium text-red-800 dark:text-red-300 mb-2">
          Analysis Unavailable
        </h3>
        <p className="text-red-600 dark:text-red-400">{errorMessage}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 rounded-md hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // If no HTML content is available, show a message
  if (!analysisHtml || analysisHtml.trim() === "") {
    return (
      <div className="text-center py-10 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-gray-100 dark:border-gray-700">
        <style>{aiContentDarkStyles}</style>
        <svg
          className="w-12 h-12 text-gray-400 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          ></path>
        </svg>
        <p className="text-gray-600 dark:text-gray-300">
          No analysis data available. Please try again later.
        </p>
      </div>
    );
  }

  // Render the HTML content
  return (
    <div className="ai-card rounded-lg p-6 shadow-md">
      <style>{aiContentDarkStyles}</style>
      <div
        className="analysis-container"
        dangerouslySetInnerHTML={{ __html: analysisHtml }}
      />
    </div>
  );
};

export default AIAnalysis;
