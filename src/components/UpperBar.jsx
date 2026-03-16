import { Link } from 'react-router-dom';
import {
  FaFacebookF,
  FaYoutube,
  FaInstagram,
  FaWhatsapp,
} from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

export default function UpperBar() {
  return (
    <div className="w-full bg-gray-100 border-b border-gray-200">
      <div className="flex items-center justify-between px-4 md:px-6 lg:px-[100px] h-9 text-sm">
        {/* Social Icons */}
        <div className="flex items-center gap-4 text-[#182F5B] text-lg">
          <a href="#">
            <FaFacebookF />
          </a>
          <a href="#">
            <FaXTwitter />
          </a>
          <a href="#">
            <FaYoutube />
          </a>
          <a href="#">
            <FaInstagram />
          </a>
          <a href="#">
            <FaWhatsapp />
          </a>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4 text-[#182f5b]">
          <button className="flex items-center gap-1 hover:text-black">
            🌐 عربي
          </button>

          <Link
            to="/register"
            className="flex items-center gap-1 hover:text-black"
          >
            Register
          </Link>

          <Link
            to="/login"
            className="flex items-center gap-1 bg-[#182f5b] text-white px-3 py-1 rounded hover:bg-[#0f2347]"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
