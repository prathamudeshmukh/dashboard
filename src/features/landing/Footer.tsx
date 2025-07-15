import Link from 'next/link';
import { SUPPORT_EMAIL } from 'templify.constants';

import { LogoFooter } from '../../components/landing/Logo';

export const Footer = () => {
  return (
    <footer className="bg-primary text-white">
      <div className="container mx-auto px-4 py-12 md:px-0">
        {/* Top Row */}
        <div className="flex flex-wrap items-center justify-between">
          {/* Logo */}

          <LogoFooter />

          {/* Center Navigation */}
          <div className="md:ml-30 flex flex-col items-center space-x-0 text-xl font-normal md:flex-row md:items-center md:space-x-8">
            <Link href="#about" className="hover:text-white/80">About</Link>
            <Link href="#how-it-works" className="hover:text-white/80">How it works</Link>
            <Link href="#features" className="hover:text-white/80">Features</Link>
            <Link href="#pricing" className="hover:text-white/80">Pricing</Link>
            <Link href="/docs" className="hover:text-white/80">Docs</Link>
          </div>

          {/* Copyright */}
          <div className="text-xl font-normal">
            © 2025 Templify. All rights reserved
          </div>
        </div>

      </div>
      {/* Bottom Links */}
      <div className="bg-white py-4">
        <div className="flex flex-wrap items-center justify-center gap-2 text-xl font-normal text-primary">
          <Link href="#" className="hover:underline">Privacy Policy</Link>
          <span className="text-black">|</span>
          <Link href="#" className="hover:underline">Terms of service</Link>
          <span className="text-black">|</span>
          <Link href={`mailto:${SUPPORT_EMAIL}`} className="hover:underline">Contact us</Link>
        </div>
      </div>
    </footer>
  );
};
