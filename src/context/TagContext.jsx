// src/context/TagContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

const TagContext = createContext();

export const TagProvider = ({ children }) => {
  const [tags, setTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("https://api.sablle.ng/api/tags");
        if (!res.ok) throw new Error("Failed to load tags");

        const data = await res.json();
        const formatted = (Array.isArray(data) ? data : [])
          .filter((t) => t.is_active === true)
          .map((t) => ({
            id: t.id,
            name: t.name,
            slug: t.slug,
            categories: t.categories || [],
            image_url: t.image_url || t.image || null,
          }))
          .sort((a, b) => a.name.localeCompare(b.name));
        setTags(formatted);
      } catch (err) {
        setError(err.message);
        console.error("Tags fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTags();
    // Empty dependency array = runs ONLY on hard refresh / first load
  }, []);

  return (
    <TagContext.Provider value={{ tags, isLoading, error }}>
      {children}
    </TagContext.Provider>
  );
};

export const useTags = () => useContext(TagContext);
