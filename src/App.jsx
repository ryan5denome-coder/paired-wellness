import { useEffect, useState } from 'react';
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Menu, X } from 'lucide-react';

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Skincare', to: '/skincare' },
  { label: 'Guides', to: '/guides' },
];

const pageTitles = {
  '/': 'Paired Wellness | Restore the Gut. Support the Skin.',
  '/about': 'About Annie | Paired Wellness',
  '/skincare': 'Skincare | Paired Wellness',
  '/guides': 'Guides | Paired Wellness',
};

function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    document.title = pageTitles[pathname] || pageTitles['/'];
  }, [pathname]);

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      return undefined;
    }

    // Wait a frame so the destination section is mounted before measuring it.
    const frame = window.requestAnimationFrame(() => {
      if (!scrollToHash(hash)) window.scrollTo({ top: 0, behavior: 'instant' });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [pathname, hash]);

  return null;
}

function PearSketch({ className = '' }) {
  return (
    <svg className={`pear-sketch ${className}`} viewBox="0 0 118 104" aria-hidden="true">
      <path d="M68 29c1-12 8-21 21-27M70 26c15-8 30-5 41 6-16 7-29 4-41-6Z" />
      <path d="M63 31c-14-8-29-7-39 4 16 5 28 3 39-4Z" />
      <path d="M65 31C48 24 36 38 31 52 26 68 15 76 20 89c6 15 25 14 43 12 18-2 36-5 38-21 2-13-10-19-18-33-7-12-11-15-18-16Z" />
      <path d="M32 62c12-5 30-3 43 7M41 45c5 1 9 3 13 7M77 42c-3 6-3 12-1 18" />
    </svg>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const closeMenu = () => setOpen(false);

  // While the sheet is up, Escape dismisses it and the page behind stays put.
  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <header className="site-header">
      <div className="shell header-row">
        <Link to="/" className="header-brand" aria-label="Paired Wellness home" onClick={closeMenu}>
          <PearSketch />
          <span><strong>Paired</strong><small>WELLNESS</small></span>
        </Link>

        <nav className="desktop-nav" aria-label="Primary navigation">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? 'active' : '')}>
              {item.label}
            </NavLink>
          ))}
          <a href="https://linktr.ee/anniebdenome" target="_blank" rel="noreferrer">
            Start here <ArrowUpRight size={13} />
          </a>
        </nav>

        <button
          className="menu-toggle"
          type="button"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>

      {open && (
        <nav id="mobile-nav" className="mobile-nav shell" aria-label="Mobile navigation" onClick={closeMenu}>
          {navItems.map((item) => <NavLink key={item.to} to={item.to}>{item.label}</NavLink>)}
          <a href="https://linktr.ee/anniebdenome" target="_blank" rel="noreferrer">Start here</a>
        </nav>
      )}
    </header>
  );
}

function SectionLabel({ children }) {
  return <p className="section-label">{children}</p>;
}

function scrollToHash(hash) {
  const target = document.querySelector(hash);
  if (!target) return false;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  target.scrollIntoView({ behavior: reduce ? 'instant' : 'smooth', block: 'start' });
  return true;
}

function EditorialLink({ to, children, external = false, className = '' }) {
  const content = <>{children}<ArrowRight size={15} aria-hidden="true" /></>;
  const classes = `editorial-link ${className}`.trim();

  if (external) {
    return <a className={classes} href={to} target="_blank" rel="noreferrer">{content}</a>;
  }

  // Same-page anchors are handled here rather than through the router, which
  // treats a hash-only change as the same location and never re-runs the
  // scroll effect. Keeping it explicit also keeps the URL shareable.
  if (to.startsWith('#')) {
    const onClick = (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
      if (!scrollToHash(to)) return;
      event.preventDefault();
      window.history.pushState(null, '', to);
    };

    return <a className={classes} href={to} onClick={onClick}>{content}</a>;
  }

  return <Link className={classes} to={to}>{content}</Link>;
}

