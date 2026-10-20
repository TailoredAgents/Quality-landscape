import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import {
  PageHero,
  SectionLabel,
  Photo,
  ClosingCTA,
  TextLink,
} from "@/components/public-shell";
import { services } from "@/lib/business";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata(
  "Lawn & Property Care Services",
  "Explore lawn maintenance, trimming, edging, irrigation-related services, and general property care in Vidalia, Georgia.",
  "/services",
);
export default function Services() {
  return (
    <>
      <PageHero
        label="OUR SERVICES"
        title={
          <>
            Thoughtful care.
            <br />
            <em>Beautifully maintained.</em>
          </>
        }
        description="From the first cut to the finishing touches, it’s the care that makes the difference."
        image="/images/lawn.jpg"
        alt="Residential lawn and planted garden borders"
      />
      <section className="section service-intro container">
        <SectionLabel>GOOD CARE. FROM THE GROUND UP.</SectionLabel>
        <div className="intro-split">
          <h2>
            Every property is different.
            <br />
            The attention should
            <br />
            be <em>personal.</em>
          </h2>
          <div>
            <p>
              Tell us what your property needs. Quality Landscape & More offers
              a starting point for a conversation about lawn upkeep, trimming,
              edging, and general outdoor care in Vidalia, Georgia.
            </p>
          </div>
        </div>
        <nav className="service-jump" aria-label="Jump to service">
          {services.map((s) => (
            <a href={`#${s.id}`} key={s.id}>
              {s.title}
              <ArrowUpRight size={16} />
            </a>
          ))}
        </nav>
      </section>
      <section className="service-details container">
        {services.map((s, i) => (
          <article
            className={`service-detail ${i % 2 ? "reverse" : ""}`}
            id={s.id}
            key={s.id}
          >
            <Photo src={s.image} alt={s.alt} />
            <div>
              <SectionLabel>0{i + 1} / PROPERTY CARE</SectionLabel>
              <h2>{s.title}</h2>
              <p>{s.description}</p>
              <ul>
                {s.details.map((d) => (
                  <li key={d}>
                    <Check size={17} />
                    {d}
                  </li>
                ))}
              </ul>
              <Link
                className="button"
                href={`/contact?service=${encodeURIComponent(s.title)}`}
              >
                Discuss this service <ArrowUpRight size={18} />
              </Link>
            </div>
          </article>
        ))}
      </section>
      <section className="section faq-section">
        <div className="container faq-grid">
          <div>
            <SectionLabel>A FEW HELPFUL DETAILS</SectionLabel>
            <h2>
              Before we
              <br />
              <em>get started.</em>
            </h2>
            <TextLink href="/contact">Have another question?</TextLink>
          </div>
          <div>
            {[
              [
                "Where is the business based?",
                "Quality Landscape & More LLC is based in Vidalia, Georgia. Share your property location when requesting an estimate so service availability can be confirmed directly.",
              ],
              [
                "How do I request an estimate?",
                "Use the estimate form to share your contact information, property location, and the care you have in mind. You can also call to discuss your property directly.",
              ],
              [
                "Can I discuss irrigation needs?",
                "Describe your existing irrigation system and any watering concerns so we can discuss the service scope suited to your property.",
              ],
              [
                "How are pricing and schedules arranged?",
                "Pricing, timing, and the scope of work are discussed directly based on your property and the care it needs.",
              ],
            ].map(([q, a]) => (
              <details key={q}>
                <summary>
                  {q}
                  <span>+</span>
                </summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <ClosingCTA />
    </>
  );
}
