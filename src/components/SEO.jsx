import { Helmet } from 'react-helmet-async';

const DEFAULTS = {
  title:       'SOLVEN4 — The AI Financial Intelligence Platform',
  description: 'SOLVEN4 is a SaaS platform for trading education, IB relationship management, and professional analytics. Join as a Founding Member for lifetime access.',
  image:       'https://solven4.com/og-image.jpg',
  url:         'https://hub.solven4.com',
};

export function SEO({ title, description, path, noindex = false }) {
  const fullTitle = title ? `${title} | SOLVEN4` : DEFAULTS.title;
  const fullUrl   = `${DEFAULTS.url}${path || ''}`;
  const desc      = description || DEFAULTS.description;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}
      <link rel="canonical" href={fullUrl} />

      <meta property="og:title"       content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:image"       content={DEFAULTS.image} />
      <meta property="og:url"         content={fullUrl} />
      <meta property="og:type"        content="website" />
      <meta property="og:site_name"   content="SOLVEN4" />

      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:title"       content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image"       content={DEFAULTS.image} />
    </Helmet>
  );
}
