import React, { useEffect, useState } from "react";

const programs = [
  {
    number: "01",
    title: "A listening ear",
    description:
      "One-to-one conversations with a caring guide, at your pace and on your terms.",
    label: "PERSONAL SUPPORT",
  },
  {
    number: "02",
    title: "A place to belong",
    description:
      "Small, welcoming circles where we make room for the real, messy, hopeful stuff.",
    label: "COMMUNITY CIRCLES",
  },
  {
    number: "03",
    title: "Tools for the everyday",
    description:
      "Gentle, practical ways to build steadier routines and care for your whole self.",
    label: "WELLBEING WORKSHOPS",
  },
];

const rooms = [
  {
    title: "When the day feels loud",
    text: "You want somewhere quiet to set things down, without having to explain yourself perfectly.",
  },
  {
    title: "When you look after everyone else",
    text: "The steady ones need a place that asks how they are, too. You can put the role down for a while.",
  },
  {
    title: "When you want steadier ground",
    text: "Not a total life overhaul. Just a few kinder rhythms you can actually keep.",
  },
  {
    title: "When you want company",
    text: "Small circles for the real, unfinished, hopeful parts of being a person.",
  },
];

const notes = [
  {
    quote: "I didn’t have to arrive with a neat story. There was simply room.",
    initials: "A",
  },
  {
    quote: "It felt less like being assessed, and more like being met.",
    initials: "M",
  },
  {
    quote: "I left with one small thing I could try. That was enough for the day.",
    initials: "S",
  },
];

const breathCycle = [
  { key: "inhale", label: "Breathe in", ms: 4000 },
  { key: "hold", label: "Hold gently", ms: 4000 },
  { key: "exhale", label: "Breathe out", ms: 6000 },
];

const faqs = [
  {
    question: "Do I need to be in crisis to reach out?",
    answer:
      "Not at all. You can connect with us when things feel hard, when you feel a little stuck, or simply when you want to take better care of yourself. There is no threshold you have to meet.",
  },
  {
    question: "What happens after I get in touch?",
    answer:
      "A member of our team will get back to you within two working days. We will listen, learn what you are looking for, and talk through a next step together. There is no pressure to commit to anything.",
  },
  {
    question: "Is your support confidential?",
    answer:
      "We treat every conversation with care and respect. Before we begin, our team will explain how your information is used and the limits of confidentiality, so you can make an informed choice.",
  },
];

function Icon({ name, size = 22 }) {
  const shared = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  if (name === "arrow") {
    return (
      <svg {...shared}>
        <path d="M4.5 12h14M12.5 5.5l6.5 6.5-6.5 6.5" />
      </svg>
    );
  }
  return null;
}

function Brand({ inverse = false }) {
  return (
    <a className={`brand${inverse ? " brand-inverse" : ""}`} href="#home" aria-label="SERÈNEA home">
      <span className="brand-mark" aria-hidden="true">
        <svg className="brand-leaf" viewBox="0 0 24 24" fill="none">
          <path className="leaf-stem" d="M12 20.5V11" />
          <path className="leaf-soft" d="M12 15.2c-.6-3.4-3.2-5.4-7-5.4.2 4.2 2.8 6.6 7 6.8Z" />
          <path className="leaf-fill" d="M12 12.4c.8-3.6 3.8-6 7.6-6.2-.2 4.4-3 7-7.6 7.4Z" />
        </svg>
      </span>
      <span className="brand-word">SERÈNEA</span>
    </a>
  );
}

let hasTrackedPageView = false;
const trackedSections = new Set();

