import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, ArrowRight, Phone, MapPin } from "lucide-react";
import { Brand } from "./brand";
import { business, services } from "@/lib/business";
export function TextLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className="text-link">
      {children}
      <ArrowUpRight size={18} />
    </Link>
  );
}
export function Photo({
  src,
  alt,
  className = "",
  priority = false,
  sizes = "(max-width: 768px) 100vw, 50vw",
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  return (
    <div className={`photo ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        quality={60}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
      />
    </div>
  );
}
export function SectionLabel({
  children,
  light = false,
}: {
  children: React.ReactNode;
  light?: boolean;
}) {
  return (
    <p className={`eyebrow ${light ? "eyebrow-light" : ""}`}>
      <span />
      {children}
    </p>
  );
}
export function ClosingCTA() {
  return (
    <section className="closing-cta">
      <Image
        src="/images/property.jpg"
        alt="Green lawn framed by mature trees"
        fill
        sizes="100vw"
        quality={60}
      />
      <div className="closing-shade" />
      <div className="container closing-content">
        <SectionLabel light>GOOD CARE STARTS WITH A CONVERSATION</SectionLabel>
        <h2>
          Ready to love the way
          <br />
          your property looks?
        </h2>
        <div className="button-row">
          <Link className="button button-sage" href="/contact">
            Request an Estimate <ArrowUpRight size={19} />
          </Link>
          <a className="call-link" href={business.phoneHref}>
            <Phone size={17} />
            {business.phone}
          </a>
        </div>
      </div>
    </section>
  );
}
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <Brand light />
            <p>
              Thoughtful care.
              <br />
              Beautiful outdoor spaces.
            </p>
            <span className="location">
              <MapPin size={15} /> {business.location}
            </span>
          </div>
          <div>
            <h3>Explore</h3>
            <Link href="/">Home</Link>
            <Link href="/services">Our Services</Link>
            <Link href="/our-work">Our Work</Link>
            <Link href="/about">About Us</Link>
            <Link href="/contact">Get in Touch</Link>
          </div>
          <div>
            <h3>Property care</h3>
            {services.map((s) => (
              <Link key={s.id} href={`/services#${s.id}`}>
                {s.title}
              </Link>
            ))}
          </div>
          <div className="footer-contact">
            <h3>Let’s talk about your property.</h3>
            <a href={business.phoneHref} className="footer-phone">
              {business.phone}
            </a>
            <Link href="/contact" className="text-link">
              Request an Estimate <ArrowRight size={18} />
            </Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} {business.name}
          </span>
          <div>
            <Link href="/privacy">Privacy & preferences</Link>
            <span>Website by Tailored Agents</span>
          </div>
        </div>
        <p className="footer-preview">
          Landscape inspiration photography courtesy of Pexels.
        </p>
      </div>
    </footer>
  );
}
export function PageHero({
  label,
  title,
  description,
  image,
  alt,
}: {
  label: string;
  title: React.ReactNode;
  description: string;
  image: string;
  alt: string;
}) {
  return (
    <section className="page-hero">
      <Image
        src={image}
        alt={alt}
        fill
        sizes="100vw"
        quality={60}
        preload
        fetchPriority="high"
      />
      <div className="page-hero-shade" />
      <div className="container">
        <SectionLabel light>{label}</SectionLabel>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </section>
  );
}
export function Process() {
  return (
    <section className="section process">
      <div className="container">
        <div className="section-heading">
          <div>
            <SectionLabel>A SIMPLE PLACE TO START</SectionLabel>
            <h2>
              A better-looking property.
              <br />
              Three simple steps.
            </h2>
          </div>
          <p>
            Tell us what you have in mind.
            <br />
            We’ll take the conversation from there.
          </p>
        </div>
        <div className="process-grid">
          {[
            [
              "Request an estimate",
              "Share a few details about your property and the care you’re looking for.",
            ],
            [
              "Discuss your property",
              "Talk through your needs, the available services, and the scope of the work.",
            ],
            [
              "Get started",
              "Agree on the details and take the next step toward a well-kept outdoor space.",
            ],
          ].map(([title, text], i) => (
            <div key={title}>
              <span className="step-number">0{i + 1}</span>
              <h3>{title}</h3>
              <p>{text}</p>
              {i === 0 && <TextLink href="/contact">Let’s begin</TextLink>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
