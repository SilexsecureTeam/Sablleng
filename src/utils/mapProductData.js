// src/utils/mapProductData.js
import prod from "../assets/prod.png";
import prod1 from "../assets/prod1.png";
import prod2 from "../assets/prod2.png";

// Mock reviews data (since API doesn't provide reviews)
const mockReviews = {
  averageRating: 4.6,
  totalReviews: 85,
  ratings: [
    { label: "Excellent", value: 70, color: "bg-yellow-400" },
    { label: "Good", value: 20, color: "bg-yellow-400" },
    { label: "Average", value: 5, color: "bg-yellow-400" },
    { label: "Below Average", value: 3, color: "bg-yellow-400" },
    { label: "Poor", value: 2, color: "bg-yellow-400" },
  ],
  comments: [
    {
      author: "Alice Brown",
      date: "5 April 2023",
      rating: 4,
      text: "Solid product, but could use more customization options.",
    },
  ],
};

// Placeholder images to cycle through
const placeholderImages = [prod, prod1, prod2];

// Map API category names to static `type` values
const categoryTypeMap = {
  "GREETING CARDS": "Greeting Cards",
  ELECTRONICS: "Tech Gadgets",
  SPEAKERS: "Audio",
  "Pens & Pencils": "Office and writing tools",
  BAGS: "Bags and Travel",
  BOTTLES: "Drink Ware",
  CHOCOLATES: "Edibles",
  // Add more mappings as needed
};

// Categories considered customizable
const customizableCategories = ["GREETING CARDS", "CHOCOLATES", "MUGS", "BAGS"];

export const mapProductData = (apiProduct, index) => ({
  id: apiProduct.id,
  name: apiProduct.name,
  model: apiProduct.product_code || apiProduct.description || "N/A",
  price: `₦${parseFloat(apiProduct.sale_price_inc_tax).toFixed(2)}`,
  image: apiProduct.images.length > 0 ? apiProduct.images[0] : placeholderImages[index % placeholderImages.length],
  category: customizableCategories.includes(apiProduct.category.name) ? "Start Customizing" : "Product Overview",
  type: categoryTypeMap[apiProduct.category.name] || apiProduct.category.name,
  badge: customizableCategories.includes(apiProduct.category.name) ? "Customizable" : null,
  reviews: mockReviews, // Replace with API call if reviews endpoint exists
});