function BloomDoodle({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 84"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M32 39c0 11-2 23 1 39"
        stroke="var(--bloom-leaf, #83947c)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M32 60c-9-1-12-7-12-11 7 0 12 4 12 11Zm1 9c8-1 12-6 12-11-7 0-12 4-12 11Z"
        fill="var(--bloom-leaf, #83947c)"
        fillOpacity=".72"
      />
      <g transform="translate(32 29)" stroke="var(--bloom-center, #c59b58)" strokeWidth="1">
        <ellipse cy="-11" rx="5.5" ry="9" fill="var(--bloom-petal, #e8c99a)" />
        <ellipse cy="-11" rx="5.5" ry="9" transform="rotate(60)" fill="var(--bloom-petal, #e8c99a)" />
        <ellipse cy="-11" rx="5.5" ry="9" transform="rotate(120)" fill="var(--bloom-petal, #e8c99a)" />
        <ellipse cy="-11" rx="5.5" ry="9" transform="rotate(180)" fill="var(--bloom-petal, #e8c99a)" />
        <ellipse cy="-11" rx="5.5" ry="9" transform="rotate(240)" fill="var(--bloom-petal, #e8c99a)" />
        <ellipse cy="-11" rx="5.5" ry="9" transform="rotate(300)" fill="var(--bloom-petal, #e8c99a)" />
        <circle r="5.5" fill="var(--bloom-center, #c59b58)" />
      </g>
    </svg>
  );
}

