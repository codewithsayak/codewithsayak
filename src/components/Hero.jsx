import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowDownRight, ArrowUpRight, Asterisk, Plus } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SectionLink, useExperience } from '../hooks/ExperienceContext.jsx';
import { formatIndiaTime } from '../lib/utils.js';
import SculptureFallback from './SculptureFallback.jsx';

const Sculpture = lazy(() => import('./Sculpture.jsx'));

export function IndiaClock() {
  const [time, setTime] = useState(() => formatIndiaTime());
  useEffect(() => {
    const timer = setInterval(() => setTime(formatIndiaTime()), 30000);
    return () => clearInterval(timer);
  }, []);
  return <span>{time} <span className="muted">IST</span></span>;
}

export default function Hero() {
  const root = useRef(null);
  const { motion } = useExperience();

  useLayoutEffect(() => {
    if (!motion) return;
    const media = gsap.matchMedia();
    const context = gsap.context(() => {
      gsap.from('.hero-intro > *', { y: 18, opacity: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out', delay: 0.1 });
      gsap.from('.hero-line > span', { yPercent: 110, rotate: 3, duration: 1.2, stagger: 0.12, ease: 'power4.out', delay: 0.15 });
      gsap.from('.hero-description, .hero-actions', { y: 24, opacity: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out', delay: 0.6 });
      gsap.from('.hero-art', { opacity: 0, scale: 0.88, duration: 1.5, ease: 'power3.out', delay: 0.25 });
      gsap.from('.hero-bottom', { opacity: 0, duration: 1, delay: 1 });
      media.add('(min-width: 801px)', () => {
        gsap.to('.hero-copy', { y: 95, opacity: 0.25, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom 15%', scrub: 1 } });
        gsap.to('.hero-art', { y: 135, rotation: 9, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: 1.2 } });
      });
    }, root);
    return () => { media.revert(); context.revert(); };
  }, [motion]);

  return (
    <section id="top" className="hero page-width" ref={root} aria-labelledby="hero-title">
      <div className="hero-intro micro"><span><span className="tiny-cross">+</span> INDEPENDENT FRONTEND DEVELOPER</span><span>PORTFOLIO — VOL. 02 <span className="muted">/ 2026</span></span></div>
      <div className="hero-main">
        <div className="hero-copy">
          <div className="availability"><span className="status-dot" /> Open to good conversations</div>
          <h1 id="hero-title"><span className="hero-line"><span>Code with</span></span><span className="hero-line serif-line"><span>character<span className="hero-period">.</span></span></span></h1>
          <p className="hero-description">I’m <strong>Sayak Karmakar.</strong> I turn thoughtful ideas into expressive digital experiences. A little logic. A lot of feeling.</p>
          <div className="hero-actions"><SectionLink to="work" className="button button-primary">Explore my work <ArrowDownRight size={19} /></SectionLink><SectionLink to="about" className="text-link">Meet the maker <ArrowUpRight size={16} /></SectionLink></div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="art-grid" />
          <span className="art-coordinate micro"><Plus size={12} /> EXPERIMENT № 001</span>
          <div className="sculpture-shadow" />
          <Suspense fallback={<SculptureFallback />}><Sculpture motion={motion} /></Suspense>
          <div className="art-caption micro"><span className="caption-line" /> A STUDY IN BALANCE</div>
          <div className="orbit-badge"><svg viewBox="0 0 110 110" className="badge-text"><defs><path id="badge-circle" d="M55,55 m-41,0 a41,41 0 1,1 82,0 a41,41 0 1,1 -82,0" /></defs><text><textPath href="#badge-circle" textLength="255">DESIGN WITH INTENT · BUILD WITH CARE · </textPath></text></svg><Asterisk size={37} strokeWidth={1.2} /></div>
          <span className="art-interaction micro">MOVE YOUR CURSOR. FIND A NEW PERSPECTIVE.</span>
        </div>
      </div>
      <div className="hero-bottom micro"><span className="hero-location"><span className="location-dot" /> DURGPUR, INDIA <span className="muted">/</span> <IndiaClock /></span><span className="hero-remote">LOCAL ROOTS. GLOBAL REACH.</span><SectionLink to="work" className="scroll-cue">SCROLL TO DISCOVER <span><ArrowDown size={15} /></span></SectionLink></div>
    </section>
  );
}

export function Marquee() {
  const root = useRef(null);
  const { motion } = useExperience();
  useLayoutEffect(() => {
    if (!motion) return;
    const context = gsap.context(() => {
      gsap.fromTo('.marquee-track', { xPercent: 0 }, { xPercent: -17, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: 1.4 } });
    }, root);
    return () => context.revert();
  }, [motion]);
  return <div className="marquee" ref={root} aria-hidden="true"><div className="marquee-track">{[0, 1, 2].map((item) => <div className="marquee-group" key={item}><span>THOUGHTFUL DESIGN</span><Asterisk /><span className="serif">Expressive code</span><Asterisk /><span>HUMAN EXPERIENCES</span><Asterisk /></div>)}</div></div>;
}
