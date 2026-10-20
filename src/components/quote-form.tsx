"use client";
import { cloneElement, useEffect, useId, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowUpRight, CheckCircle2, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { services } from "@/lib/business";
export function QuoteForm() {
  const params = useSearchParams();
  const initial = params.get("service") || "";
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [error, setError] = useState("");
  const [fields, setFields] = useState<Record<string, string[]>>({});
  const form = useRef<HTMLFormElement>(null);
  const success = useRef<HTMLDivElement>(null);
  const failure = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (state === "success") success.current?.focus();
    if (state === "error") {
      const invalid = form.current?.querySelector<HTMLElement>(
        '[aria-invalid="true"]',
      );
      (invalid || failure.current)?.focus();
    }
  }, [state, fields]);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("loading");
    setError("");
    setFields({});
    const data = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const r = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await r.json();
      if (!r.ok) {
        setFields(result.fields || {});
        throw new Error(
          result.error || "We couldn’t save your request. Please try again.",
        );
      }
      if (!result.stored)
        throw new Error(
          "Online requests are temporarily unavailable. Please call to discuss your property.",
        );
      setState("success");
    } catch (e) {
      setState("error");
      setError(e instanceof Error ? e.message : "Please try again.");
    }
  }
  if (state === "success")
    return (
      <div ref={success} className="form-success" role="status" tabIndex={-1}>
        <CheckCircle2 size={48} strokeWidth={1.3} />
        <SectionTitle title="Your request is received." />
        <p>
          Your inquiry has been saved for the business to review. Thank you for
          sharing the details of your property.
        </p>
        <button
          className="button"
          onClick={() => {
            setState("idle");
            form.current?.reset();
          }}
        >
          Send another request <ArrowUpRight size={18} />
        </button>
      </div>
    );
  const field = (name: string) => fields[name]?.[0];
  return (
    <>
      <p className="eyebrow">
        <span />
        REQUEST AN ESTIMATE
      </p>
      <h2>
        Let’s make a little
        <br />
        <em>room for quality.</em>
      </h2>
      <form ref={form} onSubmit={submit} className="quote-form">
        <div className="form-row">
          <Field label="Full name" error={field("name")}>
            <input
              name="name"
              autoComplete="name"
              required
              minLength={2}
              maxLength={100}
              placeholder="Your full name"
              aria-invalid={!!field("name")}
            />
          </Field>
          <Field label="Phone number" error={field("phone")}>
            <input
              name="phone"
              type="tel"
              autoComplete="tel"
              required
              minLength={7}
              maxLength={30}
              placeholder="(912) 555-0123"
              aria-invalid={!!field("phone")}
            />
          </Field>
        </div>
        <Field label="Email address" error={field("email")}>
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            placeholder="you@example.com"
            aria-invalid={!!field("email")}
          />
        </Field>
        <div className="form-row">
          <Field label="Service requested" error={field("service")}>
            <select
              name="service"
              required
              defaultValue={
                services.some((s) => s.title === initial) ? initial : ""
              }
              aria-invalid={!!field("service")}
            >
              <option value="" disabled>
                Select a service
              </option>
              {services.map((s) => (
                <option key={s.id}>{s.title}</option>
              ))}
              <option>Not sure — let’s discuss</option>
            </select>
          </Field>
          <Field label="Property location" error={field("location")}>
            <input
              name="location"
              autoComplete="street-address"
              required
              minLength={2}
              maxLength={200}
              placeholder="Street or area, town"
              aria-invalid={!!field("location")}
            />
          </Field>
        </div>
        <Field label="Tell us about your property" error={field("message")}>
          <textarea
            name="message"
            required
            minLength={10}
            maxLength={3000}
            rows={4}
            placeholder="What would you like a hand with? Share a few details about your lawn or property."
            aria-invalid={!!field("message")}
          />
        </Field>
        <div className="honeypot" aria-hidden="true">
          <label>
            Leave this blank
            <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
        <label className="check-label">
          <input type="checkbox" name="consent" value="yes" required />
          <span>
            I agree to share these details so the business can respond to my
            inquiry. <Link href="/privacy">Privacy details</Link>
          </span>
        </label>
        {error && (
          <p ref={failure} className="form-error" role="alert" tabIndex={-1}>
            {error}
          </p>
        )}
        <button className="button form-submit" disabled={state === "loading"}>
          {state === "loading" ? (
            <>
              <LoaderCircle className="spin" size={18} />
              Submitting…
            </>
          ) : (
            <>
              Request an Estimate <ArrowUpRight size={19} />
            </>
          )}
        </button>
        <p className="form-footnote">
          Your details are used to handle your inquiry. Submitting a request
          does not confirm a booking.
        </p>
      </form>
    </>
  );
}
function Field({
  label,
  children,
  error,
}: {
  label: string;
  children: React.ReactElement<{
    id?: string;
    "aria-describedby"?: string;
    "aria-labelledby"?: string;
  }>;
  error?: string;
}) {
  const id = useId();
  return (
    <label className="field" htmlFor={id}>
      <span id={`${id}-label`}>
        {label} <small>*</small>
      </span>
      {cloneElement(children, {
        id,
        "aria-labelledby": `${id}-label`,
        "aria-describedby": error ? `${id}-error` : undefined,
      })}
      {error && (
        <small id={`${id}-error`} className="field-error">
          {error}
        </small>
      )}
    </label>
  );
}
function SectionTitle({ title }: { title: string }) {
  return <h2>{title}</h2>;
}
