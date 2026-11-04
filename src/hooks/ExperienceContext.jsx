import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
const ExperienceContext = createContext(null);

function initialMotion() {
  try {
    const saved = localStorage.getItem('sk-motion');
    if (saved !== null) return saved === 'on';
  } catch { /* Storage can be unavailable in private browsing. */ }
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function ExperienceProvider({ children }) {
  const [motion, setMotion] = useState(initialMotion);
  const [toast, setToast] = useState('');
  const lenisRef = useRef(null);
  const toastTimer = useRef(null);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      let saved = null;
      try { saved = localStorage.getItem('sk-motion'); } catch { /* Optional preference. */ }
      if (saved === null) setMotion(!media.matches);
    };
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.motion = motion ? 'on' : 'off';
  }, [motion]);

  useLayoutEffect(() => {
    if (!motion) return;
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true, syncTouch: false, prevent: (node) => node.hasAttribute('data-lenis-prevent') });
    lenisRef.current = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [motion]);

  const toggleMotion = useCallback(() => {
    setMotion((current) => {
      const next = !current;
      try { localStorage.setItem('sk-motion', next ? 'on' : 'off'); } catch { /* Optional preference. */ }
      return next;
    });
  }, []);

  const notify = useCallback((message) => {
    clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(''), 3600);
  }, []);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const scrollTo = useCallback((id, updateHash = true) => {
    const target = document.getElementById(id);
    if (!target) return;
    if (updateHash) window.history.replaceState(null, '', id === 'top' ? window.location.pathname : `#${id}`);
    const focus = () => {
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    };
    if (lenisRef.current) lenisRef.current.scrollTo(target, { offset: -100, onComplete: focus });
    else {
      target.scrollIntoView({ behavior: 'instant', block: 'start' });
      focus();
    }
  }, []);

  const setModalOpen = useCallback((open) => {
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) lenisRef.current?.stop();
    else lenisRef.current?.start();
  }, []);

  return (
    <ExperienceContext.Provider value={{ motion, toggleMotion, scrollTo, notify, toast, setModalOpen }}>
      {children}
    </ExperienceContext.Provider>
  );
}

export function useExperience() {
  return useContext(ExperienceContext);
}

export function SectionLink({ to, children, onClick, ...props }) {
  const { scrollTo } = useExperience();
  return <a href={`#${to}`} {...props} onClick={(event) => {
    onClick?.(event);
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    scrollTo(to);
  }}>{children}</a>;
}
