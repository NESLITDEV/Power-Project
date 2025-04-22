import { AIAnalysis } from "./blocks";
import { FormattedMessage } from "react-intl";
import { Container } from "@/components/container";

const AIAnalysisPage = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
          <FormattedMessage
            id="DASHBOARD.AI_ANALYSIS.TITLE"
            defaultMessage="AI Analysis"
          />
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
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
