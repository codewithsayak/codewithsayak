import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../server/app.js';

let server;
let base;
before(async () => {
  server = createApp().listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => new Promise((resolve) => server.close(resolve)));

test('health endpoint reports ok', async () => {
  const response = await fetch(`${base}/api/health`);
  assert.equal(response.status, 200);
  assert.equal((await response.json()).status, 'ok');
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
});

test('portfolio endpoint exposes the shared content source', async () => {
  const data = await (await fetch(`${base}/api/portfolio`)).json();
  assert.equal(data.profile.name, 'Sayak Karmakar');
  assert.equal(data.projects.length, 2);
  assert.equal(data.journey.length, 4);
});

test('activity endpoint is marked as a snapshot', async () => {
  const data = await (await fetch(`${base}/api/activity`)).json();
  assert.equal(data.total, 37);
  assert.equal(data.isLive, false);
});

test('contact endpoint returns field errors for invalid input', async () => {
  const response = await fetch(`${base}/api/contact`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'A', email: 'bad', message: 'short' }) });
  assert.equal(response.status, 400);
  assert.ok((await response.json()).errors.email);
});

test('contact endpoint prepares a draft for valid input', async () => {
  const response = await fetch(`${base}/api/contact`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Alex Morgan', email: 'alex@example.com', message: 'I would love to collaborate on a new website project.', projectType: 'A website' }) });
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.delivered, false);
  assert.ok(data.mailto.startsWith('mailto:'));
});

test('unknown API routes return JSON 404s', async () => {
  const response = await fetch(`${base}/api/nope`);
  assert.equal(response.status, 404);
  assert.ok((await response.json()).error);
});

test('malformed JSON returns a helpful 400', async () => {
  const response = await fetch(`${base}/api/contact`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{bad json' });
  assert.equal(response.status, 400);
});

test('oversized payloads are rejected', async () => {
  const response = await fetch(`${base}/api/contact`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: 'x'.repeat(20000) }) });
  assert.equal(response.status, 413);
});
