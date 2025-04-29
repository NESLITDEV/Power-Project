import { AIAnalysis } from "./blocks";
import { FormattedMessage } from "react-intl";
import { Container } from "@/components/container";

// Custom CSS for dark mode
const darkModeStyles = `
  .dark .ai-analysis-container {
    background-color: #1F2129 !important;
    border-color: #363843 !important;
  }
  
  .dark .ai-text-high {
    color: #F5F5F5 !important;
  }
  
  .dark .ai-text-medium {
    color: #B5B7C8 !important;
  }
  
  .dark .ai-card {
    background-color: #26272F !important;
    border-color: #363843 !important;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2) !important;
  }
`;

const AIAnalysisPage = () => {
  return (
    <div className="container mx-auto px-4 py-6 ai-analysis-container">
      <style>{darkModeStyles}</style>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 ai-text-high mb-2">
          <FormattedMessage
            id="DASHBOARD.AI_ANALYSIS.TITLE"
            defaultMessage="AI Analysis"
          />
        </h1>
        <p className="text-gray-500 dark:text-gray-400 ai-text-medium">
          <FormattedMessage
            id="DASHBOARD.AI_ANALYSIS.SUBTITLE"
            defaultMessage="Intelligent insights about your utility consumption patterns"
          />
        </p>
      </div>

      <AIAnalysis />
    </div>
  );
};

export default AIAnalysisPage;
