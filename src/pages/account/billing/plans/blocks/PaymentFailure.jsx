import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { KeenIcon } from "@/components";
import { FormattedMessage } from "react-intl";

export const PaymentFailure = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/account/billing/plans");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
      <div className="text-center">
        <div className="mb-4">
          <KeenIcon icon="cross-circle" className="w-16 h-16 text-danger" />
        </div>
        <h2 className="text-2xl font-bold mb-2">
          <FormattedMessage
            id="PLANS.PAYMENT_FAILED_TITLE"
            defaultMessage="Payment Failed"
          />
        </h2>
        <p className="text-gray-600 mb-4">
          <FormattedMessage
            id="PLANS.PAYMENT_FAILED_MESSAGE"
            defaultMessage="We're sorry, but your payment could not be processed. You will be redirected to the plans page shortly."
          />
        </p>
      </div>
    </div>
  );
};
