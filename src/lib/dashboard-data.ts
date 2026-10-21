export type Inquiry = {
  id: string;
  name: string;
  phone: string;
  email: string;
  service: string;
  location: string;
  message: string;
  status: "new" | "contacted" | "scheduled" | "closed";
  notification_status: string;
  created_at: string;
};
export type Breakdown = { name: string; value: number };
export type DashboardData = {
  sample: boolean;
  days: number;
  metrics: {
    pageviews: number;
    quotes: number;
  };
  daily: {
    date: string;
    pageviews: number;
    quotes: number;
  }[];
  pages: Breakdown[];
  sources: Breakdown[];
  devices: Breakdown[];
  campaigns: Breakdown[];
  services: Breakdown[];
  inquiries: Inquiry[];
};
export function csvEscape(value: unknown) {
  let text = String(value ?? "");
  if (/^[\s]*[=+@\-]/.test(text)) text = "'" + text;
  return '"' + text.replace(/"/g, '""') + '"';
}
export function inquiryCsv(inquiries: Inquiry[]) {
  return (
    "\uFEFF" +
    [
      [
        "Name",
        "Phone",
        "Email",
        "Service",
        "Location",
        "Message",
        "Status",
        "Submitted",
        "Email notification",
      ],
      ...inquiries.map((i) => [
        i.name,
        i.phone,
        i.email,
        i.service,
        i.location,
        i.message,
        i.status,
        i.created_at,
        i.notification_status,
      ]),
    ]
      .map((row) => row.map(csvEscape).join(","))
      .join("\r\n")
  );
}
export function sampleDashboard(days: number): DashboardData {
  const daily = Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - days + 1 + i);
    const activity = Math.round(
      25 + i * 0.16 + Math.sin(i * 1.8) * 7 + (i % 7 < 5 ? 10 : 0),
    );
    return {
      date: date.toLocaleDateString("en-CA", { timeZone: "America/New_York" }),
      pageviews: Math.round(activity * 2.45),
      quotes: i % 3 === 0 ? 2 : i % 5 === 0 ? 1 : 0,
    };
  });
  const pageviews = daily.reduce((n, d) => n + d.pageviews, 0);
  const quotes = daily.reduce((n, d) => n + d.quotes, 0);
  const distribute = (names: string[], weights: number[], total: number) =>
    names.map((name, i) => ({ name, value: Math.round(total * weights[i]) }));
  const inquiries: Inquiry[] = Array.from(
    { length: Math.min(quotes, 18) },
    (_, i) => ({
      id: `sample-${i + 1}`,
      name: [
        "Alex Sample",
        "Jordan Example",
        "Casey Demo",
        "Morgan Sample",
        "Taylor Example",
        "Riley Demo",
      ][i % 6],
      phone: "(912) 555-01" + String(i).padStart(2, "0"),
      email: `sample${i + 1}@example.com`,
      service: [
        "Lawn Maintenance",
        "Trimming & Edging",
        "General Property Care",
        "Irrigation Services",
      ][i % 4],
      location: "Example property · Vidalia",
      message: [
        "Demonstration inquiry: interested in discussing regular lawn upkeep and the edges around the front walk.",
        "Demonstration inquiry: would like to talk about trimming and general care for an outdoor space.",
        "Demonstration inquiry: looking for property maintenance. Please discuss the available services.",
      ][i % 3],
      status: (["new", "new", "contacted", "scheduled", "closed"] as const)[
        i % 5
      ],
      notification_status: "sample_only",
      created_at: new Date(Date.now() - i * 86400000 * 1.3).toISOString(),
    }),
  );
  return {
    sample: true,
    days,
    metrics: {
      pageviews,
      quotes,
    },
    daily,
    pages: distribute(
      ["/", "/services", "/our-work", "/contact", "/about"],
      [0.4, 0.24, 0.17, 0.12, 0.07],
      pageviews,
    ),
    sources: distribute(
      ["Google", "Direct", "Facebook", "Other referrals"],
      [0.46, 0.29, 0.18, 0.07],
      pageviews,
    ),
    devices: distribute(
      ["mobile", "desktop", "tablet"],
      [0.68, 0.26, 0.06],
      pageviews,
    ),
    campaigns: distribute(
      ["spring-property-care", "local-awareness"],
      [0.6, 0.4],
      Math.round(pageviews * 0.12),
    ),
    services: distribute(
      [
        "Lawn Maintenance",
        "Trimming & Edging",
        "General Property Care",
        "Irrigation Services",
      ],
      [0.5, 0.25, 0.17, 0.08],
      quotes,
    ),
    inquiries,
  };
}
