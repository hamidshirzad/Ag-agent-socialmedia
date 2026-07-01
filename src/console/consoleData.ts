// Navigation + screen metadata for the Fourdoor console, mirroring the
// PAGE_META / GROUP_LABELS / sidebar structure from the fourdoor_ai.html mockup.

export type ScreenId =
  | "main_dashboard_overview" | "main_dashboard" | "dashboard_overview"
  | "content_agent_hub" | "content_hub_1" | "content_hub_2"
  | "lead_pipeline_sales_agent" | "lead_pipeline_1" | "lead_pipeline_2"
  | "analytics_strategic_insights" | "analytics_insights_1" | "analytics_insights_2"
  | "settings_integrations_1" | "settings_integrations_2" | "system_settings";

export type GroupId = "dashboard" | "content" | "leads" | "analytics" | "settings";

export interface NavItem { id: ScreenId; label: string; icon: string; }
export interface NavGroup { id: GroupId; label: string; icon: string; items: NavItem[]; }

export const GROUP_LABELS: Record<GroupId, string> = {
  dashboard: "Dashboard", content: "Content", leads: "Leads",
  analytics: "Analytics", settings: "Settings",
};

export const NAV: NavGroup[] = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard", items: [
    { id: "main_dashboard_overview", label: "Dashboard", icon: "dashboard" },
    { id: "main_dashboard", label: "Overview", icon: "space_dashboard" },
    { id: "dashboard_overview", label: "Command View", icon: "monitor" },
  ]},
  { id: "content", label: "Content", icon: "auto_awesome", items: [
    { id: "content_agent_hub", label: "Content Hub", icon: "auto_awesome" },
    { id: "content_hub_1", label: "Content Library", icon: "library_books" },
    { id: "content_hub_2", label: "Content Calendar", icon: "calendar_month" },
  ]},
  { id: "leads", label: "Leads", icon: "filter_list", items: [
    { id: "lead_pipeline_sales_agent", label: "Lead Pipeline", icon: "filter_list" },
    { id: "lead_pipeline_1", label: "Lead Board", icon: "view_kanban" },
    { id: "lead_pipeline_2", label: "Qualification", icon: "task_alt" },
  ]},
  { id: "analytics", label: "Analytics", icon: "insights", items: [
    { id: "analytics_strategic_insights", label: "Strategic Insights", icon: "insights" },
    { id: "analytics_insights_1", label: "Campaign Analytics", icon: "bar_chart" },
    { id: "analytics_insights_2", label: "Performance", icon: "trending_up" },
  ]},
  { id: "settings", label: "Settings", icon: "settings", items: [
    { id: "settings_integrations_1", label: "Integrations", icon: "cable" },
    { id: "settings_integrations_2", label: "Connections", icon: "hub" },
    { id: "system_settings", label: "System", icon: "tune" },
  ]},
];

export const PAGE_META: Record<ScreenId, { label: string; group: GroupId }> = NAV.reduce(
  (acc, g) => {
    g.items.forEach((it) => { acc[it.id] = { label: it.label, group: g.id }; });
    return acc;
  },
  {} as Record<ScreenId, { label: string; group: GroupId }>,
);

export const TICKS: string[] = [
  "Content Agent drafting LinkedIn post #7...",
  "Sales Agent qualified lead → BANT: 91",
  "Engagement Agent replied to 3 DMs...",
  "Analytics Agent: TikTok CTR up 14%",
  "Content Agent scheduling Instagram reel...",
  "Sales Agent booked call with Sarah M.",
  "Engagement Agent detected high-intent DM",
  "Content Agent generated 5 caption variants",
];
