"use client";
export default function Error({ reset }: { reset: () => void }) {
  return (
    <main className="not-found">
      <h1>A brief pause.</h1>
      <p>
        The private dashboard is temporarily unavailable. Check the database
        configuration or try again.
      </p>
      <button className="button" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
