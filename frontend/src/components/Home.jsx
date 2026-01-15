import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="antialiased bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-md p-4 sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <img
              src="/image.jpeg"
              alt="Bhoomisetu Logo"
              className="h-10 w-10 mr-3 rounded-full shadow-sm object-cover"
              onError={(e) => {
                e.target.src =
                  "https://placehold.co/40x40/ffffff/000000?text=Logo";
              }}
            />
            <span className="text-2xl font-bold text-gray-800">Bhoomisetu</span>
          </div>
          <div className="hidden md:flex space-x-6">
            <a
              href="#"
              className="text-gray-700 hover:text-green-600 font-medium"
            >
              Home
            </a>
            <a
              href="#features"
              className="text-gray-700 hover:text-green-600 font-medium"
            >
              Features
            </a>
            <a
              href="#about"
              className="text-gray-700 hover:text-green-600 font-medium"
            >
              About Us
            </a>
            <a
              href="#contact"
              className="text-gray-700 hover:text-green-600 font-medium"
            >
              Contact
            </a>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/login"
              className="px-5 py-2 border border-green-600 text-green-600 rounded-full hover:bg-green-50 transition duration-200 font-semibold"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="px-5 py-2 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition duration-200 font-semibold"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="bg-gradient-to-br from-green-600 to-green-800 text-white py-20 px-4 text-center relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ clipPath: "polygon(0 0, 100% 0, 100% 85%, 0% 100%)" }}
        ></div>
        <div className="container mx-auto max-w-4xl relative z-10">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
            Simplify Your Land Dispute Resolution
          </h1>
          <p className="text-xl md:text-2xl mb-10 opacity-90">
            Bhoomisetu provides a transparent, efficient, and secure platform to
            manage and resolve land disputes with ease.
          </p>
          <div className="space-x-4">
            <Link
              to="/signup"
              className="inline-block bg-white text-green-700 px-8 py-4 rounded-full text-lg font-bold shadow-lg hover:bg-gray-100 transition transform hover:scale-105"
            >
              Get Started Now
            </Link>
          </div>
        </div>
      </header>

      {/* Features */}
      <section id="features" className="py-16 px-4 bg-white">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-12">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Feature 1 */}
            <div className="bg-gray-50 rounded-xl shadow-md p-8 hover:scale-105 transition-transform">
              <div className="text-green-600 text-5xl mb-6 flex justify-center">
                <svg
                  className="w-16 h-16"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7s-8.268-2.943-9.542-7z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                Full Transparency
              </h3>
              <p className="text-gray-600">
                Track the progress of your disputes in real-time with complete
                visibility.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-50 rounded-xl shadow-md p-8 hover:scale-105 transition-transform">
              <div className="text-green-600 text-5xl mb-6 flex justify-center">
                <svg
                  className="w-16 h-16"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                Streamlined Process
              </h3>
              <p className="text-gray-600">
                Simplifies complex legal procedures for faster resolution.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-50 rounded-xl shadow-md p-8 hover:scale-105 transition-transform">
              <div className="text-green-600 text-5xl mb-6 flex justify-center">
                <svg
                  className="w-16 h-16"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 15v2M6 21h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                Secure & Reliable
              </h3>
              <p className="text-gray-600">
                Your data is protected with state-of-the-art security protocols.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-green-700 text-white py-16 px-4 text-center">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-4xl font-bold mb-6">
            Having a land dispute? Let's resolve it—together
          </h2>
          <p className="text-xl opacity-90 mb-8">
            Join Bhoomisetu and start your journey to resolution today.
          </p>
          <div className="space-x-4">
            <Link
              to="/login"
              className="inline-block bg-white text-green-700 px-8 py-4 rounded-full text-lg font-bold shadow-lg hover:bg-gray-100 transition transform hover:scale-105"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="inline-block border-2 border-white text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-white hover:text-green-700 transition transform hover:scale-105"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 px-4 bg-white text-center">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-4xl font-bold text-gray-800 mb-6">
            About Bhoomisetu
          </h2>
          <p className="text-gray-600 text-lg">
            Bhoomisetu is dedicated to resolving land disputes with
            transparency, speed, and trust. Our mission is to empower citizens
            with a reliable digital platform to address their concerns
            effectively.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 px-4 bg-gray-100 text-center">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-4xl font-bold text-gray-800 mb-6">Contact Us</h2>
          <p className="text-gray-600 text-lg">
            Have questions or need help? Reach out to us anytime.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-10 px-4">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">
              Bhoomisetu
            </h3>
            <p className="text-sm">
              Your trusted partner in land dispute resolution.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-white">
                  Home
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-white">
                  Features
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-white">
                  About Us
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-white">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">
              Contact Us
            </h3>
            <p className="text-sm">Email: info@bhoomisetu.com</p>
            <p className="text-sm">Phone: +91 123 456 7890</p>
            <p className="text-sm">123 Land Lane, Dispute City, India</p>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-500 text-sm">
          &copy; 2025 Bhoomisetu. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