function recordSiteEvent(event, target) {
  const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://127.0.0.1:8000" : "");

  fetch(`${apiUrl}/api/analytics/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event, target }),
    keepalive: true,
  }).then((response) => {
    if (!response.ok) {
      console.error(`Website analytics request failed with status ${response.status}.`);
    }
  }).catch((error) => {
    console.error("Website analytics could not reach the metrics API.", error);
  });
}

const sectionTargets = ["welcome", "about", "programs", "resources", "pause", "notes", "faq", "contact"];

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const [whatsappUrl, setWhatsappUrl] = useState("");
  const [breathing, setBreathing] = useState(false);
  const [breathPhase, setBreathPhase] = useState(0);

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    if (!hasTrackedPageView) {
      hasTrackedPageView = true;
      recordSiteEvent("page_view", "home");
    }

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const target = entry.target.id;
        if (entry.isIntersecting && !trackedSections.has(target)) {
          trackedSections.add(target);
          recordSiteEvent("section_view", target);
        }
      }
    }, { threshold: 0.1 });

    sectionTargets.forEach((id) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });

    const handleClick = (event) => {
      const element = event.target instanceof Element ? event.target : null;
      const control = element?.closest("[data-analytics]");
      if (control) {
        recordSiteEvent(control.dataset.analytics, control.dataset.target);
      }
    };

    document.addEventListener("click", handleClick);
    return () => {
      observer.disconnect();
      document.removeEventListener("click", handleClick);
    };
  }, []);

  useEffect(() => {
    if (!breathing) return undefined;
    let index = 0;
    let timer;
    const tick = () => {
      setBreathPhase(index);
      timer = window.setTimeout(() => {
        index = (index + 1) % breathCycle.length;
        tick();
      }, breathCycle[index].ms);
    };
    tick();
    return () => window.clearTimeout(timer);
  }, [breathing]);

  function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const message = [
      "Hello SERÈNEA,",
      "",
      `My name is ${formData.get("name")}.`,
      `My email is ${formData.get("email")}.`,
      "",
      formData.get("message"),
    ].join("\n");
    setWhatsappUrl(
      `https://wa.me/254741148048?text=${encodeURIComponent(message)}`,
    );
  }

  return (
    <>
      <div className="announcement" id="home">
        <span className="announcement-spark" aria-hidden="true">✦</span>
        You don’t have to figure it out alone.
        <a href="#contact" data-analytics="cta_click" data-target="announcement_contact">Let’s take the next step <Icon name="arrow" size={14} /></a>
        <span className="announcement-spark" aria-hidden="true">✦</span>
      </div>

      <header className="site-header">
        <div className="header-inner">
          <Brand />
          <button
            className="menu-toggle"
            type="button"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span />
            <span />
          </button>
          <nav className={menuOpen ? "main-nav nav-open" : "main-nav"} aria-label="Main navigation">
            <a href="#about" onClick={closeMenu}>Our approach</a>
            <a href="#programs" onClick={closeMenu}>How we help</a>
            <a href="#resources" onClick={closeMenu}>A little guidance</a>
            <a className="nav-cta" href="#contact" onClick={closeMenu} data-analytics="cta_click" data-target="header_contact">
              Say Hello <Icon name="arrow" size={16} />
            </a>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <span className="eyebrow"><span className="eyebrow-dot" /> A LITTLE ROOM TO FEEL LIKE YOU</span>
            <h1 id="hero-title">A softer place<br />to <em>land.</em></h1>
            <p className="hero-intro">
              Life can feel like a lot. We’re here to make finding support feel a little less
              overwhelming — and a lot more human.
            </p>
            <div className="hero-actions">
              <a className="button button-dark" href="#programs" data-analytics="cta_click" data-target="hero_programs">
                Find your next step <Icon name="arrow" size={17} />
              </a>
              <a className="text-link" href="#about" data-analytics="cta_click" data-target="hero_about">Get to know us <span>↓</span></a>
            </div>
            <div className="hero-note">
              <p>A little support can make<br />a world of difference.</p>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-art">
              <img
                src="/hero-illustration.png"
                alt="Illustration of a woman with a flower, with gentle reminders to breathe and grow"
                fetchPriority="high"
              />
            </div>
          </div>
          <div className="hero-decoration" aria-hidden="true">
            <svg viewBox="0 0 32 32" width="28" height="28">
              <path d="M16 2.5 18.2 12 28 16l-9.8 4L16 29.5 13.8 20 4 16l9.8-4L16 2.5Z" />
            </svg>
          </div>
        </section>

        <section className="trust-strip" aria-label="Our values">
          <span>Come as you are</span><i aria-hidden="true">✿</i><span>Go at your own pace</span><i aria-hidden="true">✿</i><span>Find your people</span><i aria-hidden="true">✿</i><span>Feel a little more you</span>
        </section>

        <section className="welcome-section section-wrap full-width-band band-white" id="welcome" aria-labelledby="welcome-title">
          <div className="section-heading welcome-heading">
            <div>
              <span className="eyebrow eyebrow-dark">WHOEVER YOU ARE TODAY</span>
              <h2 id="welcome-title">You don’t have to arrive with the <em>right words.</em></h2>
            </div>
            <p>SERÈNEA is a small room for real life. Come in the middle of a hard week, or on an ordinary Tuesday.</p>
          </div>
          <div className="room-grid">
            {rooms.map((room) => (
              <article className="room-card" key={room.title}>
                <h3>{room.title}</h3>
                <p>{room.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="intro-section section-wrap full-width-band band-gold" id="about">
          <div className="intro-heading">
            <span className="eyebrow eyebrow-dark">A NOTE FROM US</span>
            <h2>Care that sees<br />the <em>whole</em> you.</h2>
          </div>
          <div className="intro-body">
            <p className="intro-lead">
              Wellbeing isn’t a straight line. And support shouldn’t be one-size-fits-all.
            </p>
            <p>
              SERÈNEA is a mental health foundation rooted in something simple: people do
              better when they feel seen, supported, and connected. We create welcoming ways
              to explore what feeling well can look like for you.
            </p>
            <a className="underlined-link" href="#programs">A little more about how we help <Icon name="arrow" size={16} /></a>
          </div>
          <div className="intro-stamp" aria-hidden="true"><span>HERE FOR<br />THE HUMAN<br />IN ALL OF US</span><BloomDoodle className="bloom-doodle stamp-bloom" /></div>
        </section>

        <section className="programs-section" id="programs">
          <div className="section-wrap">
            <div className="section-heading">
              <div>
                <span className="eyebrow eyebrow-dark">THERE’S NO ONE RIGHT WAY</span>
                <h2>Support, your <em>way.</em></h2>
              </div>
              <p>Start where you are. We’ll figure out the rest together <span aria-hidden="true">♡</span></p>
            </div>
            <div className="program-grid">
              {programs.map((program) => (
                <article className="program-card" key={program.number}>
                  <div className="program-card-top">
                    <BloomDoodle className="bloom-doodle card-bloom" />
                    <span className="program-number">{program.number}</span>
                  </div>
                  <span className="program-label">{program.label}</span>
                  <h3>{program.title}</h3>
                  <p>{program.description}</p>
                  <a href="#contact" className="card-link" data-analytics="cta_click" data-target={`support_${program.number}`}>
                    Ask us about {program.title} <Icon name="arrow" size={17} />
                  </a>
                </article>
              ))}
            </div>
            <div className="programs-footnote">
              <span className="footnote-star">✳</span>
              <p>Not sure what fits? That’s a perfectly good place to start.</p>
              <a href="#contact" data-analytics="cta_click" data-target="programs_contact">Talk it through <Icon name="arrow" size={15} /></a>
            </div>
          </div>
        </section>

        <section className="path-section section-wrap full-width-band band-gold" id="resources">
          <div className="path-illustration" aria-hidden="true">
            <div className="path-sun">☼</div>
            <div className="path-line" />
            <div className="path-flower flower-one">✿</div>
            <div className="path-flower flower-two">✳</div>
            <div className="path-note">One small<br />step counts.</div>
          </div>
          <div className="path-content">
            <span className="eyebrow eyebrow-dark">NO PRESSURE. NO PERFECT PLAN.</span>
            <h2>Start small.<br /><em>Start here.</em></h2>
            <p>
              Reaching out doesn’t have to mean having all the answers. It can just mean
              opening a door and seeing how it feels.
            </p>
            <ol className="path-steps">
              <li><span>01</span><div><strong>Tell us a little</strong><small>Share what’s on your mind — only what you’re comfortable with.</small></div></li>
              <li><span>02</span><div><strong>We’ll listen first</strong><small>A real person will get back to you and hear what you need.</small></div></li>
              <li><span>03</span><div><strong>Choose what feels right</strong><small>Explore a next step together, at a pace that feels like yours.</small></div></li>
            </ol>
            <a href="#contact" className="button button-dark" data-analytics="cta_click" data-target="resources_contact">Take the first step <Icon name="arrow" size={17} /></a>
          </div>
        </section>

        <section className="pause-section section-wrap full-width-band band-white" id="pause" aria-labelledby="pause-title">
          <div className="pause-copy">
            <span className="eyebrow eyebrow-dark">A MINUTE YOU CAN KEEP</span>
            <h2 id="pause-title">One quiet minute, <em>right here.</em></h2>
            <p>
              Follow the circle if you like: in for four, hold for four, out for six.
              Or simply watch. This is a pause, not treatment, and not a substitute for care.
            </p>
            <button
              className="button button-dark"
              type="button"
              aria-pressed={breathing}
              onClick={() => setBreathing((active) => !active)}
              data-analytics="cta_click"
              data-target={breathing ? "pause_stop" : "pause_start"}
            >
              {breathing ? "Rest the circle" : "Begin a quiet minute"}
            </button>
          </div>
          <div className="pause-stage">
            <div
              className={`breath-orb breath-${breathing ? breathCycle[breathPhase].key : "idle"}`}
              aria-hidden="true"
            />
            <p className="breath-label" aria-live="polite">
              {breathing ? breathCycle[breathPhase].label : "Ready when you are"}
            </p>
          </div>
        </section>

        <section className="quote-band">
          <span className="quote-mark" aria-hidden="true">“</span>
          <blockquote>You don’t need to have it all figured out<br className="desktop-break" /> to deserve a little support.</blockquote>
          <span className="quote-flower" aria-hidden="true">✳</span>
        </section>

        <section className="notes-section section-wrap full-width-band band-white" id="notes" aria-labelledby="notes-title">
          <div className="notes-heading">
            <span className="eyebrow eyebrow-dark">A FEEL FOR THE ROOM</span>
            <h2 id="notes-title">The kind of ease we hope you <em>notice.</em></h2>
            <p>These are the feelings we design for. They are not reviews, and they are not promises.</p>
          </div>
          <div className="notes-grid">
            {notes.map((note) => (
              <figure className="note-card" key={note.initials}>
                <BloomDoodle className="bloom-doodle note-bloom" />
                <blockquote>“{note.quote}”</blockquote>
                <figcaption>
                  <span aria-hidden="true">{note.initials}</span>
                  A feeling we keep in mind
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="faq-section section-wrap full-width-band band-white" id="faq">
          <div className="faq-intro">
            <span className="eyebrow eyebrow-dark">GOOD THINGS TO KNOW</span>
            <h2>A few things<br />you might be <em>wondering.</em></h2>
            <p>Still have a question? We’re always happy to hear from you.</p>
            <a className="underlined-link" href="#contact" data-analytics="cta_click" data-target="faq_contact">Ask us anything <Icon name="arrow" size={16} /></a>
          </div>
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <article className={`faq-item${openFaq === index ? " faq-open" : ""}`} key={faq.question}>
                <h3>
                  <button
                    type="button"
                    aria-expanded={openFaq === index}
                    onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                  >
                    {faq.question}<span className="faq-toggle">{openFaq === index ? "−" : "+"}</span>
                  </button>
                </h3>
                {openFaq === index && <p>{faq.answer}</p>}
              </article>
            ))}
          </div>
        </section>

        <section className="contact-section" id="contact">
          <div className="contact-sprig sprig-left" aria-hidden="true">✿</div>
          <div className="contact-card">
            <div className="contact-copy">
              <span className="eyebrow eyebrow-dark">A GOOD PLACE TO BEGIN</span>
              <h2>Let’s start with<br /><em>hello.</em></h2>
              <p>
                Whatever brought you here, we’re glad you found us. Share a little about
                what’s on your mind and we’ll prepare a note for our WhatsApp. You can
                review it before you decide whether to send.
              </p>
              <div className="contact-promise"><span>♡</span><span>Just a conversation.<br /><strong>No pressure, ever.</strong></span></div>
            </div>
            <div className="contact-form-wrap">
              {whatsappUrl ? (
                <div className="form-success" role="status">
                  <span className="success-flower">✿</span>
                  <h3>Your note is ready.</h3>
                  <p>Your message is ready for WhatsApp. Review it there, then tap Send only if and when you feel ready.</p>
                  <a
                    className="button button-dark"
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-analytics="whatsapp_open"
                    data-target="contact_whatsapp"
                  >
                    Open WhatsApp <Icon name="arrow" size={17} />
                  </a>
                  <button className="form-edit-button" type="button" onClick={() => setWhatsappUrl("")} data-analytics="cta_click" data-target="form_edit">Edit your note <Icon name="arrow" size={16} /></button>
                </div>
              ) : (
                <form className="contact-form" onSubmit={handleSubmit} onChange={() => setWhatsappUrl("")}>
                  <label htmlFor="name">Your name</label>
                  <input id="name" name="name" type="text" autoComplete="name" placeholder="What should we call you?" maxLength="120" required />
                  <label htmlFor="email">Email address</label>
                  <input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" maxLength="254" required />
                  <label htmlFor="message">What’s on your mind?</label>
                  <textarea id="message" name="message" rows="3" placeholder="Share only what feels comfortable..." maxLength="5000" required />
                  <button className="button button-dark form-submit" type="submit" data-analytics="cta_click" data-target="form_preview">
                    Preview WhatsApp message <Icon name="arrow" size={17} />
                  </button>
                  <p className="privacy-note">Nothing is sent from this form. Your note opens in WhatsApp so you can review it first.</p>
                </form>
              )}
            </div>
          </div>
          <div className="contact-sprig sprig-right" aria-hidden="true">✳</div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-main">
          <div className="footer-brand">
            <Brand inverse />
            <p>A softer place to land.<br />A little more room to grow.</p>
          </div>
          <div className="footer-note">
            <span className="eyebrow">HERE FOR THE WHOLE YOU</span>
            <p>Small steps, kind people,<br />and care that meets you where you are.</p>
          </div>
          <div className="footer-links">
            <a href="#about">Our approach</a>
            <a href="#programs">How we help</a>
            <a href="#resources">Getting started</a>
            <a href="#contact">Get in touch</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} SERÈNEA Foundation. Made with care.</span>
          <p>If you or someone else is in immediate danger, contact your local emergency services. SERÈNEA is not a crisis or emergency service.</p>
        </div>
      </footer>
    </>
  );
}

export default App;
