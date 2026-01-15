import React, { useState, useEffect } from "react";

const Trust = () => {
  const [logos, setLogos] = useState([]);
  // const [heading, setHeading] = useState("Trusted by Leading Organizations");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("https://api.sablle.ng/api/trusted-organizations")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load trusted partners");
        return res.json();
      })
      .then((json) => {
        const data = json.data || [];
        const activeSections = Array.isArray(data)
          ? data.filter((s) => s.is_active === true)
          : [];

        // Merge all logos from active sections
        const allLogos = activeSections.flatMap(
          (section) => section.logos || []
        );

        // Optional: use heading from the first active section (or fallback)
        // const firstHeading =
        //   activeSections[0]?.heading || "Trusted by Leading Organizations";

        setLogos(allLogos);
        // setHeading(firstHeading);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="py-12 text-center">Loading partners...</div>;
  }

  if (error) {
    console.error(error);
    return null; // or show error message
  }

  if (logos.length === 0) {
    return null; // or <div className="py-12 text-center">No partners available</div>
  }

  return (
    <section className="py-12 md:py-16">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8">
        <h2 className="text-2xl md:text-3xl font-light text-black text-center mb-4">
          Trusted by Leading Organizations
        </h2>

        <div className="overflow-x-hidden">
          <div className="flex gap-6 md:gap-8 py-4 animate-scroll">
            {/* Original logos */}
            {logos.map((logo) => (
              <div
                key={logo.id}
                className="flex-none w-32 sm:w-40 md:w-48 h-20 md:h-24 flex items-center justify-center"
              >
                <img
                  src={logo.url}
                  alt={logo.name || "Trusted Partner"}
                  className="max-w-full max-h-full object-contain p-4"
                />
              </div>
            ))}

            {/* Duplicate for seamless infinite scroll */}
            {logos.map((logo) => (
              <div
                key={`duplicate-${logo.id}`}
                className="flex-none w-32 sm:w-40 md:w-48 h-20 md:h-24 flex items-center justify-center"
              >
                <img
                  src={logo.url}
                  alt={logo.name || "Trusted Partner"}
                  className="max-w-full max-h-full object-contain p-4"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Trust;
