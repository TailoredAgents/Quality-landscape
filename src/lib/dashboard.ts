import { query } from "./db";
import type { DashboardData, Inquiry, Breakdown } from "./dashboard-data";
export async function realDashboard(days: number): Promise<DashboardData> {
  const where = `created_at >= (((now() AT TIME ZONE 'America/New_York')::date - ($1::integer - 1)) AT TIME ZONE 'America/New_York')`;
  const [
    metricRows,
    quoteRows,
    daily,
    pageRows,
    sources,
    devices,
    campaigns,
    services,
    inquiries,
    quoteDaily,
  ] = await Promise.all([
    query<{
      pageviews: number;
    }>(
      `SELECT count(*)::int pageviews FROM analytics_events WHERE ${where} AND kind='pageview'`,
      [days],
    ),
    query<{ count: number }>(
      `SELECT count(*)::int count FROM inquiries WHERE ${where}`,
      [days],
    ),
    query<{ date: string; pageviews: number }>(
      `SELECT to_char(created_at AT TIME ZONE 'America/New_York','YYYY-MM-DD') date,count(*)::int pageviews FROM analytics_events WHERE ${where} AND kind='pageview' GROUP BY 1 ORDER BY 1`,
      [days],
    ),
    query<Breakdown>(
      `SELECT path name,count(*)::int value FROM analytics_events WHERE ${where} AND kind='pageview' GROUP BY path ORDER BY value DESC LIMIT 10`,
      [days],
    ),
    query<Breakdown>(
      `SELECT source name,count(*)::int value FROM analytics_events WHERE ${where} AND kind='pageview' GROUP BY source ORDER BY value DESC LIMIT 10`,
      [days],
    ),
    query<Breakdown>(
      `SELECT device name,count(*)::int value FROM analytics_events WHERE ${where} AND kind='pageview' GROUP BY device ORDER BY value DESC`,
      [days],
    ),
    query<Breakdown>(
      `SELECT concat(utm_source, CASE WHEN utm_medium<>'' THEN ' / '||utm_medium ELSE '' END, CASE WHEN utm_campaign<>'' THEN ' / '||utm_campaign ELSE '' END) name,count(*)::int value FROM analytics_events WHERE ${where} AND kind='pageview' AND (coalesce(utm_source,'')<>'' OR coalesce(utm_campaign,'')<>'') GROUP BY 1 ORDER BY value DESC LIMIT 10`,
      [days],
    ),
    query<Breakdown>(
      `SELECT service name,count(*)::int value FROM inquiries WHERE ${where} GROUP BY service ORDER BY value DESC`,
      [days],
    ),
    query<Inquiry>(
      `SELECT id,name,phone,email,service,location,message,status,notification_status,created_at FROM inquiries WHERE ${where} ORDER BY created_at DESC LIMIT 500`,
      [days],
    ),
    query<{ date: string; quotes: number }>(
      `SELECT to_char(created_at AT TIME ZONE 'America/New_York','YYYY-MM-DD') date,count(*)::int quotes FROM inquiries WHERE ${where} GROUP BY 1`,
      [days],
    ),
  ]);
  const metrics = {
    ...metricRows[0],
    quotes: quoteRows[0].count,
  };
  const dates = Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - days + 1 + i);
    const key = date.toLocaleDateString("en-CA", {
      timeZone: "America/New_York",
    });
    return {
      date: key,
      pageviews: daily.find((d) => d.date === key)?.pageviews || 0,
      quotes: quoteDaily.find((d) => d.date === key)?.quotes || 0,
    };
  });
  return {
    sample: false,
    days,
    metrics,
    daily: dates,
    pages: pageRows,
    sources,
    devices,
    campaigns,
    services,
    inquiries: inquiries.map((i) => ({
      ...i,
      created_at: new Date(i.created_at).toISOString(),
    })),
  };
}
