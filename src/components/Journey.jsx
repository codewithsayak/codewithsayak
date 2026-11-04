import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUpRight, Asterisk, GitCommitHorizontal } from 'lucide-react';
import gsap from 'gsap';
import { journey, profile } from '../../shared/portfolio.js';
import { SectionLink, useExperience } from '../hooks/ExperienceContext.jsx';

function Activity() {
  const [activity, setActivity] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/activity', { signal: controller.signal })
      .then((response) => { if (!response.ok) throw new Error('Unavailable'); return response.json(); })
      .then(setActivity)
      .catch((cause) => { if (cause.name !== 'AbortError') setError(true); });
    return () => controller.abort();
  }, []);

  const formatDate = (date) => new Intl.DateTimeFormat('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`));

  return (
    <div className="activity-panel" data-reveal>
      <div className="activity-summary">
        <span className="micro"><GitCommitHorizontal size={17} /> LEARNING IN PUBLIC</span>
        <p><strong>{activity?.total ?? '—'}</strong><span>public contributions<br />in a year of showing up.</span></p>
        <a href={`${profile.social.github}?tab=overview`} target="_blank" rel="noopener noreferrer" className="text-link">The live picture <ArrowUpRight size={14} /></a>
      </div>
      <div className="activity-chart-wrap">
        {activity ? <>
          <div className="activity-scroll" tabIndex={0} role="region" aria-label="GitHub contribution calendar, October 2025 to October 2026">
            <div className="activity-chart" role="img" aria-label={`${activity.total} public contributions in the snapshot ending ${formatDate(activity.capturedAt)}`}>
              {activity.weeks.map((week, index) => (
                <div className="activity-week" key={index}>
                  {week.contributionDays.map((day) => <span key={day.date} className={`activity-day level-${Math.min(day.count, 4)}`} title={`${day.date}: ${day.count} contribution${day.count === 1 ? '' : 's'}`} />)}
                </div>
              ))}
            </div>
          </div>
          <div className="activity-dates micro">
            <span>{formatDate(activity.weeks[0].contributionDays[0].date)}</span>
            <span>SNAPSHOT · {formatDate(activity.capturedAt)}</span>
            <span>{formatDate(activity.capturedAt)}</span>
          </div>
        </> : <div className="activity-placeholder">
          {error ? <p>The snapshot is unavailable. <a href={profile.social.github} target="_blank" rel="noopener noreferrer">Explore my GitHub instead <ArrowUpRight size={13} /></a></p> : <p>Gathering the little steps…</p>}
        </div>}
        <p className="activity-note">Real public activity, not a live counter. Small steps still count.</p>
      </div>
    </div>
  );
}

// Decorative chapter illustrations. The actual story stays in semantic HTML,
// so the horizontal choreography never hides content from assistive technology.
function JourneyArt({ index }) {
  if (index === 0) return (
    <div className="journey-art-inner code-art" aria-hidden="true">
      <div className="code-art-window">
        <div className="code-art-bar"><span className="browser-dots"><i /><i /><i /></span><span>the-first-line.js</span></div>
        <div className="code-art-lines">
          <span><i>01</i><b>// It starts with a little curiosity.</b></span>
          <span><i>02</i><em>const</em> idea = <strong>'Hello, world!'</strong>;</span>
          <span><i>03</i>console.<em>log</em>(idea);<i className="code-caret" /></span>
        </div>
        <div className="code-art-footer"><span className="status-dot" /> A SMALL BEGINNING. A BIG POSSIBILITY.</div>
      </div>
      <span className="code-art-tag">&lt;hello-world /&gt;</span>
    </div>
  );
  if (index === 1) return (
    <div className="journey-art-inner logic-art" aria-hidden="true">
      <span className="logic-square square-one" /><span className="logic-square square-two" /><span className="logic-square square-three" />
      <span className="logic-center">JS<span>ONE IDEA DEEPER</span></span>
      <span className="logic-note micro">CURIOSITY → PRACTICE → REPEAT</span>
    </div>
  );
  if (index === 2) return (
    <div className="journey-art-inner commit-art" aria-hidden="true">
      <div className="commit-thread" />
      {['Make the first commit.', 'Keep showing up.', 'Share the process.'].map((label, commitIndex) => (
        <div className={`commit-row commit-row-${commitIndex}`} key={label}>
          <span className="commit-node"><GitCommitHorizontal size={17} /></span>
          <div><span className="micro">{['THE BEGINNING', 'THE HABIT', 'THE COMMUNITY'][commitIndex]}</span><strong>{label}</strong></div>
          <Asterisk size={17} strokeWidth={1.2} />
        </div>
      ))}
    </div>
  );
  return (
    <div className="journey-art-inner shipping-art" aria-hidden="true">
      <div className="shipping-window">
        <div className="shipping-bar"><span className="browser-dots"><i /><i /><i /></span><span>made with care</span><ArrowUpRight size={11} /></div>
        <div className="shipping-page"><span className="micro">A LITTLE LOGIC. A LOT OF FEELING.</span><strong>Code with<br /><em>character.</em></strong><span className="shipping-pill">Made to feel different <ArrowUpRight size={12} /></span></div>
      </div>
      <span className="shipping-stamp"><Asterisk size={25} strokeWidth={1.2} /><span>ALWAYS<br />EVOLVING</span></span>
    </div>
  );
}

