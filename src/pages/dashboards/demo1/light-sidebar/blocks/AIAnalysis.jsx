import { useState, useEffect } from "react";
import axios from "axios";
import { useAuthContext } from "@/auth";

const AIAnalysis = () => {
  const [analysisHtml, setAnalysisHtml] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { auth } = useAuthContext();

  useEffect(() => {
    const fetchAIAnalysis = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_APP_API_URL}/user-expenses/Get-AI-Response?userId=${auth.id}`,
          {
            headers: {
              Authorization: `Bearer ${auth.token}`,
            },
          }
        );

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

        }

        // Set the cleaned HTML content
        setAnalysisHtml(cleanedHtml);
        setError(null);
      } catch (error) {
        console.error("Error fetching AI analysis:", error);
        setError("Failed to load AI analysis. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    // Make sure auth and auth.id are available before making the API call
    if (auth?.token && auth?.id) {
      fetchAIAnalysis();
    } else {
      console.error("Auth token or user ID missing");
      setError("Authentication required. Please log in again.");
      setLoading(false);
    }
  }, [auth?.token, auth?.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-3 text-gray-600">Analyzing your utility data...</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-4 text-center">{error}</div>;
  }

  // If no HTML content is available, show a message
  if (!analysisHtml || analysisHtml.trim() === "") {
    return (
      <div className="text-center py-10">
        <p className="text-gray-600">
          No analysis data available. Please try again later.
        </p>
      </div>
    );
  }

  // Render the HTML content
  return (
    <div
      className="analysis-container"
      dangerouslySetInnerHTML={{ __html: analysisHtml }}
    />
  );
};

export default AIAnalysis;
