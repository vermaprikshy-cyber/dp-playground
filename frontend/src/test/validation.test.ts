import { describe, it, expect } from 'vitest';
import { validateAlgorithmInput } from '../lib/validation';

describe('Algorithm Input Validation', () => {
  describe('Fibonacci', () => {
    it('accepts valid n within range', () => {
      const res = validateAlgorithmInput('fibonacci', 'tabulation', { n: 10 });
      expect(res.isValid).toBe(true);
      expect(res.errors).toEqual({});
    });

    it('rejects negative n', () => {
      const res = validateAlgorithmInput('fibonacci', 'tabulation', { n: -5 });
      expect(res.isValid).toBe(false);
      expect(res.errors.n).toContain('non-negative');
    });

    it('rejects recursive mode n > 12 to prevent freeze', () => {
      const res = validateAlgorithmInput('fibonacci', 'recursive', { n: 15 });
      expect(res.isValid).toBe(false);
      expect(res.errors.n).toContain('capped at 12');
    });

    it('rejects n > 40', () => {
      const res = validateAlgorithmInput('fibonacci', 'tabulation', { n: 45 });
      expect(res.isValid).toBe(false);
      expect(res.errors.n).toContain('40 or less');
    });
  });

  describe('Climbing Stairs', () => {
    it('accepts positive stairs', () => {
      const res = validateAlgorithmInput('climbing_stairs', 'memoization', { n: 5 });
      expect(res.isValid).toBe(true);
    });

    it('rejects 0 stairs', () => {
      const res = validateAlgorithmInput('climbing_stairs', 'tabulation', { n: 0 });
      expect(res.isValid).toBe(false);
      expect(res.errors.n).toContain('at least 1');
    });
  });

  describe('0/1 Knapsack', () => {
    it('accepts matching weights and values with valid capacity', () => {
      const res = validateAlgorithmInput('knapsack_01', 'tabulation', {
        weights: [1, 3, 4, 5],
        values: [1, 4, 5, 7],
        capacity: 7,
      });
      expect(res.isValid).toBe(true);
    });

    it('rejects length mismatch between weights and values', () => {
      const res = validateAlgorithmInput('knapsack_01', 'tabulation', {
        weights: [1, 3],
        values: [1, 4, 5],
        capacity: 7,
      });
      expect(res.isValid).toBe(false);
      expect(res.errors.weights).toContain('same count');
    });

    it('rejects capacity > 30', () => {
      const res = validateAlgorithmInput('knapsack_01', 'tabulation', {
        weights: [1, 2],
        values: [3, 4],
        capacity: 35,
      });
      expect(res.isValid).toBe(false);
      expect(res.errors.capacity).toContain('capped at 30');
    });

    it('rejects negative or zero item weights', () => {
      const res = validateAlgorithmInput('knapsack_01', 'tabulation', {
        weights: [0, 2],
        values: [3, 4],
        capacity: 5,
      });
      expect(res.isValid).toBe(false);
      expect(res.errors.weights).toContain('positive integer');
    });

    it('rejects recursive strategy for 0/1 Knapsack in MVP', () => {
      const res = validateAlgorithmInput('knapsack_01', 'recursive', {
        weights: [1, 2],
        values: [3, 4],
        capacity: 5,
      });
      expect(res.isValid).toBe(false);
      expect(res.errors.strategy).toContain('not implemented');
    });
  });
});
