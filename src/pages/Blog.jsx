/**
 * S4 HUB — Public Blog
 * Renders content_posts rows Cockpit's SEO/GEO Engine has published.
 * Was previously write-only: the whole SEO content pipeline (generate ->
 * save draft -> publish) had no public page anywhere to actually publish
 * *to* — publishing content nobody can read defeats the point of an SEO
 * pipeline. /blog (list) and /blog/:slug (detail).
 */
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const S = { bg: '#1A1B1E', border: 'rgba(255,255,255,0.08)', ink: '#E0E7FF', dim: '#94A3B8', accent: '#6366F1' };

function fmtDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function BlogList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('content_posts')
      .select('id, title, slug, meta_description, content_type, published_at')
      .eq('status', 'published')
      .in('content_type', ['seo', 'geo', 'blog'])
      .order('published_at', { ascending: false })
      .then(({ data }) => { setPosts(data || []); setLoading(false); });
  }, []);

  return (
    <div style={{ background: S.bg, minHeight: '100vh', color: S.ink }}>
      <Helmet><title>Blog | SOLVEN4</title></Helmet>
      <div style={{ borderBottom: `1px solid ${S.border}`, padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link to="/" style={{ color: S.accent, fontSize: 12, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ArrowLeft size={13} /> Back to SOLVEN4
        </Link>
      </div>
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '48px 24px' }}>
        <h1 style={{ fontFamily: "'Satoshi', sans-serif", fontSize: 32, fontWeight: 500, margin: '0 0 8px' }}>Blog</h1>
        <p style={{ color: S.dim, fontSize: 14, marginBottom: 40 }}>Insights on trading, markets, and the SOLVEN4 platform.</p>

        {loading ? (
          <p style={{ color: S.dim }}>Loading…</p>
        ) : posts.length === 0 ? (
          <p style={{ color: S.dim }}>No posts published yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {posts.map(p => (
              <Link key={p.id} to={`/blog/${p.slug}`} style={{
                display: 'block', padding: 20, borderRadius: 12,
                border: `1px solid ${S.border}`, textDecoration: 'none', color: S.ink,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: S.dim, fontSize: 11, marginBottom: 8 }}>
                  <Calendar size={11} /> {fmtDate(p.published_at)}
                </div>
                <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 6px' }}>{p.title}</h2>
                {p.meta_description && <p style={{ color: S.dim, fontSize: 13.5, margin: 0 }}>{p.meta_description}</p>}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(undefined);

  useEffect(() => {
    supabase.from('content_posts')
      .select('id, title, body, meta_description, schema_jsonld, published_at')
      .eq('slug', slug).eq('status', 'published').maybeSingle()
      .then(({ data }) => setPost(data || null));
  }, [slug]);

  if (post === undefined) return <div style={{ background: S.bg, minHeight: '100vh' }} />;
  if (post === null) {
    return (
      <div style={{ background: S.bg, minHeight: '100vh', color: S.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
        <p style={{ color: S.dim }}>Post not found.</p>
        <Link to="/blog" style={{ color: S.accent, fontSize: 13 }}>← Back to Blog</Link>
      </div>
    );
  }

  return (
    <div style={{ background: S.bg, minHeight: '100vh', color: S.ink }}>
      <Helmet>
        <title>{post.title} | SOLVEN4 Blog</title>
        {post.meta_description && <meta name="description" content={post.meta_description} />}
        {post.schema_jsonld && <script type="application/ld+json">{post.schema_jsonld}</script>}
      </Helmet>
      <div style={{ borderBottom: `1px solid ${S.border}`, padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link to="/blog" style={{ color: S.accent, fontSize: 12, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ArrowLeft size={13} /> Back to Blog
        </Link>
      </div>
      <article style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: S.dim, fontSize: 11, marginBottom: 12 }}>
          <Calendar size={11} /> {fmtDate(post.published_at)}
        </div>
        <h1 style={{ fontFamily: "'Satoshi', sans-serif", fontSize: 28, fontWeight: 500, margin: '0 0 24px', lineHeight: 1.25 }}>{post.title}</h1>
        <div style={{ color: '#CBD5E1', fontSize: 15, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{post.body}</div>
      </article>
    </div>
  );
}
