import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowUp, ArrowUpRight, Check, Copy, Mail, Send, X } from 'lucide-react';
import { Github, Instagram } from './BrandIcons.jsx';
import { profile } from '../../shared/portfolio.js';
import { projectTypes } from '../../server/contact.js';
import { SectionLink, useExperience } from '../hooks/ExperienceContext.jsx';
import { copyText } from '../lib/utils.js';
import { IndiaClock } from './Hero.jsx';

export default function Contact({ onContact }) {
  const { notify } = useExperience();
  const copyEmail = async () => {
    try { await copyText(profile.email); notify('Email address copied. Say hello whenever you’re ready.'); }
    catch { notify(`You can reach me at ${profile.email}`); }
  };
  return <><section id="contact" className="contact-section" aria-labelledby="contact-title"><div className="page-width"><div className="contact-topline" data-reveal><p className="eyebrow"><span>05</span> GOOD THINGS START WITH A HELLO</p><span className="availability"><span className="status-dot" /> OPEN TO WHAT’S NEXT</span></div><div className="contact-main" data-reveal><h2 id="contact-title">Have a good feeling?<br /><span className="serif">Let’s talk.</span></h2><button className="contact-orb" onClick={onContact} aria-label="Start a conversation with Sayak"><ArrowUpRight strokeWidth={1} /><span>START SOMETHING</span></button></div><div className="contact-bottom" data-reveal><div><p>A project, an opportunity, or a shared curiosity.<br />I’d love to hear what’s on your mind.</p><div className="email-row"><a href={`mailto:${profile.email}`}>{profile.email}</a><button className="icon-button" onClick={copyEmail} aria-label="Copy email address"><Copy size={17} /></button></div></div><div className="contact-socials"><a href={profile.social.github} target="_blank" rel="noopener noreferrer"><Github size={17} /> GitHub <ArrowUpRight size={14} /></a><a href={profile.social.instagram} target="_blank" rel="noopener noreferrer"><Instagram size={17} /> Instagram <ArrowUpRight size={14} /></a><a href={profile.social.telegram} target="_blank" rel="noopener noreferrer"><Send size={17} /> Telegram <ArrowUpRight size={14} /></a></div></div></div></section><footer className="site-footer"><div className="page-width footer-main"><SectionLink to="top" className="footer-brand"><span className="brand-monogram" aria-hidden="true">s<span>.</span></span><span>A little logic. A lot of feeling.</span></SectionLink><span className="footer-location micro">DURGPUR, IN <span>·</span> <IndiaClock /></span><SectionLink to="top" className="back-top micro">BACK TO TOP <ArrowUp size={15} /></SectionLink></div><div className="page-width footer-bottom micro"><span>© {new Date().getFullYear()} SAYAK KARMAKAR</span><span>DESIGNED WITH INTENT. BUILT WITH REACT.</span><span>STILL A WORK IN PROGRESS. ALWAYS.</span></div></footer></>;
}

const emptyForm = { name: '', email: '', projectType: projectTypes[0], message: '' };

