import React from "react";
import { FormattedMessage } from "react-intl";

// Custom CSS for dark mode
const darkModeStyles = `
  .dark .summary-card {
    background-color: #1F2129 !important;
    border-color: #363843 !important;
  }
  
  .dark .summary-text-high {
    color: #F5F5F5 !important;
  }
  
  .dark .summary-text-medium {
    color: #B5B7C8 !important;
  }
  
  .dark .summary-border {
    border-color: #363843 !important;
  }
`;

const SummarySection = ({
  loading,
  expenseTypes,
  totalCost,
  expenses,
  getDetailedStats,
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <style>{darkModeStyles}</style>
        {[1, 2, 3].map((index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 animate-pulse summary-card"
          >
            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="flex justify-between items-center">
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              ))}
              <div className="pt-2 mt-2 border-t border-gray-100 dark:border-gray-700 summary-border">
                <div className="flex justify-between items-center">
                  <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <style>{darkModeStyles}</style>
      {expenseTypes.map((expenseType) => {
        const stats = getDetailedStats(expenseType);
        return (
          <div
            key={expenseType}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200 summary-card"
          >
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4 summary-text-high">
              {expenseType} <FormattedMessage id="DASHBOARD.SUMMARY" />
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400 summary-text-medium">
                  <FormattedMessage id="DASHBOARD.CURRENT_USAGE" />
                </span>
                <span className="font-medium summary-text-high">
                  {stats.currentUsage.toLocaleString()} {stats.unit}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400 summary-text-medium">
                  <FormattedMessage id="DASHBOARD.AVERAGE" />
                </span>
                <span className="font-medium summary-text-high">
                  {stats.average.toFixed(2)} {stats.unit}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400 summary-text-medium">
                  <FormattedMessage id="DASHBOARD.CHANGE" />
                </span>
                <span
                  className={
                    stats.change >= 0 ? "text-green-500" : "text-red-500"
                  }
                >
                  {stats.change > 0 ? "+" : ""}
                  {stats.change.toFixed(1)}%
                </span>
              </div>
              <div className="pt-2 mt-2 border-t border-gray-100 dark:border-gray-700 summary-border">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400 summary-text-medium">
                    <FormattedMessage id="DASHBOARD.STATUS" />
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      stats.change <= 0
                        ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                    }`}
                  >
                    {stats.change <= 0 ? (
                      <FormattedMessage id="DASHBOARD.OPTIMAL" />
                    ) : (
                      <FormattedMessage id="DASHBOARD.HIGH_USAGE" />
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Total Summary Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200 summary-card">
        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4 summary-text-high">
          <FormattedMessage id="DASHBOARD.OVERALL_SUMMARY" />
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-500 dark:text-gray-400 summary-text-medium">
              <FormattedMessage id="DASHBOARD.TOTAL_COST" />
            </span>
            <span className="font-medium summary-text-high">
              ${totalCost.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 dark:text-gray-400 summary-text-medium">
              <FormattedMessage id="DASHBOARD.ACTIVE_TYPES" />
            </span>
            <span className="font-medium summary-text-high">
              {expenseTypes.length}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 dark:text-gray-400 summary-text-medium">
              <FormattedMessage id="DASHBOARD.TOTAL_RECORDS" />
            </span>
            <span className="font-medium summary-text-high">
              {expenses.length}
            </span>
          </div>
          <div className="pt-2 mt-2 border-t border-gray-100 dark:border-gray-700 summary-border">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 dark:text-gray-400 summary-text-medium">
                <FormattedMessage id="DASHBOARD.LAST_UPDATED" />
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-300 summary-text-high">
                {expenses.length > 0 ? (
                  new Date(
                    Math.max(...expenses.map((e) => new Date(e.createdDate)))
                  ).toLocaleDateString()
                ) : (
                  <FormattedMessage id="DASHBOARD.NO_DATA" />
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummarySection;
