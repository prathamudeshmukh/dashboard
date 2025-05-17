import Image from 'next/image';

export const Logo = () => (
  <div className="flex items-center gap-2 text-xl font-semibold">
    <div className="relative h-10 w-32">
      <Image
        src="/logo-full.png"
        alt="Templify Logo 1"
        height={40}
        width={120}
      />
    </div>
  </div>
);

export const LogoFooter = () => (
  <div className="flex items-center gap-2 text-xl font-semibold">
    <div className="relative h-10 w-32">
      <Image
        src="/Logo_footer_version.png"
        alt="Templify Logo 1"
        height={80}
        width={160}
      />
    </div>
  </div>
);
