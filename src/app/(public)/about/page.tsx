import {
  PageHero,
  SectionLabel,
  Photo,
  TextLink,
  ClosingCTA,
} from "@/components/public-shell";
import { Brand } from "@/components/brand";
import { business } from "@/lib/business";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata(
  "About Quality Landscape & More",
  "Get to know Quality Landscape & More LLC in Vidalia, Georgia. Thoughtful lawn care, attention to detail, and straightforward communication.",
  "/about",
);
export default function About() {
  return (
    <>
      <PageHero
        label="ABOUT QUALITY"
        title={
          <>
            Built on hard work.
            <br />
            Defined by <em>quality.</em>
          </>
        }
        description="A local name. A thoughtful approach. Pride in the details that make a property feel like home."
        image="/images/property.jpg"
        alt="Home with a green lawn framed by established trees"
      />
      <section className="section container about-intro">
        <SectionLabel>VIDALIA, GEORGIA</SectionLabel>
        <div className="intro-split">
          <h2>
            Good property care
            <br />
            starts with <em>pride.</em>
          </h2>
          <div>
            <p>
              Quality Landscape & More LLC is a landscaping and
              property-maintenance company in Vidalia, Georgia, with lawn care
              at the center of its service offering.
            </p>
            <p>
              A well-presented property is built through consistent care,
              careful finishing touches, and straightforward conversations.
            </p>
            <TextLink href="/services">Discover the services</TextLink>
          </div>
        </div>
      </section>
      <section className="about-philosophy">
        <Photo
          src="/images/trimming.jpg"
          alt="Close-up of careful hedge trimming"
        />
        <div>
          <SectionLabel light>THE WAY WE SEE IT</SectionLabel>
          <h2>
            It’s more than
            <br />
            how it looks.
            <br />
            It’s how it’s <em>cared for.</em>
          </h2>
          <p>
            There’s a difference between doing the work and taking pride in it.
            A neat lawn, a defined edge, a carefully trimmed hedge — each detail
            contributes to a place that feels welcoming.
          </p>
          <p>That’s the approach at Quality Landscape & More.</p>
        </div>
      </section>
      <section className="section container owner-section">
        <div className="owner-story">
          <SectionLabel>ROOTED IN VIDALIA</SectionLabel>
          <h2>
            A local business.
            <br />A personal <em>approach.</em>
          </h2>
          <p>
            {business.ownerStory ||
              "Every property has its own needs. Tell us what matters to you, from a tidy front lawn to the small details around your outdoor space. A straightforward conversation is the first step toward the right care."}
          </p>
          <TextLink href="/contact">Start a conversation</TextLink>
        </div>
        {business.ownerPhoto ? (
          <Photo
            src={business.ownerPhoto}
            alt="Owner of Quality Landscape & More"
          />
        ) : (
          <div className="owner-card">
            <Brand />
            <div />
            <p>
              Rooted in Vidalia.
              <br />
              Built around care.
            </p>
            <small>VIDALIA, GEORGIA</small>
          </div>
        )}
      </section>
      <ClosingCTA />
    </>
  );
}
