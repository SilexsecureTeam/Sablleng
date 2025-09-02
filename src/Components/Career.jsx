import career from "../assets/career.png";
import career2 from "../assets/career2.png";
import career1 from "../assets/chero.png";

const Career = () => {
  return (
    <div>
      {/* Hero Section */}
      <div
        className="bg-cover bg-top h-[500px] md:h-[600px] relative"
        style={{ backgroundImage: `url(${career})` }}
      >
        <div className="h-full absolute inset-0 bg-black/40 opacity-50"></div>
        <div className="max-w-[1200px] mx-auto flex flex-col h-full items-center justify-center px-4 sm:px-6">
          <h2 className="text-white text-xl sm:text-2xl md:text-3xl font-bold text-center mb-4">
            Build the Future of Shopping With Us
          </h2>
          <p className="text-white text-sm sm:text-base md:text-base font-normal max-w-[500px] w-full text-center">
            At Sablleng, we’re more than an e-commerce brand — we’re a team
            shaping how people shop online. If you’re passionate about
            creativity, technology, and delivering great customer experiences,
            we’d love to have you on board. Join us and let’s grow together
          </p>
        </div>
      </div>

      {/* Why Work With Us Section */}
      <div className="w-full flex flex-col md:flex-row items-stretch justify-between">
        <img
          src={career1}
          alt="Career"
          className="object-cover min-h-[200px] h-[300px] md:h-auto w-full md:w-1/2"
        />
        <div className="bg-[#6B3838] w-full md:w-1/2 flex justify-center items-center flex-col p-6 sm:p-8 md:p-15">
          <div className="w-full max-w-[500px] text-start">
            <h2 className="text-lg sm:text-xl md:text-xl font-semibold text-[#F9FAFB] mb-2">
              Why Work With Us?
            </h2>
            <hr className="bg-[#F9FAFB] w-20 h-1 md:h-2 border-0 mb-6 md:mb-8" />
            <p className="text-xs sm:text-sm md:text-base text-[#F9FAFB] poppins mb-4">
              At Sablleng, we’re building more than an online shop. We’re
              creating experiences that make shopping simple, fun, and
              rewarding.
            </p>
            <p className="text-xs sm:text-sm md:text-base text-[#F9FAFB] poppins mb-4">
              Joining our team means being part of a fast-growing e-commerce
              brand that values:
            </p>
            <ul className="list-disc list-inside text-xs sm:text-sm md:text-base text-[#F9FAFB]">
              <li className="pb-2 sm:pb-3 poppins">
                <span className="font-semibold mr-2">Innovation:</span>
                Work with creative minds to shape the future of online shopping.
              </li>
              <li className="pb-2 sm:pb-3 poppins">
                <span className="font-semibold mr-2">Growth:</span>
                Learn, improve, and build your career in a dynamic environment.
              </li>
              <li className="pb-2 sm:pb-3 poppins">
                <span className="font-semibold mr-2">Impact:</span>
                Your work helps connect thousands of shoppers with products they
                love.
              </li>
              <li className="pb-2 sm:pb-3 poppins">
                <span className="font-semibold mr-2">Culture:</span>
                Be part of a supportive, collaborative, and energetic team.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div
        className="bg-cover bg-top h-[250px] md:h-[320px] relative"
        style={{ backgroundImage: `url(${career2})` }}
      >
        <div className="h-full absolute inset-0 bg-black/40 opacity-50"></div>
        <div className="max-w-[1200px] mx-auto flex flex-col h-full items-center justify-center px-4 sm:px-6">
          <p className="text-white text-base sm:text-lg md:text-xl font-normal max-w-[500px] w-full text-center">
            You don't just work here, you build moments, memories, and
            meaningful impact
          </p>
        </div>
      </div>
    </div>
  );
};

export default Career;
