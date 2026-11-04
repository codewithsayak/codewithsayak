import { useEffect, useLayoutEffect, useState } from 'react';
import { Check, Asterisk } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ExperienceProvider, useExperience } from './hooks/ExperienceContext.jsx';
import Header from './components/Header.jsx';
import Hero, { Marquee } from './components/Hero.jsx';
import Work, { ProjectDialog } from './components/Work.jsx';
import About from './components/About.jsx';
import Playground from './components/Playground.jsx';
import Journey from './components/Journey.jsx';
import Contact, { ContactDialog } from './components/Contact.jsx';

gsap.registerPlugin(ScrollTrigger);

function Portfolio() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [contactOpen, setContactOpen] = useState(false);
  const { motion, toast, scrollTo } = useExperience();

  useLayoutEffect(() => {
    if (!motion) return;
    const context = gsap.context(() => {
      gsap.utils.toArray('[data-reveal]').forEach((element) => {
        gsap.from(element, { y: 35, opacity: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: element, start: 'top 92%', once: true } });
      });
    });
    let cancelled = false;
    document.fonts.ready.then(() => { if (!cancelled) ScrollTrigger.refresh(); });
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener('load', onLoad);
    return () => { cancelled = true; window.removeEventListener('load', onLoad); context.revert(); };
  }, [motion]);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const timer = setTimeout(() => scrollTo(hash, false), 250);
    return () => clearTimeout(timer);
  }, []);

  return <><a className="skip-link" href="#main-content">Skip to content</a><Header /><main id="main-content"><Hero /><Marquee /><Work onSelect={setSelectedProject} /><About /><Playground /><Journey /><Contact onContact={() => setContactOpen(true)} /></main><div className={`toast ${toast ? 'visible' : ''}`} role="status" aria-live="polite">{toast && <><Check size={17} /><span>{toast}</span></>}</div><div className="page-edge-note" aria-hidden="true"><Asterisk size={12} /> DESIGNED TO FEEL DIFFERENT.</div>{selectedProject && <ProjectDialog project={selectedProject} onClose={() => setSelectedProject(null)} />}{contactOpen && <ContactDialog onClose={() => setContactOpen(false)} />}</>;
}

export default function App() {
  return <ExperienceProvider><Portfolio /></ExperienceProvider>;
}
