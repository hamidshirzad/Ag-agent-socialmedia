import { Helmet } from 'react-helmet-async';

const BASE_URL   = 'https://fourdoor.ai';
const SITE_NAME  = 'Fourdoor AI';
const SITE_TITLE = 'Fourdoor AI | Autonomous Social Media & Lead Gen SaaS';
const SITE_DESC  = 'Fourdoor AI is an autonomous, AI-driven marketing and lead generation SaaS platform. It generates social media content, engages users, qualifies leads, and books sales calls autonomously.';

interface PageMetaProps {
  title?:       string;
  description?: string;
  path?:        string;
  type?:        'website' | 'article';
}

export default function PageMeta({
  title       = SITE_TITLE,
  description = SITE_DESC,
  path        = '/',
  type        = 'website',
}: PageMetaProps) {
  const url       = `${BASE_URL}${path}`;
  const fullTitle = title === SITE_TITLE ? title : `${title} | ${SITE_NAME}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description"         content={description} />
      <link rel="canonical"            href={url} />
      <meta property="og:type"         content={type} />
      <meta property="og:url"          content={url} />
      <meta property="og:title"        content={fullTitle} />
      <meta property="og:description"  content={description} />
      <meta name="twitter:card"         content="summary" />
      <meta name="twitter:url"          content={url} />
      <meta name="twitter:title"        content={fullTitle} />
      <meta name="twitter:description"  content={description} />
    </Helmet>
  );
}
