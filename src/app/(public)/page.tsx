import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpRight,
  ArrowDown,
  Leaf,
  Scissors,
  Handshake,
  Check,
} from "lucide-react";
import {
  SectionLabel,
  Photo,
  TextLink,
  ClosingCTA,
  Process,
} from "@/components/public-shell";
import { Gallery } from "@/components/gallery";
import { Reveal } from "@/components/reveal";
import { services, business } from "@/lib/business";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata(
  "Lawn Care & Property Maintenance in Vidalia, GA",
  "Professional lawn maintenance, precise trimming, and thoughtful property care in Vidalia, Georgia. Discuss your property and request an estimate.",
  "/",
);
export default function Home() {
  return (
    <>
      <section className="home-hero">
        <Image
          className="hero-image"
          src="/images/property.jpg"
          alt="Green lawn and landscaped residential property framed by trees"
          fill
          sizes="100vw"
          priority
        />
        <div className="hero-shade" />
        <div className="container hero-content">
          <div className="hero-copy">
            <SectionLabel light>
              VIDALIA, GEORGIA <span className="hero-eyebrow-dot">•</span> LAWN
              CARE & PROPERTY MAINTENANCE
            </SectionLabel>
            <h1>
              The Details
              <br />
              Make the <em>Difference.</em>
            </h1>
            <p>
              Professional lawn maintenance, precise trimming,
              <br className="desktop-break" /> and dependable property care in
              Vidalia, Georgia.
            </p>
            <div className="button-row">
              <Link className="button button-sage" href="/contact">
                Request an Estimate <ArrowUpRight size={19} />
              </Link>
              <Link className="button button-outline" href="/our-work">
                Explore Our Work <ArrowUpRight size={19} />
              </Link>
            </div>
          </div>
          <div className="hero-bottom">
            <a href="#quality-promise">
              <span className="scroll-icon">
                <ArrowDown size={17} />
              </span>{" "}
              A LITTLE CARE. A BIG DIFFERENCE.
            </a>
          </div>
        </div>
        <div className="hero-side-note">
          ROOTED IN CARE. FINISHED WITH QUALITY.
        </div>
      </section>
      <div className="trust-strip">
        <div className="container">
          {[
            [Leaf, "Thoughtful Lawn Care"],
            [Scissors, "Attention to Detail"],
            [Handshake, "Dependable Local Service"],
          ].map(([Icon, label]) => {
            const I = Icon as typeof Leaf;
            return (
              <div key={label as string}>
                <I size={21} strokeWidth={1.4} />
                <span>{label as string}</span>
              </div>
            );
          })}
        </div>
      </div>
      <section className="section promise" id="quality-promise">
        <div className="container promise-grid">
          <Reveal className="promise-image">
            <Photo
              src="/images/garden.jpg"
              alt="Garden with carefully shaped shrubs, beds, and lawn"
            />
            <span className="image-tag">IT’S THE LITTLE THINGS.</span>
            <div className="image-caption">
              <span>01 / THE QUALITY APPROACH</span>
              <span>Care, down to the last detail.</span>
            </div>
          </Reveal>
          <Reveal className="promise-copy">
            <SectionLabel>THE QUALITY PROMISE</SectionLabel>
            <h2>
              Your property deserves more than just a <em>quick cut.</em>
            </h2>
            <p>
              A crisp edge. A carefully trimmed hedge. A lawn that makes coming
              home feel a little better. The difference is in the details.
            </p>
            <p>
              At Quality Landscape & More, the focus is simple: thoughtful lawn
              maintenance and property care that help your outdoor space look
              its best.
            </p>
            <TextLink href="/about">Get to know Quality</TextLink>
            <div className="signature-line">
              <span>Good work speaks for itself.</span>
              <Leaf size={27} strokeWidth={1} />
            </div>
          </Reveal>
        </div>
      </section>
      <section className="section services-preview">
        <div className="container">
          <Reveal className="section-heading">
            <div>
              <SectionLabel>CARE FOR EVERY CORNER</SectionLabel>
              <h2>
                A little more pride.
                <br />A lot more <em>curb appeal.</em>
              </h2>
            </div>
            <div>
              <p>
                From a fresh cut to the finishing touches,
                <br />
                give your property the attention it deserves.
              </p>
              <TextLink href="/services">Explore our services</TextLink>
            </div>
          </Reveal>
          <div className="service-grid">
            {services.map((s, i) => (
              <Link
                className="service-card"
                href={`/services#${s.id}`}
                key={s.id}
              >
                <div className="service-card-image">
                  <Image
                    src={s.image}
                    alt={s.alt}
                    fill
                    sizes="(max-width: 600px) 90vw, (max-width: 1000px) 45vw, 23vw"
                  />
                  <span>0{i + 1}</span>
                </div>
                <div className="service-card-title">
                  <h3>{s.title}</h3>
                  <ArrowUpRight size={22} />
                </div>
                <p>{s.short}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="section featured-work">
        <div className="container">
          <div className="section-heading">
            <div>
              <SectionLabel>THE DIFFERENCE IS VISIBLE</SectionLabel>
              <h2>
                Quality you can <em>see.</em>
              </h2>
            </div>
            <TextLink href="/our-work">Explore the gallery</TextLink>
          </div>
          <Gallery featured />
          <div className="gallery-caption">
            <span>LANDSCAPE INSPIRATION</span>
            <p>
              Thoughtful lawn care, precise edges, and beautifully maintained
              outdoor spaces.
            </p>
          </div>
        </div>
      </section>
      <section className="section why-quality">
        <div className="container why-grid">
          <div>
            <SectionLabel light>MORE THAN MAINTENANCE</SectionLabel>
            <h2>
              Care you notice.
              <br />
              Quality you <em>feel.</em>
            </h2>
            <p>
              A well-kept property starts with an approach that values the work
              — and the people who call it home.
            </p>
            <TextLink href="/about">Our approach</TextLink>
          </div>
          <div className="value-list">
            {[
              [
                "An eye for the details",
                "Clean edges, neat greenery, and a thoughtful finish. Small touches that bring the whole property together.",
              ],
              [
                "Pride in the work",
                "Professional property maintenance with a focus on care, presentation, and a job thoughtfully done.",
              ],
              [
                "A straightforward conversation",
                "Clear communication about your property, your needs, and the next steps.",
              ],
            ].map(([t, d], i) => (
              <div key={t}>
                <span>0{i + 1}</span>
                <div>
                  <h3>{t}</h3>
                  <p>{d}</p>
                </div>
                <Check size={19} />
              </div>
            ))}
          </div>
        </div>
        {business.testimonials.length > 0 && (
          <div className="container review-slot">
            {business.testimonials.map((t) => (
              <blockquote key={t.name}>
                “{t.quote}”<cite>{t.name}</cite>
              </blockquote>
            ))}
          </div>
        )}
      </section>
      <Process />
      <ClosingCTA />
    </>
  );
}
