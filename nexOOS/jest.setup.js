require('@testing-library/jest-dom');

const { TextDecoder, TextEncoder } = require('util');
const {
  ReadableStream,
  TransformStream,
  WritableStream,
} = require('stream/web');

if (!global.TextEncoder) {
  global.TextEncoder = TextEncoder;
}

if (!global.TextDecoder) {
  global.TextDecoder = TextDecoder;
}

if (!global.ReadableStream) {
  global.ReadableStream = ReadableStream;
}

if (!global.TransformStream) {
  global.TransformStream = TransformStream;
}

if (!global.WritableStream) {
  global.WritableStream = WritableStream;
}

// Next.js 16+ restructured its internal compiled paths. Wrap in try/catch so the
// setup does not throw MODULE_NOT_FOUND if the path moves again. Node 18+ and
// jest-environment-jsdom 30 already provide native fetch globally as a fallback.
try {
  const p = require('next/dist/compiled/@edge-runtime/primitives/fetch');
  if (!global.fetch) global.fetch = p.fetch;
  if (!global.Headers) global.Headers = p.Headers;
  if (!global.Request) global.Request = p.Request;
  if (!global.Response) global.Response = p.Response;
} catch {
  // native fetch available via Node 18+ / jsdom — no polyfill required
}