// Intrinsic pixel sizes, so the browser reserves the right box before the file
// arrives and the page never reflows underneath the reader.
const imageDimensions = {
  '/botanical/paired-pear-hero.jpg': [1664, 2080],
  '/botanical/paired-orchard-wide.jpg': [2200, 1238],
  '/botanical/paired-floral-detail.jpg': [1664, 2080],
  '/annie-denome-portrait.webp': [1067, 1600],
  '/annie-ryan-formal.webp': [1200, 390],
  '/annie/annie-staircase.jpg': [850, 600],
};

function Figure({ src, alt, caption, className = '', grayscale = false, priority = false }) {
  const [width, height] = imageDimensions[src] || [];

  return (
    <figure className={`editorial-figure ${className}${grayscale ? ' grayscale' : ''}`}>
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : undefined}
      />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

function LogoLockup({ className = '', note = 'Listen to the podcast' }) {
  return (
    <div className={`logo-lockup ${className}`.trim()}>
      <img
        className="logo-lockup-mark"
        src="/annie-ryan-formal.webp"
        alt="Health in the Spirit"
        width={1200}
        height={390}
        loading="lazy"
        decoding="async"
      />
      <a
        className="logo-lockup-note"
        href="https://healthinthespirit.com/"
        target="_blank"
        rel="noreferrer"
      >
        {note} <ArrowUpRight size={14} aria-hidden="true" />
      </a>
    </div>
  );
}

/**
 * Weekly newsletter opt-in.
 *
 * Posts natively to Mautic form 4 ("Newsletter Signup") on
 * crm.thepairedwellness.com, the same way the acne landing page posts to form 1.
 * The native POST is deliberate: this site is a static-assets Worker with no
 * server route, and Mautic's submit endpoint sends no CORS headers, so a fetch
 * from the browser would be blocked. The form's own Mautic action adds the
 * contact to the "Newsletter Subscribers" segment, kept separate from the guide
 * leads because this is a different consent and a different cadence.
 *
 * Verified end to end: submit returns 302 and the contact lands in the segment.
 *
 * The letter itself is still being written, so this copy promises a first issue
 * that is coming, never one that is already sending.
 */
function NewsletterSignup() {
  return (
    <div className="newsletter-signup">
      <SectionLabel>The weekly letter</SectionLabel>
      <h2>One steady email a week.</h2>
      <p>
        Annie is building a weekly letter — what she’s learning, what the research actually says,
        and the questions worth bringing to your own practitioner. It isn’t sending yet. Leave your
        email and the first one comes to you.
      </p>
      <form action="https://crm.thepairedwellness.com/form/submit?formId=4" method="post">
        <input type="hidden" name="mauticform[formId]" value="4" />
        <input type="hidden" name="mauticform[formName]" value="newslettersignup" />
        <input type="hidden" name="mauticform[return]" value="https://thepairedwellness.com/newsletter-thank-you" />
        <input type="hidden" name="mauticform[messenger]" value="" />

        <label className="visually-hidden" htmlFor="newsletter-email">Email address</label>
        <div className="newsletter-row">
          <input
            id="newsletter-email"
            type="email"
            name="mauticform[email]"
            required
            autoComplete="email"
            inputMode="email"
            placeholder="you@email.com"
          />
          <button type="submit" name="mauticform[submit]" value="1">
            Sign me up
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>
        <p className="newsletter-fine">
          One email a week once it begins. Unsubscribe any time. Education, not medical advice.
        </p>
      </form>
    </div>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell contact-layout">
        <div className="contact-copy">
          <SectionLabel>Contact</SectionLabel>
          <h2>Get in Touch</h2>
          <div className="contact-details">
            <p><span>Email</span><a href="mailto:annie@healthinthespirit.com">annie@healthinthespirit.com</a></p>
            <p><span>Socials</span><a href="https://www.instagram.com/paired.wellness/" target="_blank" rel="noreferrer">@paired.wellness</a></p>
            <p><span>Listen</span><a href="https://healthinthespirit.com/" target="_blank" rel="noreferrer">Health in the Spirit</a></p>
          </div>
          <NewsletterSignup />
        </div>
        <Figure
          src="/annie/annie-staircase.jpg"
          alt="Annie DeNome seated on a staircase"
          caption="Come as you are."
          className="contact-photo"
        />
      </div>
      <div className="shell footer-bottom">
        <span>© {new Date().getFullYear()} Paired Wellness</span>
        <span>Education and encouragement—not diagnosis or treatment.</span>
      </div>
    </footer>
  );
}

function Layout({ children }) {
  return (
    <div className="site-frame">
      <ScrollManager />
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Header />
      <main id="main-content">{children}</main>
      <Footer />
    </div>
  );
}

function Home() {
  return (
    <>
      <section className="home-masthead">
        <div className="shell masthead-grid">
          <div className="masthead-copy reveal">
            <PearSketch className="masthead-sketch" />
            <h1>Paired<br />Wellness</h1>
            <p className="masthead-tagline">Restore the gut. Support the skin.</p>
            <p>
              Root-cause wellness for the body and soul—grounded in faith, attentive to the whole person, and built for real life.
            </p>
            <div className="masthead-actions">
              <EditorialLink to="/about">Meet Annie</EditorialLink>
              <EditorialLink to="/guides">Explore guides</EditorialLink>
            </div>
          </div>
          <Figure
            src="/botanical/paired-pear-hero.jpg"
            alt="Fresh pears in a quiet natural setting"
            caption="The Paired Wellness Method"
            className="masthead-figure reveal delay-1"
            priority
          />
        </div>
      </section>

      <section className="editorial-band bio-band">
        <div className="shell bio-feature">
          <Figure
            src="/annie-denome-portrait.webp"
            alt="Portrait of Annie DeNome"
            className="bio-portrait"
            grayscale
          />
          <div className="bio-feature-copy">
            <SectionLabel>Bio</SectionLabel>
            <h2>Health Restoration<br />with <em>Annie DeNome</em></h2>
            <p>
              I spent over 15 years searching for answers to acne, bloating, brain fog, and painful cycles. Paired Wellness is where that story turns outward to become a steady Christ-centered guide for women who are ready to ask better questions.
            </p>
            <blockquote>Nothing changed fast or alone. Everything changed when the whole story mattered.</blockquote>
            <EditorialLink to="/about">Read Annie’s story</EditorialLink>
          </div>
        </div>
      </section>

      <section className="editorial-band method-band">
        <div className="shell">
          <div className="method-heading">
            <h2>Restore <em>the gut</em></h2>
            <p>Start with the connected story rather than one isolated symptom.</p>
          </div>

          <div className="method-grid">
            <article className="method-item method-item-one">
              <span className="editorial-number">01</span>
              <Figure src="/annie/annie-staircase.jpg" alt="Annie DeNome" />
              <h3>Ask better questions</h3>
              <p>Skin, digestion, hormones, stress, sleep, and spiritual life deserve to be understood together.</p>
            </article>
            <article className="method-item method-item-two">
              <span className="editorial-number">02</span>
              <div className="method-type-panel">
                <span>root + rhythm</span>
                <strong>Notice patterns before chasing perfection.</strong>
              </div>
              <p>Simple foundations create a steadier place from which to choose testing, support, and daily habits.</p>
            </article>
            <article className="method-item method-item-three">
              <span className="editorial-number">03</span>
              <div className="method-type-panel pale">
                <span>faith + practice</span>
                <strong>Let prayer shape the pace of healing.</strong>
              </div>
              <p>Stewardship is faithful attention—not control, shame, or fear.</p>
            </article>
          </div>

          <div className="support-skin-heading">
            <h2>Support <em>the skin</em></h2>
            <p>Clean products on the outside. Root-cause work on the inside.</p>
            <EditorialLink to="/skincare">See the skincare approach</EditorialLink>
          </div>
        </div>
      </section>

      <section className="orchard-story">
        <div className="shell orchard-grid">
          <blockquote>“The body is not an interruption to the spiritual life. It is part of the gift we are learning to steward.”</blockquote>
          <Figure src="/botanical/paired-orchard-wide.jpg" alt="A quiet pear orchard in warm light" className="orchard-wide" />
          <Figure src="/botanical/paired-pear-hero.jpg" alt="Pears gathered in natural light" className="orchard-tall" />
          <div className="orchard-copy">
            <SectionLabel>The Paired Wellness Method</SectionLabel>
            <p>Body and soul. Root and fruit. Faith and practice. The most useful next step is usually the one that honors both sides of the pair.</p>
          </div>
        </div>
      </section>

      <section className="editorial-band guide-feature">
        <div className="shell guide-feature-grid">
          <Figure
            src="/annie-denome-portrait.webp"
            alt="Annie DeNome, wellness educator and guide"
            className="guide-feature-photo"
          />
          <div className="guide-feature-copy">
            <SectionLabel>Your trail guide</SectionLabel>
            <h2>I’ll help you find the next faithful step.</h2>
            <p>
              Paired Wellness is not a prescription or a promise. It is a growing library of clear explanations, thoughtful questions, and practical starting points for acne, gut health, clean skincare, and everyday stewardship.
            </p>
            <EditorialLink to="/guides">Preview the guide library</EditorialLink>
          </div>
        </div>
      </section>
    </>
  );
}

function About() {
  const journey = [
    ['01', 'The long guessing season', 'Acne began around age ten. Bloating, constipation, painful cycles, and brain fog followed. Food rules, creams, antibiotics, and new routines kept promising an answer.'],
    ['02', 'The questions changed', 'Comprehensive testing helped connect patterns that had been treated as isolated symptoms. The work shifted from throwing things at the surface to understanding context.'],
    ['03', 'The cross became a doorway', 'Prayer, clean products, gut support, and consistent habits became part of a slow healing story—one Annie now uses to make another woman’s path feel less lonely.'],
  ];

  return (
    <>
      <section className="page-intro">
        <div className="shell page-intro-grid">
          <div>
            <SectionLabel>About Annie</SectionLabel>
            <h1>Health restoration with <em>Annie DeNome.</em></h1>
            <p>This was never only about clear skin. It is about becoming more present to your life, more confident in the body God gave you, and more able to use your gifts with freedom.</p>
          </div>
          <Figure src="/annie-denome-portrait.webp" alt="Portrait of Annie DeNome" caption="Theology + Psychology • Root-cause wellness" className="page-intro-image" grayscale />
        </div>
      </section>

      <section className="editorial-band about-story">
        <div className="shell prose-grid">
          <div>
            <SectionLabel>A little more of the story</SectionLabel>
            <h2>Thoughtful by training.<br />Hopeful by grace.<br /><em>Practical by necessity.</em></h2>
          </div>
          <div className="long-copy">
            <p>Annie is an Owensboro, Kentucky native, lifelong swimmer and triathlete, theologian, wife, and mom. Straight out of high school, she spent a year traveling the country with NET Ministries, sharing the Gospel with young people.</p>
            <p>At Franciscan University of Steubenville, she double-majored in Theology and Psychology—a pairing that still shapes how she sees health: the interior life matters, the body matters, and neither one flourishes in isolation.</p>
            <p>Today, Paired Wellness turns a decade-long struggle with acne and gut symptoms into clear, compassionate education for women who are tired of guessing.</p>
          </div>
        </div>
      </section>

      <section className="journey-section">
        <div className="shell">
          <div className="section-title-row">
            <h2>The root-cause journey</h2>
            <p>What looked like separate problems was one connected story.</p>
          </div>
          <div className="journey-list">
            {journey.map(([number, title, text]) => (
              <article key={number}>
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="faith-section">
        <div className="shell faith-grid">
          <LogoLockup className="faith-lockup" note="Listen to Health in the Spirit" />
          <div>
            <SectionLabel>What guides this work</SectionLabel>
            <h2>Faith and health were never meant to be strangers.</h2>
            <p>Caring for the body is not vanity. It is stewardship—never an attempt to control every outcome, but a response to the gift already entrusted to us.</p>
            <div className="belief-lines">
              <p><span>01</span><strong>Jesus first</strong> Healing is never reduced to a protocol.</p>
              <p><span>02</span><strong>Whole-person context</strong> Skin, gut, habits, emotions, relationships, and spiritual life belong to one person.</p>
              <p><span>03</span><strong>Patient consistency</strong> Small faithful choices matter more than perfect streaks.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Skincare() {
  return (
    <>
      <section className="page-intro skincare-intro">
        <div className="shell page-intro-grid reverse">
          <Figure src="/annie-denome-portrait.webp" alt="Annie DeNome" caption="Support the skin" className="page-intro-image skincare-annie" />
          <div>
            <SectionLabel>Clean beauty, calmer choices</SectionLabel>
            <h1>Skin is not separate from the <em>rest of you.</em></h1>
            <p>What you put on your skin should support the bigger work you are doing—not become one more cycle of fear, impulse, and disappointment.</p>
            <EditorialLink to="#partners">Meet Annie’s partners</EditorialLink>
          </div>
        </div>
      </section>

      <section className="editorial-band skincare-method">
        <div className="shell">
          <div className="section-title-row">
            <h2>Support <em>the skin</em></h2>
            <p>Gut work on the inside. Clean products on the outside.</p>
          </div>
          <div className="skin-principles">
            <article><span>01</span><h3>Simplify first</h3><p>Before adding more, know what your routine already contains.</p></article>
            <article><span>02</span><h3>Watch the whole story</h3><p>Skin may reflect sleep, stress, digestion, hormones, environment, and habits.</p></article>
            <article><span>03</span><h3>Choose without fear</h3><p>Ingredient awareness should create clarity—not anxiety or perfectionism.</p></article>
          </div>
        </div>
      </section>

      <section id="partners" className="partners-editorial">
        <div className="shell">
          <div className="section-title-row">
            <h2>Products Annie partners with</h2>
            <p>Annie may earn from qualifying purchases through her partner links. That relationship is disclosed so you can choose with clarity.</p>
          </div>
          <div className="partner-editorial-grid">
            <article>
              <span className="editorial-number">01</span>
              <p className="overline">Clean skincare + makeup</p>
              <h3>Crunchi</h3>
              <p>High-performing skincare and color cosmetics for the ingredient-conscious woman.</p>
              <EditorialLink to="https://crunchi.com/?als=AnnieDeNome" external>Explore Crunchi</EditorialLink>
            </article>
            <article>
              <span className="editorial-number">02</span>
              <p className="overline">Fresh skincare</p>
              <h3>RINGANA</h3>
              <p>Annie’s newest partnership, centered on skincare made with a fresh-first mindset. Annie is a Founding Partner.</p>
              <EditorialLink to="https://www.instagram.com/paired.wellness/" external>Ask Annie about RINGANA</EditorialLink>
            </article>
            <Figure src="/botanical/paired-pear-hero.jpg" alt="Fresh pears in natural light" caption="Why fresh matters" className="partner-pear" />
          </div>
        </div>
      </section>

      <section className="editorial-band fresh-copy-section">
        <div className="shell fresh-copy-grid">
          <div className="fresh-words" aria-hidden="true">
            <span>FRESH PRODUCE</span><span>FRESH BREAD</span><span>FRESH COFFEE</span>
          </div>
          <div>
            <SectionLabel>Why “fresh” matters to Annie</SectionLabel>
            <h2>We know instinctively that <em>fresh means more.</em></h2>
            <p>We accept that fresh food does not sit unchanged for years. Annie’s skincare philosophy invites that same common sense into the bathroom: what feeds the skin matters, and freshness is worth asking about.</p>
            <p className="fine-note">This reflects Annie’s personal skincare philosophy, not a promise of individual results.</p>
          </div>
        </div>
      </section>

      <section className="routine-editorial">
        <div className="shell">
          <div className="section-title-row"><h2>Before buying one more bottle</h2><p>A gentle routine reset.</p></div>
          <ol className="routine-list">
            <li><span>01</span><div><h3>Name your goal</h3><p>Are you trying to calm irritation, support the barrier, simplify makeup, or understand a recurring pattern?</p></div></li>
            <li><span>02</span><div><h3>Inventory what you use</h3><p>List each cleanser, serum, active, moisturizer, makeup product, and spot treatment before adding anything new.</p></div></li>
            <li><span>03</span><div><h3>Change slowly</h3><p>One thoughtful swap is easier to understand than a complete overhaul.</p></div></li>
            <li><span>04</span><div><h3>Look beyond the bathroom</h3><p>If acne persists, skincare may be only one part of the conversation. Consider qualified support for the whole picture.</p></div></li>
          </ol>
        </div>
      </section>
    </>
  );
}

const guideTopics = [
  ['01', 'Acne', 'The Acne Clarity Guide', 'Why recurring breakouts are so often a whole-body conversation, what is worth testing before you buy one more product, and how to read the patterns your skin is showing you.', 'Free · releasing soon'],
  ['02', 'Skincare', 'The Clean Swap Guide', 'A less-overwhelming way to audit your routine, understand product roles, and make changes one at a time.', 'Coming soon'],
  ['03', 'Gut health', 'Gut Foundations', 'The in-depth one: digestion, stomach acid, absorption, bile flow, the gut’s reach into skin, mood, immunity, and hormones, and why “just take a probiotic” so rarely settles it.', 'In-depth · releasing soon'],
  ['04', 'Foundational labs', 'Test, Don’t Guess', 'Questions to bring to a qualified practitioner and plain-language context for common wellness conversations.', 'Coming soon'],
  ['05', 'Faith + rhythms', 'Stewardship Without Striving', 'Prayerful routines for caring for the body without turning wellness into fear, control, or perfectionism.', 'Coming soon'],
  ['06', 'Everyday wellness', 'The Simple Start Handbook', 'A practical workbook for choosing a focus, noticing progress, and building habits that can live in real family life.', 'Coming soon'],
];

function Guides() {
  return (
    <>
      <section className="guides-intro">
        <div className="shell guides-intro-grid">
          <div>
            <SectionLabel>Resource library</SectionLabel>
            <h1>Guides for when you need a <em>clear next step.</em></h1>
          </div>
          <div>
            <p>No twenty-tab rabbit holes. No panic buying. Just thoughtful education, reflection prompts, and practical starting points—built slowly and responsibly.</p>
            <span className="development-note">First guides are in development</span>
          </div>
        </div>
      </section>

      <section className="editorial-band guide-library">
        <div className="shell guide-rows">
          {guideTopics.map(([number, label, title, text, status]) => (
            <article key={number}>
              <span className="guide-number">{number}</span>
              <p className="overline">{label}</p>
              <h2>{title}</h2>
              <p>{text}</p>
              <span className={`coming-soon${status === 'Coming soon' ? '' : ' highlighted'}`}>{status}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="guide-invitation">
        <div className="shell guide-invitation-grid">
          <LogoLockup className="guide-lockup" note="Listen to Health in the Spirit" />
          <div>
            <SectionLabel>Help shape the library</SectionLabel>
            <h2>What do you wish someone had explained sooner?</h2>
            <p>Send Annie the question you keep searching. Your note may help shape a future guide or Health in the Spirit conversation.</p>
            <EditorialLink to="mailto:annie@healthinthespirit.com?subject=Paired%20Wellness%20guide%20idea" external>Share a guide idea</EditorialLink>
          </div>
        </div>
        <div className="shell guide-disclaimer">
          <strong>Education, not a diagnosis.</strong>
          <p>Guides offer general education and questions to consider. They do not diagnose, prescribe, or replace a relationship with your own qualified healthcare professional.</p>
        </div>
      </section>
    </>
  );
}

function NotFound() {
  return (
    <section className="not-found">
      <div className="shell">
        <SectionLabel>404</SectionLabel>
        <h1>This page is still growing.</h1>
        <EditorialLink to="/">Return home</EditorialLink>
      </div>
    </section>
  );
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/skincare" element={<Skincare />} />
        <Route path="/guides" element={<Guides />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}
