/**
 * S4 HUB — Legal Pages
 * Terms of Service, Privacy Policy, Risk Disclaimer
 * Shared component — route to /legal/:doc
 */
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const LAST_UPDATED = 'July 11, 2026';
const JURISDICTION = 'United Arab Emirates';
const COMPANY      = 'SOLVEN4 Ltd.';
const EMAIL        = 'legal@solven4.com';
const HUB_URL      = 'https://hub.solven4.com';

const DOCS = {
  terms: {
    title: 'Terms of Service',
    content: <TermsContent />,
  },
  privacy: {
    title: 'Privacy Policy',
    content: <PrivacyContent />,
  },
  risk: {
    title: 'Risk Disclaimer',
    content: <RiskContent />,
  },
};

export default function LegalPages() {
  const { doc = 'terms' } = useParams();
  const page = DOCS[doc] || DOCS.terms;

  return (
    <div style={{ background: '#1A1B1E', minHeight: '100vh', color: '#CBD5E1' }}>
      <Helmet><title>{page.title} | SOLVEN4</title></Helmet>

      {/* Header */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link to="/dashboard" style={{ color: '#6366F1', fontSize: 12, textDecoration: 'none' }}>← Back to HUB</Link>
        <span style={{ color: 'rgba(255,255,255,0.08)' }}>|</span>
        <span style={{ fontFamily: "'Satoshi', monospace", fontSize: 12, color: '#6366F1', letterSpacing: '0.15em' }}>S4 LEGAL</span>
      </div>

      {/* Nav tabs */}
      <div style={{ display: 'flex', gap: '4px', padding: '16px 24px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        {Object.entries(DOCS).map(([key, d]) => (
          <Link key={key} to={`/legal/${key}`} style={{
            padding: '8px 16px', fontSize: 12, borderRadius: '6px 6px 0 0',
            background: doc === key ? '#14161B' : 'transparent',
            color: doc === key ? '#E2E8F0' : '#94A3B8',
            border: doc === key ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
            borderBottom: doc === key ? '1px solid #14161B' : '1px solid transparent',
            textDecoration: 'none', fontWeight: doc === key ? 600 : 400,
          }}>
            {d.title}
          </Link>
        ))}
      </div>

      {/* Content */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 24px 80px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 500, color: '#E2E8F0', marginBottom: 8 }}>{page.title}</h1>
        <p style={{ fontSize: 12, color: '#94A3B8', marginBottom: 32 }}>Last updated: {LAST_UPDATED} · {COMPANY}</p>
        <div className="legal-body">{page.content}</div>
      </div>

      <style>{`
        .legal-body h2 { font-size:16px; font-weight:700; color:#E2E8F0; margin:28px 0 10px; }
        .legal-body h3 { font-size:14px; font-weight:600; color:#CBD5E1; margin:18px 0 6px; }
        .legal-body p  { font-size:13px; color:#94A3B8; line-height:1.8; margin-bottom:12px; }
        .legal-body ul { margin:8px 0 12px 20px; }
        .legal-body li { font-size:13px; color:#94A3B8; line-height:1.8; }
        .legal-body .highlight { background:rgba(99,102,241,.08); border-left:3px solid #6366F1; padding:12px 16px; border-radius:0 6px 6px 0; margin:16px 0; }
        .legal-body .warning   { background:rgba(239,68,68,.08); border-left:3px solid #EF4444; padding:12px 16px; border-radius:0 6px 6px 0; margin:16px 0; }
        .legal-body a { color:#6366F1; }
      `}</style>
    </div>
  );
}

