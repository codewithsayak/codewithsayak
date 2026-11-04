import { useLayoutEffect, useRef } from 'react';
import { ArrowUpRight, Asterisk, Download, Code2, Compass, GitBranch } from 'lucide-react';
import gsap from 'gsap';
import { profile } from '../../shared/portfolio.js';
import { useExperience } from '../hooks/ExperienceContext.jsx';

const manifesto = 'Good design is felt before it’s understood. I bring that feeling to the web, one thoughtful detail at a time.'.split(' ');
const toolkits = [
  { icon: Code2, label: 'BUILDING WITH', tools: ['JavaScript', 'React', 'HTML & CSS', 'Node.js'] },
  { icon: GitBranch, label: 'WORKING IN', tools: ['Git & GitHub', 'VS Code', 'Figma', 'Vercel'] },
  { icon: Compass, label: 'EXPLORING NEXT', tools: ['Accessibility', 'Performance', 'APIs', 'Creative coding'] },
];

export default function About() {
  const root = useRef(null);
  const { motion } = useExperience();
  useLayoutEffect(() => {
    if (!motion) return;
    const context = gsap.context(() => {
      gsap.fromTo('.manifesto-word', { opacity: 0.2 }, { opacity: 1, stagger: 0.12, ease: 'none', scrollTrigger: { trigger: '.manifesto', start: 'top 80%', end: 'bottom 48%', scrub: 0.6 } });
      gsap.to('.about-asterisk', { rotation: 150, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: 1 } });
    }, root);
    return () => context.revert();
  }, [motion]);

  return <section id="about" className="about-section" ref={root} aria-labelledby="about-title">
    <div className="page-width"><div className="about-topline"><p className="eyebrow"><span>02</span> THE PERSON BEHIND THE PIXELS</p><Asterisk className="about-asterisk" size={64} strokeWidth={1} aria-hidden="true" /></div>
      <h2 id="about-title" className="manifesto">{manifesto.map((word, index) => <span className={`manifesto-word ${['felt', 'feeling'].includes(word) ? 'serif' : ''}`} key={`${word}-${index}`}>{word} </span>)}</h2>
      <div className="about-details"><div className="about-bio" data-reveal><p className="about-bio-heading">A developer’s mind.<br /><span className="serif">A designer’s eye.</span></p><p>I’m Sayak — a student, frontend developer, and incurably curious maker based in India. I learn by building, share what I discover, and care about how a digital experience feels as much as how it works.</p><p>Still learning. Always making. Intentionally keeping things human.</p><a className="text-link light-link" href={profile.resume} download>My résumé, the short version <Download size={16} /></a><div className="signature">Sayak<span>THE MAKER</span></div></div><div className="toolkit" data-reveal>{toolkits.map(({ icon: Icon, label, tools }) => <div className="toolkit-group" key={label}><h3 className="micro"><Icon size={15} strokeWidth={1.5} />{label}</h3><div>{tools.map((tool) => <span key={tool}>{tool}</span>)}</div></div>)}<a className="toolkit-github" href={profile.social.github} target="_blank" rel="noopener noreferrer">Follow the learning curve <ArrowUpRight size={16} /></a></div></div>
    </div>
  </section>;
}
