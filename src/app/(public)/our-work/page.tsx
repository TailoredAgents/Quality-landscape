import { PageHero, SectionLabel, ClosingCTA } from "@/components/public-shell";
import { Gallery } from "@/components/gallery";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata(
  "Our Work & Landscape Inspiration",
  "Explore landscape inspiration: well-maintained lawns, carefully trimmed greenery, and the details that bring outdoor spaces together.",
  "/our-work",
);
export default function OurWork() {
  return (
    <>
      <PageHero
        label="THE GALLERY"
        title={
          <>
            The beauty is
            <br />
            in the <em>details.</em>
          </>
        }
        description="Fresh green lawns. Thoughtful finishing touches. Outdoor spaces that feel cared for."
        image="/images/garden.jpg"
        alt="Garden with shaped greenery and a large lawn"
      />
      <section className="section container">
        <div className="section-heading gallery-intro">
          <div>
            <SectionLabel>A VISION OF QUALITY</SectionLabel>
            <h2>
              Room for a little
              <br />
              <em>outdoor inspiration.</em>
            </h2>
          </div>
          <p>
            Explore ideas for a well-kept outdoor space, from welcoming lawns to
            carefully finished edges and greenery. Find inspiration for your
            property’s next chapter.
          </p>
        </div>
        <Gallery />
        <div className="work-note">
          <span>CARE IN EVERY DETAIL</span>
          <p>
            A fresh cut. A thoughtful finish. A place you love coming home to.
          </p>
        </div>
      </section>
      <ClosingCTA />
    </>
  );
}
