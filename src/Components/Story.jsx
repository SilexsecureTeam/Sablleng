import React from "react";
import story from "../assets/story.png";

const Story = () => {
  return (
    <div className="bg-[#C7969D4D] min-h-screen">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12  flex flex-col md:flex-row justify-between space-x-10">
        <div className="w-full md:w-1/2">
          <h2 className="text-[#5F1327] text-2xl md:text-4xl">Our Story</h2>
          <p className="text-base mt-4 leading-7 text-[#414245] ">
            Our founder and Chief Curator, Simisolu Soyombo is a lawyer with
            keen interest in providing practical and actionable solutions. One
            of her hobbies include selecting gift items for friends, family and
            herself. <br />
            In 2018, she realized the immense joy people around her relished in
            from untying packages or unboxing gifts; the delight and
            satisfaction they got can be shared across a wider audience, hence,
            filling the world with more happy moments, one individual at a gift!{" "}
            <br />
            This informed her choice to create SABLLÉ LUXURY. She decided to
            share this profound discovery she was passionate about with the
            world and so began curating even more beautiful gift items that can
            make a lasting impression as well as bring warmth to people’s hearts
            and lives. <br />
            However, SABLLÉ LUXURY did not happen overnight. The high-class
            luxury brand we have built is the result of many nights kept awake
            with a million dreams and strategic planning. A lot of hard work,
            dedication, enthusiastic-resilience and amazingly spirited teamwork
            are inputted behind the scenes with a huge leap of faith.
          </p>
        </div>
        <div className="w-full md:w-1/2 mt-8 md:mt-0">
          <div className="flex md:justify-end justify-center w-full">
            <img
              src={story}
              alt="img"
              className="md:h-120 md:max-w-96 object-top"
            />
          </div>
          <div className="flex md:justify-end justify-center w-full">
            <h2 className="text-[#5F1327] md:max-w-70 w-full text-center md:text-start leading-8 mt-4 text-xl">
              Simisolu Soyombo <br />
              Founder/Chief Curator
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Story;
