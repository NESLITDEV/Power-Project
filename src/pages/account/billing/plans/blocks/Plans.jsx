import { Fragment, useState, useEffect } from "react";
import { KeenIcon } from "@/components";
import { useLanguage } from "@/i18n";
import { FormattedMessage, useIntl } from "react-intl";
import axios from "axios";
import { useAuthContext } from "@/auth";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PaymentSuccess } from "./PaymentSuccess";
import { PaymentFailure } from "./PaymentFailure";

// Get API URL from environment variables
const API_URL = import.meta.env.VITE_APP_API_URL;

const Plans = () => {
  const { isRTL } = useLanguage();
  const intl = useIntl();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isAnnual, setIsAnnual] = useState(true);
  const [isRecurring, setIsRecurring] = useState(true);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { auth } = useAuthContext();

  // Check for payment status in URL
  const paymentStatus = searchParams.get("payment_status");

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/Stripe/get-all-products`);
        setProducts(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching plans:", err);
        setError("Failed to load plans. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handleToggleBilling = () => {
    setIsAnnual(!isAnnual);
  };

  const handleToggleRecurring = () => {
    setIsRecurring(!isRecurring);
  };

  const getFilteredPrices = (product) => {
    if (!product?.prices) return null;

    if (isAnnual) {
      // Get annual price (200 EUR for Premium, 1200 EUR for Company)
      return product.prices.find(
        (price) => price.amount === (product.name === "Premium" ? 200 : 1200)
      );
    } else {
      // Get monthly price (16.67 EUR for Premium, 100 EUR for Company)
      return product.prices.find(
        (price) => price.amount === (product.name === "Premium" ? 16.67 : 100)
      );
    }
  };

  const formatPrice = (amount, currency) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getPlanPrice = (productName) => {
    const product = products.find((p) => p.name === productName);
    if (!product) return null;
    return getFilteredPrices(product);
  };

  const handleSubscribe = async (type, price) => {
    try {
      if (!auth?.stripeCustomerId) {
        console.error("No Stripe customer ID found");
        setError(
          "Your account is not properly set up for payments. Please contact support."
        );
        return;
      }

      // Get user ID from auth context
      const userId = auth.userId || auth.id || auth.sub;

      if (!userId) {
        console.error("No user ID found");
        setError("User ID not found. Please log out and log in again.");
        return;
      }

      // Create request body
      const requestBody = {
        userId: userId,
        stripeCustomerId: auth.stripeCustomerId,
        stripePriceId: price.id,
        planName: type === "private" ? "Premium" : "Company",
        price: price.amount,
        currency: price.currency,
        interval: isAnnual ? "year" : "month",
        planPurchaseType: isRecurring
          ? isAnnual
            ? "recurring_annual"
            : "recurring_monthly"
          : isAnnual
            ? "one_time_annual"
            : "one_time_monthly",
        successUrl: `${window.location.origin}/account/billing/plans/success`,
        cancelUrl: `${window.location.origin}/account/billing/plans/failed`,
      };

      console.log("Sending request to purchase plan:", requestBody);

      // Make API call to purchase plan
      const response = await axios.post(
        `${API_URL}/Stripe/purchase-plan`,
        requestBody
      );

      // Check if the response contains a URL for Stripe checkout
      if (response.data && response.data.url) {
        // Redirect to the Stripe checkout URL
        window.location.href = response.data.url;
      } else {
        console.error("No checkout URL returned from API");
        setError("Failed to initiate checkout. Please try again later.");
      }
    } catch (error) {
      console.error("Subscription error:", error);
      setError("Failed to initiate subscription. Please try again later.");
    }
  };

  // If payment was successful, show success component
  if (paymentStatus === "success") {
    return <PaymentSuccess />;
  }

  // If payment failed, show failure component
  if (paymentStatus === "failed") {
    return <PaymentFailure />;
  }

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-danger">{error}</div>;
  }

  const plans = {
    info: {
      free: {
        title: "Free",
        description: "Essential features for basic expense tracking",
        free: true,
      },
      private: {
        title: "Premium",
        description: "Advanced features for personal finance management",
        price: getPlanPrice("Premium") || { amount: 0, currency: "eur" },
      },
      company: {
        title: "Company",
        description: "Complete solution for business expense management",
        price: getPlanPrice("Company") || { amount: 0, currency: "eur" },
      },
    },
    features: [
      {
        title: intl.formatMessage({ id: "PLANS.FEATURE_EXPENSE_TRACKING" }),
        plans: {
          free: intl.formatMessage({ id: "PLANS.FEATURE_LIMIT_5_MONTH" }),
          private: intl.formatMessage({ id: "PLANS.FEATURE_UNLIMITED" }),
          company: intl.formatMessage({ id: "PLANS.FEATURE_UNLIMITED" }),
        },
      },
      {
        title: intl.formatMessage({ id: "PLANS.FEATURE_BASIC_CATEGORIES" }),
        plans: {
          free: intl.formatMessage({
            id: "PLANS.FEATURE_BASIC_CATEGORIES_LIST",
          }),
          private: intl.formatMessage({ id: "PLANS.FEATURE_ALL_BASIC_PLUS" }),
          company: intl.formatMessage({ id: "PLANS.FEATURE_ALL_CATEGORIES" }),
        },
      },
      {
        title: intl.formatMessage({ id: "PLANS.FEATURE_ADVANCED_CATEGORIES" }),
        plans: {
          free: intl.formatMessage({ id: "PLANS.FEATURE_NOT_AVAILABLE" }),
          private: intl.formatMessage({
            id: "PLANS.FEATURE_ADVANCED_CATEGORIES_LIST",
          }),
          company: intl.formatMessage({
            id: "PLANS.FEATURE_COMPANY_CATEGORIES",
          }),
        },
      },
      {
        title: intl.formatMessage({ id: "PLANS.FEATURE_OCR" }),
        plans: {
          free: intl.formatMessage({ id: "PLANS.FEATURE_UNLIMITED_SCANS" }),
          private: intl.formatMessage({ id: "PLANS.FEATURE_UNLIMITED_SCANS" }),
          company: intl.formatMessage({ id: "PLANS.FEATURE_UNLIMITED_SCANS" }),
        },
      },
      {
        title: intl.formatMessage({ id: "PLANS.FEATURE_CUSTOM_CATEGORIES" }),
        plans: {
          free: intl.formatMessage({ id: "PLANS.FEATURE_NOT_AVAILABLE" }),
          private: intl.formatMessage({
            id: "PLANS.FEATURE_UP_TO_3_CATEGORIES",
          }),
          company: intl.formatMessage({
            id: "PLANS.FEATURE_UNLIMITED_CATEGORIES",
          }),
        },
      },
    ],
  };

  const renderPlanInfo = (type, info) => (
    <Fragment>
      <h3 className="text-lg text-gray-900 font-medium pb-2">{info.title}</h3>
      <div className="text-gray-700 text-2sm">{info.description}</div>
      <div className="py-4">
        {info.free ? (
          <h4 className="text-2xl text-gray-900 font-semibold leading-none">
            <FormattedMessage id="PLANS.FREE" />
          </h4>
        ) : (
          <div className="flex items-end gap-1.5">
            <div className="text-2xl text-gray-900 font-semibold leading-none">
              {formatPrice(info.price.amount, info.price.currency)}
            </div>
            <div className="text-gray-700 text-2xs">
              {isRecurring ? (
                isAnnual ? (
                  <FormattedMessage id="PLANS.PER_YEAR" />
                ) : (
                  <FormattedMessage id="PLANS.PER_MONTH" />
                )
              ) : (
                ""
              )}
            </div>
          </div>
        )}
      </div>
      <div>
        <button
          className={
            info.free
              ? "btn btn-light btn-sm flex justify-center w-full"
              : "btn btn-primary btn-sm text-center flex justify-center w-full"
          }
          onClick={() => !info.free && handleSubscribe(type, info.price)}
        >
          {info.free ? (
            <FormattedMessage id="PLANS.GET_STARTED" />
          ) : (
            <FormattedMessage id="PLANS.UPGRADE" />
          )}
        </button>
      </div>
    </Fragment>
  );

  const renderFeatureDetail = (detail) => {
    if (detail === intl.formatMessage({ id: "PLANS.FEATURE_NOT_AVAILABLE" })) {
      return <KeenIcon icon="cross" className="text-danger text-lg" />;
    }
    return <div className="text-gray-800 text-2sm">{detail}</div>;
  };

  const renderItem = (feature, index) => {
    return (
      <tr key={index}>
        <td className="table-border-s !px-5 !py-3.5">
          <div className="text-gray-900 text-2sm leading-none font-medium">
            {feature.title}
          </div>
        </td>
        <td className="table-border-s !px-5 !py-3.5">
          <div className="text-gray-800 text-2sm">
            {renderFeatureDetail(feature.plans.free)}
          </div>
        </td>
        <td className="table-border-s !px-5 !py-3.5">
          {renderFeatureDetail(feature.plans.private)}
        </td>
        <td className="table-border-s !px-5 !py-3.5">
          {renderFeatureDetail(feature.plans.company)}
        </td>
      </tr>
    );
  };

  return (
    <div className="scrollable-x-auto pt-3 -mt-3">
      <table className="table table-fixed min-w-[1000px] table-border-b table-border-e table-rounded card-rounded [&_tr:nth-of-type(2)>td]:table-border-t [&_tr:nth-of-type(2)>td:first-child]:card-rounded-ts">
        <tbody>
          <tr>
            <td className="!border-b-0 align-bottom !p-5 !pt-7.5 !pb-6">
              <div className="flex flex-col gap-4">
                <label className="switch switch-sm">
                  <input
                    className="order-1"
                    type="checkbox"
                    checked={isRecurring}
                    onChange={handleToggleRecurring}
                  />
                  <div className="switch-label order-2">
                    <span className="text-gray-800 text-2sm font-semibold">
                      <FormattedMessage id="PLANS.RECURRING" />
                    </span>
                  </div>
                </label>

                <label className="switch switch-sm">
                  <input
                    className="order-1"
                    type="checkbox"
                    checked={isAnnual}
                    onChange={handleToggleBilling}
                  />
                  <div className="switch-label order-2">
                    <span className="text-gray-800 text-2sm font-semibold">
                      <FormattedMessage id="PLANS.ANNUAL_BILLING" />
                    </span>
                  </div>
                </label>
              </div>
            </td>
            <td className="!border-b-0 table-border-s table-border-t card-rounded-tl bg-light-active dark:bg-coal-100 !p-5 !pt-7.5 relative">
              <span className="absolute badge badge-sm badge-outline badge-success absolutes top-0 start-1/2 rtl:translate-x-1/2 -translate-x-1/2 -translate-y-1/2">
                <FormattedMessage id="PLANS.CURRENT_PLAN" />
              </span>
              {renderPlanInfo("free", plans.info.free)}
            </td>
            <td className="!border-b-0 table-border-s table-border-t !p-5 !pt-7.5">
              {renderPlanInfo("private", plans.info.private)}
            </td>
            <td className="!border-b-0 table-border-s table-border-t card-rounded-tr !p-5 !pt-7.5">
              {renderPlanInfo("company", plans.info.company)}
            </td>
          </tr>

          {plans.features.map((feature, index) => renderItem(feature, index))}
        </tbody>
      </table>
    </div>
  );
};

export { Plans };
