import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Image as ImageIcon } from "lucide-react";
import { AuthContext } from "../../context/AuthContextObject";
import { toast } from "react-toastify";

const ProductCustomizationsDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);

  const [product, setProduct] = useState(null);
  const [customizations, setCustomizations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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

        {/* Gallery / List */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customizations.map((c, idx) => (
            <div
              key={c.id || idx}
              className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {c.image_path ? (
                <img
                  src={`https://api.sablle.ng/storage/${c.image_path}`}
                  alt="Customized preview"
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-gray-400" />
                </div>
              )}

              <div className="p-4">
                {c.text && (
                  <p className="font-medium text-lg mb-2">"{c.text}"</p>
                )}
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    Position:{" "}
                    <span className="font-medium">{c.position || "—"}</span>
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
