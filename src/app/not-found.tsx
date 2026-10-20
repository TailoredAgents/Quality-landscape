import Link from "next/link";
export default function NotFound() {
  return (
    <main className="not-found">
      <span className="eyebrow">404 / A DIFFERENT PATH</span>
      <h1>
        Let’s get you
        <br />
        back to <em>green.</em>
      </h1>
      <p>That page couldn’t be found.</p>
      <Link href="/" className="button">
        Return home →
      </Link>
    </main>
  );
}
