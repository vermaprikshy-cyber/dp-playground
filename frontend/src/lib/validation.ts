export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateAlgorithmInput(
  algorithmId: string,
  strategy: string,
  input: Record<string, any>
): ValidationResult {
  const errors: Record<string, string> = {};

  if (algorithmId === 'fibonacci') {
    const n = Number(input.n);
    if (!Number.isInteger(n)) {
      errors.n = 'n must be an integer.';
    } else if (n < 0) {
      errors.n = 'n must be non-negative (n ≥ 0).';
    } else if (strategy === 'recursive' && n > 12) {
      errors.n = 'For recursive mode, n is capped at 12 to prevent exponential browser freezing.';
    } else if (n > 40) {
      errors.n = 'n must be 40 or less.';
    }
  } else if (algorithmId === 'climbing_stairs') {
    const n = Number(input.n);
    if (!Number.isInteger(n)) {
      errors.n = 'n must be an integer.';
    } else if (n < 1) {
      errors.n = 'n must be at least 1 stair.';
    } else if (strategy === 'recursive' && n > 12) {
      errors.n = 'For recursive mode, n is capped at 12 to keep execution fast and readable.';
    } else if (n > 30) {
      errors.n = 'n must be 30 or less.';
    }
  } else if (algorithmId === 'knapsack_01') {
    const weights: number[] = Array.isArray(input.weights) ? input.weights : [];
    const values: number[] = Array.isArray(input.values) ? input.values : [];
    const capacity = Number(input.capacity);

    if (strategy === 'recursive') {
      errors.strategy = 'Recursive mode is not implemented for 0/1 Knapsack in this playground.';
    }

    if (!Number.isInteger(capacity) || capacity < 0) {
      errors.capacity = 'Capacity must be a non-negative integer (≥ 0).';
    } else if (capacity > 30) {
      errors.capacity = 'Capacity is capped at 30 so the DP table fits legibly on screen.';
    }

    if (weights.length !== values.length) {
      errors.weights = 'Weights and Values must have the exact same count of items.';
    } else if (weights.length > 10) {
      errors.weights = 'Maximum of 10 items allowed.';
    }

    for (let i = 0; i < weights.length; i++) {
      const w = Number(weights[i]);
      if (!Number.isInteger(w) || w <= 0) {
        errors.weights = `Item weight at index ${i + 1} must be a positive integer (≥ 1).`;
        break;
      }
    }

    for (let i = 0; i < values.length; i++) {
      const v = Number(values[i]);
      if (!Number.isInteger(v) || v < 0) {
        errors.values = `Item value at index ${i + 1} must be a non-negative integer (≥ 0).`;
        break;
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
