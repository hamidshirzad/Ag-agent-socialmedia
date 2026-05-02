import { useEffect } from "react";

const SITE_NAME = "Fourdoor AI";
const SITE_DESC = "Autonomous AI-driven marketing and lead generation. Generate content, engage leads, and book sales calls on autopilot.";

interface MetaProps {
  title?: string;
  description?: string;
}

export function Meta({ title, description }: MetaProps) {
  const fullTitle = title ? `${title} — ${SITE_NAME}` : SITE_NAME;
  const fullDesc  = description ?? SITE_DESC;

  useEffect(() => {
    document.title = fullTitle;

    const set = (selector: string, attr: string, value: string) => {
      const el = document.querySelector(selector);
      if (el) el.setAttribute(attr, value);
    };

    set('meta[property="og:title"]',       "content", fullTitle);
    set('meta[property="og:description"]', "content", fullDesc);
    set('meta[property="og:url"]',         "content", window.location.href);
    set('meta[name="twitter:title"]',      "content", fullTitle);
    set('meta[name="twitter:description"]',"content", fullDesc);
    set('link[rel="canonical"]',           "href",    window.location.href);
  }, [fullTitle, fullDesc]);

  return null;
}
