import { useEffect, useState } from 'react';
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronRight,
  Droplets,
  Heart,
  Camera,
  Leaf,
  Menu,
  Podcast,
  Sparkles,
  Sprout,
  X,
} from 'lucide-react';

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Skincare', to: '/skincare' },
  { label: 'Guides', to: '/guides' },
];

const pageTitles = {
  '/': 'Annie B Wellness | Faith, Gut Health & Clean Skincare',
  '/about': 'About Annie | Annie B Wellness',
  '/skincare': 'Clean Skincare | Annie B Wellness',
  '/guides': 'Wellness Guides | Annie B Wellness',
};

function ScrollManager() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.title = pageTitles[pathname] || pageTitles['/'];
  }, [pathname]);

  return null;
}

function Announcement() {
  return (
    <div className="announcement">
      <div className="shell announcement-inner">
        <span>Root-cause wellness for body + soul</span>
        <a href="https://www.instagram.com/her.holy.terrain/" target="_blank" rel="noreferrer">
          Follow Annie <ArrowUpRight size={14} aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      <Announcement />
      <header className="site-header">
        <div className="shell nav-shell">
          <Link to="/" className="wordmark" aria-label="Annie B Wellness home">
            <span className="wordmark-main">Annie B</span>
            <span className="wordmark-sub">WELLNESS</span>
          </Link>

          <nav className="desktop-nav" aria-label="Primary navigation">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => (isActive ? 'active' : undefined)}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <a
            className="nav-cta desktop-cta"
            href="https://linktr.ee/anniebdenome"
            target="_blank"
            rel="noreferrer"
          >
            Start here <ArrowUpRight size={15} aria-hidden="true" />
          </a>

          <button
            className="menu-toggle"
            type="button"
            aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>

        {open && (
          <nav className="mobile-nav shell" aria-label="Mobile navigation">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to}>
                {item.label} <ChevronRight size={18} aria-hidden="true" />
              </NavLink>
            ))}
            <a href="https://linktr.ee/anniebdenome" target="_blank" rel="noreferrer">
              Start here <ArrowUpRight size={18} aria-hidden="true" />
            </a>
          </nav>
        )}
      </header>
    </>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div className="footer-brand">
          <Link to="/" className="wordmark footer-wordmark">
            <span className="wordmark-main">Annie B</span>
            <span className="wordmark-sub">WELLNESS</span>
          </Link>
          <p>Christ-centered encouragement for clear direction, healthy rhythms, and whole-person stewardship.</p>
          <a
            className="social-link"
            href="https://www.instagram.com/her.holy.terrain/"
            target="_blank"
            rel="noreferrer"
          >
            <Camera size={18} aria-hidden="true" /> @her.holy.terrain
          </a>
        </div>

        <div className="footer-links">
          <span className="footer-label">Explore</span>
          {navItems.map((item) => (
            <Link key={item.to} to={item.to}>{item.label}</Link>
          ))}
        </div>

        <div className="footer-links">
          <span className="footer-label">Connect</span>
          <a href="https://healthinthespirit.com/" target="_blank" rel="noreferrer">Health in the Spirit</a>
          <a href="mailto:annie@healthinthespirit.com">Email Annie</a>
          <a href="https://linktr.ee/anniebdenome" target="_blank" rel="noreferrer">Annie’s links</a>
        </div>

        <div className="footer-note">
          <span className="footer-label">A gentle note</span>
          <p>
            This site is for education and encouragement. It does not diagnose, treat, or replace care from your qualified clinician.
          </p>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© {new Date().getFullYear()} Annie B Wellness</span>
        <span>Made to nourish body + soul</span>
      </div>
    </footer>
  );
}

