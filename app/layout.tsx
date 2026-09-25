import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GiveAwayMyWealth.com | A 24-hour holiday from ownership",
  description: "A 24-hour holiday from the liabilities, upkeep and stewardship of ownership.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>
    <header className="site-header">
      <a href="/" className="brand" aria-label="GiveAwayMyWealth home"><span className="brand-mark">G</span><span className="brand-name">GiveAwayMy<span>Wealth</span></span></a>
      <nav className="header-links" aria-label="Main navigation"><a href="/experience">The experience</a><a href="/arrangement">The arrangement</a><a href="/children">Junior office</a><a href="/enroll" className="header-cta">Begin your day</a></nav>
    </header>
    {children}
    <footer className="site-footer"><div className="wrap">
      <div className="footer-grid"><div><a href="/" className="brand"><span className="brand-mark">G</span><span className="brand-name">GiveAwayMy<span>Wealth</span></span></a><p className="footer-note">The exceptional relief of having nothing to manage. Terms: no trust is formed, no asset or liability is transferred, no access is restricted, and no payment is taken.</p></div><div className="footer-links"><a href="/experience">Experience</a><a href="/arrangement">Arrangement</a><a href="/children">Junior office</a><a href="/enroll">Enroll</a></div></div>
      <div className="footer-bottom"><span>© 2026 GiveAwayMyWealth</span><span>A private day away from responsibility.</span></div>
    </div></footer>
  </body></html>;
}
