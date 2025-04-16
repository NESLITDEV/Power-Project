import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormattedMessage, useIntl } from "react-intl";
import { toast } from "sonner";

const GenericExpense = ({ selectedFile, setSelectedFile }) => {
  const intl = useIntl();
  const [formData, setFormData] = useState({
    expenseType: "",
    amount: "",
    date: "",
    notes: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "amount") {
      // Only allow positive numbers
      if (
        value === "" ||
        (/^\d*\.?\d*$/.test(value) && parseFloat(value) >= 0)
      ) {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate form
    if (!formData.expenseType || !formData.amount || !formData.date) {
      toast.error("Please fill in all required fields");
      return;
    }
    // Submit form data
    console.log("Form submitted:", formData);
    toast.success("Expense saved successfully");

    // Reset form
    setFormData({
      expenseType: "",
      amount: "",
      date: "",
      notes: "",
    });

    // Properly remove the image if it exists
    if (selectedFile?.url) {
      URL.revokeObjectURL(selectedFile.url);
    }
    setSelectedFile(null);
  };

  return (
    <div className="container mx-auto p-6">
      {/* Form and Image Preview Section */}
      <div
        className={`grid gap-6 ${selectedFile?.url ? "lg:grid-cols-2" : "grid-cols-1"}`}
      >
        {/* Manual Entry Section */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">
            <FormattedMessage id="UTILITY.GENERIC.TITLE" />
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  <FormattedMessage id="UTILITY.GENERIC.EXPENSE_TYPE" />
                </label>
                <Input
                  type="text"
                  name="expenseType"
                  value={formData.expenseType}
                  onChange={handleInputChange}
                  placeholder={intl.formatMessage({
                    id: "UTILITY.GENERIC.EXPENSE_TYPE_PLACEHOLDER",
                  })}
                  className="w-full"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  <FormattedMessage id="UTILITY.GENERIC.AMOUNT" />
                </label>
                <Input
                  type="text"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="Enter amount"
                  className="w-full"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  <FormattedMessage id="UTILITY.GENERIC.DATE" />
                </label>
                <Input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  <FormattedMessage id="UTILITY.GENERIC.NOTES" />
                </label>
                <Input
                  type="text"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Add any additional notes"
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="submit" variant="default">
                <FormattedMessage id="UTILITY.GENERIC.SAVE" />
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setFormData({
                    expenseType: "",
                    amount: "",
                    date: "",
                    notes: "",
                  })
                }
              >
                <FormattedMessage id="UTILITY.GENERIC.CLEAR" />
              </Button>
            </div>
          </form>
        </Card>

        {/* Image Preview Section */}
        {selectedFile?.url && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              <FormattedMessage
                id="UTILITY.GENERIC.BILL_PREVIEW"
                values={{ name: selectedFile.name }}
              />
            </h3>
            <div className="aspect-video relative rounded-lg overflow-hidden">
              <img
                src={selectedFile.url}
                alt="Bill preview"
                className="object-contain w-full h-full"
              />
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default GenericExpense;
