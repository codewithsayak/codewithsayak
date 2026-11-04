import test from 'node:test';
import assert from 'node:assert/strict';
import { createContactDraft, validateContact } from '../server/contact.js';

const valid = { name: 'Alex Morgan', email: 'alex@example.com', projectType: 'A website', message: 'I would love to collaborate on a thoughtful new portfolio website.' };

test('creates an encoded mailto draft without claiming delivery', () => {
  const draft = createContactDraft(valid);
  assert.equal(draft.delivered, false);
  assert.ok(draft.mailto.startsWith('mailto:codewithsayak@gmail.com?'));
  assert.ok(draft.mailto.includes('subject=A%20website'));
  assert.ok(draft.subject.includes('Alex Morgan'));
  assert.ok(draft.body.includes('alex@example.com'));
  assert.ok(draft.body.includes(valid.message));
});

test('trims whitespace and defaults the project type', () => {
  const result = validateContact({ ...valid, name: '  Alex Morgan  ', email: ' alex@example.com ', projectType: '' });
  assert.equal(result.value.name, 'Alex Morgan');
  assert.equal(result.value.email, 'alex@example.com');
  assert.equal(result.value.projectType, 'A website');
});

test('rejects missing and malformed fields', () => {
  const result = validateContact({ name: 'A', email: 'not-an-email', message: 'too short', projectType: 'Unknown' });
  assert.ok(result.errors.name);
  assert.ok(result.errors.email);
  assert.ok(result.errors.message);
  assert.ok(result.errors.projectType);
});

test('rejects header injection and control characters in single-line fields', () => {
  assert.ok(validateContact({ ...valid, name: 'Alex\r\nBcc: victim@example.com' }).errors.name);
  assert.ok(validateContact({ ...valid, email: 'alex@example.com\nBcc: victim@example.com' }).errors.email);
});

test('allows multiline messages but rejects other control characters', () => {
  assert.ok(validateContact({ ...valid, message: 'First line.\nSecond line with enough detail to pass.' }).value);
  assert.ok(validateContact({ ...valid, message: 'Hello\u0000 world, this is a sufficiently long message.' }).errors.message);
});

test('enforces message length boundaries', () => {
  assert.ok(validateContact({ ...valid, message: 'x'.repeat(19) }).errors.message);
  assert.ok(validateContact({ ...valid, message: 'x'.repeat(20) }).value);
  assert.ok(validateContact({ ...valid, message: 'x'.repeat(4000) }).value);
  assert.ok(validateContact({ ...valid, message: 'x'.repeat(4001) }).errors.message);
});

test('rejects non-object payloads', () => {
  assert.ok(validateContact(null).errors.form);
  assert.ok(validateContact([]).errors.form);
  assert.ok(validateContact('hello').errors.form);
});
