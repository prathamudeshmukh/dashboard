import Link from 'next/link';

import { LogoFooter } from '../../components/landing/Logo';

export const Footer = () => {
  return (
    <footer className="bg-primary text-white">
      <div className="container mx-auto px-4 py-12">
        {/* Top Row */}
        <div className="flex flex-col items-center justify-between space-y-6 md:flex-row md:space-y-0">
          {/* Logo */}
          <div className="flex items-center">
            <LogoFooter />
          </div>

          {/* Center Navigation */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium">
            <Link href="#about" className="hover:text-white/80">About</Link>
            <Link href="#how-it-works" className="hover:text-white/80">How it works</Link>
            <Link href="#features" className="hover:text-white/80">Features</Link>
            <Link href="#pricing" className="hover:text-white/80">Pricing</Link>
            <Link href="#other" className="hover:text-white/80">Other</Link>
          </div>

          {/* Copyright */}
          <div className="text-center text-sm text-white md:text-right">
            © 2025 Templify. All rights reserved
          </div>
        </div>

      </div>
      {/* Bottom Links */}
      <div className="bg-white py-4">
        <div className="mr-12 flex flex-wrap items-center justify-center gap-2 text-sm font-medium text-primary">
          <Link href="#" className="hover:underline">Privacy Policy</Link>
          <span className="text-black">|</span>
          <Link href="#" className="hover:underline">Terms of service</Link>
          <span className="text-black">|</span>
          <Link href="#" className="hover:underline">Contact us</Link>
        </div>
      </div>
    </footer>
  );
};
