import React, { useState, useContext } from "react";
import { Edit, Plus, Truck, Clock, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContextObject";

const DeliveryDetails = () => {
  const { setSelectedAddress } = useContext(CartContext);
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      name: "John O. - +2348037358599",
      address: "17 Adesola Odeku St, Victoria Island, Lagos",
    },
    {
      id: 2,
      name: "John O. - +2347063673967",
      address: "32 Oyegipwua Oshodi Ikojipu, Lagos - OSHODI-MAFOLUKU",
    },
  ]);
  const [selectedDelivery, setSelectedDelivery] = useState("standard");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState("");
  const [selectedAddressId, setSelectedAddressId] = useState(
    addresses[0]?.id || null
  );
  const navigate = useNavigate();

  const deliveryOptions = [
    {
      id: "standard",
      icon: Truck,
      title: "Standard",
      subtitle: "3 - 5 days",
      price: "Free",
      value: 0,
    },
    {
      id: "express",
      icon: Clock,
      title: "Express",
      subtitle: "24 - 48 hrs",
      price: "₦6,000",
      value: 6000,
    },
    {
      id: "pickup",
      icon: MapPin,
      title: "Office Pickup",
      subtitle: "Ready in 24 - 48 hrs",
      price: "Free",
      value: 0,
    },
  ];

  const addNewAddress = () => {
    if (newAddress.trim()) {
      const newId = addresses.length + 1;
      const newAddr = {
        id: newId,
        name: "User", // Ideally, get user name from auth context
        address: newAddress.trim(),
      };
      setAddresses([...addresses, newAddr]);
      setSelectedAddressId(newId);
      setSelectedAddress(newAddr);
      setNewAddress("");
      setShowAddressForm(false);
    }
  };

  const handleContinue = () => {
    const selectedAddr = addresses.find(
      (addr) => addr.id === selectedAddressId
    );
    setSelectedAddress(selectedAddr);
    const selectedDeliveryOption = deliveryOptions.find(
      (opt) => opt.id === selectedDelivery
    );
    // Explicitly create a serializable delivery object
    const serializableDelivery = {
      id: selectedDeliveryOption.id,
      title: selectedDeliveryOption.title,
      subtitle: selectedDeliveryOption.subtitle,
      price: selectedDeliveryOption.price,
      value: selectedDeliveryOption.value,
    };
    // Ensure selectedAddr is serializable
    const serializableAddress = {
      id: selectedAddr.id,
      name: selectedAddr.name,
      address: selectedAddr.address,
    };
    navigate("/payment", {
      state: {
        selectedDelivery: serializableDelivery,
        selectedAddress: serializableAddress, // Include address if needed in PaymentComponent
      },
    });
  };

  return (
    <div className="max-w-[1200px] mx-auto p-4 lg:p-6">
      <div className="grid md:grid-cols-2 gap-6 lg:gap-20">
        {/* Delivery Details Section */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Delivery Details
          </h2>
          <div className="space-y-6">
            {addresses.map((address) => (
              <div
                key={address.id}
                className={`bg-gray-100 rounded-lg p-4 relative group cursor-pointer ${
                  selectedAddressId === address.id
                    ? "border-2 border-[#CB5B6A]"
                    : ""
                }`}
                onClick={() => setSelectedAddressId(address.id)}
              >
                <p className="text-sm text-gray-700 pr-8">{address.name}</p>
                <p className="text-sm text-gray-700">{address.address}</p>
                <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
                  <Edit size={16} />
                </button>
              </div>
            ))}
          </div>
          {showAddressForm ? (
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <input
                type="text"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                placeholder="Enter new delivery address"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CB5B6A] focus:border-transparent"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={addNewAddress}
                  className="px-4 py-2 bg-[#CB5B6A] text-white rounded-lg hover:bg-[#CB5B6A]/70 transition-colors text-sm"
                >
                  Add Address
                </button>
                <button
                  onClick={() => {
                    setShowAddressForm(false);
                    setNewAddress("");
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddressForm(true)}
              className="w-full border-2 border-gray-300 rounded-lg p-4 flex items-center justify-center gap-2 text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors group"
            >
              <Plus
                size={20}
                className="group-hover:scale-110 transition-transform"
              />
              <span className="font-medium">Add new delivery Address</span>
            </button>
          )}
        </div>

        {/* Delivery Options Section */}
        <div className="space-y-6 border border-gray-200 rounded-lg p-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delivery
            </h3>
            <p className="text-sm text-gray-600 mb-4">Choose method & ETA</p>
          </div>
          <div className="space-y-3">
            {deliveryOptions.map((option) => {
              const Icon = option.icon;
              return (
                <label
                  key={option.id}
                  className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedDelivery === option.id
                      ? "border-[#CB5B6A] bg-[#CB5B6A]/10"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="delivery"
                      value={option.id}
                      checked={selectedDelivery === option.id}
                      onChange={(e) => setSelectedDelivery(e.target.value)}
                      className="text-[#CB5B6A] focus:ring-[#CB5B6A]"
                    />
                    <div
                      className={`p-2 rounded-lg ${
                        selectedDelivery === option.id
                          ? "bg-[#CB5B6A]/20"
                          : "bg-gray-100"
                      }`}
                    >
                      <Icon
                        size={20}
                        className={
                          selectedDelivery === option.id
                            ? "text-[#CB5B6A]"
                            : "text-gray-600"
                        }
                      />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {option.title}
                      </h4>
                      <p className="text-sm text-gray-500">{option.subtitle}</p>
                    </div>
                  </div>
                  <span
                    className={`font-semibold ${
                      selectedDelivery === option.id
                        ? "text-[#CB5B6A]"
                        : "text-gray-700"
                    }`}
                  >
                    {option.price}
                  </span>
                </label>
              );
            })}
          </div>
          <button
            onClick={handleContinue}
            className="w-full bg-[#CB5B6A] hover:bg-[#CB5B6A]/70 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Continue to Payment
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeliveryDetails;
