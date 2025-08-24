import React from "react";
import team from "../assets/team1.png";
import team1 from "../assets/team2.png";
import team2 from "../assets/team3.png";

const Team = () => {
  // Team member data
  const teamMembers = [
    {
      img: team,
      name: "Sarah Johnson",
      role: "Founder & CEO",
    },
    {
      img: team1,
      name: "Michael Smith",
      role: "Creative Director",
    },
    {
      img: team2,
      name: "Emily Davis",
      role: "Operations Manager",
    },
  ];

  return (
    <div className="bg-[#FFF2F2]">
      <div className="max-w-[1200px] mx-auto w-full px-4 sm:px-6 md:px-8 py-12 md:py-16">
        {/* Section Title */}
        <h2 className="text-2xl md:text-4xl text-center text-[#1E1E1E] mon mb-10 font-[var(--font-montaga)]">
          Meet our team
        </h2>

        {/* Team Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {teamMembers.map((member) => (
            <img
              src={member.img}
              alt={member.name}
              className="w-full h-100 object-cover  "
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Team;
