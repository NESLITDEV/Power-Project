import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormattedMessage, useIntl } from "react-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import UtilityUpload from "@/components/utility/UtilityUpload";

const WaterUsage = ({ selectedFile, setSelectedFile }) => {
  const intl = useIntl();
  const [formData, setFormData] = useState({
    reading: "",
    date: "",
    usageType: "residential",
    flowRate: "",
    notes: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "reading" || name === "flowRate") {
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

  const handleUsageTypeChange = (value) => {
    setFormData((prev) => ({ ...prev, usageType: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate form
    if (!formData.reading || !formData.date) {
      toast.error("Please fill in all required fields");
      return;
    }
    // Submit form data
    console.log("Form submitted:", formData);
    toast.success("Reading saved successfully");

    // Reset form
    setFormData({
      reading: "",
      date: "",
      usageType: "residential",
      flowRate: "",
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
            <FormattedMessage id="UTILITY.WATER.TITLE" />
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  <FormattedMessage id="UTILITY.WATER.METER_READING" />
                </label>
                <Input
                  type="text"
                  name="reading"
                  value={formData.reading}
                  onChange={handleInputChange}
                  placeholder="Enter meter reading"
                  className="w-full"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  <FormattedMessage id="UTILITY.WATER.READING_DATE" />
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
                  <FormattedMessage id="UTILITY.WATER.USAGE_TYPE" />
                </label>
                <Select
                  value={formData.usageType}
                  onValueChange={handleUsageTypeChange}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={intl.formatMessage({
                        id: "UTILITY.WATER.USAGE_TYPE_PLACEHOLDER",
                      })}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="residential">
                      <FormattedMessage id="UTILITY.WATER.USAGE_TYPE_RESIDENTIAL" />
                    </SelectItem>
                    <SelectItem value="commercial">
                      <FormattedMessage id="UTILITY.WATER.USAGE_TYPE_COMMERCIAL" />
                    </SelectItem>
                    <SelectItem value="industrial">
                      <FormattedMessage id="UTILITY.WATER.USAGE_TYPE_INDUSTRIAL" />
                    </SelectItem>
                    <SelectItem value="irrigation">
                      <FormattedMessage id="UTILITY.WATER.USAGE_TYPE_IRRIGATION" />
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  <FormattedMessage id="UTILITY.WATER.FLOW_RATE" />
                </label>
                <Input
                  type="text"
                  name="flowRate"
                  value={formData.flowRate}
                  onChange={handleInputChange}
                  placeholder="Enter flow rate"
                  className="w-full"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                <FormattedMessage id="UTILITY.WATER.NOTES" />
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Add any additional notes"
                className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setFormData({
                    reading: "",
                    date: "",
                    usageType: "residential",
                    flowRate: "",
                    notes: "",
                  })
                }
              >
                <FormattedMessage id="UTILITY.WATER.CLEAR" />
              </Button>
              <Button type="submit" variant="default">
                <FormattedMessage id="UTILITY.WATER.SAVE" />
              </Button>
            </div>
          </form>
        </Card>

        {/* Image Preview Section */}
        {selectedFile?.url && (
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">
              <FormattedMessage
                id="UTILITY.WATER.BILL_PREVIEW"
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

export default WaterUsage;