export default function Journey() {
  const root = useRef(null);
  const cinema = useRef(null);
  const pin = useRef(null);
  const viewport = useRef(null);
  const track = useRef(null);
  const counter = useRef(null);
  const { motion } = useExperience();

  useLayoutEffect(() => {
    if (!motion) return undefined;
    const media = gsap.matchMedia();

    // Only pin where the complete chapter and its controls fit. Touch-sized
    // viewports, short windows, and reduced-motion visitors get the same story
    // in a natural vertical layout. Vertical scrolling is never intercepted.
    media.add('(min-width: 1000px) and (min-height: 650px)', () => {
      const section = root.current;
      section.classList.add('is-cinematic');
      const distance = () => Math.max(0, track.current.scrollWidth - viewport.current.clientWidth);
      let chapter = 0;
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: cinema.current,
          pin: pin.current,
          start: 'top 88px',
          end: () => `+=${distance() * 1.05}`,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const next = Math.min(journey.length - 1, Math.floor(self.progress * journey.length));
            if (next !== chapter) {
              chapter = next;
              if (counter.current) counter.current.textContent = String(next + 1).padStart(2, '0');
            }
          },
        },
      });

      timeline.to(track.current, { x: () => -distance(), ease: 'none', duration: 1 }, 0);
      timeline.fromTo('.journey-progress-fill', { scaleX: 0 }, { scaleX: 1, ease: 'none', duration: 1 }, 0);
      gsap.utils.toArray('.journey-art-inner', track.current).forEach((art, index) => {
        timeline.fromTo(art, { rotation: -5, scale: 0.94 }, { rotation: 3, scale: 1, ease: 'none', duration: 0.34 }, index * 0.2);
      });
      gsap.utils.toArray('.journey-year', track.current).forEach((year) => {
        timeline.fromTo(year, { xPercent: 10 }, { xPercent: -10, ease: 'none', duration: 1 }, 0);
      });

      return () => {
        section.classList.remove('is-cinematic');
        if (counter.current) counter.current.textContent = '01';
      };
    });

    return () => media.revert();
  }, [motion]);

  return (
    <section id="journey" className="journey-section section-space" ref={root} aria-labelledby="journey-title">
      <div className="journey-cinema" ref={cinema}>
        <div className="journey-pin" ref={pin}>
          <div className="page-width">
            <div className="section-heading journey-heading">
              <div><p className="eyebrow"><span>04</span> ALWAYS IN PROGRESS</p><h2 id="journey-title">The journey is<br /><span className="serif">part of the work.</span></h2></div>
              <p className="section-description">No overnight success story.<br />Just curiosity, consistency, and a growing body of work.</p>
            </div>
            <div className="journey-viewport" ref={viewport}>
              <div className="journey-track" ref={track}>
                {journey.map((item, index) => (
                  <article className={`journey-step journey-tone-${index}`} key={item.year} aria-labelledby={`journey-step-${index}`}>
                    <span className="journey-year" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                    <div className="journey-step-copy">
                      <p className="micro journey-step-date"><span>{item.year}</span><span>CHAPTER 0{index + 1}</span></p>
                      <h3 id={`journey-step-${index}`}>{item.title}</h3>
                      <p>{item.text}</p>
                      <span className="journey-step-note micro">{['EVERY MAKER STARTS SOMEWHERE.', 'LEARN BY MAKING SOMETHING.', 'BETTER WHEN IT’S SHARED.', 'THE NEXT CHAPTER IS UNWRITTEN.'][index]}</span>
                    </div>
                    <div className="journey-art"><JourneyArt index={index} /></div>
                  </article>
                ))}
              </div>
            </div>
            <div className="journey-progress">
              <span className="micro"><span ref={counter}>01</span><span className="muted"> / 04</span></span>
              <div className="journey-progress-rail" aria-hidden="true"><span className="journey-progress-fill" /></div>
              <span className="micro journey-scroll-hint">KEEP SCROLLING. THE STORY MOVES WITH YOU. <ArrowDown size={13} /></span>
              <SectionLink to="activity" className="text-link journey-skip">Skip to the build log <ArrowDown size={13} /></SectionLink>
            </div>
          </div>
        </div>
      </div>
      <div id="activity" className="page-width activity-anchor"><Activity /></div>
    </section>
  );
}
