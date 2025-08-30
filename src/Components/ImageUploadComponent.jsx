import React, { useState, useContext, useRef } from "react";
import { CartContext } from "../context/CartContextObject";
import products from "../data/products";
import { X, Upload, Image } from "lucide-react";

const ImageUploadComponent = ({ productId, onBack }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const { addItem } = useContext(CartContext);
  const product = products.find((p) => p.id === parseInt(productId));
  const canvasRef = useRef(null); // For combining images

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target.result);
        setIsModalOpen(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setDragOver(false);
  };

  // Combine product image and logo using canvas
  const generateCombinedImage = () => {
    return new Promise((resolve) => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const productImg = new window.Image();
      const logoImg = new window.Image();

      productImg.src = product?.image || "";
      productImg.onload = () => {
        // Set canvas size to match product image
        canvas.width = productImg.width;
        canvas.height = productImg.height;

        // Draw product image
        ctx.drawImage(productImg, 0, 0, canvas.width, canvas.height);

        if (uploadedImage) {
          logoImg.src = uploadedImage;
          logoImg.onload = () => {
            // Calculate logo size (50% of product image width)
            const logoSize = canvas.width * 0.5;
            const logoX = (canvas.width - logoSize) / 2;
            const logoY = (canvas.height - logoSize) / 2;

            // Draw logo centered on product image
            ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
            resolve(canvas.toDataURL("image/png"));
          };
        } else {
          resolve(canvas.toDataURL("image/png"));
        }
      };
    });
  };

  const handleAddToCart = async () => {
    if (!product) return;
    const combinedImage = await generateCombinedImage();
    addItem({
      id: product.id,
      name: product.name,
      model: product.model,
      price: parseFloat(product.price.replace("₦", "")) * 1000,
      image: combinedImage,
      quantity: 1,
      customized: true,
    });
    setUploadedImage(null);
    onBack();
  };

  return (
    <div className="bg-white">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Side - Upload Area */}
        <div className="">
          <div className="flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 p-8 min-h-[400px]">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center flex-1 flex flex-col justify-center">
              <div className="mb-6">
                <Image className="w-16 h-16 text-gray-400 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Upload your own design file
              </h3>
              <p className="text-gray-500 mb-6">PNG, JPEG, PSD, AI, etc</p>
            </div>
          </div>
          <button
            onClick={openModal}
            className="w-full bg-[#CB5B6A] hover:bg-[#CB5B6A]/70 text-white font-medium py-3 px-6 rounded-lg transition-colors mt-4"
          >
            Upload Logo
          </button>
        </div>

        {/* Right Side - Product Preview */}
        <div className="">
          <div className="flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 p-8 min-h-[400px]">
            <div className="bg-gray-50 rounded-lg p-8 text-center flex-1 flex flex-col justify-center">
              {product ? (
                <div className="relative w-64 h-64 mx-auto">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain rounded-lg"
                  />
                  {uploadedImage && (
                    <img
                      src={uploadedImage}
                      alt="Uploaded logo"
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 object-contain"
                    />
                  )}
                </div>
              ) : (
                <div className="w-64 h-64 mx-auto bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-600 font-medium text-lg">
                    No Product
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3 mt-4">
            <button
              onClick={handleAddToCart}
              className="w-full bg-[#CB5B6A] hover:bg-[#CB5B6A]/70 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Add to Cart
            </button>
            <button
              onClick={onBack}
              className="w-full bg-gray-300 hover:bg-gray-400 text-gray-900 font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Back to Product
            </button>
          </div>
        </div>
      </div>

      {/* Hidden Canvas for Combining Images */}
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center p-10 z-50">
          <div className="bg-[#6B3838] rounded-lg shadow-xl max-w-lg w-full">
            <div className="flex justify-between items-center p-6 border-b border-white">
              <h2 className="text-lg font-medium text-white">
                Upload your design
              </h2>
              <button
                onClick={closeModal}
                className="text-white hover:text-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 bg-[#6B3838]">
              <div
                className={`border-2 bg-[#6B3838] border-dashed rounded-lg p-12 text-center transition-colors ${
                  dragOver
                    ? "border-[#CB5B6A] bg-[#CB5B6A]/10"
                    : "border-gray-300 "
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <div className="mb-4">
                  <Upload className="w-12 h-12 text-white mx-auto" />
                </div>
                <p className="text-white mb-4">
                  Drag and drop to upload
                  <br />
                  or click here to select files from your system
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileInput}
                  className="hidden"
                  id="file-input"
                />
              </div>
              <div className="mt-4 w-full flex justify-end">
                <label
                  htmlFor="file-input"
                  className="inline-block bg-[#CB5B6A] hover:bg-[#CB5B6A]/70 text-end text-white font-medium py-2 px-6 rounded-lg cursor-pointer transition-colors"
                >
                  Upload
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploadComponent;
