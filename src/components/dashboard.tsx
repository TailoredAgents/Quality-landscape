"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  LayoutDashboard,
  ChartNoAxesCombined,
  Inbox,
  ArrowUpRight,
  ArrowDownToLine,
  LogOut,
  ChevronRight,
  Globe,
  Users,
  MousePointer2,
  Mail,
  TrendingUp,
  CalendarDays,
  RefreshCw,
  X,
  Search,
  Monitor,
  Smartphone,
  Tablet,
  ShieldCheck,
  Leaf,
} from "lucide-react";
import { Brand } from "./brand";
import {
  inquiryCsv,
  type DashboardData,
  type Inquiry,
  type Breakdown,
} from "@/lib/dashboard-data";
const format = new Intl.NumberFormat("en-US");
const date = (s: string) =>
  new Date(s).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "America/New_York",
  });
type Tab = "overview" | "traffic" | "inquiries";
export function Dashboard({
  preview,
  sampleAllowed,
}: {
  preview: boolean;
  sampleAllowed: boolean;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [days, setDays] = useState(30);
  const [sample, setSample] = useState(preview || sampleAllowed);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [selected, setSelected] = useState<Inquiry | null>(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [statusValue, setStatusValue] = useState<Inquiry["status"]>("new");
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const controller = new AbortController();
    Promise.resolve().then(() => {
      if (!controller.signal.aborted) {
        setLoading(true);
        setError("");
        setData(null);
      }
    });
    fetch(
      `/api/admin/dashboard?mode=${sample ? "sample" : "real"}&days=${days}`,
      { cache: "no-store", signal: controller.signal },
    )
      .then(async (r) => {
        if (r.status === 401) {
          router.replace("/admin/login");
          router.refresh();
          return;
        }
        const result = await r.json();
        if (!r.ok) throw new Error(result.error);
        setData(result);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [days, sample, refresh, router]);
  useEffect(() => {
    if (selected) {
      dialog.current?.showModal();
    } else dialog.current?.close();
  }, [selected]);
  function openInquiry(inquiry: Inquiry) {
    setSelected(inquiry);
    setStatusValue(inquiry.status);
    setNotice("");
  }
  async function logout() {
    const r = await fetch("/api/auth/logout", { method: "POST" });
    if (r.ok) {
      router.replace("/admin/login");
      router.refresh();
    } else setError("Sign-out failed. Please try again.");
  }
  function downloadSample() {
    if (!data) return;
    const url = URL.createObjectURL(
      new Blob([inquiryCsv(data.inquiries)], {
        type: "text/csv;charset=utf-8",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "SAMPLE-quality-inquiries.csv";
    a.click();
    URL.revokeObjectURL(url);
  }
  async function updateStatus() {
    if (!selected || !data) return;
    setSaving(true);
    setNotice("");
    try {
      if (!sample) {
        const r = await fetch(`/api/admin/inquiries/${selected.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: statusValue }),
        });
        const body = await r.json();
        if (!r.ok) throw new Error(body.error);
      }
      setData({
        ...data,
        inquiries: data.inquiries.map((i) =>
          i.id === selected.id ? { ...i, status: statusValue } : i,
        ),
      });
      setNotice(
        sample
          ? "Sample status changed for this preview only."
          : "Inquiry status saved.",
      );
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Unable to save.");
    } finally {
      setSaving(false);
    }
  }
  const filtered =
    data?.inquiries.filter(
      (i) =>
        (status === "all" || i.status === status) &&
        `${i.name} ${i.email} ${i.service}`
          .toLowerCase()
          .includes(search.toLowerCase()),
    ) || [];
  const empty =
    !!data && data.metrics.pageviews === 0 && data.metrics.quotes === 0;
  return (
    <div className="dashboard">
      <aside className="admin-sidebar">
        <Brand />
        <div className="workspace-label">BUSINESS WORKSPACE</div>
        <nav aria-label="Dashboard navigation">
          {[
            [LayoutDashboard, "overview", "Overview"],
            [ChartNoAxesCombined, "traffic", "Website traffic"],
            [Inbox, "inquiries", "Inquiries"],
          ].map(([Icon, value, label]) => {
            const I = Icon as typeof Inbox;
            return (
              <button
                key={value as string}
                className={tab === value ? "selected" : ""}
                aria-pressed={tab === value}
                onClick={() => setTab(value as Tab)}
              >
                <I size={19} />
                {label as string}
                {value === "inquiries" &&
                  !!data?.inquiries.filter((i) => i.status === "new")
                    .length && (
                    <span>
                      {data.inquiries.filter((i) => i.status === "new").length}
                    </span>
                  )}
              </button>
            );
          })}
        </nav>
        <div className="sidebar-site">
          <span className="site-status-dot" />
          <div>
            <strong>
              {preview ? "Presentation preview" : "Business website"}
            </strong>
            <p>{preview ? "Safe to explore" : "First-party analytics"}</p>
          </div>
        </div>
        <div className="sidebar-bottom">
          <Link href="/" target="_blank">
            View website
            <ArrowUpRight size={16} />
          </Link>
          <button onClick={logout}>
            <LogOut size={16} />
            Sign out
          </button>
          <div className="admin-avatar">
            <span>Q</span>
            <div>
              <strong>Quality Landscape & More</strong>
              <small>Administrator</small>
            </div>
          </div>
        </div>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <span>
            Workspace <ChevronRight size={13} />
            <strong>
              {tab === "overview"
                ? "Overview"
                : tab === "traffic"
                  ? "Website traffic"
                  : "Inquiries"}
            </strong>
          </span>
          <div>
            <ShieldCheck size={15} />
            <span>Private & secure</span>
            <span className="top-avatar">Q</span>
          </div>
        </header>
        <main className="admin-content">
          <div className="dashboard-heading">
            <div>
              <p className="admin-eyebrow">QUALITY LANDSCAPE & MORE</p>
              <h1>
                {tab === "overview"
                  ? "Your business, at a glance."
                  : tab === "traffic"
                    ? "A clearer view of your visitors."
                    : "Every conversation starts here."}
              </h1>
              <p>
                {tab === "overview"
                  ? "A little insight into the attention your website is receiving."
                  : tab === "traffic"
                    ? "Understand how people find and explore your website."
                    : "Review requests, keep track of next steps, and stay in touch."}
              </p>
            </div>
            <button
              className="admin-icon-button"
              aria-label="Refresh dashboard"
              onClick={() => setRefresh((n) => n + 1)}
            >
              <RefreshCw size={17} className={loading ? "spin" : ""} />
            </button>
          </div>
          <div className={`sample-banner ${sample ? "" : "real-banner"}`}>
            <div>
              <Leaf size={19} />
              <span>
                <strong>
                  {sample
                    ? "Sample Data — Illustrative Dashboard Preview"
                    : "Real Data — Website Analytics"}
                </strong>
                <small>
                  {sample
                    ? "Demonstration figures and fictional inquiries. No real business activity is represented."
                    : preview
                      ? "Preview traffic is not collected. This view shows only genuine stored records."
                      : "Traffic is collected only when visitors allow analytics. Inquiries include all saved submissions."}
                </small>
              </span>
            </div>
            {sampleAllowed && (
              <button
                onClick={() => {
                  setSample(!sample);
                  setSelected(null);
                }}
              >
                {sample ? "View real data" : "Explore sample data"}
                <ArrowUpRight size={15} />
              </button>
            )}
          </div>
          <div className="dashboard-controls">
            <div className="range-control" aria-label="Date range">
              {[7, 30, 90].map((d) => (
                <button
                  key={d}
                  aria-pressed={days === d}
                  onClick={() => setDays(d)}
                >
                  Last {d} days
                </button>
              ))}
            </div>
            <span className="date-range">
              <CalendarDays size={14} />
              {data
                ? `${date(data.daily[0]?.date + "T12:00:00Z")} – ${date(data.daily.at(-1)?.date + "T12:00:00Z")}`
                : "Loading range"}
            </span>
          </div>
          {error ? (
            <div className="dashboard-empty" role="alert">
              <h2>A connection needs attention.</h2>
              <p>{error}</p>
              <button
                className="button"
                onClick={() => setRefresh((n) => n + 1)}
              >
                Try again
              </button>
            </div>
          ) : loading || !data ? (
            <div className="dashboard-skeleton" aria-label="Loading dashboard">
              <div />
              <div />
              <div />
              <div />
            </div>
          ) : (
            <>
              {tab !== "inquiries" && (
                <>
                  <div className="kpi-grid">
                    {[
                      [
                        Globe,
                        "Total pageviews",
                        format.format(data.metrics.pageviews),
                        "Pages viewed",
                      ],
                      [
                        Users,
                        "Estimated visitors",
                        format.format(data.metrics.visitors),
                        "Anonymous visitor estimates",
                      ],
                      [
                        MousePointer2,
                        "Website visits",
                        format.format(data.metrics.sessions),
                        "Browser sessions",
                      ],
                      [
                        Mail,
                        "Quote requests",
                        format.format(data.metrics.quotes),
                        "Saved inquiries",
                      ],
                      [
                        TrendingUp,
                        "Inquiry conversion",
                        data.metrics.visitors
                          ? `${data.metrics.conversion.toFixed(1)}%`
                          : "—",
                        "Inquiries / estimated visitors",
                      ],
                    ].map(([Icon, label, value, note]) => {
                      const I = Icon as typeof Globe;
                      return (
                        <article className="kpi-card" key={label as string}>
                          <div>
                            <span>{label as string}</span>
                            <I size={16} />
                          </div>
                          <strong>{value as string}</strong>
                          <small>{note as string}</small>
                        </article>
                      );
                    })}
                  </div>
                  {empty && (
                    <div className="real-empty">
                      <span>
                        <Globe size={22} />
                      </span>
                      <div>
                        <h2>A fresh start, ready to grow.</h2>
                        <p>
                          Your real traffic and inquiries will appear here after
                          launch.{" "}
                          {sampleAllowed
                            ? "Explore sample data to see how the dashboard works."
                            : ""}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="chart-row">
                    <section className="dashboard-panel traffic-chart">
                      <div className="panel-heading">
                        <div>
                          <h2>Website activity</h2>
                          <p>A daily view of visits to your site.</p>
                        </div>
                        <div className="chart-legend">
                          <span />
                          Pageviews
                          <span />
                          Visitors
                        </div>
                      </div>
                      <div className="main-chart">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={data.daily}
                            margin={{
                              top: 15,
                              right: 10,
                              left: -25,
                              bottom: 0,
                            }}
                          >
                            <defs>
                              <linearGradient
                                id="pageviewFill"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                              >
                                <stop
                                  offset="0%"
                                  stopColor="#789a61"
                                  stopOpacity={0.25}
                                />
                                <stop
                                  offset="100%"
                                  stopColor="#789a61"
                                  stopOpacity={0}
                                />
                              </linearGradient>
                            </defs>
                            <CartesianGrid
                              strokeDasharray="3 6"
                              vertical={false}
                              stroke="#e6eae0"
                            />
                            <XAxis
                              dataKey="date"
                              tickFormatter={(d) => date(d + "T12:00:00Z")}
                              minTickGap={45}
                              tickLine={false}
                              axisLine={false}
                              tick={{ fontSize: 10, fill: "#84907e" }}
                              dy={9}
                            />
                            <YAxis
                              tickLine={false}
                              axisLine={false}
                              allowDecimals={false}
                              tick={{ fontSize: 10, fill: "#84907e" }}
                            />
                            <Tooltip
                              labelFormatter={(d) =>
                                date(String(d) + "T12:00:00Z")
                              }
                              contentStyle={{
                                border: "1px solid #dce4d5",
                                borderRadius: 8,
                                fontSize: 12,
                              }}
                            />
                            <Area
                              type="monotone"
                              dataKey="pageviews"
                              name="Pageviews"
                              stroke="#426d47"
                              strokeWidth={2.5}
                              fill="url(#pageviewFill)"
                              isAnimationActive={false}
                            />
                            <Area
                              type="monotone"
                              dataKey="visitors"
                              name="Visitors"
                              stroke="#b5c5a2"
                              strokeWidth={2}
                              fill="transparent"
                              isAnimationActive={false}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="chart-foot">
                        <span>
                          Average engaged page time{" "}
                          <strong>{data.metrics.engagement}s</strong>
                        </span>
                        <span>
                          {sample
                            ? "Illustrative engagement"
                            : "Measured on page visibility changes"}
                        </span>
                      </div>
                    </section>
                    <section className="dashboard-panel source-panel">
                      <div className="panel-heading">
                        <div>
                          <h2>How visitors find you</h2>
                          <p>Referral share of pageviews</p>
                        </div>
                        <ArrowUpRight size={16} />
                      </div>
                      <BreakdownList values={data.sources} compact />
                      <div className="panel-note">
                        {sample
                          ? "Sample referral distribution."
                          : "Referral hostnames only. Direct includes unknown and internal referrals."}
                      </div>
                    </section>
                  </div>
                </>
              )}
              {tab === "overview" && (
                <>
                  <div className="dashboard-two-col">
                    <section className="dashboard-panel">
                      <div className="panel-heading">
                        <div>
                          <h2>Popular pages</h2>
                          <p>Where the attention is going</p>
                        </div>
                        <button
                          onClick={() => setTab("traffic")}
                          className="panel-action"
                        >
                          View traffic
                          <ArrowUpRight size={14} />
                        </button>
                      </div>
                      <PageTable values={data.pages} />
                    </section>
                    <section className="dashboard-panel">
                      <div className="panel-heading">
                        <div>
                          <h2>Quote requests over time</h2>
                          <p>Confirmed submissions, by day</p>
                        </div>
                        <Mail size={17} />
                      </div>
                      <div className="quote-chart">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={data.daily}
                            margin={{ left: -28, right: 5 }}
                          >
                            <CartesianGrid
                              vertical={false}
                              strokeDasharray="3 5"
                              stroke="#e8ece2"
                            />
                            <XAxis
                              dataKey="date"
                              tickFormatter={(d) => date(d + "T12:00:00Z")}
                              minTickGap={60}
                              axisLine={false}
                              tickLine={false}
                              tick={{ fontSize: 9, fill: "#84907e" }}
                            />
                            <YAxis
                              allowDecimals={false}
                              axisLine={false}
                              tickLine={false}
                              tick={{ fontSize: 9, fill: "#84907e" }}
                            />
                            <Tooltip
                              labelFormatter={(d) =>
                                date(String(d) + "T12:00:00Z")
                              }
                            />
                            <Bar
                              dataKey="quotes"
                              name="Quote requests"
                              fill="#91ab79"
                              radius={[3, 3, 0, 0]}
                              maxBarSize={22}
                              isAnimationActive={false}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </section>
                  </div>
                  <section className="dashboard-panel">
                    <div className="panel-heading">
                      <div>
                        <h2>Recent inquiries</h2>
                        <p>A good place to start your next conversation.</p>
                      </div>
                      <button
                        className="panel-action"
                        onClick={() => setTab("inquiries")}
                      >
                        View all
                        <ArrowUpRight size={14} />
                      </button>
                    </div>
                    <InquiryTable
                      inquiries={data.inquiries.slice(0, 5)}
                      onSelect={openInquiry}
                    />
                  </section>
                </>
              )}
              {tab === "traffic" && (
                <>
                  <div className="dashboard-two-col">
                    <section className="dashboard-panel">
                      <div className="panel-heading">
                        <div>
                          <h2>Most visited pages</h2>
                          <p>Total pageviews by public route</p>
                        </div>
                      </div>
                      <PageTable values={data.pages} />
                    </section>
                    <section className="dashboard-panel">
                      <div className="panel-heading">
                        <div>
                          <h2>Landing pages</h2>
                          <p>The first page in each recorded session</p>
                        </div>
                      </div>
                      <PageTable values={data.landingPages} />
                    </section>
                  </div>
                  <div className="dashboard-three-col">
                    <section className="dashboard-panel">
                      <div className="panel-heading">
                        <div>
                          <h2>Devices</h2>
                          <p>General screen categories</p>
                        </div>
                      </div>
                      <div className="device-list">
                        {data.devices.length ? (
                          data.devices.map((d) => {
                            const Icon =
                              d.name === "mobile"
                                ? Smartphone
                                : d.name === "tablet"
                                  ? Tablet
                                  : Monitor;
                            return (
                              <div key={d.name}>
                                <Icon size={20} />
                                <span>{d.name}</span>
                                <strong>{format.format(d.value)}</strong>
                              </div>
                            );
                          })
                        ) : (
                          <EmptySmall />
                        )}
                      </div>
                    </section>
                    <section className="dashboard-panel">
                      <div className="panel-heading">
                        <div>
                          <h2>Campaign traffic</h2>
                          <p>UTM source / medium / campaign</p>
                        </div>
                      </div>
                      <BreakdownList values={data.campaigns} />
                    </section>
                    <section className="dashboard-panel">
                      <div className="panel-heading">
                        <div>
                          <h2>Requested services</h2>
                          <p>From confirmed inquiries</p>
                        </div>
                      </div>
                      <BreakdownList values={data.services} />
                    </section>
                  </div>
                </>
              )}
              {tab === "inquiries" && (
                <>
                  <div className="inquiry-summary">
                    <div>
                      <strong>{data.metrics.quotes}</strong>
                      <span>total inquiries in this range</span>
                    </div>
                    <p>
                      {sample
                        ? "Fictional contacts for demonstration. Sample status changes reset when data reloads."
                        : "Select an inquiry to read the full details and update its status. The list displays the latest 500; export includes all inquiries in this range."}
                    </p>
                  </div>
                  <section className="dashboard-panel">
                    <div className="inquiry-filters">
                      <label className="search-input">
                        <Search size={16} />
                        <input
                          placeholder="Search name, email, or service"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          aria-label="Search inquiries"
                        />
                      </label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        aria-label="Filter inquiry status"
                      >
                        <option value="all">All statuses</option>
                        {["new", "contacted", "scheduled", "closed"].map(
                          (s) => (
                            <option key={s}>{s}</option>
                          ),
                        )}
                      </select>
                      {sample ? (
                        <button
                          className="button button-light"
                          onClick={downloadSample}
                        >
                          <ArrowDownToLine size={16} />
                          Export sample CSV
                        </button>
                      ) : (
                        <a
                          className="button button-light"
                          href={`/api/admin/export?days=${days}`}
                        >
                          <ArrowDownToLine size={16} />
                          Export CSV
                        </a>
                      )}
                    </div>
                    <InquiryTable inquiries={filtered} onSelect={openInquiry} />
                  </section>
                  <div className="dashboard-two-col">
                    <section className="dashboard-panel">
                      <div className="panel-heading">
                        <div>
                          <h2>Requested services</h2>
                          <p>The care your visitors ask about</p>
                        </div>
                      </div>
                      <BreakdownList values={data.services} />
                    </section>
                    <section className="dashboard-panel insight-card">
                      <Mail size={24} />
                      <h2>From inquiry to conversation.</h2>
                      <p>
                        Open a request, use the contact details to get in touch,
                        and update the status as you go. Simple tools for a
                        personal business.
                      </p>
                    </section>
                  </div>
                </>
              )}
              <p className="dashboard-methodology">
                {sample
                  ? "All displayed activity is illustrative. Sample data stays separate from the production database."
                  : "Visitor and session counts are estimates of consenting browsers, not people. Conversion uses all inquiries / consenting visitor estimates and may exceed 100%. Traffic uses the configured retention window."}{" "}
                · Dates shown in Eastern Time.
              </p>
            </>
          )}
        </main>
        <footer className="admin-footer">
          <span>Quality Landscape & More · Business insights</span>
          <span>Thoughtfully built by Tailored Agents</span>
        </footer>
      </div>
      <dialog
        aria-label="Inquiry details"
        ref={dialog}
        className="inquiry-dialog"
        onCancel={() => setSelected(null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setSelected(null);
        }}
      >
        {selected && (
          <>
            <button
              className="dialog-close"
              onClick={() => setSelected(null)}
              aria-label="Close inquiry"
            >
              <X size={21} />
            </button>
            <span className="admin-eyebrow">
              {sample ? "SAMPLE INQUIRY" : "PROPERTY-CARE INQUIRY"}
            </span>
            <h2>{selected.name}</h2>
            <p className="inquiry-date">
              Received {date(selected.created_at)} · {selected.service}
            </p>
            <dl>
              <div>
                <dt>Phone</dt>
                <dd>
                  <a href={`tel:${selected.phone.replace(/[^+\d]/g, "")}`}>
                    {selected.phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>
                  <a href={`mailto:${selected.email}`}>{selected.email}</a>
                </dd>
              </div>
              <div>
                <dt>Property</dt>
                <dd>{selected.location}</dd>
              </div>
              <div>
                <dt>Details</dt>
                <dd>{selected.message}</dd>
              </div>
              <div>
                <dt>Email notification</dt>
                <dd>{selected.notification_status.replaceAll("_", " ")}</dd>
              </div>
            </dl>
            <label className="field">
              <span>Inquiry status</span>
              <select
                aria-label="Inquiry status"
                value={statusValue}
                onChange={(e) =>
                  setStatusValue(e.target.value as Inquiry["status"])
                }
              >
                {["new", "contacted", "scheduled", "closed"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <button className="button" onClick={updateStatus} disabled={saving}>
              {saving
                ? "Saving…"
                : sample
                  ? "Update sample status"
                  : "Save status"}
              <ArrowUpRight size={17} />
            </button>
            {notice && (
              <p role="status" className="status-notice">
                {notice}
              </p>
            )}
          </>
        )}
      </dialog>
    </div>
  );
}
function EmptySmall() {
  return <p className="empty-small">No activity in this date range yet.</p>;
}
function BreakdownList({
  values,
  compact = false,
}: {
  values: Breakdown[];
  compact?: boolean;
}) {
  const total = values.reduce((n, v) => n + v.value, 0);
  return (
    <div className={`breakdown-list ${compact ? "compact" : ""}`}>
      {!values.length ? (
        <EmptySmall />
      ) : (
        values.map((v, i) => (
          <div key={v.name}>
            <div>
              <span>
                <i
                  style={{
                    background: ["#3e6648", "#92ad7a", "#c3cfaf", "#c19d67"][
                      i % 4
                    ],
                  }}
                />
                {v.name || "Unspecified"}
              </span>
              <strong>
                {format.format(v.value)}{" "}
                <small>
                  {total ? Math.round((v.value / total) * 100) : 0}%
                </small>
              </strong>
            </div>
            <div className="breakdown-track">
              <span
                style={{
                  width: `${total ? (v.value / total) * 100 : 0}%`,
                  background: ["#3e6648", "#92ad7a", "#c3cfaf", "#c19d67"][
                    i % 4
                  ],
                }}
              />
            </div>
          </div>
        ))
      )}
    </div>
  );
}
function PageTable({ values }: { values: Breakdown[] }) {
  return !values.length ? (
    <EmptySmall />
  ) : (
    <div className="page-table">
      {values.map((v, i) => (
        <div key={v.name}>
          <span>0{i + 1}</span>
          <strong>
            {v.name === "/" ? "Home" : v.name.slice(1).replace("-", " ")}
          </strong>
          <small>{v.name}</small>
          <b>{format.format(v.value)}</b>
        </div>
      ))}
    </div>
  );
}
function InquiryTable({
  inquiries,
  onSelect,
}: {
  inquiries: Inquiry[];
  onSelect: (i: Inquiry) => void;
}) {
  return !inquiries.length ? (
    <div className="inquiries-empty">
      <Inbox size={30} />
      <h3>No inquiries to show yet.</h3>
      <p>New requests will appear here. Try another date range or search.</p>
    </div>
  ) : (
    <div
      className="table-scroll"
      role="region"
      aria-label="Inquiries table, scroll horizontally for more details"
      tabIndex={0}
    >
      <p className="table-hint">Swipe to see status and more details →</p>
      <table className="inquiry-table">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Requested service</th>
            <th>Received</th>
            <th>Status</th>
            <th>
              <span className="sr-only">Open details</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {inquiries.map((i) => (
            <tr key={i.id}>
              <td>
                <button onClick={() => onSelect(i)}>
                  <span className="lead-avatar">
                    {i.name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")}
                  </span>
                  <span>
                    <strong>{i.name}</strong>
                    <small>{i.email}</small>
                  </span>
                </button>
              </td>
              <td>{i.service}</td>
              <td>{date(i.created_at)}</td>
              <td>
                <span className={`status-badge status-${i.status}`}>
                  <i />
                  {i.status}
                </span>
              </td>
              <td>
                <button
                  className="row-open"
                  onClick={() => onSelect(i)}
                  aria-label={`View inquiry from ${i.name}`}
                >
                  <ArrowUpRight size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
