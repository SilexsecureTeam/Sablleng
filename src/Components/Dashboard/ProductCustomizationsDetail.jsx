import React, { useState, useEffect, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Image as ImageIcon, Loader2 } from "lucide-react";
import { AuthContext } from "../../context/AuthContextObject";
import { toast } from "react-toastify";

const ProductCustomizationsDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);

  const [product, setProduct] = useState(null);
  const [customizations, setCustomizations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const canvasRefs = useRef({}); // To reference each canvas by customization id

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          "https://api.sablle.ng/api/product/customized",
          {
            headers: { Authorization: `Bearer ${auth.token}` },
          },
        );
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();

        const target = (data.products || []).find(
          (p) => p.id === Number(productId),
        );
        if (!target || !target.customization?.length) {
          toast.info("No customizations for this product.");
          navigate("/dashboard/customizations");
          return;
        }

        setProduct(target);
        setCustomizations(target.customization || []);
      } catch (err) {
        toast.error("Error loading data");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (auth?.token) fetchData();
  }, [productId, auth?.token, navigate]);

  // New drawing useEffect
  useEffect(() => {
    if (!customizations.length || !product) return;

    customizations.forEach((cust) => {
      const canvas = canvasRefs.current[cust.id];
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height); // reset

      const baseSrc =
        product.image ||
        "https://via.placeholder.com/600x600/eeeeee/cccccc?text=Product+Base";

      const baseImg = new Image();
      baseImg.crossOrigin = "anonymous";
      baseImg.src = baseSrc;

      baseImg.onload = () => {
        canvas.width = baseImg.width;
        canvas.height = baseImg.height;
        ctx.drawImage(baseImg, 0, 0);

        // Try to draw logo
        if (cust.image_path) {
          const logo = new Image();
          logo.crossOrigin = "anonymous";
          logo.src = `https://api.sablle.ng/storage/${cust.image_path}`;

          logo.onload = () => {
            const logoSize = Math.min(canvas.width, canvas.height) * 0.35; // adjustable
            let x = parseFloat(cust.coordinates?.x) || canvas.width / 2;
            let y = parseFloat(cust.coordinates?.y) || canvas.height / 2;

            // Basic bounds check
            x = Math.max(
              logoSize / 2,
              Math.min(canvas.width - logoSize / 2, x),
            );
            y = Math.max(
              logoSize / 2,
              Math.min(canvas.height - logoSize / 2, y),
            );

            ctx.drawImage(
              logo,
              x - logoSize / 2,
              y - logoSize / 2,
              logoSize,
              logoSize,
            );

            drawText(ctx, cust, x, y + logoSize / 2 + 20, canvas); // text below logo
          };

          logo.onerror = () => {
            console.warn(
              `Logo failed to load for cust ${cust.id}: ${logo.src}`,
            );
            drawText(
              ctx,
              cust,
              canvas.width / 2,
              canvas.height / 2 + 60,
              canvas,
            ); // fallback text position
          };
        } else {
          // No logo → center text
          drawText(ctx, cust, canvas.width / 2, canvas.height / 2, canvas);
        }
      };

      baseImg.onerror = () => {
        console.error(`Base image failed: ${baseSrc}`);
        // Draw placeholder text on blank canvas
        ctx.fillStyle = "#cccccc";
        ctx.font = "20px Arial";
        ctx.fillText("Base image unavailable", 20, 40);
        drawText(ctx, cust, canvas.width / 2, 100, canvas);
      };
    });
  }, [customizations, product]);

  // Helper to draw text with outline
  const drawText = (ctx, cust, x, y, canvas) => {
    if (!cust.text) return;

    const fontSize = Math.min(48, canvas.height * 0.08); // scale with canvas
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Black outline for visibility
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = fontSize > 30 ? 4 : 3;
    ctx.strokeText(cust.text, x, y);

    // White fill
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(cust.text, x, y);

    console.log(`Drew text "${cust.text}" at (${x}, ${y}) for cust ${cust.id}`);
  };

  if (isLoading) return <div className="p-10 text-center">Loading...</div>;

  if (!product)
    return <div className="p-10 text-center">Product not found</div>;

  return (
    <div className="min-h-screen bg-[#FAF7F5] p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-sm">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard/customizations")}
              className="text-[#5F1327] hover:text-[#B54F5E]"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-semibold">{product.name}</h1>
              <p className="text-sm text-gray-600">
                {customizations.length} customer customizations
              </p>
            </div>
          </div>
        </div>

        {/* Grid of customizations */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customizations.map((c) => (
            <div
              key={c.id}
              className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="relative">
                <canvas
                  ref={(el) => (canvasRefs.current[c.id] = el)}
                  className="w-full h-64 object-cover bg-gray-100"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                </div>
                {!c.image_path && !c.text && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>

              <div className="p-4">
                {c.text && (
                  <p className="font-medium text-lg mb-2">"{c.text}"</p>
                )}
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    Position:{" "}
                    <span className="font-medium">
                      {c.position || "Custom"}
                    </span>
                  </p>
                  {c.instruction && <p>Note: {c.instruction}</p>}
                  <p className="text-xs text-gray-500 mt-3">
                    {new Date(c.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {customizations.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            No customizations recorded for this product.
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCustomizationsDetail;
