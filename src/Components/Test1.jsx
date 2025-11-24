import React, { useState } from "react";
import { Phone, Plus, Trash2 } from "lucide-react";

export default function Test() {
  const [billTo, setBillTo] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [paymentDue, setPaymentDue] = useState("");
  const [items, setItems] = useState([
    { id: 1, description: "", quantity: "", price: "", amount: 0 },
  ]);

  const addItem = () => {
    setItems([
      ...items,
      {
        id: items.length + 1,
        description: "",
        quantity: "",
        price: "",
        amount: 0,
      },
    ]);
  };

  const removeItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const updateItem = (id, field, value) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === "quantity" || field === "price") {
            const qty = parseFloat(updated.quantity) || 0;
            const price = parseFloat(updated.price) || 0;
            updated.amount = qty * price;
          }
          return updated;
        }
        return item;
      })
    );
  };

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const vat = subtotal * 0.075;
  const total = subtotal + vat;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-stone-100 p-8">
      <div className="max-w-4xl mx-auto bg-[#fefdfb] shadow-2xl border-8 border-[#8b7355] p-10">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="text-3xl font-bold tracking-wider text-[#8b7355] border-2 border-[#8b7355] px-4 py-2 inline-block">
              SABLLE
            </div>
          </div>
          <div className="text-right text-sm">
            <div className="font-semibold text-[#8b7355]">SABLLE</div>
            <div className="text-gray-600">Lagos</div>
            <div className="text-gray-600">Nigeria</div>
            <div className="flex items-center justify-end gap-1 mt-1">
              <Phone className="w-3 h-3 text-gray-600" />
              <span className="text-gray-600">08187290260</span>
            </div>
          </div>
        </div>

        {/* Invoice Title with decorative border */}
        <div className="flex items-center justify-center mb-10">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#8b7355] to-[#8b7355]"></div>
          <div className="mx-4 relative">
            <div className="border-2 border-[#8b7355] px-8 py-2 bg-[#fefdfb]">
              <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-[#8b7355]"></div>
              <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-[#8b7355]"></div>
              <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-[#8b7355]"></div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-[#8b7355]"></div>
              <span className="text-2xl font-serif text-[#c4a052]">
                Invoice
              </span>
            </div>
          </div>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent via-[#8b7355] to-[#8b7355]"></div>
        </div>

        {/* Bill To and Invoice Details */}
        <div className="flex justify-between mb-8">
          <div className="w-1/2">
            <div className="text-xs font-semibold text-gray-500 mb-2">
              BILL TO
            </div>
            <textarea
              value={billTo}
              onChange={(e) => setBillTo(e.target.value)}
              placeholder="Customer name and address..."
              className="w-full h-24 p-2 text-sm border-b border-gray-300 focus:border-[#8b7355] focus:outline-none bg-transparent resize-none"
            />
          </div>
          <div className="w-5/12 text-sm">
            <div className="flex justify-between mb-2">
              <span className="font-semibold">Invoice Number:</span>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-32 px-2 border-b border-gray-300 focus:border-[#8b7355] focus:outline-none text-right bg-transparent"
              />
            </div>
            <div className="flex justify-between mb-2">
              <span className="font-semibold">Invoice Date:</span>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-32 px-2 border-b border-gray-300 focus:border-[#8b7355] focus:outline-none text-right bg-transparent"
              />
            </div>
            <div className="flex justify-between mb-2">
              <span className="font-semibold">Payment Due:</span>
              <input
                type="date"
                value={paymentDue}
                onChange={(e) => setPaymentDue(e.target.value)}
                className="w-32 px-2 border-b border-gray-300 focus:border-[#8b7355] focus:outline-none text-right bg-transparent"
              />
            </div>
            <div className="flex justify-between mt-4 pt-2 border-t border-gray-300">
              <span className="font-bold">Amount Due (NGN):</span>
              <span className="font-bold">₦{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-6">
          <div className="border-t-2 border-b-2 border-[#8b7355] py-2 mb-2">
            <div className="grid grid-cols-12 gap-4 text-sm font-semibold">
              <div className="col-span-5">Items</div>
              <div className="col-span-2 text-center">Quantity</div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-2 text-right">Amount</div>
              <div className="col-span-1"></div>
            </div>
          </div>

          {items.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-12 gap-4 mb-2 items-center"
            >
              <div className="col-span-5">
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) =>
                    updateItem(item.id, "description", e.target.value)
                  }
                  placeholder="Item description"
                  className="w-full px-2 py-1 text-sm border-b border-gray-200 focus:border-[#8b7355] focus:outline-none bg-transparent"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) =>
                    updateItem(item.id, "quantity", e.target.value)
                  }
                  placeholder="0"
                  className="w-full px-2 py-1 text-sm text-center border-b border-gray-200 focus:border-[#8b7355] focus:outline-none bg-transparent"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  value={item.price}
                  onChange={(e) => updateItem(item.id, "price", e.target.value)}
                  placeholder="0.00"
                  className="w-full px-2 py-1 text-sm text-right border-b border-gray-200 focus:border-[#8b7355] focus:outline-none bg-transparent"
                />
              </div>
              <div className="col-span-2 text-right text-sm font-medium">
                ₦{item.amount.toFixed(2)}
              </div>
              <div className="col-span-1 flex justify-center">
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={addItem}
            className="flex items-center gap-2 text-sm text-[#8b7355] hover:text-[#6d5942] mt-4 font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
        </div>

        <div className="border-t border-gray-300 mt-8"></div>

        {/* Totals */}
        <div className="flex justify-end mt-4">
          <div className="w-5/12 text-sm">
            <div className="flex justify-between mb-2">
              <span>Sub-total:</span>
              <span>₦{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-3 text-xs text-gray-600">
              <span>VAT at 7.5%:</span>
              <span>₦{vat.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-300">
              <span>Amount Due (NGN):</span>
              <span>₦{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Notes/Terms */}
        <div className="mt-12 pt-6 border-t border-gray-300">
          <div className="text-sm font-bold mb-2">Notes / Terms</div>
          <div className="text-xs text-gray-700 space-y-1">
            <p>Thank you for shopping with SABLLE</p>
            <p>
              This is your invoice. Please retain for your records. Kindly make
              payment to:
            </p>
            <p className="mt-2">
              <span className="font-semibold">Name:</span> SABLLE NIG LTD
              <br />
              <span className="font-semibold">A/c:</span> 1304461853
              <br />
              <span className="font-semibold">Bank:</span> Providus Bank
            </p>
          </div>
        </div>

        {/* Footer - Powered by Wave */}
        <div className="mt-12 pt-6 border-t border-gray-200 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <span>Powered by</span>
            <span className="font-bold text-[#4a90e2]">Wave</span>
          </div>
        </div>
      </div>
    </div>
  );
}
