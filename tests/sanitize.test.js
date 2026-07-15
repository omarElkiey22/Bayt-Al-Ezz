import { expect, test, describe } from 'vitest';
import { sanitizeInput } from '../src/js/utils.js';

describe('sanitizeInput', () => {
  test('strips HTML tags', () => {
    expect(sanitizeInput('Hello <b>World</b>')).toBe('Hello World');
    expect(sanitizeInput('<script>alert("xss")</script>')).toBe('alert("xss")');
    expect(sanitizeInput('<img src="x" onerror="alert(1)">')).toBe('');
  });

  test('handles plain text', () => {
    expect(sanitizeInput('Plain text')).toBe('Plain text');
  });

  test('handles non-string inputs', () => {
    expect(sanitizeInput(null)).toBe(null);
    expect(sanitizeInput(123)).toBe(123);
  });
});
