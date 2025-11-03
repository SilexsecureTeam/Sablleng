// src/utils/categoryGroups.js
export const GROUP_MAP = {
  christmas: [45, 96], // CHRISTMAS, Ornaments
  hampers: [12, 64, 80, 81, 67], // GIFT SETS, Gift box - Marble, Gift Box - Confectioneries, Bottle & Mug Set, Kits
  corporate: [26, 37, 19, 32, 28, 51, 63, 3, 14, 50], // SERVICES, DELIVERY, ACCESSORIES, Cufflinks, Ties, Wallets, Watches, Candles, Tableware, Kitchenware
  "exclusive-at-sabblle": [103, 102, 66, 101], // New Testing, FRAGRANCE, SPECIALTY TOOLS, Cameras
  "for-him": [100, 71, 78, 32, 28, 51, 63, 35, 86, 87, 17, 59, 84], // MENS GROOMING, All Mens Grooming, Mens Perfume, Cufflinks, Ties, Wallets, Watches, Socks, Cufflinks Set, Handkerchiefs, ELECTRONICS, Chargers, Headphones
  "for-her": [65, 98, 79, 83, 36, 16, 33, 90, 91, 60, 38], // BEAUTY, Jewellery, Purses, Bracelets, Make up Accessories, PERFUMES, Jewellery case, Glasses Case, Glasses, Bags, KIDS (kid gifts for her?)
  birthday: [1, 7, 48, 68, 69, 25, 40, 41, 15], // GREETING CARDS, GAMES, Toys, Puzzles, Books, Journals & Notebooks, Pens & Pencils, STATIONERY, SOCIAL STATIONARY
  confectionery: [10, 27, 49, 77, 9, 21, 30, 52, 62, 95, 54, 55, 11, 18, 20, 53, 57, 85, 93, 99, 72, 73, 74, 56, 82, 88, 92, 2, 5, 24] // CONFECTIONARY, Chocolates, Sweets, Truffles, Biscuits, Nuts, Biscuits & Nuts, Honey, Crisps, Popcorn, Coffee, Hot Chocolate, Teas, BEVERAGES, SPIRITS, Rosè Wine, WINE, Red Wine, White Wine, Wine Cases, DRINKS, Bottles, Non Alcoholic, BATH & BODY, Room Sprays, Incense, Car Fragrance, HOME FRAGRANCE, Diffusers, Helium gas
};

// Helper to get subcategories for a main group
export const getSubCategories = (mainSlug, allCategories) => {
  const slug = mainSlug.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
  const subIds = GROUP_MAP[slug] || [];
  return allCategories.filter(cat => subIds.includes(cat.id));
};