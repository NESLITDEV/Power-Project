import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { FormattedMessage } from "react-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import UtilityUpload from "@/components/utility/UtilityUpload";
import { useIntl } from "react-intl";

const GasUsage = ({ selectedFile, setSelectedFile }) => {
  const intl = useIntl();
  const [formData, setFormData] = useState({
    reading: "",
    date: "",
    usageType: "residential",
    pressure: "",
    notes: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "reading" || name === "pressure" || name === "temperature") {
      // Allow negative values for temperature, but only positive for others
      if (name === "temperature") {
        if (value === "" || /^-?\d*\.?\d*$/.test(value)) {
          setFormData((prev) => ({ ...prev, [name]: value }));
        }
      } else if (
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
    if (!formData.reading || !formData.date) {
      toast.error("Please fill in all required fields");
      return;
    }
    console.log("Form submitted:", formData);
    toast.success("Reading saved successfully");
    
    // Reset form data
    setFormData({
      reading: "",
      date: "",
      usageType: "residential",
      pressure: "",
      notes: "",
    });
    
    // Properly remove the image if it exists
    if (selectedFile?.url) {
      URL.revokeObjectURL(selectedFile.url);
    }
    setSelectedFile(null);
  };

  const handleUsageTypeChange = (value) => {
    setFormData((prev) => ({ ...prev, usageType: value }));
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
            <FormattedMessage id="UTILITY.GAS.TITLE" />
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                <FormattedMessage id="UTILITY.GAS.METER_READING" />
              </label>
              <Input
                type="text"
                name="reading"
                value={formData.reading}
                onChange={handleInputChange}
                placeholder="Enter meter reading"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                <FormattedMessage id="UTILITY.GAS.READING_DATE" />
              </label>
              <Input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                <FormattedMessage id="UTILITY.GAS.USAGE_TYPE" />
              </label>
              <Select
                name="usageType"
                value={formData.usageType}
                onValueChange={handleUsageTypeChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select usage type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="residential">
                    <FormattedMessage id="UTILITY.GAS.USAGE_TYPE_RESIDENTIAL" />
                  </SelectItem>
                  <SelectItem value="commercial">
                    <FormattedMessage id="UTILITY.GAS.USAGE_TYPE_COMMERCIAL" />
                  </SelectItem>
                  <SelectItem value="industrial">
                    <FormattedMessage id="UTILITY.GAS.USAGE_TYPE_INDUSTRIAL" />
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                <FormattedMessage id="UTILITY.GAS.PRESSURE" />
              </label>
              <Input
                type="text"
                name="pressure"
                value={formData.pressure}
                onChange={handleInputChange}
                placeholder="Enter pressure"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                <FormattedMessage id="UTILITY.GAS.NOTES" />
              </label>
              <Input
                type="text"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Add any additional notes"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="submit" variant="default">
                <FormattedMessage id="UTILITY.GAS.SAVE" />
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setFormData({
                    reading: "",
                    date: "",
                    usageType: "residential",
                    pressure: "",
                    notes: "",
                  })
                }
              >
                <FormattedMessage id="UTILITY.GAS.CLEAR" />
              </Button>
            </div>
          </form>
        </Card>

        {/* Image Preview Section */}
        {selectedFile?.url && (
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">
              <FormattedMessage
                id="UTILITY.GAS.BILL_PREVIEW"
                values={{ name: selectedFile.name }}
              />
            </h2>
            <div className="relative h-[calc(100%-4rem)] min-h-[400px]">
              <img
                src={selectedFile.url}
                alt={selectedFile.name}
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default GasUsage;
