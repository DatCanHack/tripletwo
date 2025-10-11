// src/components/Footer.jsx
import { Link } from "react-router-dom";

const year = new Date().getFullYear();

function Icon({ d, className = "w-5 h-5" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className={className}
    >
      <path d={d} />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-[#1c2227] bg-[#0f1214]">
      <div className="container py-10 md:py-14">
        {/* Top grid */}
        <div className="grid gap-10 md:grid-cols-12">
          {/* Brand + intro */}
          <div className="md:col-span-5">
            <Link to="/" className="inline-flex items-center gap-2">
              <img
                src="/images/home/logo.png"
                alt="TripleTwo logo"
                className="h-9 w-9 rounded-sm object-contain"
                aria-hidden="true"
              />
              <div className="flex items-center">
                <span className="text-white font-extrabold tracking-tight leading-none">
                  Triple
                </span>
                <span className="text-[#00B3A4] font-extrabold tracking-tight leading-none -ml-[2px]">
                  Two
                </span>
              </div>
            </Link>

            <p className="mt-4 text-gray-300 leading-7">
              Transform your body with <span className="text-white">32</span>,
              your trusted partner in fitness. With over{" "}
              <span className="text-[#00B3A4] font-semibold">5 years</span> of
              experience, we offer expert coaching, tailored workout plans, and
              comprehensive nutritional guidance.{" "}
              <a href="#" className="text-[#00B3A4] hover:underline">
                Join our community
              </a>{" "}
              and start your journey towards a healthier, stronger you.
            </p>

            {/* Socials */}
            <div className="mt-6 flex items-center gap-4">
              <a
                href="#"
                className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-white/10 hover:bg-white/5"
                aria-label="Instagram"
              >
                <Icon d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 0h10M16.5 7.5h.01M12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" />
              </a>
              <a
                href="#"
                className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-white/10 hover:bg-white/5"
                aria-label="Twitter / X"
              >
                <Icon d="M3 21 21 3M7 3h10L7 21h10" />
              </a>
              <a
                href="#"
                className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-white/10 hover:bg-white/5"
                aria-label="YouTube"
              >
                <Icon d="M3 8.5c0-2 1.6-3.5 3.6-3.5h10.8C19.4 5 21 6.5 21 8.5v7c0 2-1.6 3.5-3.6 3.5H6.6C4.6 19 3 17.5 3 15.5v-7zM10 9.5l6 3.5-6 3.5v-7z" />
              </a>
              <a
                href="#"
                className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-white/10 hover:bg-white/5"
                aria-label="Facebook"
              >
                <Icon d="M14 8h3V5h-3a4 4 0 0 0-4 4v3H7v3h3v6h3v-6h3l1-3h-4V9a1 1 0 0 1 1-1z" />
              </a>
            </div>
          </div>

          {/* Columns */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <h4 className="text-[#00B3A4] font-semibold">Company</h4>
              <ul className="mt-4 space-y-2 text-gray-300">
                <li>
                  <a href="#" className="hover:text-white">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Our Services
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Testimonial
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-[#00B3A4] font-semibold">Resources</h4>
              <ul className="mt-4 space-y-2 text-gray-300">
                <li>
                  <a href="#" className="hover:text-white">
                    32 Tools
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Workout Videos
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Nutrition Guides
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Success Stories
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Membership
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-[#00B3A4] font-semibold">Programs</h4>
              <ul className="mt-4 space-y-2 text-gray-300">
                <li>
                  <Link to="/program/fatloss" className="hover:text-white">
                    Weight Loss
                  </Link>
                </li>
                <li>
                  <Link to="/program/strength" className="hover:text-white">
                    Building Muscles
                  </Link>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Home Workout
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Gym Plan
                  </a>
                </li>
                <li>
                  <Link to="/pricing" className="hover:text-white">
                    Our Plans
                  </Link>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    32 Group
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div className="col-span-2 sm:col-span-1">
              <h4 className="text-[#00B3A4] font-semibold">Contact Us</h4>
              <ul className="mt-4 space-y-3 text-gray-300">
                <li className="flex items-start gap-3">
                  <Icon
                    className="w-5 h-5 text-gray-400"
                    d="M12 21s-7-5-7-10a7 7 0 0 1 14 0c0 5-7 10-7 10z"
                  />
                  <span>FPT University – Da Nang, Vietnam</span>
                </li>
                <li className="flex items-center gap-3">
                  <Icon
                    className="w-5 h-5 text-gray-400"
                    d="M22 16.92v3a2 2 0 0 1-2.18 2A19.84 19.84 0 0 1 3.08 5.18 2 2 0 0 1 5 3h3a2 2 0 0 1 2 1.72c.12.9.32 1.77.6 2.6a2 2 0 0 1-.45 2.11L9.1 11a16 16 0 0 0 4.9 4.9l1.57-1.05a2 2 0 0 1 2.11-.45c.83.28 1.7.48 2.6.6A2 2 0 0 1 22 16.92z"
                  />
                  <a href="tel:123456789" className="hover:text-white">
                    +84848775559
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Icon
                    className="w-5 h-5 text-gray-400"
                    d="M4 4h16v16H4zM4 7l8 6 8-6"
                  />
                  <a
                    href="mailto:tripletwo@outlook.com.vn"
                    className="hover:text-white"
                  >
                    tripletwo@outlook.com.vn
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-10 border-t border-[#1c2227]" />

        {/* Bottom bar */}
        <div className="mt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-sm text-gray-400">
          <p>© {year} TripleTwo. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white">
              Terms
            </a>
            <a href="#" className="hover:text-white">
              Privacy
            </a>
            <a href="#" className="hover:text-white">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
