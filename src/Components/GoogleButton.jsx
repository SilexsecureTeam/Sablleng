import React, { useContext } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContextObject";
import { CartContext } from "../context/CartContextObject";

const GoogleButton = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(AuthContext);
  const { cart_session_id, setCartSessionId, setItems, setTotal } =
    useContext(CartContext);

  // internal loading state just for Google flow
  const [loading, setLoading] = React.useState(false);

  const handleGoogleSuccess = async (credentialResponse) => {
    const credential = credentialResponse.credential;
    if (!credential) return;

    setLoading(true);

    try {
      const res = await fetch("https://api.sablle.ng/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_token: credential }),
      });

      const data = await res.json();

      if (res.ok) {
        const role = data.user?.role || "user";

        if (role.toLowerCase() !== "user") {
          toast.error("Admins cannot use Google login");
          return;
        }

        toast.success("Welcome to Sablle!");
        login(data.token, data.user, role);

        // ─────── CART MERGE & FETCH (same as before) ───────
        if (cart_session_id) {
          try {
            const mergeRes = await fetch(
              "https://api.sablle.ng/api/cart/merge",
              {
                method: "POST",
                headers: {
                  "X-Cart-Session": cart_session_id,
                  Authorization: `Bearer ${data.token}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({}),
              }
            );
            const mergeData = await mergeRes.json();
            if (mergeRes.ok) {
              setCartSessionId(null);
              localStorage.removeItem("cart_session_id");
              setItems(mergeData.data?.items || []);
              setTotal(mergeData.data?.total || 0);
              localStorage.setItem(
                "cart_items",
                JSON.stringify(mergeData.data?.items || [])
              );
              localStorage.setItem("cart_total", mergeData.data?.total || 0);
            }
          } catch (e) {
            console.error(e);
          }
        }

        // Fetch fresh cart
        try {
          const cartRes = await fetch("https://api.sablle.ng/api/cart", {
            headers: { Authorization: `Bearer ${data.token}` },
          });
          const cartData = await cartRes.json();
          if (cartRes.ok) {
            setItems(cartData.data?.items || []);
            setTotal(cartData.data?.total || 0);
            localStorage.setItem(
              "cart_items",
              JSON.stringify(cartData.data?.items || [])
            );
            localStorage.setItem("cart_total", cartData.data?.total || 0);
          }
        } catch (e) {
          console.error(e);
        }

        const from = location.state?.from?.pathname || "/";
        setTimeout(() => navigate(from, { replace: true }), 1500);
      } else {
        toast.error(data.message || "Google login failed");
      }
    } catch (err) {
      toast.error("Network error. Try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-8">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => toast.error("Google Sign-In failed")}
          useOneTap={false}
          theme="outline"
          size="large"
          text="continue_with"
          shape="rectangular"
          width="380px"
          isDisabled={loading} // ← disables button while loading
        />
        {loading && (
          <p className="text-sm text-gray-600 mt-2">Signing you in...</p>
        )}
      </div>
    </div>
  );
};

export default GoogleButton;
