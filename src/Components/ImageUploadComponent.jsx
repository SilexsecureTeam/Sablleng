import React, { useState, useContext, useRef, useEffect } from "react";
import { CartContext } from "../context/CartContextObject";
import { useNavigate } from "react-router-dom";
import { X, Upload, Image, RotateCcw } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ImageUploadComponent = ({ product, auth, onBack }) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [text, setText] = useState("");
  const [instruction, setInstruction] = useState("");
  const [position, setPosition] = useState("top-left");
  const [imageCoordinates, setImageCoordinates] = useState({ x: 0, y: 0 });
  const [textCoordinates, setTextCoordinates] = useState({ x: 0, y: 60 });
  const [fontSize, setFontSize] = useState(24);
  const [textColor, setTextColor] = useState("#FFFFFF");
  const [imageSize, setImageSize] = useState(0.1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [isDragging, setIsDragging] = useState(null);
  const { addItem } = useContext(CartContext);
  const canvasRef = useRef(null);

  // Update TEXT coordinates based on position selection (logo is now independent)
  useEffect(() => {
    if (!product || !canvasRef.current) return;

    const canvas = canvasRef.current;
    if (canvas.width <= 1 || canvas.height <= 1) return; // wait for real dimensions

    const { width, height } = canvas;

    const positions = {
      "top-left": { x: width * 0.12, y: height * 0.12 },
      "top-right": { x: width * 0.88, y: height * 0.12 },
      "bottom-left": { x: width * 0.12, y: height * 0.88 },
      "bottom-right": { x: width * 0.88, y: height * 0.88 },
      center: { x: width / 2, y: height / 2 },
    };

    const pos = positions[position] || positions["center"];

    // Only update TEXT position (centered on the preset point)
    setTextCoordinates({
      x: pos.x,
      y: pos.y + fontSize * 0.6, // slight offset downward so text feels centered
    });
  }, [position, product, fontSize]);

  // Redraw canvas for preview
  useEffect(() => {
    if (!product) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const productImg = new window.Image();
    productImg.src = product.image || "";
    productImg.onload = () => {
      canvas.width = productImg.width;
      canvas.height = productImg.height;
      ctx.drawImage(productImg, 0, 0, canvas.width, canvas.height);

      if (uploadedImage) {
        const logoImg = new window.Image();
        logoImg.src = uploadedImage;
        logoImg.onload = () => {
          const logoSize = canvas.width * imageSize;
          ctx.drawImage(
            logoImg,
            imageCoordinates.x - logoSize / 2,
            imageCoordinates.y - logoSize / 2,
            logoSize,
            logoSize,
          );
        };
      }

      if (text) {
        ctx.font = `${fontSize}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Stroke (outline)
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 3; // thickness of outline
        ctx.strokeText(text, textCoordinates.x, textCoordinates.y);

        // Fill (white text on top)
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText(text, textCoordinates.x, textCoordinates.y);
      }

      if (isDragging === "image" && uploadedImage) {
        const logoSize = canvas.width * imageSize;
        ctx.strokeStyle = "#5F1327";
        ctx.lineWidth = 2;
        ctx.strokeRect(
          imageCoordinates.x - logoSize / 2,
          imageCoordinates.y - logoSize / 2,
          logoSize,
          logoSize,
        );
      } else if (isDragging === "text" && text) {
        ctx.strokeStyle = "#5F1327";
        ctx.lineWidth = 2;
        ctx.strokeRect(
          textCoordinates.x - 50,
          textCoordinates.y - fontSize / 2,
          100,
          fontSize,
        );
      }
    };
  }, [
    product,
    uploadedImage,
    text,
    imageCoordinates,
    textCoordinates,
    fontSize,
    textColor,
    imageSize,
    isDragging,
  ]);

  useEffect(() => {
    console.log("isDragging changed to:", isDragging);
  }, [isDragging]);

  const handleFileSelect = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      // toast.error("Please upload an image file (PNG, JPEG, etc.)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      // toast.error("File size exceeds 5MB limit");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target.result);
      setUploadedFile(file);
      if (!imageCoordinates.x && !imageCoordinates.y) {
        // only set if not already positioned
        const canvas = canvasRef.current;
        if (canvas && canvas.width > 1) {
          setImageCoordinates({
            x: canvas.width / 2,
            y: canvas.height / 2,
          });
        }
      }
      setIsModalOpen(false);
    };
    reader.readAsDataURL(file);
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

  const handleMouseDown = (e) => {
    e.preventDefault(); // stop browser defaults like text selection

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const scaledX = (e.clientX - rect.left) * scaleX;
    const scaledY = (e.clientY - rect.top) * scaleY;

    console.log("Scaled mouse down at:", { scaledX, scaledY }); // debug

    const logoSize = canvas.width * imageSize;

    if (uploadedImage) {
      const left = imageCoordinates.x - logoSize / 2;
      const right = imageCoordinates.x + logoSize / 2;
      const top = imageCoordinates.y - logoSize / 2;
      const bottom = imageCoordinates.y + logoSize / 2;

      // Hit area with padding for easy grabbing
      if (
        scaledX >= left - 40 &&
        scaledX <= right + 40 &&
        scaledY >= top - 40 &&
        scaledY <= bottom + 40
      ) {
        console.log("Hit logo area (scaled) → drag start");
        setIsDragging("image");
        return;
      } else {
        console.log("Missed logo (scaled)", { left, right, top, bottom });
      }
    }

    if (text) {
      if (
        scaledX >= textCoordinates.x - 80 &&
        scaledX <= textCoordinates.x + 80 &&
        scaledY >= textCoordinates.y - fontSize &&
        scaledY <= textCoordinates.y + fontSize
      ) {
        console.log("Hit text area");
        setIsDragging("text");
        return;
      }
    }

    console.log("No hit - click outside elements");
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    console.log("Mouse moving while dragging:", isDragging); // keep for now, remove later

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();

    // Scale factor: how many real pixels per preview pixel
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    // Scaled mouse position in REAL image coordinates
    let scaledX = (e.clientX - rect.left) * scaleX;
    let scaledY = (e.clientY - rect.top) * scaleY;

    // Clamp to real canvas bounds (0 to full width/height)
    scaledX = Math.max(0, Math.min(canvas.width, scaledX));
    scaledY = Math.max(0, Math.min(canvas.height, scaledY));

    if (isDragging === "image" && uploadedImage) {
      const logoSize = canvas.width * imageSize;
      const minVisible = 20; // minimum pixels of logo that stay visible

      // Allow center to move until only minVisible px of logo remains on canvas
      const minX = logoSize / 2 - (logoSize - minVisible);
      const maxX = canvas.width - (logoSize / 2 - (logoSize - minVisible));
      const boundedX = Math.max(minX, Math.min(maxX, scaledX));

      const minY = logoSize / 2 - (logoSize - minVisible);
      const maxY = canvas.height - (logoSize / 2 - (logoSize - minVisible));
      const boundedY = Math.max(minY, Math.min(maxY, scaledY));

      setImageCoordinates({ x: boundedX, y: boundedY });
    } else if (isDragging === "text" && text) {
      // Text: looser bounds, can get closer to edges
      const textWidthEstimate = Math.min(
        text.length * (fontSize * 0.6),
        canvas.width * 0.8,
      );
      const boundedX = Math.max(
        textWidthEstimate / 2,
        Math.min(canvas.width - textWidthEstimate / 2, scaledX),
      );
      const boundedY = Math.max(
        fontSize,
        Math.min(canvas.height - fontSize / 2, scaledY),
      );
      setTextCoordinates({ x: boundedX, y: boundedY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  const handleReset = () => {
    setUploadedImage(null);
    setUploadedFile(null);
    setText("");
    setInstruction("");
    setPosition("center"); // default to center for text
    setFontSize(24);
    setTextColor("#FFFFFF"); // back to white (since stroke is black)
    setImageSize(0.1);

    // Reset coords to center if canvas is ready, else fallback
    if (canvasRef.current && canvasRef.current.width > 1) {
      const { width, height } = canvasRef.current;
      setImageCoordinates({ x: width / 2, y: height / 2 });
      setTextCoordinates({ x: width / 2, y: height / 2 + 40 }); // text a bit below center
    } else {
      // Fallback if canvas not loaded yet
      setImageCoordinates({ x: 0, y: 0 });
      setTextCoordinates({ x: 0, y: 60 });
    }

    // toast.info("Customizations reset"); // uncomment if you want
  };

  const adjustImageSize = (delta) => {
    setImageSize((prev) => {
      const newSize = Math.max(0.1, Math.min(0.5, prev + delta));
      return newSize;
    });
  };

  const handleSubmitCustomization = async () => {
    if (!product) {
      // toast.error("No product selected");
      return;
    }
    if (!uploadedImage && !text) {
      // toast.error("Please upload an image or add text");
      return;
    }
    if (!auth?.isAuthenticated || !auth?.token) {
      // toast.error("Please log in to customize products");
      navigate("/signin");
      return;
    }

    setIsSubmitting(true);
    setApiError(null);

    const formData = new FormData();
    formData.append("product_id", product.id);
    if (uploadedFile) formData.append("image", uploadedFile);
    if (uploadedFile && imageSize !== undefined) {
      formData.append("image_size", imageSize.toString());
    }
    if (text) formData.append("text", text);
    if (instruction) formData.append("instruction", instruction);
    formData.append("position", position);
    formData.append("coordinates[x]", imageCoordinates.x);
    formData.append("coordinates[y]", imageCoordinates.y);

    try {
      const response = await fetch("https://api.sablle.ng/api/customizations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
            `Failed to submit customization: ${response.statusText}`,
        );
      }

      const data = await response.json();
      toast.success("Customization submitted successfully!", {
        position: "top-right",
        autoClose: 3000,
      });

      const combinedImage = data.customized_image_url || product.image;
      addItem({
        id: product.id,
        name: product.name,
        model: product.model || "N/A",
        price:
          product.rawPrice ||
          parseFloat(product.price.replace("₦", "") || 0) * 1000,
        image: combinedImage,
        quantity: 1,
        customized: true,
        text,
        position, // still useful for text placement hint
        coordinates: imageCoordinates, // logo coords
        imageSize: imageSize.toString(), // logo size
      });

      setUploadedImage(null);
      setUploadedFile(null);
      setText("");
      setInstruction("");
      setImageCoordinates({ x: 100, y: 100 });
      setTextCoordinates({ x: 100, y: 160 });
      setPosition("top-left");
      setImageSize(0.5);
      onBack();
    } catch (err) {
      console.error("Customization error:", err);
      setApiError(err.message);
      // toast.error(`Error: ${err.message}`, {
      //   position: "top-right",
      //   autoClose: 5000,
      // });
    } finally {
      setIsSubmitting(false);
    }
  };

  // const generateCombinedImage = () => {
  //   return new Promise((resolve) => {
  //     const canvas = canvasRef.current;
  //     const ctx = canvas.getContext("2d");
  //     const productImg = new window.Image();
  //     productImg.src = product?.image || "";
  //     productImg.onload = () => {
  //       canvas.width = productImg.width;
  //       canvas.height = productImg.height;
  //       ctx.drawImage(productImg, 0, 0, canvas.width, canvas.height);

  //       if (uploadedImage) {
  //         const logoImg = new window.Image();
  //         logoImg.src = uploadedImage;
  //         logoImg.onload = () => {
  //           const logoSize = canvas.width * imageSize;
  //           ctx.drawImage(
  //             logoImg,
  //             imageCoordinates.x - logoSize / 2,
  //             imageCoordinates.y - logoSize / 2,
  //             logoSize,
  //             logoSize,
  //           );
  //           if (text) {
  //             ctx.font = `${fontSize}px Arial`;
  //             ctx.fillStyle = textColor;
  //             ctx.textAlign = "center";
  //             ctx.textBaseline = "middle";
  //             ctx.fillText(text, textCoordinates.x, textCoordinates.y);
  //           }
  //           resolve(canvas.toDataURL("image/png"));
  //         };
  //       } else if (text) {
  //         ctx.font = `${fontSize}px Arial`;
  //         ctx.fillStyle = textColor;
  //         ctx.textAlign = "center";
  //         ctx.textBaseline = "middle";
  //         ctx.fillText(text, textCoordinates.x, textCoordinates.y);
  //         resolve(canvas.toDataURL("image/png"));
  //       } else {
  //         resolve(canvas.toDataURL("image/png"));
  //       }
  //     };
  //   });
  // };

  if (!product) {
    return (
      <div className="bg-white p-8 text-center">
        <p className="text-red-500">Product not found</p>
        <button
          onClick={onBack}
          className="mt-4 bg-gray-300 hover:bg-gray-400 text-gray-900 font-medium py-3 px-6 rounded-lg"
        >
          Back to Product
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <ToastContainer />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-4 lg:p-6">
        <div>
          <div className="flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 p-8 min-h-[400px]">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center flex-1 flex flex-col justify-center">
              <div className="mb-6">
                <Image className="w-16 h-16 text-gray-400 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Upload your own design file
              </h3>
              <p className="text-gray-500 mb-6">PNG, JPEG, PSD, AI, etc</p>
              {uploadedImage && (
                <div className="mt-4">
                  <img
                    src={uploadedImage}
                    alt="Uploaded preview"
                    className="w-16 h-16 object-contain mx-auto border border-gray-200 rounded"
                  />
                  <p className="text-sm text-gray-500 mt-2">Uploaded Image</p>
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={openModal}
                className="flex-1 bg-[#5F1327] hover:bg-[#5F1327]/70 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                disabled={isSubmitting}
              >
                Upload Logo
              </button>
              <button
                onClick={handleReset}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                disabled={isSubmitting}
              >
                <RotateCcw className="w-4 h-4" /> Reset
              </button>
            </div>
            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Text to Display
                  <span className="text-xs text-gray-500 ml-1">
                    (drag to reposition)
                  </span>
                </label>
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter text (e.g., Happy Birthday)"
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#5F1327]"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Additional Instructions for Production Team
                  <span className="text-xs text-gray-500 ml-1">(optional)</span>
                </label>
                <textarea
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                  placeholder="Enter instructions (e.g., Place at the top)"
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#5F1327]"
                  rows={3}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Position
                  <span className="text-xs text-gray-500 ml-1">
                    (sets initial placement)
                  </span>
                </label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#5F1327]"
                  disabled={isSubmitting}
                >
                  {[
                    "top-left",
                    "top-right",
                    "bottom-left",
                    "bottom-right",
                    "center",
                  ].map((opt) => (
                    <option key={opt} value={opt}>
                      {opt.replace("-", " ").toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
              {uploadedImage && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Logo Size
                    <span className="text-xs text-gray-500 ml-1">
                      (drag slider or use +/-)
                    </span>
                  </label>
                  <div className="flex items-center gap-3 mt-1">
                    <button
                      onClick={() => adjustImageSize(-0.01)}
                      className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-md text-sm font-medium"
                      disabled={isSubmitting || imageSize <= 0.05}
                    >
                      -
                    </button>

                    <input
                      type="range"
                      min="0.05" // now allows very small logos
                      max="0.8" // max 80% to avoid covering whole product
                      step="0.01" // fine control (1% steps)
                      value={imageSize}
                      onChange={(e) => setImageSize(parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      disabled={isSubmitting}
                    />

                    <button
                      onClick={() => adjustImageSize(0.01)}
                      className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-md text-sm font-medium"
                      disabled={isSubmitting || imageSize >= 0.8}
                    >
                      +
                    </button>

                    {/* Show current size as percentage – very helpful feedback */}
                    <span className="text-sm font-medium text-gray-700 min-w-[50px] text-right">
                      {(imageSize * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Font Size
                  <span className="text-xs text-gray-500 ml-1">
                    (for text display)
                  </span>
                </label>
                <select
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#5F1327]"
                  disabled={isSubmitting}
                >
                  {[12, 16, 20, 24, 28, 32, 36, 40, 48, 56, 64].map((size) => (
                    <option key={size} value={size}>
                      {size}px
                    </option>
                  ))}
                </select>
              </div>
              <div className="hidden">
                <label className="block text-sm font-medium text-gray-700">
                  Text Color
                  <span className="text-xs text-gray-500 ml-1">
                    (choose text color)
                  </span>
                </label>
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-full h-10 border border-gray-300 rounded-md"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 p-2 min-h-[400px]">
            <div className="bg-gray-50 rounded-lg p-2 text-center flex-1 flex flex-col justify-center">
              <canvas
                ref={canvasRef}
                className="w-64 h-64 md:w-90 mx-auto cursor-move border border-gray-200 rounded"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
              {/* <p className="mt-2 text-sm text-gray-500">
                Drag image or text to adjust position
              </p> */}
            </div>
          </div>
          <div className="space-y-3 mt-4">
            <button
              onClick={handleSubmitCustomization}
              className="w-full bg-[#5F1327] hover:bg-[#5F1327]/70 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              disabled={isSubmitting || (!uploadedImage && !text)}
            >
              {isSubmitting ? "Submitting..." : "Submit Customization"}
            </button>
            <button
              onClick={onBack}
              className="w-full bg-gray-300 hover:bg-gray-400 text-gray-900 font-medium py-3 px-6 rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              Back to Product
            </button>
          </div>
          {apiError && (
            <p className="mt-2 text-red-500 text-center">{apiError}</p>
          )}
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center p-4 z-50">
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
                      ? "border-[#5F1327] bg-[#5F1327]/10"
                      : "border-gray-300"
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
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    onClick={closeModal}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-900 font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <label
                    htmlFor="file-input"
                    className="bg-[#5F1327] hover:bg-[#5F1327]/70 text-white font-medium py-2 px-6 rounded-lg cursor-pointer transition-colors"
                  >
                    Upload
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploadComponent;
