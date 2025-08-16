import '@testing-library/jest-dom';
import { toHaveNoViolations } from 'jest-axe';
import 'whatwg-fetch';
expect.extend(toHaveNoViolations);

// Polyfill for Next.js API routes testing
import { TextEncoder, TextDecoder } from 'util';
import { ReadableStream } from 'stream/web';

Object.assign(global, {
  TextEncoder,
  TextDecoder,
  ReadableStream,
  Request: global.Request || require('node-fetch').Request,
  Response: global.Response || require('node-fetch').Response,
  Headers: global.Headers || require('node-fetch').Headers,
});

// Mock environment variables for tests
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';


