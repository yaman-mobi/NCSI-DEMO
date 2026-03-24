import { Link, useNavigate } from 'react-router-dom';
import {
  FaFacebookF,
  FaYoutube,
  FaInstagram,
  FaGlobe,
  FaUser,
  FaSignOutAlt,
} from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { FaArrowRightToBracket } from 'react-icons/fa6';
import { Dropdown } from 'react-bootstrap';
export default function UpperBar() {
  const navigate = useNavigate();
  const { user, profile, signOut, isAuthenticated } = useAuth();
  const displayName = user?.fullName || user?.email?.split('@')[0] || 'User';

  const PlatformType = {
    Facebook: 'https://www.facebook.com/OmanNCSI?ref=hl',
    X: 'https://x.com/NCSIOman?ref_src=twsrc%5Egoogle%7Ctwcamp%5Eserp%7Ctwgr%5Eauthor',
    Youtube: 'https://www.youtube.com/user/NCSIOman',
    Instagram: 'https://www.instagram.com/NCSIOman/',
    Whatsapp:
      'https://api.whatsapp.com/send?phone=96891459145&text=I%20Would%20like%20to%20get%20more%20informations',
  };

  const handleLogout = () => {
    signOut();
    navigate('/', { replace: true });
  };

  return (
    <div className="w-full bg-gray-100 border-b border-gray-200">
      <div className="flex items-center justify-between px-4 md:px-6 lg:px-[100px] h-9 text-sm ht-44">
        {/* Social Icons */}
        <div className="flex items-center gap-4 text-[#182F5B] text-lg">
          <a href={PlatformType.Facebook}>
            <FaFacebookF />
          </a>
          <a href={PlatformType.X}>
            <FaXTwitter />
          </a>
          <a href={PlatformType.Youtube}>
            <FaYoutube />
          </a>
          <a href={PlatformType.Instagram}>
            <FaInstagram />
          </a>
          <a
            href={PlatformType.Whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            title="Whatsapp"
          >
            <FontAwesomeIcon icon={faWhatsapp} />
          </a>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-6 text-[#182f5b]">
          <button className="flex items-center gap-1 hover:opacity-80">
            <FaGlobe />
            <span>عربي</span>
          </button>

          {isAuthenticated ? (
            <span className="hidden text-sm text-black/90 sm:block">
            <Dropdown>
                <Dropdown.Toggle
                  variant="link"
                  className="text-decoration-none text-[#243A5E] fw-medium"
                  >
                  {displayName}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={handleLogout}>
                    <div className="flex items-center">
                      <FaSignOutAlt className="me-2" />
                      <span>Logout</span>
                    </div>
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
             </span>
          ) : (
            <>
              <Link
                to="/register"
                className="flex items-center gap-1 text-sm hover:opacity-80"
              >
                <FaUser />
                Register
              </Link>
              <Link
                to="/login"
                className="flex items-center gap-1 rounded-md bg-[#243A5E] px-4 py-1.5 text-sm text-white hover:bg-[#1B2E4A]"
              >
                <FaArrowRightToBracket />
                Login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
