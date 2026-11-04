import { profile } from '../shared/portfolio.js';

const projectTypes = ['A website', 'A creative project', 'A frontend role', 'Just saying hello'];
const clean = (value) => (typeof value === 'string' ? value.trim() : '');
const hasControlCharacters = (value) => /[\u0000-\u001f\u007f]/.test(value);

export function validateContact(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { errors: { form: 'Please provide your contact details.' } };
  }
  const name = clean(input.name);
  const email = clean(input.email);
  const message = clean(input.message);
  const projectType = clean(input.projectType) || projectTypes[0];
  const errors = {};
  if (name.length < 2 || name.length > 80 || hasControlCharacters(name)) {
    errors.name = 'Please enter a name between 2 and 80 characters.';
  }
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || hasControlCharacters(email)) {
    errors.email = 'Please enter a valid email address.';
  }
  if (message.length < 20 || message.length > 4000 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(message)) {
    errors.message = 'Tell me a little more: between 20 and 4,000 characters.';
  }
  if (!projectTypes.includes(projectType)) {
    errors.projectType = 'Please choose one of the project options.';
  }
  if (Object.keys(errors).length) return { errors };
  return { value: { name, email, message, projectType } };
}

export function createContactDraft(input) {
  const result = validateContact(input);
  if (result.errors) return result;
  const { name, email, message, projectType } = result.value;
  const subject = `${projectType} — from ${name}`;
  const body = `Hi Sayak,\n\n${message}\n\n— ${name}\n${email}\n\nInterested in: ${projectType}`;
  const mailto = `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  return { mailto, subject, body, delivered: false };
}

export { projectTypes };
