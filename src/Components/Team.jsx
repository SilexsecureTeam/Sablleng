import React from "react";
import team1 from "../assets/team1.png";
import team2 from "../assets/team2.png";
import team3 from "../assets/team3.png";
import team4 from "../assets/team2.png"; // Placeholder for new staff member
import team5 from "../assets/team1.png"; // Placeholder for new staff member

const Team = () => {
  // Team member data (expanded to 5 core staff members)
  const teamMembers = [
    { img: team1 },
    { img: team2 },
    { img: team3 },
    { img: team4 },
    { img: team5 },
  ];

  return (
    <div className="bg-[#FFF2F2] py-12 md:py-16">
      <div className="max-w-[1200px] mx-auto w-full px-4 sm:px-6 md:px-8">
        {/* Section Title */}
        <h2 className="text-2xl md:text-4xl text-center text-[#1E1E1E] mb-10 font-[var(--font-montaga)]">
          Meet Our Team
        </h2>

        {/* Horizontal Scrolling Container */}
        <div className="overflow-x-hidden">
          <div className="flex gap-6 md:gap-8 py-4 animate-team-scroll">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="flex-none w-64 sm:w-72 md:w-80 h-auto flex flex-col items-center justify-center"
              >
                <img
                  src={member.img}
                  alt={`Team member ${index + 1}`}
                  className="w-full h-64 md:h-80 object-cover rounded-lg"
                />
              </div>
            ))}
            {/* Duplicate for seamless looping */}
            {teamMembers.map((member, index) => (
              <div
                key={`duplicate-${index}`}
                className="flex-none w-64 sm:w-72 md:w-80 h-auto flex flex-col items-center justify-center"
              >
                <img
                  src={member.img}
                  alt={`Team member ${index + 1}`}
                  className="w-full h-64 md:h-80 object-cover rounded-lg"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Team;
