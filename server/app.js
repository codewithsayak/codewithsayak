import express from 'express';
import compression from 'compression';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { profile, projects, journey } from '../shared/portfolio.js';
import { createContactDraft } from './contact.js';
import { readActivity } from './activity.js';

export function createApp() {
  const app = express();
  const activity = readActivity();
  const production = process.env.NODE_ENV === 'production';
  app.disable('x-powered-by');
  app.use(compression());
  app.use(helmet({
    // Vite's development client needs eval/websocket freedom; production ships
    // a strict policy. Inline styles are required by GSAP and the gradient lab.
    contentSecurityPolicy: production ? {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'blob:'],
        fontSrc: ["'self'", 'data:'],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        frameAncestors: ["'self'", 'https://*.e2b.app'],
        upgradeInsecureRequests: null,
      },
    } : false,
    // Allow the Arena live preview to embed the app; CSP frame-ancestors still
    // restricts production framing to same-origin and the preview host.
    frameguard: false,
    crossOriginEmbedderPolicy: false,
    strictTransportSecurity: production ? undefined : false,
  }));
  app.use(express.json({ limit: '16kb' }));
  app.use('/api', (_req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  });

  app.get('/api/health', (_req, res) => res.json({ status: 'ok', name: 'codewithsayak', version: '2.0.0' }));
  app.get('/api/portfolio', (_req, res) => res.json({ profile, projects, journey }));
  app.get('/api/activity', (_req, res) => res.json(activity));

  const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { error: 'A few too many drafts. Please try again in 15 minutes, or email me directly.' },
  });
  app.post('/api/contact', contactLimiter, (req, res) => {
    const draft = createContactDraft(req.body);
    if (draft.errors) return res.status(400).json({ errors: draft.errors });
    // This endpoint prepares a draft. It never claims to send or store a message.
    res.json(draft);
  });
  app.use('/api', (_req, res) => res.status(404).json({ error: 'This API endpoint does not exist.' }));
  app.use((error, _req, res, next) => {
    if (error.type === 'entity.too.large') return res.status(413).json({ error: 'This message is too large. Please keep it under 4,000 characters.' });
    if (error.type === 'entity.parse.failed') return res.status(400).json({ error: 'The request body must be valid JSON.' });
    next(error);
  });
  return app;
}
