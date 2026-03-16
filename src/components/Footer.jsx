import { Link } from 'react-router-dom';
import { IconLocation, IconPhone, IconFax, IconClock, IconEmail } from './Icons';

export default function Footer() {
  return (
    <footer className="flex w-full shrink-0 flex-col gap-8 bg-portal-bg-section px-4 md:px-8 lg:px-[100px] pb-5 pt-[45px]">
      <div className="flex w-full max-w-[1240px] flex-wrap items-start justify-between gap-10">
        {/* Contact */}
        <div className="flex flex-col gap-4">
          <h4 className="font-display text-base font-bold tracking-[-0.5px] text-portal-navy-dark">Contact</h4>
          <p className="text-sm leading-relaxed text-[#808080] whitespace-pre">
            {`Ministry of Transport, Communications &\nInformation Technology`}
          </p>
          <div className="flex flex-col gap-1 text-sm text-portal-gray-muted">
            <div className="flex items-center gap-2">
              <IconLocation className="h-4 w-4 shrink-0 text-portal-gray" />
              P.O. Box 684, Muscat, Sultanate of Oman
            </div>
            <div className="flex items-center gap-2">
              <IconPhone className="h-4 w-4 shrink-0 text-portal-gray" />
              Toll-free: 800 777 77
            </div>
            <div className="flex items-center gap-2">
              <IconFax className="h-4 w-4 shrink-0 text-portal-gray" />
              Fax: +968 24 685 757
            </div>
            <div className="flex items-center gap-2">
              <IconClock className="h-4 w-4 shrink-0 text-portal-gray" />
              Working hours: 07:30 – 14:30 (Oman time)
            </div>
            <div className="flex items-center gap-2">
              <IconEmail className="h-4 w-4 shrink-0 text-portal-gray" />
              Email: info@ncsi.gov.om
            </div>
          </div>
        </div>

        {/* Parent Entity / NCSI */}
        <div className="flex flex-col gap-4">
          <div className="h-px w-full bg-portal-border" />
          <h4 className="font-display text-base font-bold tracking-[-0.5px] text-portal-navy-dark">Parent Entity</h4>
          <p className="text-sm text-[#808080]">National Centre for Statistics & Information (NCSI)</p>
          <div className="flex flex-col gap-1 text-sm text-portal-gray-muted">
            <div className="flex items-center gap-2">Address: Bousher, Hayy al Arafat Street, Muscat</div>
            <div className="flex items-center gap-2">Phone: +968 800 76274</div>
            <div className="flex items-center gap-2">Email: info@ncsi.gov.om</div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col gap-4">
          <h4 className="font-display text-base font-bold tracking-[-0.5px] text-portal-navy-dark">Quick Links</h4>
          <ul className="flex flex-col gap-1 text-sm text-portal-gray-muted">
            <li><Link to="/help" className="hover:text-portal-navy">About the Portal</Link></li>
            <li><Link to="/help" className="hover:text-portal-navy">Glossary</Link></li>
            <li><Link to="/help" className="hover:text-portal-navy">Feedback / Report an Issue</Link></li>
            <li><Link to="/datasets" className="hover:text-portal-navy">Datasets</Link></li>
          </ul>
        </div>

        {/* Policies & Legal */}
        <div className="flex flex-col gap-4">
          <h4 className="font-display text-base font-bold tracking-[-0.5px] text-portal-navy-dark">Policies & Legal</h4>
          <ul className="flex flex-col gap-1 text-sm text-portal-gray-muted">
            <li><a href="#" className="hover:text-portal-navy">Open Data Policy & License</a></li>
            <li><a href="#" className="hover:text-portal-navy">Terms of Use</a></li>
            <li><a href="#" className="hover:text-portal-navy">Accessibility Statement</a></li>
          </ul>
        </div>

        {/* Support */}
        <div className="flex flex-col gap-4">
          <h4 className="font-display text-base font-bold tracking-[-0.5px] text-portal-navy-dark">Support</h4>
          <ul className="flex flex-col gap-1 text-sm text-portal-gray-muted">
            <li><Link to="/help" className="hover:text-portal-navy">Help & Support Documents</Link></li>
            <li><Link to="/help" className="hover:text-portal-navy">Contact Us</Link></li>
            <li><Link to="/ai-assistant" className="hover:text-portal-navy">Chat with AI Assistant</Link></li>
          </ul>
        </div>
      </div>

      {/* Copyright bar */}
      <div className="relative flex w-full max-w-[1240px] items-center justify-between border-t border-portal-border py-4">
        <img
          src="https://placehold.co/158x52/182f5b/ffffff?text=NCSI"
          alt="NCSI"
          className="h-[52px] w-[158px] object-contain"
        />
        <div className="text-center text-sm">
          <p className="text-portal-gray-muted">© 2026 Sultanate of Oman</p>
          <p className="text-portal-gray-muted">
            Content licensed under the <span className="font-bold text-portal-navy-dark">Open Government License</span>
          </p>
        </div>
        <p className="text-sm text-portal-gray-muted">Developed by Oman Government</p>
      </div>
    </footer>
  );
}
