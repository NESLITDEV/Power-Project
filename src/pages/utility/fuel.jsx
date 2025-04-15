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

const FuelBills = ({ selectedFile, setSelectedFile }) => {
  const intl = useIntl();
  const [formData, setFormData] = useState({
    amount: "",
    date: "",
    fuelType: "petrol",
    quantity: "",
    pricePerUnit: "",
    notes: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "amount" || name === "quantity" || name === "pricePerUnit") {
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

  const handleFuelTypeChange = (value) => {
    setFormData((prev) => ({ ...prev, fuelType: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate form
    if (!formData.amount || !formData.date || !formData.quantity) {
      toast.error("Please fill in all required fields");
      return;
    }
    // Submit form data
    toast.success("Bill saved successfully");

    // Reset form
    setFormData({
      amount: "",
      date: "",
      fuelType: "petrol",
      quantity: "",
      pricePerUnit: "",
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
            <FormattedMessage id="UTILITY.FUEL.TITLE" />
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  <FormattedMessage id="UTILITY.FUEL.AMOUNT" />
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
                  <FormattedMessage id="UTILITY.FUEL.DATE" />
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
                  <FormattedMessage id="UTILITY.FUEL.FUEL_TYPE" />
                </label>
                <Select
                  value={formData.fuelType}
                  onValueChange={handleFuelTypeChange}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={intl.formatMessage({
                        id: "UTILITY.FUEL.FUEL_TYPE_PLACEHOLDER",
                      })}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="petrol">
                      <FormattedMessage id="UTILITY.FUEL.FUEL_TYPE_PETROL" />
                    </SelectItem>
                    <SelectItem value="diesel">
                      <FormattedMessage id="UTILITY.FUEL.FUEL_TYPE_DIESEL" />
                    </SelectItem>
                    <SelectItem value="lpg">
                      <FormattedMessage id="UTILITY.FUEL.FUEL_TYPE_LPG" />
                    </SelectItem>
                    <SelectItem value="cng">
                      <FormattedMessage id="UTILITY.FUEL.FUEL_TYPE_CNG" />
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  <FormattedMessage id="UTILITY.FUEL.PRICE" />
                </label>
                <Input
                  type="text"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="Enter price per unit"
                  className="w-full"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                <FormattedMessage id="UTILITY.FUEL.NOTES" />
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
                    amount: "",
                    date: "",
                    fuelType: "petrol",
                    price: "",
                    notes: "",
                  })
                }
              >
                <FormattedMessage id="UTILITY.FUEL.CLEAR" />
              </Button>
              <Button type="submit" variant="default">
                <FormattedMessage id="UTILITY.FUEL.SAVE" />
              </Button>
            </div>
          </form>
        </Card>

        {/* Image Preview Section */}
        {selectedFile?.url && (
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">
              <FormattedMessage
                id="UTILITY.FUEL.BILL_PREVIEW"
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

export default FuelBills;
