import { Suspense } from "react";
import { MapPin, Phone, ArrowDownRight } from "lucide-react";
import { SectionLabel, Photo } from "@/components/public-shell";
import { QuoteForm } from "@/components/quote-form";
import { business } from "@/lib/business";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata(
  "Contact & Request an Estimate",
  "Tell Quality Landscape & More about your lawn or property-care needs in Vidalia, Georgia. Request an estimate and start a conversation.",
  "/contact",
);
export default function Contact() {
  return (
    <>
      <section className="contact-heading container">
        <SectionLabel>LET’S TALK ABOUT YOUR PROPERTY</SectionLabel>
        <h1>
          Good care
          <br />
          starts <em>here.</em>
          <ArrowDownRight strokeWidth={1} />
        </h1>
        <p>
          Tell us a little about your outdoor space.
          <br />
          We’ll start with a conversation.
        </p>
      </section>
      <section className="contact-layout container">
        <aside>
          <Photo
            priority
            src="/images/garden.jpg"
            alt="Neatly maintained residential garden"
          />
          <div className="contact-details">
            <div>
              <MapPin size={20} />
              <div>
                <h2>Local care, in Vidalia.</h2>
                <p>{business.location}</p>
                <small>
                  Share your location to confirm service availability.
                </small>
              </div>
            </div>
            <div>
              <Phone size={20} />
              <div>
                <h2>Prefer a conversation?</h2>
                <a href={business.phoneHref}>{business.phone}</a>
              </div>
            </div>
          </div>
        </aside>
        <div className="quote-panel" id="estimate-form">
          <Suspense fallback={<p>Loading estimate form…</p>}>
            <QuoteForm />
          </Suspense>
        </div>
      </section>
      <section className="contact-next container">
        <span>WHAT HAPPENS NEXT?</span>
        <p>
          Discuss your property. Confirm the service details.
          <br />
          Agree on the next step together.
        </p>
      </section>
    </>
  );
}
