import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../server/app.js';

test('production responses set a strict CSP while allowing Arena preview framing', async () => {
  const previous = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';
  const server = createApp().listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  try {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/health`);
    const csp = response.headers.get('content-security-policy');
    assert.ok(csp.includes("default-src 'self'"));
    assert.ok(csp.includes("script-src 'self'"));
    assert.ok(csp.includes("font-src 'self' data:"));
    assert.ok(csp.includes('frame-ancestors'));
    assert.ok(csp.includes('https://*.e2b.app'));
    assert.equal(response.headers.get('x-frame-options'), null);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    if (previous === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previous;
  }
});
