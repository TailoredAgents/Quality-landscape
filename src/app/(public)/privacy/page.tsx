import { SectionLabel } from "@/components/public-shell";
import { PrivacyPreferences } from "@/components/analytics-consent";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata(
  "Privacy & Preferences",
  "How this website handles inquiry details and optional first-party website analytics.",
  "/privacy",
);
export default function Privacy() {
  return (
    <article className="section container prose">
      <SectionLabel>YOUR INFORMATION</SectionLabel>
      <h1>
        Privacy &<br />
        <em>preferences.</em>
      </h1>
      <p className="lead">Simple care for your information, too.</p>
      <h2>Your information</h2>
      <p>
        This website uses the information you submit to let Quality Landscape &
        More review and respond to your property-care inquiry.
      </p>
      <h2>Estimate requests</h2>
      <p>
        The form stores your name, contact details, property location, requested
        service, and message in a private database. Access is limited to the
        administrator. Please avoid sharing sensitive personal information in
        the message. Inquiry records are retained for the configured period,
        initially 365 days, unless removed sooner by the administrator.
      </p>
      <h2>Optional website analytics</h2>
      <p>
        Optional analytics run only with your permission. They use random
        identifiers to estimate visitors and visits, with page paths, referral
        hostnames, campaign labels, device categories, and page engagement. Raw
        IP addresses, full referral URLs, and your inquiry contact details are
        not stored in traffic records. Browser Do Not Track and Global Privacy
        Control signals are respected. Analytics events are initially retained
        for 90 days.
      </p>
      <h2>Your choices</h2>
      <p>
        You can decline analytics and still use the entire website. Changing
        your preference removes the browser identifiers used for future
        analytics; it does not identify or remove previous anonymous events.
      </p>
      <PrivacyPreferences />
      <h2>Necessary security</h2>
      <p>
        The private admin area uses an expiring session cookie. Security rate
        limits use short-lived hashed connection identifiers. These protect
        forms and login and are separate from optional traffic analytics.
      </p>
      <h2>Questions or data requests</h2>
      <p>
        Use the contact form or call to ask the business about your submitted
        information and privacy preferences.
      </p>
    </article>
  );
}
