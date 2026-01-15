import React, { useState, useEffect } from "react";

const Team = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("https://api.sablle.ng/api/teams")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load team members");
        return res.json();
      })
      .then((json) => {
        const data = json.data || json || [];
        const activeMembers = Array.isArray(data)
          ? data.filter((m) => m.is_active === true)
          : [];
        setMembers(activeMembers);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="py-12 md:py-16 text-center">Loading team...</div>;
  }

  if (error) {
    console.error(error);
    return null; // or show a gentle error message
  }

  if (members.length === 0) {
    return (
      <div className="py-12 md:py-16 text-center text-gray-500">
        No team members available at the moment.
      </div>
    );
  }

  return (
    <div className="bg-[#FFF2F2] py-12 md:py-16">
      <div className="max-w-[1200px] mx-auto w-full px-4 sm:px-6 md:px-8">
        <h2 className="text-2xl md:text-4xl text-center text-[#1E1E1E] mb-10 font-[var(--font-montaga)]">
          Meet Our Team
        </h2>

        <div className="overflow-x-hidden">
          <div className="flex gap-6 md:gap-8 py-4 animate-team-scroll">
            {members.map((member) => {
              const photoSrc = member.photo || "/default-team-avatar.png"; // fallback image

              return (
                <div
                  key={member.id}
                  className="flex-none w-64 sm:w-72 md:w-80 h-auto flex flex-col items-center justify-center"
                >
                  <img
                    src={photoSrc}
                    alt={`${member.name} - ${member.position}`}
                    className="w-full h-64 md:h-80 object-cover rounded-lg shadow-md"
                    onError={(e) => {
                      e.target.src = "/default-team-avatar.png"; // fallback on load error
                    }}
                  />
                  <div className="mt-4 text-center">
                    <p className="font-medium text-[#1E1E1E]">{member.name}</p>
                    <p className="text-sm text-[#5F1327]">{member.position}</p>
                  </div>
                </div>
              );
            })}

            {/* Duplicate set for seamless infinite scroll */}
            {members.map((member) => {
              const photoSrc = member.photo || "/default-team-avatar.png";

              return (
                <div
                  key={`dup-${member.id}`}
                  className="flex-none w-64 sm:w-72 md:w-80 h-auto flex flex-col items-center justify-center"
                >
                  <img
                    src={photoSrc}
                    alt={`${member.name} - ${member.position}`}
                    className="w-full h-64 md:h-80 object-cover rounded-lg shadow-md"
                    onError={(e) => {
                      e.target.src = "/default-team-avatar.png";
                    }}
                  />
                  <div className="mt-4 text-center">
                    <p className="font-medium text-[#1E1E1E]">{member.name}</p>
                    <p className="text-sm text-[#5F1327]">{member.position}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Team;
