import React, { useState } from "react";
import {
  ChevronRight,
  HelpCircle,
  Package,
  Truck,
  RotateCcw,
  CreditCard,
  Shield,
  Calculator,
  Search,
  X,
  Plus,
} from "lucide-react";

const FAQSection = () => {
  const [selectedCategory, setSelectedCategory] = useState("General Questions");
  const [expandedItems, setExpandedItems] = useState({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State for mobile sidebar toggle

  const categories = [
    { id: "general", name: "General Questions", icon: HelpCircle },
    { id: "order", name: "Order Issues", icon: Package },
    { id: "shipping", name: "Shipping & Delivery", icon: Truck },
    { id: "return", name: "Returns & Refunds", icon: RotateCcw },
    { id: "payment", name: "Payments & Promos", icon: CreditCard },
    { id: "policies", name: "Policies & Security", icon: Shield },
    { id: "taxes", name: "Taxes & Fees", icon: Calculator },
    { id: "request", name: "Request an Item", icon: Search },
  ];

  const faqItems = {
    "General Questions": [
      {
        id: 1,
        question: "How do I create an account on your website?",
        answer:
          "Click the 'Sign Up' button at the top right corner, enter your email, password, and personal details, and follow the prompts to verify your account.",
      },
      {
        id: 2,
        question: "What should I do if I encounter issues during checkout?",
        answer:
          "Ensure your internet connection is stable, clear your browser cache, or try a different payment method. Contact support if the issue persists.",
      },
      {
        id: 3,
        question: "Can I shop as a guest without creating an account?",
        answer:
          "Yes, you can checkout as a guest, but creating an account allows you to track orders and save preferences.",
      },
      {
        id: 4,
        question: "How do I contact customer support?",
        answer:
          "Reach us via the 'Contact Us' page, email support@sablleng.com, or call our toll-free number during business hours.",
      },
    ],
    "Order Issues": [
      {
        id: 5,
        question: "How do I track my order?",
        answer:
          "Log into your account, go to 'My Orders,' and click on your order to view tracking details. You'll also receive a tracking link via email.",
      },
      {
        id: 6,
        question: "Can I modify or cancel my order?",
        answer:
          "Orders can be modified or cancelled within 24 hours of placement if they haven't shipped. Contact support immediately to request changes.",
      },
      {
        id: 7,
        question: "What if I received the wrong item?",
        answer:
          "Contact support with your order number and photos of the item received. We'll arrange a replacement or refund.",
      },
    ],
    "Shipping & Delivery": [
      {
        id: 8,
        question: "What are the available shipping options?",
        answer:
          "We offer standard (3-7 days), expedited (2-3 days), and overnight shipping. Costs vary based on location and order size.",
      },
      {
        id: 9,
        question: "Do you ship internationally?",
        answer:
          "Yes, we ship to over 100 countries. Delivery times and costs depend on the destination and customs regulations.",
      },
      {
        id: 10,
        question: "What if my package is delayed?",
        answer:
          "Check your tracking link for updates. If the delay exceeds the estimated delivery time, contact support for assistance.",
      },
    ],
    "Returns & Refunds": [
      {
        id: 11,
        question: "What is your return policy?",
        answer:
          "Items can be returned within 30 days of delivery in original condition with tags attached. Use our return portal to initiate the process.",
      },
      {
        id: 12,
        question: "How long do refunds take to process?",
        answer:
          "Refunds are processed within 5-7 business days after we receive your return. Funds may take additional time to reflect in your account.",
      },
      {
        id: 13,
        question: "Can I exchange an item instead of returning it?",
        answer:
          "Yes, exchanges are available for eligible items. Select the exchange option in the return portal and choose your replacement item.",
      },
    ],
    "Payments & Promos": [
      {
        id: 14,
        question: "What payment methods do you accept?",
        answer:
          "We accept Visa, MasterCard, PayPal, Apple Pay, Google Pay, and Klarna for installment payments.",
      },
      {
        id: 15,
        question: "How do I apply a promo code?",
        answer:
          "Enter your promo code in the 'Promo Code' field at checkout and click 'Apply' to see the discount reflected.",
      },
      {
        id: 16,
        question: "Why isn't my promo code working?",
        answer:
          "Ensure the code is valid, not expired, and meets all terms (e.g., minimum purchase). Contact support for help.",
      },
    ],
    "Policies & Security": [
      {
        id: 17,
        question: "How do you protect my personal information?",
        answer:
          "We use SSL encryption and comply with GDPR to secure your data. Read our privacy policy for details.",
      },
      {
        id: 18,
        question: "Do your products come with a warranty?",
        answer:
          "Most products include a manufacturer's warranty. Check the product page for specific warranty terms.",
      },
      {
        id: 19,
        question: "What is your price match policy?",
        answer:
          "We match prices from major competitors within 7 days of purchase. Submit a price match request with proof of the lower price.",
      },
    ],
    "Taxes & Fees": [
      {
        id: 20,
        question: "Are taxes included in the product price?",
        answer:
          "Taxes are calculated at checkout based on your shipping address and local tax rates.",
      },
      {
        id: 21,
        question: "Are there additional fees for international orders?",
        answer:
          "International orders may incur customs duties or import fees, which are the buyer's responsibility.",
      },
      {
        id: 22,
        question: "Why was I charged a handling fee?",
        answer:
          "Handling fees may apply to oversized items or special shipping requirements. These are shown at checkout.",
      },
    ],
    "Request an Item": [
      {
        id: 23,
        question: "How do I request a new item to be stocked?",
        answer:
          "Submit your request via the 'Request an Item' form on our website or email support@sablleng.com.",
      },
      {
        id: 24,
        question: "How long before a requested item is available?",
        answer:
          "We review requests monthly. If approved, items are typically stocked within 4-6 weeks, and you'll be notified.",
      },
    ],
  };

  const toggleExpand = (itemId) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const currentFAQs = faqItems[selectedCategory] || [];

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 bg-white">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl md:text-2xl font-semibold text-gray-900 mb-2 text-center sm:text-left">
          Need Help? We've Got Answers
        </h1>
        <p className="text-gray-600 text-sm max-w-[500px] sm:text-base text-center sm:text-left">
          Find quick solutions to common questions about shopping, shipping,
          payments, and your account. If you still need help, our support team
          is just a message away.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 md:gap-8">
        {/* Mobile Sidebar Toggle Button */}
        <button
          className="md:hidden flex items-center justify-between w-full p-3 bg-gray-50 border border-gray-200 rounded-lg mb-4"
          onClick={toggleSidebar}
        >
          <span className="font-medium text-gray-900">{selectedCategory}</span>
          <ChevronRight
            className={`w-5 h-5 text-gray-400 transform ${
              isSidebarOpen ? "rotate-90" : ""
            }`}
          />
        </button>

        {/* Sidebar */}
        <div
          className={`w-full md:w-100 flex-shrink-0 ${
            isSidebarOpen ? "block" : "hidden md:block"
          }`}
        >
          <nav className="space-y-1">
            {categories.map((category) => {
              const Icon = category.icon;
              const isSelected = selectedCategory === category.name;

              return (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.name);
                    setIsSidebarOpen(false); // Close sidebar on category selection
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 text-left rounded-lg border transition-colors ${
                    isSelected
                      ? "bg-gray-50 border-gray-200 text-gray-900"
                      : "border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-5 h-5" />
                    <span className="font-medium text-sm sm:text-base">
                      {category.name}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="space-y-3 sm:space-y-4">
            {currentFAQs.map((item) => {
              const isExpanded = expandedItems[item.id];
              const hasAnswer = item.answer && item.answer.length > 0;

              return (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-lg"
                >
                  <button
                    onClick={() => hasAnswer && toggleExpand(item.id)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium text-gray-900 text-sm sm:text-base">
                      {item.question}
                    </span>
                    {hasAnswer &&
                      (isExpanded ? (
                        <X className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      ) : (
                        <Plus className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      ))}
                  </button>
                  {hasAnswer && isExpanded && (
                    <div className="px-4 pb-4 border-t border-gray-100">
                      <p className="text-gray-600 pt-4 text-sm sm:text-base">
                        {item.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQSection;