export function ContactDialog({ onClose }) {
  const dialog = useRef(null);
  const successHeading = useRef(null);
  const { setModalOpen, notify } = useExperience();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState(null);
  const [requestError, setRequestError] = useState('');

  useLayoutEffect(() => {
    const node = dialog.current;
    node.showModal();
    setModalOpen(true);
    // The DOM removal closes the dialog without a StrictMode close-event replay.
    // Restore page scrolling synchronously before the dialog leaves the paint.
    return () => { setModalOpen(false); };
  }, [setModalOpen]);
  useEffect(() => { if (draft) successHeading.current?.focus(); }, [draft]);

  const update = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };
  const submit = async (event) => {
    event.preventDefault();
    setBusy(true); setErrors({}); setRequestError('');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form), signal: controller.signal });
      const result = await response.json();
      if (!response.ok) {
        if (result.errors) {
          setErrors(result.errors);
          const first = Object.keys(result.errors)[0];
          dialog.current.querySelector(`[name="${first}"]`)?.focus();
        } else setRequestError(result.error || 'Could not prepare your draft. Please try again.');
      } else setDraft(result);
    } catch {
      setRequestError('The connection took a little too long. Try again, or email me directly using the address below.');
    } finally { clearTimeout(timeout); setBusy(false); }
  };
  const copyDraft = async () => {
    try { await copyText(`To: ${profile.email}\nSubject: ${draft.subject}\n\n${draft.body}`); notify('Your message is copied and ready to paste.'); }
    catch { notify('Clipboard unavailable. You can open the draft in your email app instead.'); }
  };

  const handleClose = () => { setModalOpen(false); onClose(); };

  return <dialog ref={dialog} className="contact-dialog" aria-labelledby="contact-dialog-title" data-lenis-prevent onClose={handleClose} onClick={(event) => {
    if (event.target !== event.currentTarget) return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) event.currentTarget.close();
  }}><div className="dialog-top"><span className="eyebrow">A NEW CONVERSATION</span><button className="icon-button" onClick={() => dialog.current.close()} aria-label="Close contact form"><X size={21} /></button></div><div className="contact-dialog-content">{draft ? <div className="draft-success"><span className="success-icon"><Check size={28} /></span><h2 id="contact-dialog-title" ref={successHeading} tabIndex={-1}>A good start<span className="serif">.</span></h2><p>Your draft is ready. One last step: open it in your email app and hit send.</p><div className="draft-preview"><span className="micro">TO: {profile.email}</span><strong>{draft.subject}</strong><p>{draft.body}</p></div><a className="button button-primary" href={draft.mailto}>Open my email app <Mail size={17} /></a><button className="text-link" onClick={copyDraft}>Copy the message instead <Copy size={15} /></button><button className="draft-reset" onClick={() => setDraft(null)}>Write another message</button><p className="form-note">Nothing has been sent or stored on this website.</p></div> : <><h2 id="contact-dialog-title">Tell me what<br /><span className="serif">you’re imagining.</span></h2><p className="contact-dialog-lede">Big idea or first thought — both are a good place to start.</p><form onSubmit={submit} noValidate><div className="form-row">{[['name', 'Your name', 'Alex Morgan', 'name'], ['email', 'Your email', 'alex@example.com', 'email']].map(([name, label, placeholder, autoComplete]) => <div className="form-field" key={name}><label htmlFor={`contact-${name}`}>{label}</label><input id={`contact-${name}`} name={name} type={name === 'email' ? 'email' : 'text'} autoComplete={autoComplete} placeholder={placeholder} value={form[name]} onChange={update} required maxLength={name === 'name' ? 80 : 254} aria-invalid={!!errors[name]} aria-describedby={errors[name] ? `error-${name}` : undefined} />{errors[name] && <span className="field-error" id={`error-${name}`}>{errors[name]}</span>}</div>)}</div><div className="form-field"><label htmlFor="contact-project">What brings you here?</label><select id="contact-project" name="projectType" value={form.projectType} onChange={update}>{projectTypes.map((type) => <option key={type}>{type}</option>)}</select>{errors.projectType && <span className="field-error">{errors.projectType}</span>}</div><div className="form-field"><label htmlFor="contact-message">A little about your idea <span>{form.message.length}/4,000</span></label><textarea id="contact-message" name="message" rows={4} placeholder="The idea, the timeline, the thing you can’t stop thinking about…" value={form.message} onChange={update} required minLength={20} maxLength={4000} aria-invalid={!!errors.message} aria-describedby={errors.message ? 'error-message' : undefined} />{errors.message && <span className="field-error" id="error-message">{errors.message}</span>}</div>{requestError && <p className="form-error" role="alert">{requestError}</p>}<button className="button button-primary form-submit" type="submit" disabled={busy}>{busy ? 'Preparing your draft…' : 'Prepare my message'}{!busy && <ArrowUpRight size={18} />}</button><p className="form-note">This prepares an email in your own app. Nothing is sent or stored here.</p></form><a className="dialog-direct-email" href={`mailto:${profile.email}`}>Or keep it simple: {profile.email} <ArrowUpRight size={13} /></a></>}</div></dialog>;
}
