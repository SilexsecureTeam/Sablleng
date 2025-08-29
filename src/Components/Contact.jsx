import {
  MapPin,
  Mail,
  MessageCircle,
  Clock,
  Linkedin,
  Instagram,
  Facebook,
} from "lucide-react";

const Contact = () => {
  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8  py-6 md:py-12">
      <div className="flex flex-col md:flex-row space-x-8 space-y-8">
        {/* Left Column - Contact Methods */}
        <div className="space-y-6 w-full md:w-1/3">
          {/* Visit our Office */}
          <div className="bg-[#F8F8F8] rounded-lg shadow-sm p-6">
            <div className="flex flex flex-col space-y-2 items-start space-x-4">
              <div className="bg-red-400 p-3 rounded-lg">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-xl text-[#737272] mb-1">
                  Visit our Office
                </h3>
                <p className="text-[#737272] text-sm">
                  Victoria Island, Lagos, Nigeria
                </p>
              </div>
            </div>
          </div>

          {/* Send Email */}
          <div className="bg-[#F8F8F8] rounded-lg shadow-sm p-6">
            <div className="flex flex-col space-y-2 items-start space-x-4">
              <div className="bg-red-400 p-3 rounded-lg">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-xl text-[#737272] mb-1">
                  Send Email
                </h3>
                <p className="text-[#737272] text-sm">
                  Send your mail to: info@cable.ng
                </p>
              </div>
            </div>
          </div>

          {/* WhatsApp */}
          <div className="bg-[#F8F8F8] rounded-lg shadow-sm p-6">
            <div className="flex flex-col space-y-2 items-start space-x-4">
              <div className="bg-red-400 p-3 rounded-lg">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-xl text-[#737272] mb-1">
                  Call or send a whats app text
                </h3>
                <p className="text-[#737272] text-sm">+2348187390500</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Contact Form */}
        <div className="bg-[#F8F8F8] w-full md:w-2/3 rounded-lg shadow-sm p-6 md:px-12 md:py-10 h-fit">
          <h2 className="text-xl font-semibold text-[#737272] mb-2">
            Please Drop your Message
          </h2>
          <p className="text-[#737272] text-sm mb-6">
            We will get back to you as we will fill out the form below and our
            team will get back to you soon as possible.
          </p>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Name"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <input
                  type="tel"
                  placeholder="Phone Number"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent text-sm"
                />
              </div>
            </div>

            <div>
              <input
                type="email"
                placeholder="Email Address"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent text-sm"
              />
            </div>

            <div>
              <textarea
                placeholder="Your Message"
                rows={6}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent text-sm resize-none"
              ></textarea>
            </div>

            <button
              type="button"
              className="w-full bg-[#D57A86] hover:bg-red-400 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Send Message
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section - Business Hours and Social Media */}
      <div className="mt-8 bg-[#F8F8F8] rounded-lg shadow-sm p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          {/* Business Hours */}
          <div className="flex items-center space-x-4">
            <div className="bg-gray-100 p-2 rounded-lg">
              <Clock className="w-5 h-5 text-[#D57A86]" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-semibold text-gray-900">Mon - Fri</div>
                <div className="text-gray-600">9:00am - 6:00pm</div>
              </div>
              <div>
                <div className="font-semibold text-gray-900">Saturdays</div>
                <div className="text-gray-600">10:00am - 2:00pm</div>
              </div>
            </div>
          </div>

          {/* Social Media Links */}
          <div className="flex space-x-3">
            <a
              href="#"
              className="hover:bg-[#D57A86]/70 bg-[#D57A86] hover:text-black text-white p-2 rounded-lg transition-colors duration-200"
            >
              <Linkedin className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="hover:bg-[#D57A86]/70 bg-[#D57A86] hover:text-black text-white p-2 rounded-lg transition-colors duration-200"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="hover:bg-[#D57A86]/70 bg-[#D57A86] hover:text-black text-white p-2 rounded-lg transition-colors duration-200"
            >
              <Facebook className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="hover:bg-[#D57A86]/70 bg-[#D57A86] hover:text-black text-white p-2 rounded-lg transition-colors duration-200"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
