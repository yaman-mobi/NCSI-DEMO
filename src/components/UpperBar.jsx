import { Link } from 'react-router-dom';
import {
  FaFacebookF,
  FaYoutube,
  FaInstagram,
  FaWhatsapp,
} from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { useAuth } from '../context/AuthContext';

export default function UpperBar() {
  const { user, profile, signOut, isAuthenticated } = useAuth();
  const displayName = user?.fullName || user?.email?.split('@')[0] || 'User';

  const handleLogout = () => {
    signOut();
    navigate('/', { replace: true });
  };

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

          {isAuthenticated ? (
            <>
              <span className="hidden text-sm text-black/90 sm:block">
                Hi,{' '}
                <span className="font-medium">{displayName}</span>
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded border border-black/30 bg-black/10 px-3 py-1.5 text-sm font-medium text-black hover:bg-black/20"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/register"
                className="hidden text-sm font-medium text-white/90 hover:text-white sm:block"
              >
                Register
              </Link>
              <Link
                to="/login"
                className="rounded border border-white/30 bg-white/10 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/20"
              >
                Login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
