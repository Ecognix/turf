"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function Brand() {
  return <Link href="/" className="brand" aria-label="The Turf home"><span className="brand-mark"><i /><i /><i /></span><span>THE TURF<small>DIBRUGARH</small></span></Link>;
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    function onKeyDown(event) { if (event.key === "Escape") setOpen(false); }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
  return (
    <header className="site-header">
      <div className="header-inner">
        <Brand />
        <button className="menu-toggle" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={open ? "Close navigation" : "Open navigation"}><span /><span /></button>
        <nav className={open ? "nav open" : "nav"} aria-label="Main navigation">
          <Link onClick={() => setOpen(false)} aria-current={pathname === "/" ? "page" : undefined} href="/">Home</Link>
          <Link onClick={() => setOpen(false)} aria-current={pathname === "/venue" ? "page" : undefined} href="/venue">The venue</Link>
          <Link onClick={() => setOpen(false)} aria-current={pathname === "/games" ? "page" : undefined} href="/games">Games</Link>
          <Link onClick={() => setOpen(false)} aria-current={pathname === "/contact" ? "page" : undefined} href="/contact">Contact</Link>
          <div className="nav-actions">
            <Link onClick={() => setOpen(false)} aria-current={pathname === "/account" ? "page" : undefined} className="button button-outline nav-account" href="/account">Sign in / Sign up</Link>
            <Link onClick={() => setOpen(false)} className="button button-dark nav-book" href="/book">Book a slot <span>↗</span></Link>
          </div>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-top"><div><div className="eyebrow light">YOUR GAME STARTS HERE</div><h2>Good times.<br /><em>Great games.</em></h2></div><Link className="button button-lime" href="/book">Find your slot <span>↗</span></Link></div>
        <div className="footer-grid"><div><Brand /><p>A little more play, right here in Dibrugarh.</p></div><div><span className="footer-label">EXPLORE</span><Link href="/venue">The venue</Link><Link href="/games">Games</Link><Link href="/book">Book a slot</Link><Link href="/contact">Contact</Link></div><div><span className="footer-label">FIND US</span><p>Dibrugarh, Assam<br />Exact location coming soon</p><Link href="/contact">Get in touch ↗</Link></div><div><span className="footer-label">FOLLOW THE GAME</span><p>Instagram coming soon. Follow along for match-day moments and community updates.</p><p>Venue details and pricing are subject to confirmation.</p></div></div>
        <div className="footer-bottom"><span>© 2026 THE TURF DIBRUGARH</span><span>MADE FOR THE LOVE OF THE GAME ↗</span></div>
      </div>
    </footer>
  );
}
