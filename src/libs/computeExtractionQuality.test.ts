import { describe, expect, it } from 'vitest';

import { computeExtractionQuality } from './computeExtractionQuality';

// ~7200 chars — satisfies the htmlLength > 5000 threshold for "good" tier
const richHtml = '<p>content paragraph goes here</p>'.repeat(300);
const shortHtml = '<p>Hello</p>';
const tableHeavyHtml = '<table>'.repeat(5) + '<tr><td>x</td></tr>'.repeat(20) + '</table>'.repeat(5);
const imageHeavyHtml = '<img src="a.png">'.repeat(7);

describe('computeExtractionQuality', () => {
  describe('good score', () => {
    it('returns good when 5+ variables and html > 5000 chars', () => {
      const sampleJson = { a: '1', b: '2', c: '3', d: '4', e: '5' };
      const result = computeExtractionQuality(richHtml, sampleJson);

      expect(result.score).toBe('good');
      expect(result.label).toBe('Good match');
      expect(result.details).toContain('5 variables detected');
    });

    it('returns good when 10 variables and rich html', () => {
      const sampleJson = Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`k${i}`, `v${i}`]));
      const result = computeExtractionQuality(richHtml, sampleJson);

      expect(result.score).toBe('good');
    });

    it('appends table layout note when tables are present', () => {
      const sampleJson = Object.fromEntries(Array.from({ length: 6 }, (_, i) => [`k${i}`, `v${i}`]));
      const htmlWithTables = `${richHtml}<table><tr><td>x</td></tr></table>`;
      const result = computeExtractionQuality(htmlWithTables, sampleJson);

      expect(result.score).toBe('good');
      expect(result.details).toContain('table layout');
    });
  });

  describe('moderate score', () => {
    it('returns moderate when 1-4 variables and short html', () => {
      const sampleJson = { name: 'Alice' };
      const result = computeExtractionQuality(shortHtml, sampleJson);

      expect(result.score).toBe('moderate');
      expect(result.label).toBe('Partial match');
      expect(result.details).toContain('1 variable detected');
    });

    it('returns moderate when no variables but rich structural content', () => {
      const result = computeExtractionQuality(richHtml, null);

      expect(result.score).toBe('moderate');
    });

    it('returns moderate when variables present but html is short', () => {
      const sampleJson = { a: '1', b: '2', c: '3' };
      const result = computeExtractionQuality(shortHtml, sampleJson);

      expect(result.score).toBe('moderate');
    });
  });

  describe('limited score', () => {
    it('returns limited when no variables and very short html', () => {
      const result = computeExtractionQuality(shortHtml, null);

      expect(result.score).toBe('limited');
      expect(result.label).toBe('Limited match');
    });

    it('returns limited when no variables and complex layout', () => {
      const result = computeExtractionQuality(tableHeavyHtml, null);

      expect(result.score).toBe('limited');
      expect(result.details).toContain('Complex layout');
    });

    it('returns limited when no variables and image-heavy html', () => {
      const result = computeExtractionQuality(imageHeavyHtml, null);

      expect(result.score).toBe('limited');
    });

    it('returns limited when empty html and no variables', () => {
      const result = computeExtractionQuality('', null);

      expect(result.score).toBe('limited');
      expect(result.details).toBe('Minimal content extracted');
    });
  });

  describe('details message', () => {
    it('uses singular "variable" when count is 1', () => {
      const result = computeExtractionQuality(richHtml, { name: 'Alice' });

      expect(result.details).toContain('1 variable detected');
    });

    it('uses plural "variables" when count is 0', () => {
      const html = '<div>'.repeat(50) + '<p>x</p>'.repeat(30) + '</div>'.repeat(50);
      const result = computeExtractionQuality(html, null);

      expect(result.details).toContain('0 variables');
    });
  });
});
