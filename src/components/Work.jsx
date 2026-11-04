import { useEffect, useLayoutEffect, useRef } from 'react';
import { ArrowUpRight, ArrowRight, X } from 'lucide-react';
import { Github } from './BrandIcons.jsx';
import gsap from 'gsap';
import { projects } from '../../shared/portfolio.js';
import { useExperience } from '../hooks/ExperienceContext.jsx';

export function ExternalLink({ href, children, ...props }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>;
}

function BrowserFrame({ project, eager = false }) {
  return <div className={`browser-frame browser-${project.id}`}><div className="browser-bar"><span className="browser-dots"><i /><i /><i /></span><span>{project.domain}</span><ArrowUpRight size={11} /></div><div className="browser-image"><img src={project.image} alt={project.imageAlt} loading={eager ? 'eager' : 'lazy'} width="1392" height="918" /></div></div>;
}

export default function Work({ onSelect }) {
  const root = useRef(null);
  const { motion } = useExperience();
  useLayoutEffect(() => {
    if (!motion) return;
    const media = gsap.matchMedia();
    media.add('(min-width: 901px)', () => {
      const cards = gsap.utils.toArray('.project-card', root.current);
      gsap.to(cards[0], { scale: 0.955, filter: 'brightness(0.94)', transformOrigin: 'center top', ease: 'none', scrollTrigger: { trigger: cards[1], start: 'top bottom', end: 'top 130px', scrub: 0.7 } });
      cards.forEach((card) => {
        gsap.fromTo(card.querySelector('.project-visual'), { y: 42, rotation: -3 }, { y: 0, rotation: 0, ease: 'none', scrollTrigger: { trigger: card, start: 'top 90%', end: 'top 20%', scrub: 1 } });
      });
    });
    return () => media.revert();
  }, [motion]);

  return <section id="work" className="work-section page-width section-space" ref={root} aria-labelledby="work-title">
    <div className="section-heading" data-reveal><div><p className="eyebrow"><span>01</span> SELECTED WORK</p><h2 id="work-title">Small collection.<br /><span className="serif">Big on the details.</span></h2></div><p className="section-description">A few things I’ve designed, built, and shipped.<br className="desktop-break" /> No concept filler. Just real work.</p></div>
    <div className="project-stack">{projects.map((project, index) => <article key={project.id} className={`project-card project-${project.theme}`} style={{ '--card-index': index }} aria-labelledby={`project-title-${project.id}`}>
      <div className="project-copy"><div className="project-topline micro"><span>PROJECT {project.number}</span><span>{project.year}</span></div><p className="project-category micro">{project.category}</p><h3 id={`project-title-${project.id}`}>{project.headline[0]}<br /><span className="serif">{project.headline[1]}</span></h3><p className="project-description">{project.description}</p><div className="project-tags">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><button className="project-case-button" onClick={() => onSelect(project)} aria-label={`Explore the ${project.title} case study`}><span>Explore the project</span><span className="circle-arrow"><ArrowUpRight size={22} /></span></button></div>
      <div className="project-visual"><span className="project-visual-number" aria-hidden="true">{project.number}</span><ExternalLink href={project.url} className="browser-link" aria-label={`Visit ${project.title} live site`}><BrowserFrame project={project} eager={index === 0} /></ExternalLink><div className="project-visual-footer micro"><span><span className="status-dot" /> LIVE & OPEN SOURCE</span><ExternalLink href={project.source} aria-label={`${project.title} source on GitHub`}><Github size={15} /> SOURCE <ArrowUpRight size={12} /></ExternalLink></div></div>
    </article>)}</div>
    <div className="work-footnote" data-reveal><span className="micro">GOOD THINGS TAKE CURIOSITY.</span><ExternalLink href="https://github.com/codewithsayak?tab=repositories" className="text-link">More on my GitHub <ArrowUpRight size={16} /></ExternalLink></div>
  </section>;
}

export function ProjectDialog({ project, onClose }) {
  const dialog = useRef(null);
  const { setModalOpen } = useExperience();
  useLayoutEffect(() => {
    const node = dialog.current;
    node.showModal();
    setModalOpen(true);
    // Removing an open <dialog> also removes it from the top layer. Calling
    // close() here would queue a close event during StrictMode's effect replay.
    // A layout effect restores page scrolling synchronously before paint.
    return () => { setModalOpen(false); };
  }, [setModalOpen]);

  const handleClose = () => { setModalOpen(false); onClose(); };

  return <dialog ref={dialog} className="project-dialog" aria-labelledby="case-study-title" data-lenis-prevent onClose={handleClose} onClick={(event) => {
    if (event.target !== event.currentTarget) return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) event.currentTarget.close();
  }}>
    <div className="dialog-top"><span className="eyebrow">PROJECT {project.number} / THE DETAILS</span><button className="icon-button" onClick={() => dialog.current.close()} aria-label="Close project details" autoFocus><X size={21} /></button></div>
    <div className="case-study-content"><p className="project-category micro">{project.category}</p><h2 id="case-study-title">{project.title}<span className="serif">, unpacked.</span></h2><p className="case-study-lede">{project.overview}</p><BrowserFrame project={project} eager /><div className="case-study-columns"><div><h3>What’s inside</h3><ul>{project.features.map((feature) => <li key={feature}><ArrowRight size={14} />{feature}</li>)}</ul></div><div><h3>My role</h3><p>{project.role}</p><h3>The thinking</h3><p>{project.takeaway}</p></div></div><div className="case-study-actions"><ExternalLink href={project.url} className="button button-primary">Visit the live site <ArrowUpRight size={17} /></ExternalLink><ExternalLink href={project.source} className="text-link"><Github size={17} /> Read the source <ArrowUpRight size={15} /></ExternalLink></div><p className="case-study-note micro">BUILT IN THE OPEN. MIT LICENSED. ALWAYS EVOLVING.</p></div>
  </dialog>;
}
