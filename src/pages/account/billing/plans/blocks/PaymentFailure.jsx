import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FormattedMessage } from "react-intl";
import { useAuthContext } from "@/auth";


// Get API URL from environment variables
const API_URL = import.meta.env.VITE_APP_API_URL;

export const PaymentFailure = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Get session data from localStorage
        const sessionData = localStorage.getItem("stripeSessionData");
        if (!sessionData) {
          setError("No session data found");
          setIsLoading(false);
          return;
        }

        const { sessionId, requestBody } = JSON.parse(sessionData);
        if (!sessionId || !requestBody) {
          setError("Invalid session data");
          setIsLoading(false);
          return;
        }

        // Verify the payment with the backend
        const response = await axios.post(
          `${API_URL}/Stripe/verify-payment?sessionId=${sessionId}`,
          requestBody
        );

        if (response.data.success) {
          // Clear the session data from localStorage
          localStorage.removeItem("stripeSessionData");
          // Start countdown
          const timer = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(timer);
                navigate("/account/billing/plans");
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        } else {
          setError("Payment verification failed");
        }
      } catch (error) {
        console.error("Error verifying payment:", error);
        setError("Failed to verify payment");
      } finally {
        setIsLoading(false);
      }
    };

    verifyPayment();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
        <div className="text-gray-600">Verifying payment status...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-red-500 text-xl mb-4">{error}</div>
        <button
          onClick={() => navigate("/account/billing/plans")}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Return to Plans
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="text-red-500 text-xl mb-4">Payment failed!</div>
      <div className="text-gray-600 mb-4">
        Redirecting to plans page in {countdown} seconds...
      </div>
    </div>
  );
};

export default PaymentFailure;
