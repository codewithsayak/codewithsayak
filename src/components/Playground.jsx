import { useEffect, useId, useRef, useState } from 'react';
import { ArrowUpRight, Check, Copy, Download, Shuffle, Sparkles } from 'lucide-react';
import { useExperience } from '../hooks/ExperienceContext.jsx';
import { copyText } from '../lib/utils.js';

const presets = [
  { name: 'Wine hour', colors: ['#4c1731', '#a64763', '#e9ae91'] },
  { name: 'Blue hour', colors: ['#172c50', '#637ac4', '#c4b8e5'] },
  { name: 'Slow Sunday', colors: ['#243e35', '#789780', '#d9d6ad'] },
  { name: 'Peach club', colors: ['#ad4c3c', '#e79672', '#f2d6a2'] },
];
const types = ['linear', 'radial', 'conic'];

function gradientString(type, angle, colors) {
  const stops = colors.join(', ');
  if (type === 'radial') return `radial-gradient(circle at 35% 35%, ${stops})`;
  if (type === 'conic') return `conic-gradient(from ${angle}deg at 50% 50%, ${stops}, ${colors[0]})`;
  return `linear-gradient(${angle}deg, ${stops})`;
}

export default function Playground() {
  const [preset, setPreset] = useState(0);
  const [type, setType] = useState('linear');
  const [angle, setAngle] = useState(135);
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState('');
  const copyTimer = useRef(null);
  const id = useId();
  const { notify } = useExperience();
  const css = gradientString(type, angle, presets[preset].colors);
  useEffect(() => () => clearTimeout(copyTimer.current), []);

  const copy = async () => {
    try {
      await copyText(`background: ${css};`);
      setCopied(true);
      setStatus('CSS copied to your clipboard.');
      clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2500);
    } catch { setStatus('Clipboard unavailable. Select the CSS below to copy it.'); }
  };

  const download = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1920; canvas.height = 1200;
    const context = canvas.getContext('2d');
    if (!context) { notify('Image export is not supported in this browser.'); return; }
    const colors = presets[preset].colors;
    let gradient;
    if (type === 'radial') {
      gradient = context.createRadialGradient(672, 420, 0, 672, 420, Math.hypot(1920 * 0.65, 1200 * 0.65));
      colors.forEach((color, index) => gradient.addColorStop(index / (colors.length - 1), color));
    } else if (type === 'conic' && context.createConicGradient) {
      gradient = context.createConicGradient((angle - 90) * Math.PI / 180, 960, 600);
      [...colors, colors[0]].forEach((color, index) => gradient.addColorStop(index / colors.length, color));
    } else {
      const radians = angle * Math.PI / 180;
      const x = Math.sin(radians), y = -Math.cos(radians);
      const length = Math.abs(1920 * x) + Math.abs(1200 * y);
      gradient = context.createLinearGradient(960 - x * length / 2, 600 - y * length / 2, 960 + x * length / 2, 600 + y * length / 2);
      colors.forEach((color, index) => gradient.addColorStop(index / (colors.length - 1), color));
    }
    context.fillStyle = gradient;
    context.fillRect(0, 0, 1920, 1200);
    canvas.toBlob((blob) => {
      if (!blob) { notify('Could not create the image. Please try again.'); return; }
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url; link.download = `sayak-${presets[preset].name.toLowerCase().replaceAll(' ', '-')}.png`;
      document.body.appendChild(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      notify('Your 1920 × 1200 wallpaper is ready.');
    }, 'image/png');
  };

  return <section id="playground" className="playground-section page-width section-space" aria-labelledby="playground-title">
    <div className="playground-copy" data-reveal><p className="eyebrow"><span>03</span> A LITTLE ROOM TO PLAY</p><h2 id="playground-title">Less theory.<br /><span className="serif">More “what if?”</span></h2><p>Sometimes the best way to understand a thing is to play with it. Here’s a little taste of Gradient Lab.</p><p>Pick a mood. Turn the dial. Make something yours.</p><a className="text-link" href="https://gradientlab09.vercel.app" target="_blank" rel="noopener noreferrer">Step inside the full lab <ArrowUpRight size={17} /></a><div className="playground-note"><Sparkles size={19} strokeWidth={1.4} /><span>No sign-up. No rules.<br />Just a little creative freedom.</span></div></div>
    <div className="gradient-lab" data-reveal><div className="lab-topbar micro"><span><span className="status-dot" /> LIVE EXPERIMENT</span><span>GRADIENT LAB / MINI</span></div><div className="gradient-preview" style={{ background: css }}><span className="preview-corner top-left" /><span className="preview-corner bottom-right" /><div className="preview-type" aria-hidden="true">Make something<br /><span>beautiful.</span></div><span className="preview-label micro">{presets[preset].name.toUpperCase()} <span>— {String(angle).padStart(3, '0')}°</span></span></div>
      <div className="lab-controls"><div className="preset-row"><span className="control-label micro">PICK A MOOD</span><div className="preset-options">{presets.map((item, index) => <button key={item.name} className={`preset-swatch ${preset === index ? 'selected' : ''}`} style={{ background: `linear-gradient(135deg, ${item.colors.join(',')})` }} onClick={() => setPreset(index)} aria-label={item.name} aria-pressed={preset === index} title={item.name}>{preset === index && <Check size={14} />}</button>)}<button className="shuffle-button icon-button" aria-label="Choose a random mood" onClick={() => { setPreset((preset + 1 + Math.floor(Math.random() * (presets.length - 1))) % presets.length); setAngle(Math.floor(Math.random() * 360)); }}><Shuffle size={15} /></button></div></div>
        <div className="gradient-type-row"><div className="segmented-control" aria-label="Gradient type">{types.map((item) => <button key={item} onClick={() => setType(item)} aria-pressed={type === item}>{item}</button>)}</div><span className="angle-value micro">{type === 'radial' ? 'CENTERED' : `${angle}°`}</span></div>
        <div className="angle-control"><label htmlFor={`${id}-angle`} className="micro">ANGLE</label><input id={`${id}-angle`} type="range" min="0" max="360" value={angle} disabled={type === 'radial'} onChange={(event) => setAngle(Number(event.target.value))} aria-valuetext={`${angle} degrees`} /><output htmlFor={`${id}-angle`}>{angle}°</output></div>
        <div className="css-output"><code>background: {css};</code></div><div className="lab-actions"><button className="button button-dark button-small" onClick={copy}>{copied ? <Check size={15} /> : <Copy size={15} />}{copied ? 'Copied!' : 'Copy CSS'}</button><button className="text-link" onClick={download}>Save wallpaper <Download size={15} /></button></div><p className="lab-status" role="status" aria-live="polite">{status}</p>
      </div></div>
  </section>;
}
