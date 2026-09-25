import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "GiveAwayMyWealth.com | A 24-hour holiday from trusteeship",
  description: "An imagined 24-hour change of trustee for an existing trust.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>
    <header className="site-header">
      <Link href="/" className="brand" aria-label="GiveAwayMyWealth home"><span className="brand-mark">G</span><span className="brand-name">GiveAwayMy<span>Wealth</span></span></Link>
      <nav className="header-links" aria-label="Main navigation"><Link href="/experience">The experience</Link><Link href="/arrangement">The arrangement</Link><Link href="/children">Junior office</Link><a href="/enroll" className="header-cta">Begin your day</a></nav>
    </header>
    {children}
    <footer className="site-footer"><div className="wrap">
      <div className="footer-grid"><div><Link href="/" className="brand"><span className="brand-mark">G</span><span className="brand-name">GiveAwayMy<span>Wealth</span></span></Link><p className="footer-note">An imagined day away from administering your existing trust. This experience appoints no trustee, changes no duties or liability, and takes no payment.</p></div><div className="footer-links"><Link href="/experience">Experience</Link><Link href="/arrangement">Arrangement</Link><Link href="/children">Junior office</Link><a href="/enroll">Enroll</a></div></div>
      <div className="footer-bottom"><span>© 2026 GiveAwayMyWealth</span><span>A private day away from responsibility.</span></div>
    </div></footer>
  </body></html>;
}
