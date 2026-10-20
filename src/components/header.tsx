"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Menu, X, Phone } from "lucide-react";
import { Brand } from "./brand";
import { business } from "@/lib/business";
const links = [
  ["/", "Home"],
  ["/services", "Services"],
  ["/our-work", "Our Work"],
  ["/about", "About Us"],
  ["/contact", "Contact"],
];
export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const header = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    const outside = (e: PointerEvent) => {
      if (e.target instanceof Node && !header.current?.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("keydown", close);
    document.addEventListener("pointerdown", outside);
    return () => {
      document.removeEventListener("keydown", close);
      document.removeEventListener("pointerdown", outside);
    };
  }, [open]);
  return (
    <>
      <header ref={header} className="site-header">
        <div className="header-inner">
          <Brand onClick={() => setOpen(false)} />
          <nav className="desktop-nav" aria-label="Main navigation">
            {links.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className={pathname === href ? "active" : ""}
                aria-current={pathname === href ? "page" : undefined}
              >
                {label}
              </Link>
            ))}
          </nav>
          <Link className="button header-cta" href="/contact">
            Request an Estimate <ArrowUpRight size={17} />
          </Link>
          <a
            className="mobile-call"
            href={business.phoneHref}
            aria-label={`Call Quality Landscape & More at ${business.phone}`}
          >
            <Phone size={19} />
          </a>
          <button
            ref={toggle}
            className="menu-toggle"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
        {open && (
          <nav
            id="mobile-menu"
            className="mobile-menu"
            aria-label="Mobile navigation"
          >
            {links.map(([href, label], i) => (
              <Link href={href} onClick={() => setOpen(false)} key={href}>
                <span>0{i + 1}</span>
                {label}
                <ArrowUpRight size={20} />
              </Link>
            ))}
            <Link
              className="button"
              href="/contact"
              onClick={() => setOpen(false)}
            >
              Request an Estimate <ArrowUpRight size={18} />
            </Link>
            <a href={business.phoneHref}>
              <Phone size={16} />
              {business.phone}
            </a>
          </nav>
        )}
      </header>
    </>
  );
}
