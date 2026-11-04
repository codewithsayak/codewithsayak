import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Menu, Pause, Play, X } from 'lucide-react';
import { SectionLink, useExperience } from '../hooks/ExperienceContext.jsx';

const links = [['work', 'Work'], ['about', 'About'], ['playground', 'Playground'], ['journey', 'Journey'], ['contact', 'Contact']];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('');
  const { motion, toggleMotion } = useExperience();
  const menuButton = useRef(null);

  useEffect(() => {
    const progress = document.querySelector('.reading-progress');
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const total = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.transform = `scaleX(${total > 0 ? Math.min(1, window.scrollY / total) : 0})`;
      });
    };
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) setActive(entry.target.id); });
    }, { rootMargin: '-15% 0px -65% 0px', threshold: 0 });
    ['top', ...links.map(([id]) => id)].forEach((id) => {
      const node = document.getElementById(id);
      if (node) observer.observe(node);
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event) => {
      if (event.key === 'Escape') { setOpen(false); menuButton.current?.focus(); }
    };
    const onResize = () => { if (window.innerWidth > 800) setOpen(false); };
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => { document.removeEventListener('keydown', onKey); window.removeEventListener('resize', onResize); };
  }, [open]);

  return (
    <header className="site-header">
      <div className="reading-progress" aria-hidden="true" />
      <div className="header-inner page-width">
        <SectionLink to="top" className="brand" aria-label="Sayak Karmakar, back to top" onClick={() => setOpen(false)}>
          <span className="brand-monogram" aria-hidden="true">s<span>.</span></span>
          <span className="brand-name">code with sayak<span>DESIGNER & DEVELOPER</span></span>
        </SectionLink>
        <nav id="primary-navigation" className={`main-nav ${open ? 'is-open' : ''}`} aria-label="Main navigation">
          {links.map(([id, label]) => <SectionLink key={id} to={id} className={active === id ? 'active' : ''} aria-current={active === id ? 'location' : undefined} onClick={() => setOpen(false)}>{label}{id === 'work' && <sup>02</sup>}</SectionLink>)}
          <span className="mobile-nav-note">A little logic. A lot of feeling.</span>
        </nav>
        <div className="header-actions">
          <button className="motion-toggle icon-button" onClick={toggleMotion} aria-label={motion ? 'Pause animations' : 'Enable animations'} aria-pressed={motion} title={motion ? 'Pause animations' : 'Enable animations'}>{motion ? <Pause size={14} /> : <Play size={14} />}</button>
          <SectionLink to="contact" className="header-cta" onClick={() => setOpen(false)}>Let’s talk <ArrowUpRight size={16} /></SectionLink>
          <button ref={menuButton} className="menu-toggle icon-button" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} aria-controls="primary-navigation" onClick={() => setOpen(!open)}>{open ? <X size={21} /> : <Menu size={21} />}</button>
        </div>
      </div>
    </header>
  );
}
