import { redirect } from "next/navigation";
import { isAuthenticated, authConfigured } from "@/lib/auth";
import { LoginForm } from "@/components/login-form";
import { Brand } from "@/components/brand";
import { Photo, SectionLabel } from "@/components/public-shell";
import Link from "next/link";
export const dynamic = "force-dynamic";
export default async function Login() {
  if (await isAuthenticated()) redirect("/admin");
  return (
    <main className="login-page">
      <section className="login-visual">
        <Photo
          src="/images/garden.jpg"
          alt="Illustrative well-kept garden"
          priority
        />
        <div className="login-visual-shade" />
        <Brand light />
        <div>
          <SectionLabel light>QUALITY, BEHIND THE SCENES</SectionLabel>
          <h1>
            A little insight.
            <br />A clearer <em>picture.</em>
          </h1>
          <p>
            Your website, your inquiries, and your next opportunity — in one
            thoughtful space.
          </p>
        </div>
        <span>QUALITY LANDSCAPE & MORE · PRIVATE BUSINESS PLATFORM</span>
      </section>
      <section className="login-content">
        <div>
          <Link href="/" className="login-back">
            ← Back to the website
          </Link>
          <p className="eyebrow">
            <span />
            OWNER ACCESS
          </p>
          <h2>
            Welcome
            <br />
            <em>back.</em>
          </h2>
          <p>Sign in to your private business dashboard.</p>
          <LoginForm configured={authConfigured()} />
          <div className="login-security">
            Private access · Secure session · No public sign-up
          </div>
        </div>
        <small>Quality Landscape & More LLC · Vidalia, Georgia</small>
      </section>
    </main>
  );
}
