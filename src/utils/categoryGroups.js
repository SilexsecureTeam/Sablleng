// Updated utils/categoryGroups.js
// Helper to get categories for a tag
export const getTagCategories = (tag) => {
  if (!tag || !tag.categories) return [];
  return tag.categories
    .filter((cat) => cat.is_active === 1)
    .map((cat) => ({
      id: cat.id,
      name: cat.name,
       image: cat.image,  
      slug: cat.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]/g, ""),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
};