function TermsContent() {
  return <>
    <div className="highlight">
      <strong style={{ color: '#E2E8F0' }}>Summary:</strong> SOLVEN4 is a SaaS platform for trading education, IB relationship management, and professional analytics. We are not a broker, investment advisor, or financial institution.
    </div>

    <h2>1. Nature of Service</h2>
    <p>SOLVEN4 ("{COMPANY}") provides a Software-as-a-Service (SaaS) platform offering trading education tools, introducing broker (IB) network management, and professional analytics. SOLVEN4 is <strong>not</strong> a broker, investment advisor, or financial institution. Nothing on this platform constitutes investment advice, trading recommendations, or a solicitation to trade.</p>

    <h2>2. Founding Member Terms</h2>
    <p>Founding Member access is a lifetime, non-transferable SaaS license granted upon payment. Key terms:</p>
    <ul>
      <li>"Lifetime" means the operational lifetime of the SOLVEN4 product</li>
      <li>In the event SOLVEN4 is discontinued, members will receive 12 months advance notice and a pro-rated refund</li>
      <li>Founding pricing is locked — existing Founding Member pricing will never increase</li>
      <li>Access is tied to the tier purchased (EDGE, FORGE, ORACLE, or NEXUS) and cannot be downgraded</li>
      <li>Accounts are personal and non-transferable</li>
    </ul>

    <h2>3. Refund Policy</h2>
    <ul>
      <li>14-day refund window from the date of purchase</li>
      <li>Refunds processed within 5–10 business days via the original payment method</li>
      <li>Crypto payments (NOWPayments) are refunded in USDT at the USD rate on the original purchase date</li>
      <li>Refunds void the Founding Member status and access is revoked immediately upon processing</li>
    </ul>

    <h2>4. Acceptable Use</h2>
    <p>You agree not to:</p>
    <ul>
      <li>Share your account credentials with any third party</li>
      <li>Use AI features to generate content that violates applicable law</li>
      <li>Attempt to reverse-engineer, scrape, or extract our proprietary data or systems</li>
      <li>Represent SOLVEN4 content as personalized investment advice</li>
    </ul>

    <h2>5. AI Features Disclaimer</h2>
    <p>AI-generated content (TheBrain, AI Coach, FORGE AI Hub, NEXUS AI Agent, ORACLE Intelligence) is provided for educational and informational purposes only. AI responses may contain errors and should not be relied upon as professional financial, legal, or trading advice.</p>

    <h2>6. Intellectual Property</h2>
    <p>All platform content, branding, algorithms, and software remain the intellectual property of {COMPANY}. You receive a limited, non-exclusive license to access the platform for personal professional use.</p>

    <h2>7. Governing Law</h2>
    <p>These terms are governed by the laws of {JURISDICTION}. Disputes shall be resolved through binding arbitration in {JURISDICTION}.</p>

    <h2>8. Contact</h2>
    <p>Legal enquiries: <a href={`mailto:${EMAIL}`}>{EMAIL}</a></p>
  </>;
}

