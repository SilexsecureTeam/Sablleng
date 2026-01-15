import React, { useState, useEffect } from "react";

const Story = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("https://api.sablle.ng/api/about-us")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load story");
        return res.json();
      })
      .then((json) => {
        setData(json.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading)
    return <div className="text-center py-12">Loading our story...</div>;
  if (error || !data)
    return (
      <div className="text-center py-12 text-red-600">Error loading story</div>
    );

  const imageSrc = data.founder_image
    ? `https://api.sablle.ng/storage/${data.founder_image}`
    : "/placeholder-founder.jpg"; // fallback if needed

  return (
    <div className="bg-[#C7969D4D] min-h-screen">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12 flex flex-col md:flex-row justify-between space-x-10">
        <div className="w-full md:w-1/2">
          <h2 className="text-[#5F1327] text-2xl md:text-4xl">
            {data.heading}
          </h2>
          <div className="text-base mt-4 leading-7 text-[#414245] whitespace-pre-wrap">
            {data.content}
          </div>
        </div>
        <div className="w-full md:w-1/2 mt-8 md:mt-0">
          <div className="flex md:justify-end justify-center w-full">
            <img
              src={imageSrc}
              alt="Founder"
              className="md:h-120 md:max-w-96 object-top rounded-lg"
            />
          </div>
          <div className="flex md:justify-end justify-center w-full">
            <h2 className="text-[#5F1327] md:max-w-70 w-full text-center md:text-start leading-8 mt-4 text-xl">
              {data.founder_name} <br />
              {data.founder_title}
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Story;
