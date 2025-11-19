import React, { useState, useEffect } from "react";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "../assets/footer.png";

const Footer = () => {
  const [shopTags, setShopTags] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShopTags = async () => {
      try {
        // Try cache first
        const cached = localStorage.getItem("sablle_footer_tags");
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
            setShopTags(data);
            setLoading(false);
            return;
          }
        }

        const res = await fetch("https://api.sablle.ng/api/tags");
        if (!res.ok) throw new Error("Failed to fetch tags");

        const tagsData = await res.json();
        const tagsArray = Array.isArray(tagsData) ? tagsData : [];

        const activeTags = tagsArray
          .filter((tag) => tag.is_active === true)
          .map((tag) => ({
            name: tag.name,
            slug: tag.slug,
          }))
          .slice(0, 5); // Only first 5

        // Cache for next visit
        localStorage.setItem(
          "sablle_footer_tags",
          JSON.stringify({ data: activeTags, timestamp: Date.now() })
        );

        setShopTags(activeTags);
      } catch (err) {
        console.error("Footer tags error:", err);
        // Silently fall back to empty (won't break layout)
        setShopTags([]);
      } finally {
        setLoading(false);
      }
    };

    fetchShopTags();
  }, []);

  return (
    <footer className="bg-[#353535] text-white py-12 md:py-16">
      <div className="max-w-[1200px] px-4 sm:px-6 md:px-8 pb-6 mx-auto grid grid-cols-1 md:grid-cols-5 gap-12">
        {/* Brand Section */}
        <div>
          <img src={logo} alt="img" className="mb-4" />
          <p className="text-sm leading-relaxed mb-6">
            Nigeria’s premier luxury gifting service, creating memorable
            experiences through thoughtfully curated hampers and personalized
            gifts.
          </p>
        </div>

        {/* Shop - NOW DYNAMIC - Only First 5 Tags */}
        <div>
          <h3 className="text-white font-semibold text-xl mb-4">Shop</h3>
          <ul className="space-y-2 text-sm">
            {loading ? (
              // Simple loading placeholders
              <>
                {[...Array(5)].map((_, i) => (
                  <li key={i}>
                    <span className="block h-4 bg-gray-600 rounded w-24 animate-pulse"></span>
                  </li>
                ))}
              </>
            ) : shopTags.length > 0 ? (
              shopTags.map((tag) => (
                <li key={tag.slug}>
                  <Link
                    to={`/groups/${tag.slug}`}
                    className="hover:text-white transition-colors"
                  >
                    {tag.name}
                  </Link>
                </li>
              ))
            ) : (
              // Fallback if no tags (rare)
              <>
                <li>
                  <Link to="/" className="hover:text-white">
                    For Her
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:text-white">
                    For Him
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:text-white">
                    Corporate Gifts
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:text-white">
                    Special Occasions
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:text-white">
                    Gift Cards
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>

        {/* Company */}
        <div>
          <h3 className="text-white font-semibold text-xl mb-4">Company</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/about" className="hover:text-white">
                About Us
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-white">
                Our Story
              </Link>
            </li>
            <li>
              <Link to="/careers" className="hover:text-white">
                Careers
              </Link>
            </li>
            {/* <li>
              <Link to="/" className="hover:text-white">
                Press
              </Link>
            </li>
            <li>
              <Link to="/" className="hover:text-white">
                Blog
              </Link>
            </li> */}
          </ul>
        </div>

        {/* Support */}
        <div>
          <h3 className="text-white font-semibold text-xl mb-4">Support</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/faqs" className="hover:text-white">
                FAQs
              </Link>
            </li>
            {/* <li>
              <Link to="/" className="hover:text-white">
                Shipping Info
              </Link>
            </li>
            <li>
              <Link to="/" className="hover:text-white">
                Returns
              </Link>
            </li>
            <li>
              <Link to="/" className="hover:text-white">
                Size Guide
              </Link>
            </li> */}
            <li>
              <Link to="/contact" className="hover:text-white">
                Contact Us
              </Link>
            </li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h3 className="text-white font-semibold text-xl mb-4">Legal</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/privacy-policy" className="hover:text-white">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/terms" className="hover:text-white">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link to="/cookie-policy" className="hover:text-white">
                Cookie Policy
              </Link>
            </li>
            {/* <li>
              <Link to="/" className="hover:text-white">
                Refund Policy
              </Link>
            </li> */}
          </ul>
        </div>
      </div>

      {/* Bottom Social Links */}
      <div className="flex justify-between items-end max-w-[1200px] px-4 sm:px-6 md:px-8 mx-auto">
        <div className="space-y-2 text-sm">
          <p className="font-semibold text-white">+2348187230200</p>
          <p>info@sablle.ng</p>
          <p>2A Adebayo Doherty Road Lekki Phase 1 Lagos, Nigeria.</p>
        </div>
        <div className="flex justify-end space-x-6">
          <a href="#" className="hover:text-white hidden">
            <Linkedin size={18} />
          </a>
          <a
            href="https://www.instagram.com/sablleluxury?igsh=aHVvbmFuN2RoNHZ3"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white"
          >
            <Instagram size={18} />
          </a>
          <a
            href="https://www.facebook.com/profile.php?id=100092503805566"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white"
          >
            <Facebook size={18} />
          </a>
          <a href="#" className="hover:text-white hidden">
            <Twitter size={18} />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
