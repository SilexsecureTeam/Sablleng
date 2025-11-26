// src/hooks/useAllProducts.js
import { useState, useEffect } from "react";

const useAllProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cacheKey = "all_products";
    const cached = localStorage.getItem(cacheKey);
    const CACHE_TIME = 60 * 60 * 1000; // 1 hour

    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TIME) {
        setProducts(data);
        setLoading(false);
        return;
      }
    }

    const fetchAllProducts = async () => {
      setLoading(true);
      try {
        // Fetch all active products (light fields)
        const res = await fetch(
          "https://api.sablle.ng/api/products?per_page=500&is_active=1&fields=id,name,sale_price_inc_tax,images.url,images.path,category.name,customize"
        );
        if (!res.ok) throw new Error("Failed to load products");

        const result = await res.json();
        const allProducts = Array.isArray(result.data) ? result.data : result;

        const formatted = allProducts.map((item) => ({
          id: item.id,
          name: item.name,
          price: parseFloat(item.sale_price_inc_tax) || 0,
          image: item.images?.[0]?.url || (item.images?.[0]?.path ? `https://api.sablle.ng/storage/${item.images[0].path}` : "/placeholder-image.jpg"),
          category: item.category?.name,
          customize: !!item.customize,
        }));

        setProducts(formatted);

        // Cache it
        localStorage.setItem(cacheKey, JSON.stringify({
          data: formatted,
          timestamp: Date.now(),
        }));
      } catch (err) {
        console.error(err);
        setError("Failed to load search data");
      } finally {
        setLoading(false);
      }
    };

    fetchAllProducts();
  }, []);

  return { products, loading, error };
};

export default useAllProducts;