function Layout({ children }) {
  return (
    <div className="site-frame">
      <ScrollManager />
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}

function Eyebrow({ children, light = false }) {
  return <p className={`eyebrow${light ? ' eyebrow-light' : ''}`}>{children}</p>;
}

function TextLink({ to, children, external = false, light = false }) {
  const className = `text-link${light ? ' text-link-light' : ''}`;
  const content = <>{children} <ArrowRight size={17} aria-hidden="true" /></>;

  if (external) {
    return <a className={className} href={to} target="_blank" rel="noreferrer">{content}</a>;
  }
  return <Link className={className} to={to}>{content}</Link>;
}

function Home() {
  return (
    <>
      <section className="hero home-hero">
        <div className="shell hero-grid">
          <div className="hero-copy reveal">
            <Eyebrow>Faith • Gut Health • Clean Skincare</Eyebrow>
            <h1>
              Wellness, rooted in the <em>One who made you.</em>
            </h1>
            <p className="hero-lead">
              I’m Annie—a theologian, wellness advocate, and woman who spent more than a decade asking why. Now I help women move from guessing to grounded next steps for their skin, gut, and whole-person health.
            </p>
            <div className="button-row">
              <Link className="button button-primary" to="/about">
                Meet Annie <ArrowRight size={17} aria-hidden="true" />
              </Link>
              <Link className="button button-ghost" to="/guides">Browse guides</Link>
            </div>
            <div className="trust-row" aria-label="Annie B Wellness focus areas">
              <span><Check size={15} aria-hidden="true" /> Root-cause focused</span>
              <span><Check size={15} aria-hidden="true" /> Christ-centered</span>
              <span><Check size={15} aria-hidden="true" /> No shame, no guessing</span>
            </div>
          </div>

          <div className="hero-visual reveal delay-1">
            <div className="portrait-arch">
              <img src="/annie-denome-portrait.webp" alt="Annie DeNome, founder of Annie B Wellness" />
            </div>
            <div className="hero-stamp">
              <Sprout size={18} aria-hidden="true" />
              <span>BODY + SOUL</span>
            </div>
            <div className="hero-orbit" aria-hidden="true" />
          </div>
        </div>
        <div className="paper-line" aria-hidden="true" />
      </section>

      <section className="pathways section-pad">
        <div className="shell">
          <div className="section-heading split-heading">
            <div>
              <Eyebrow>A place to begin</Eyebrow>
              <h2>What is your body asking you to notice?</h2>
            </div>
            <p>
              Symptoms are not a moral failure. They are information. Let’s slow down, look at the whole picture, and make the next faithful choice.
            </p>
          </div>

          <div className="pathway-grid">
            <Link to="/guides" className="pathway-card lime-card">
              <span className="card-number">01</span>
              <Sparkles aria-hidden="true" />
              <h3>Acne that keeps returning</h3>
              <p>Look beyond the surface and learn the questions that helped Annie stop chasing one more quick fix.</p>
              <span className="card-arrow"><ArrowUpRight aria-hidden="true" /></span>
            </Link>
            <Link to="/guides" className="pathway-card green-card">
              <span className="card-number">02</span>
              <Leaf aria-hidden="true" />
              <h3>Gut health that feels confusing</h3>
              <p>Build a calmer, more connected understanding of bloating, digestion, rhythms, and everyday foundations.</p>
              <span className="card-arrow"><ArrowUpRight aria-hidden="true" /></span>
            </Link>
            <Link to="/skincare" className="pathway-card cream-card">
              <span className="card-number">03</span>
              <Droplets aria-hidden="true" />
              <h3>A cleaner skincare routine</h3>
              <p>Choose products with more intention—without turning your bathroom into another source of fear or perfectionism.</p>
              <span className="card-arrow"><ArrowUpRight aria-hidden="true" /></span>
            </Link>
          </div>
        </div>
      </section>

      <section className="root-story dark-section section-pad">
        <div className="shell story-grid">
          <div className="story-image-wrap">
            <img src="/annie-ryan-formal.webp" alt="Annie and Ryan DeNome, hosts of Health in the Spirit" />
            <span className="image-caption">Annie + Ryan • Health in the Spirit</span>
          </div>
          <div className="story-copy">
            <Eyebrow light>My story</Eyebrow>
            <h2>“Our God is not a symptom God. He’s a root cause God.”</h2>
            <p>
              For years, I prayed for relief from cystic acne, painful bloating, constipation, and brain fog. I tried creams, food rules, antibiotics, and every new idea I could find. What changed was not one miracle product. It was finally seeing that the symptoms belonged to one story.
            </p>
            <p>
              Prayer stayed at the center. Better questions, comprehensive testing, daily consistency, and clean swaps gave that prayer a practical path forward.
            </p>
            <TextLink to="/about" light>Read Annie’s story</TextLink>
          </div>
        </div>
      </section>

      <section className="fresh-section section-pad">
        <div className="shell fresh-grid">
          <div className="fresh-editorial">
            <div className="editorial-rule" aria-hidden="true" />
            <Eyebrow>Fresh perspective</Eyebrow>
            <h2>never designed <em>to be fresh</em></h2>
            <p>
              We understand that fresh food carries a different kind of life. Annie’s skincare philosophy asks a simple question: why would the skin be separate from the rest of you?
            </p>
            <TextLink to="/skincare">Explore Annie’s skincare philosophy</TextLink>
          </div>
          <div className="fresh-cards">
            <article className="mini-feature">
              <span>Clean beauty</span>
              <h3>Crunchi</h3>
              <p>High-performing skincare and makeup with an ingredient-conscious approach.</p>
              <a href="https://crunchi.com/?als=AnnieDeNome" target="_blank" rel="noreferrer">
                Shop Annie’s link <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            </article>
            <article className="mini-feature mini-feature-dark">
              <span>Founding Partner</span>
              <h3>RINGANA</h3>
              <p>Fresh skincare at the center of Annie’s newest clean-beauty partnership.</p>
              <a href="https://www.instagram.com/her.holy.terrain/" target="_blank" rel="noreferrer">
                Ask Annie about RINGANA <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            </article>
          </div>
        </div>
      </section>

      <section className="guides-preview section-pad">
        <div className="shell">
          <div className="section-heading centered-heading">
            <Eyebrow>Guides are growing</Eyebrow>
            <h2>Clear help for the questions you keep carrying.</h2>
            <p>The first Annie B Wellness guides are being written now. Here is what is coming.</p>
          </div>
          <div className="guide-strip">
            {[
              ['Acne Clarity', 'Skin is a messenger—not the enemy.'],
              ['Clean Skincare', 'A calmer way to read labels and make swaps.'],
              ['Gut Foundations', 'Start with rhythms before chasing perfection.'],
            ].map(([title, text], index) => (
              <article key={title} className="guide-preview-card">
                <span>0{index + 1}</span>
                <BookOpen aria-hidden="true" />
                <h3>{title}</h3>
                <p>{text}</p>
                <small>COMING SOON</small>
              </article>
            ))}
          </div>
          <div className="center-link"><TextLink to="/guides">See all guide topics</TextLink></div>
        </div>
      </section>

      <section className="podcast-banner">
        <div className="shell podcast-inner">
          <div className="podcast-mark"><Podcast aria-hidden="true" /></div>
          <div>
            <Eyebrow light>Listen at the kitchen table</Eyebrow>
            <h2>Health in the Spirit</h2>
            <p>A Catholic health and wellness podcast with Annie and Dr. Ryan DeNome—rooted in Saints, Scripture, and the Catechism.</p>
          </div>
          <a className="button button-light" href="https://healthinthespirit.com/" target="_blank" rel="noreferrer">
            Listen now <ArrowUpRight size={17} aria-hidden="true" />
          </a>
        </div>
      </section>
    </>
  );
}

function About() {
  const beliefs = [
    ['Jesus first', 'Healing is never reduced to a protocol. Prayer, surrender, and the person of Jesus remain at the center.'],
    ['Whole-person context', 'Skin, gut, hormones, habits, emotions, relationships, and spiritual life are not separate compartments.'],
    ['Patient consistency', 'Lasting change is usually quieter than a quick fix. Small faithful choices matter more than perfect streaks.'],
  ];

  return (
    <>
      <section className="page-hero about-hero">
        <div className="shell page-hero-grid">
          <div className="page-hero-copy">
            <Eyebrow>Meet Annie DeNome</Eyebrow>
            <h1>This was never only about <em>clear skin.</em></h1>
            <p>
              It is about becoming more present to your life, more confident in the body God gave you, and more able to use your gifts with freedom.
            </p>
          </div>
          <div className="about-portrait-card">
            <img src="/annie-denome-portrait.webp" alt="Portrait of Annie DeNome" />
            <div>
              <span>THEOLOGY + PSYCHOLOGY</span>
              <strong>ROOT-CAUSE WELLNESS ADVOCATE</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="bio-section section-pad">
        <div className="shell bio-grid">
          <div>
            <Eyebrow>A little more of the story</Eyebrow>
            <h2>Thoughtful by training. Hopeful by grace. Practical by necessity.</h2>
          </div>
          <div className="long-copy">
            <p className="drop-cap">
              Annie is an Owensboro, Kentucky native, lifelong swimmer and triathlete, theologian, wife, and mom. Straight out of high school, she spent a year traveling the country with NET Ministries, sharing the Gospel with young people in parish halls, school gyms, and everywhere in between.
            </p>
            <p>
              At Franciscan University of Steubenville, she double-majored in Theology and Psychology—a combination that still shapes how she sees health: the interior life matters, the body matters, and neither one flourishes in isolation.
            </p>
            <p>
              Today, her work and advocacy bridge faith with practical human development. Through Annie B Wellness, she is turning a decade-long struggle with acne and gut symptoms into clear, compassionate education for women who are tired of guessing.
            </p>
          </div>
        </div>
      </section>

      <section className="journey-section section-pad">
        <div className="shell">
          <div className="section-heading centered-heading narrow-heading">
            <Eyebrow>The root-cause journey</Eyebrow>
            <h2>What looked like separate problems was one connected story.</h2>
          </div>
          <div className="journey-grid">
            <article>
              <span className="journey-number">01</span>
              <h3>The long guessing season</h3>
              <p>Acne began around age ten. Bloating, constipation, painful cycles, and brain fog followed. Food rules, creams, antibiotics, and new routines kept promising an answer.</p>
            </article>
            <article>
              <span className="journey-number">02</span>
              <h3>The questions changed</h3>
              <p>Comprehensive testing helped connect patterns that had been treated as isolated symptoms. The work shifted from throwing things at the surface to understanding context.</p>
            </article>
            <article>
              <span className="journey-number">03</span>
              <h3>The cross became a doorway</h3>
              <p>Prayer, clean products, gut support, and consistent habits became part of a slow healing story—one Annie now uses to make another woman’s path feel less lonely.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="beliefs-section dark-section section-pad">
        <div className="shell beliefs-grid">
          <div className="beliefs-intro">
            <Eyebrow light>What guides this work</Eyebrow>
            <h2>Faith and health were never meant to be strangers.</h2>
            <p>
              Caring for the body is not vanity. It is stewardship—never an attempt to control every outcome, but a response to the gift already entrusted to us.
            </p>
          </div>
          <div className="belief-list">
            {beliefs.map(([title, text], index) => (
              <article key={title}>
                <span>0{index + 1}</span>
                <div><h3>{title}</h3><p>{text}</p></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="life-notes section-pad">
        <div className="shell">
          <div className="section-heading split-heading">
            <div><Eyebrow>Beyond the wellness talk</Eyebrow><h2>The person behind the page.</h2></div>
            <p>Annie brings the same energy to wellness that she brings to faith and family: practical, joyful, grounded, and always ready to dive in.</p>
          </div>
          <div className="notes-grid">
            <div><span>01</span><strong>Forever near the water</strong><p>A lifelong swimmer and triathlete who will choose the beach, pool, or creek bed every time.</p></div>
            <div><span>02</span><strong>Family at the center</strong><p>Most sunny days are best spent outside with Ryan and their son, Joachim Giorgio.</p></div>
            <div><span>03</span><strong>At the kitchen table</strong><p>Co-host of <em>Health in the Spirit</em>, where Catholic tradition and modern wellness share one conversation.</p></div>
          </div>
        </div>
      </section>

      <section className="simple-cta">
        <div className="shell simple-cta-inner">
          <Heart aria-hidden="true" />
          <div><Eyebrow>Come as you are</Eyebrow><h2>You do not have to figure it all out today.</h2></div>
          <Link className="button button-primary" to="/guides">Find a place to begin</Link>
        </div>
      </section>
    </>
  );
}

function Skincare() {
  return (
    <>
      <section className="page-hero skincare-hero">
        <div className="shell skincare-hero-grid">
          <div className="skincare-visual" aria-hidden="true">
            <div className="bottle bottle-one" />
            <div className="bottle bottle-two" />
            <div className="bottle bottle-three" />
            <Leaf className="skincare-leaf" />
          </div>
          <div className="page-hero-copy">
            <Eyebrow>Clean beauty, calmer choices</Eyebrow>
            <h1>Skin is not separate from the <em>rest of you.</em></h1>
            <p>
              What you put on your skin should support the bigger work you are doing—not become one more cycle of fear, impulse, and disappointment.
            </p>
            <a className="button button-primary" href="#partners">Meet Annie’s partners <ArrowRight size={17} /></a>
          </div>
        </div>
      </section>

      <section className="inside-out section-pad">
        <div className="shell inside-out-grid">
          <div className="inside-out-title">
            <Eyebrow>The inside + outside approach</Eyebrow>
            <h2>Gut work on the inside. Clean products on the outside.</h2>
          </div>
          <div className="inside-out-copy">
            <p>
              Annie’s own before-and-after story was not built on skincare alone. Better root-cause direction helped her work on the internal patterns, while clean skincare and makeup helped calm the daily burden on the surface.
            </p>
            <p>
              The goal here is not a “perfect” routine. It is an honest one: fewer guesses, ingredients you feel good about, and products that fit the season your skin is actually in.
            </p>
          </div>
        </div>
        <div className="shell principle-row">
          <div><span>01</span><h3>Simplify first</h3><p>Before adding more, know what your routine already contains.</p></div>
          <div><span>02</span><h3>Watch the whole story</h3><p>Skin may reflect sleep, stress, digestion, hormones, environment, and habits.</p></div>
          <div><span>03</span><h3>Choose without fear</h3><p>Ingredient awareness should create clarity—not anxiety or perfectionism.</p></div>
        </div>
      </section>

      <section id="partners" className="partners-section section-pad">
        <div className="shell">
          <div className="section-heading centered-heading narrow-heading">
            <Eyebrow>Products Annie partners with</Eyebrow>
            <h2>Two clean-beauty paths, one intentional philosophy.</h2>
            <p>Annie may earn from qualifying purchases made through her partner links. Her partnership is disclosed so you can choose with clarity.</p>
          </div>

          <div className="partner-grid">
            <article className="partner-card crunchy-card">
              <div className="partner-topline"><span>CLEAN SKINCARE + MAKEUP</span><Sparkles aria-hidden="true" /></div>
              <h3>Crunchi</h3>
              <p className="partner-tagline">High-performing beauty for the ingredient-conscious woman.</p>
              <div className="partner-points">
                <span><Check size={15} /> Skincare and color cosmetics</span>
                <span><Check size={15} /> Annie’s established clean-beauty partner</span>
                <span><Check size={15} /> Direct partner shopping link</span>
              </div>
              <a className="button button-dark" href="https://crunchi.com/?als=AnnieDeNome" target="_blank" rel="noreferrer">
                Explore Crunchi <ArrowUpRight size={17} />
              </a>
            </article>

            <article className="partner-card ringana-card">
              <div className="partner-topline"><span>FRESH SKINCARE</span><Leaf aria-hidden="true" /></div>
              <h3>RINGANA</h3>
              <p className="partner-tagline">Annie’s newest partnership, centered on skincare made with a fresh-first mindset.</p>
              <div className="partner-points">
                <span><Check size={15} /> Annie is a Founding Partner</span>
                <span><Check size={15} /> A “fresh matters” product philosophy</span>
                <span><Check size={15} /> U.S. details and access rolling out</span>
              </div>
              <a className="button button-light" href="https://www.instagram.com/her.holy.terrain/" target="_blank" rel="noreferrer">
                Ask Annie about RINGANA <ArrowUpRight size={17} />
              </a>
            </article>
          </div>
        </div>
      </section>

      <section className="fresh-manifesto section-pad">
        <div className="shell manifesto-grid">
          <div className="manifesto-title">
            <span>FRESH PRODUCE</span><span>FRESH BREAD</span><span>FRESH COFFEE</span>
          </div>
          <div className="manifesto-copy">
            <Eyebrow>Why “fresh” matters to Annie</Eyebrow>
            <h2>“We know instinctively that fresh means more.”</h2>
            <p>
              We accept that fresh food does not sit unchanged for years. Annie’s RINGANA message invites that same common sense into skincare: what feeds the skin matters, and freshness is worth asking about.
            </p>
            <p className="source-note">This reflects Annie’s personal skincare philosophy, not a promise of individual results.</p>
          </div>
        </div>
      </section>

      <section className="routine-section section-pad">
        <div className="shell routine-grid">
          <div className="routine-intro"><Eyebrow>A gentle routine reset</Eyebrow><h2>Before buying one more bottle, pause here.</h2></div>
          <ol className="routine-list">
            <li><span>01</span><div><h3>Name your goal</h3><p>Are you trying to calm irritation, support the barrier, simplify makeup, or address a recurring pattern?</p></div></li>
            <li><span>02</span><div><h3>Inventory what you use</h3><p>List every cleanser, serum, active, moisturizer, makeup product, and spot treatment before adding anything new.</p></div></li>
            <li><span>03</span><div><h3>Change slowly</h3><p>One thoughtful swap is easier to understand than a complete overhaul you cannot evaluate.</p></div></li>
            <li><span>04</span><div><h3>Look beyond the bathroom</h3><p>If acne persists, skincare may be only one part of the conversation. Consider qualified support for the whole picture.</p></div></li>
          </ol>
        </div>
      </section>
    </>
  );
}

const guideTopics = [
  { icon: Sparkles, label: 'ACNE', title: 'The Acne Clarity Guide', text: 'A whole-picture framework for the questions, patterns, and next steps that can sit underneath recurring breakouts.', accent: 'lime' },
  { icon: Droplets, label: 'SKINCARE', title: 'The Clean Swap Guide', text: 'A less-overwhelming way to audit your routine, understand product roles, and make changes one at a time.', accent: 'cream' },
  { icon: Leaf, label: 'GUT HEALTH', title: 'Gut Foundations', text: 'Simple explanations of digestion, regularity, food patterns, stress, and the everyday rhythms worth noticing first.', accent: 'green' },
  { icon: Sprout, label: 'FOUNDATIONAL LABS', title: 'Test, Don’t Guess', text: 'Questions to bring to a qualified practitioner and plain-language context for common wellness conversations.', accent: 'ash' },
  { icon: Heart, label: 'FAITH + RHYTHMS', title: 'Stewardship Without Striving', text: 'Prayerful routines for caring for the body without turning wellness into fear, control, or perfectionism.', accent: 'dark' },
  { icon: BookOpen, label: 'EVERYDAY WELLNESS', title: 'The Simple Start Handbook', text: 'A practical workbook for choosing a focus, noticing progress, and building habits that can live in real family life.', accent: 'cream' },
];

function Guides() {
  return (
    <>
      <section className="page-hero guides-hero">
        <div className="shell guides-hero-inner">
          <Eyebrow>Resource library</Eyebrow>
          <h1>Guides for when you need a <em>clear next step.</em></h1>
          <p>
            No twenty-tab rabbit holes. No panic buying. Just thoughtful education, reflection prompts, and practical starting points—built slowly and responsibly.
          </p>
          <div className="guide-status"><span className="pulse-dot" /> First guides are in development</div>
        </div>
      </section>

      <section className="guides-library section-pad">
        <div className="shell guide-library-grid">
          {guideTopics.map((guide, index) => {
            const Icon = guide.icon;
            return (
              <article key={guide.title} className={`library-card ${guide.accent}`}>
                <div className="library-card-top"><span>0{index + 1}</span><Icon aria-hidden="true" /></div>
                <small>{guide.label}</small>
                <h2>{guide.title}</h2>
                <p>{guide.text}</p>
                <button type="button" className="coming-button" disabled>
                  Coming soon
                </button>
              </article>
            );
          })}
        </div>
      </section>

      <section className="guide-request section-pad">
        <div className="shell request-card">
          <div>
            <Eyebrow>Help shape the library</Eyebrow>
            <h2>What do you wish someone had explained sooner?</h2>
            <p>Send Annie the question you keep searching. Your note may help shape a future guide or podcast conversation.</p>
          </div>
          <a className="button button-primary" href="mailto:annie@healthinthespirit.com?subject=Annie%20B%20Wellness%20guide%20idea">
            Share a guide idea <ArrowRight size={17} />
          </a>
        </div>
      </section>

      <section className="guide-disclaimer">
        <div className="shell disclaimer-inner">
          <BookOpen aria-hidden="true" />
          <div><h2>Education, not a diagnosis.</h2><p>Guides will offer general education and questions to consider. They will not diagnose, prescribe, or replace a relationship with your own qualified healthcare professional.</p></div>
        </div>
      </section>
    </>
  );
}

function NotFound() {
  return (
    <section className="not-found section-pad">
      <div className="shell">
        <Eyebrow>404</Eyebrow>
        <h1>This page is still growing.</h1>
        <p>Let’s get you back to solid ground.</p>
        <Link className="button button-primary" to="/">Return home</Link>
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