function PrivacyContent() {
  return <>
    <div className="highlight">
      <strong style={{ color: '#E2E8F0' }}>Key point:</strong> We do not store card numbers, CVVs, or full payment details. Payments are processed by Dodo Payments (Merchant of Record). AI conversations are not used to train models and are auto-deleted after 90 days.
    </div>

    <h2>Data We Collect</h2>
    <h3>Account Data</h3>
    <p>Email address, full name, trading experience level, and profile preferences you provide during registration.</p>

    <h3>Usage Data</h3>
    <p>Page views, feature interactions, session duration, and error reports (via Sentry). AI chat history is stored encrypted for context continuity within sessions.</p>

    <h3>Payment Data</h3>
    <p>We do <strong>not</strong> store card numbers, CVVs, bank details, or full payment credentials. All payment processing is handled by Dodo Payments (Merchant of Record) and NOWPayments (crypto). We receive only payment confirmation, tier, and transaction ID.</p>

    <h3>MetaApi Trading Data</h3>
    <p>If you connect your MT4/MT5 account via MetaApi, your trade history is synced with your explicit consent and stored encrypted in your private Supabase partition. This data is never shared with third parties.</p>

    <h2>How We Use Your Data</h2>
    <ul>
      <li>Providing and improving SOLVEN4 platform services</li>
      <li>Sending transactional notifications (payment confirmations, security alerts)</li>
      <li>Personalizing AI features with your trading context</li>
      <li>Security monitoring and fraud prevention</li>
    </ul>

    <h2>AI Features and Data</h2>
    <p>Your conversations with SOLVEN4 AI features are used <strong>only</strong> to provide the service during your session. They are <strong>never</strong> used to train AI models. AI conversations are stored with AES-256 encryption and auto-deleted after 90 days.</p>

    <h2>Your Rights</h2>
    <ul>
      <li><strong>Access:</strong> Export your data from Account Settings → Export Data</li>
      <li><strong>Deletion:</strong> Delete your account from Account Settings → Delete Account. All personal data purged within 30 days.</li>
      <li><strong>Portability:</strong> Trade journal and analytics data exportable as CSV at any time</li>
      <li><strong>Correction:</strong> Update your profile information in Account Settings at any time</li>
    </ul>

    <h2>Third-Party Services</h2>
    <ul>
      <li><strong>Supabase</strong> — Database hosting (EU data centre). <a href="https://supabase.com/privacy" target="_blank" rel="noreferrer">Privacy policy</a></li>
      <li><strong>Dodo Payments</strong> — Payment processing and Merchant of Record</li>
      <li><strong>Sentry</strong> — Error monitoring (PII is stripped before transmission)</li>
      <li><strong>Telegram / Twilio</strong> — Notification delivery (optional, with your consent)</li>
      <li><strong>Anthropic Claude</strong> — AI responses (your data is not used for training)</li>
    </ul>

    <h2>Contact</h2>
    <p>Data Protection enquiries: <a href={`mailto:${EMAIL}`}>{EMAIL}</a></p>
  </>;
}

function RiskContent() {
  return <>
    <div className="warning">
      <strong style={{ color: '#EF4444' }}>IMPORTANT RISK WARNING</strong> — Please read carefully before using any trading-related features on SOLVEN4.
    </div>

    <h2>Trading Risk Warning</h2>
    <p>Trading foreign exchange (forex), contracts for difference (CFDs), cryptocurrencies, and other financial instruments involves a <strong>high level of risk</strong> and may not be suitable for all investors.</p>
    <p>There is a possibility that you may sustain a loss equal to or greater than your entire investment. Therefore, you should <strong>not invest or risk money that you cannot afford to lose</strong>.</p>

    <h2>What SOLVEN4 Is — and Is Not</h2>
    <p>SOLVEN4 provides educational tools, analytical dashboards, and professional IB network management. SOLVEN4 does <strong>not</strong>:</p>
    <ul>
      <li>Execute trades on your behalf</li>
      <li>Hold, custody, or manage your funds</li>
      <li>Provide personalized investment advice</li>
      <li>Guarantee any trading results, returns, or outcomes</li>
      <li>Act as a licensed broker or financial advisor</li>
    </ul>

    <h2>AI-Generated Content</h2>
    <p>AI features (TheBrain, ORACLE Intelligence, AI Coach, etc.) generate content for <strong>educational and analytical purposes only</strong>. AI outputs:</p>
    <ul>
      <li>May contain errors or outdated information</li>
      <li>Are not personalized financial advice</li>
      <li>Should not be the sole basis for any trading decision</li>
      <li>Do not account for your personal financial situation, risk tolerance, or investment objectives</li>
    </ul>

    <h2>Past Performance</h2>
    <p>Past performance is not indicative of future results. Any historical data, backtests, or performance figures shown on SOLVEN4 are for educational illustration only and do not guarantee future performance.</p>

    <h2>CFD Risk Statement</h2>
    <p>CFDs are complex instruments and come with a high risk of losing money rapidly due to leverage. A significant percentage of retail investor accounts lose money when trading CFDs. You should consider whether you understand how CFDs work and whether you can afford to take the high risk of losing your money.</p>

    <h2>Regulatory Notice</h2>
    <p>SOLVEN4 is a SaaS platform and is not a regulated financial services provider. You should seek advice from an independent, licensed financial advisor before making any investment decisions.</p>

    <h2>Contact</h2>
    <p>If you have questions about risk: <a href={`mailto:${EMAIL}`}>{EMAIL}</a></p>
  </>;
}
