import React, { useState } from "react";
import { X, Upload, Image } from "lucide-react";

const ImageUploadComponent = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [dragOver, setDragOver] = useState(false);

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

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Side - Upload Area */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
              <div className="mb-6">
                <Image className="w-16 h-16 text-gray-400 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Upload your own design file
              </h3>
              <p className="text-gray-500 mb-6">PNG, JPEG, PSD, AI, etc</p>
              <button
                onClick={openModal}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Upload Logo
              </button>
            </div>
          </div>

          {/* Right Side - Product Preview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="text-center">
              <div className="bg-gray-50 rounded-lg p-8 mb-6">
                {uploadedImage ? (
                  <div className="relative">
                    <img
                      src={uploadedImage}
                      alt="Uploaded design"
                      className="w-48 h-48 object-contain mx-auto rounded-lg"
                    />
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-lg shadow-sm border">
                      <span className="text-gray-600 font-medium">SABLE</span>
                    </div>
                  </div>
                ) : (
                  <div className="w-48 h-48 mx-auto bg-gray-200 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-white rounded-lg mx-auto mb-2 flex items-center justify-center shadow-sm">
                        <span className="text-gray-600 font-medium text-lg">
                          SABLE
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <button className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-6 rounded-lg transition-colors">
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Upload your design
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                  dragOver
                    ? "border-red-400 bg-red-50"
                    : "border-gray-300 bg-gray-50"
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <div className="mb-4">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                </div>
                <p className="text-gray-600 mb-4">
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
                <label
                  htmlFor="file-input"
                  className="inline-block bg-red-400 hover:bg-red-500 text-white font-medium py-2 px-6 rounded-lg cursor-pointer transition-colors"
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
