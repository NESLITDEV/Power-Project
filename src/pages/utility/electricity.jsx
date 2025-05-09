import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import axios from "axios";
import { useAuthContext } from "@/auth";
import { FormattedMessage, useIntl } from "react-intl";

// Custom CSS for dark mode
const darkModeStyles = `
  .dark .electricity-card {
    background-color: #1F2129 !important;
    border-color: #363843 !important;
  }
  
  .dark .electricity-text-high {
    color: #F5F5F5 !important;
  }
  
  .dark .electricity-text-medium {
    color: #B5B7C8 !important;
  }
  
  .dark .electricity-input {
    background-color: #26272F !important;
    border-color: #363843 !important;
    color: #F5F5F5 !important;
  }
  
  .dark .electricity-button {
    border-color: #363843 !important;
  }
`;

const ElectricityUsage = ({
  selectedFile,
  setSelectedFile,
  expenseTypeId,
  expenseCategoryId,
  unitOfMeasurement,
  disabled,
  expenseTypeName,
  ocrData,
  setOcrFiles,
}) => {
  const [formData, setFormData] = useState({
    ratePerUnit: "",
    unitsConsumed: "",
    date: "",
    notes: "",
  });
  const { auth } = useAuthContext();
  const intl = useIntl();

  // Update form data when OCR data is received
  useEffect(() => {
    if (ocrData) {
      setFormData((prevData) => ({
        ...prevData,
        ratePerUnit: ocrData.ratePerUnit || prevData.ratePerUnit,
        unitsConsumed: ocrData.unitsConsumed || prevData.unitsConsumed,
        date: ocrData.date || prevData.date,
        notes: ocrData.notes || prevData.notes,
      }));
    }
  }, [ocrData]);

  const handleInputChange = (e) => {
    if (disabled) return;
    const { name, value } = e.target;
    // Only allow positive numbers for rate and units
    if ((name === "ratePerUnit" || name === "unitsConsumed") && value !== "") {
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue < 0) return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (disabled) return;
    if (!formData.ratePerUnit || !formData.unitsConsumed || !formData.date) {
      toast.error(
        intl.formatMessage({ id: "UTILITY.ELECTRICITY.ERROR.FILL_REQUIRED" })
      );
      return;
    }

    // Check if we have the required IDs
    if (!auth?.id) {
      toast.error(
        intl.formatMessage({ id: "UTILITY.ELECTRICITY.ERROR.USER_NOT_FOUND" })
      );
      return;
    }

    if (!expenseTypeId) {
      toast.error(
        intl.formatMessage({
          id: "UTILITY.ELECTRICITY.ERROR.TYPE_NOT_SELECTED",
        })
      );
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_APP_API_URL}/user-expenses/Create-User-Expense`,
        {
          userId: auth.id,
          expenseTypeId: expenseTypeId,
          quantity: parseFloat(formData.unitsConsumed),
          ratePerUnit: parseFloat(formData.ratePerUnit),
          status: 1,
          expenseForDate: formData.date,
        },
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        }
      );

      toast.success(
        intl.formatMessage(
          { id: "UTILITY.ELECTRICITY.SUCCESS.RECORDED" },
          { type: expenseTypeName || "Utility" }
        )
      );

      // Reset form data
      setFormData({
        ratePerUnit: "",
        unitsConsumed: "",
        date: "",
        notes: "",
      });

      // Reset file input
      const fileInput = document.getElementById("file-upload");
      if (fileInput) {
        fileInput.value = "";
      }

      // Properly remove the image if it exists
      if (selectedFile?.url) {
        URL.revokeObjectURL(selectedFile.url);
      }
      setSelectedFile(null);
      if (setOcrFiles) {
        setOcrFiles([]); // Reset ocrFiles state
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(
        error.response?.data?.message ||
          intl.formatMessage(
            { id: "UTILITY.ELECTRICITY.ERROR.RECORD_FAILED" },
            { type: expenseTypeName || "utility" }
          )
      );
    }
  };

  return (
    <div className="container mx-auto p-6">
      <style>{darkModeStyles}</style>
      {/* Form and Image Preview Section */}
      <div
        className={`grid gap-6 ${selectedFile?.url ? "lg:grid-cols-2" : "grid-cols-1"}`}
      >
        {/* Manual Entry Section */}
        <Card className="p-6 electricity-card">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6 electricity-text-high">
            <FormattedMessage
              id="UTILITY.ELECTRICITY.USAGE"
              values={{ type: expenseTypeName || "Utility" }}
            />
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 electricity-text-medium">
                  <FormattedMessage id="UTILITY.ELECTRICITY.RATE_PER_UNIT" />
                </label>
                <Input
                  type="text"
                  name="ratePerUnit"
                  value={formData.ratePerUnit}
                  onChange={handleInputChange}
                  placeholder={intl.formatMessage({
                    id: "UTILITY.ELECTRICITY.PLACEHOLDER.RATE",
                  })}
                  className="w-full electricity-input"
                  required
                  disabled={disabled}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 electricity-text-medium">
                  <FormattedMessage id="UTILITY.ELECTRICITY.UNITS_CONSUMED" />
                </label>
                <Input
                  type="text"
                  name="unitsConsumed"
                  value={formData.unitsConsumed}
                  onChange={handleInputChange}
                  placeholder={intl.formatMessage({
                    id: "UTILITY.ELECTRICITY.PLACEHOLDER.UNITS",
                  })}
                  className="w-full electricity-input"
                  required
                  disabled={disabled}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 electricity-text-medium">
                  <FormattedMessage id="UTILITY.ELECTRICITY.DATE" />
                </label>
                <Input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full electricity-input"
                  required
                  disabled={disabled}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 electricity-text-medium">
                  <FormattedMessage id="UTILITY.ELECTRICITY.NOTES" />
                </label>
                <Input
                  type="text"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder={intl.formatMessage({
                    id: "UTILITY.ELECTRICITY.PLACEHOLDER.NOTES",
                  })}
                  className="w-full electricity-input"
                  disabled={disabled}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setFormData({
                    ratePerUnit: "",
                    unitsConsumed: "",
                    date: "",
                    notes: "",
                  })
                }
                disabled={disabled}
                className="electricity-button"
              >
                <FormattedMessage id="UTILITY.ELECTRICITY.CLEAR" />
              </Button>
              <Button type="submit" variant="default" disabled={disabled}>
                <FormattedMessage id="UTILITY.ELECTRICITY.SAVE" />
              </Button>
            </div>
          </form>
        </Card>

        {/* Image Preview Section */}
        {selectedFile?.url && (
          <Card className="p-6 electricity-card">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6 electricity-text-high">
              Image Preview
            </h2>
            <div className="flex justify-center items-center border rounded-md p-2 dark:border-gray-700">
              <img
                src={selectedFile.url}
                alt={intl.formatMessage({
                  id: "UTILITY.ELECTRICITY.ALT.BILL_PREVIEW",
                })}
                className="max-h-[500px] object-contain"
              />
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ElectricityUsage;
