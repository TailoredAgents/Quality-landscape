import { Header } from "@/components/header";
import { Footer } from "@/components/public-shell";
import { AnalyticsConsent } from "@/components/analytics-consent";
import { previewMode } from "@/lib/config";
import { business } from "@/lib/business";
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <AnalyticsConsent preview={previewMode} />
      {!previewMode && business.approvedForLaunch && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              name: business.name,
              address: {
                "@type": "PostalAddress",
                addressLocality: "Vidalia",
                addressRegion: "GA",
                addressCountry: "US",
              },
              ...(business.phoneVerified ? { telephone: business.phone } : {}),
            }).replace(/</g, "\\u003c"),
          }}
        />
      )}
    </>
  );
}
