import React from 'react';
import { AlgorithmDetail, Preset } from '../types';
import { Play, RotateCcw, Bookmark } from 'lucide-react';

interface InputFormProps {
  algorithm: AlgorithmDetail;
  strategy: string;
  onStrategyChange: (strategy: string) => void;
  inputValues: Record<string, any>;
  onInputChange: (newValues: Record<string, any>) => void;
  includeTrace: boolean;
  onIncludeTraceChange: (includeTrace: boolean) => void;
  onRun: () => void;
  onReset: () => void;
  onApplyPreset: (preset: Preset) => void;
  validationErrors: Record<string, string>;
  isLoading: boolean;
}

export const InputForm: React.FC<InputFormProps> = ({
  algorithm,
  strategy,
  onStrategyChange,
  inputValues,
  onInputChange,
  includeTrace,
  onIncludeTraceChange,
  onRun,
  onReset,
  onApplyPreset,
  validationErrors,
  isLoading,
}) => {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onRun();
      }}
      className="input-form"
    >
      {/* Preset selector */}
      {algorithm.presets && algorithm.presets.length > 0 && (
        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Bookmark size={14} />
            <span>Preset Examples:</span>
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {algorithm.presets.map((preset) => (
              <button
                type="button"
                key={preset.id}
                onClick={() => onApplyPreset(preset)}
                className="btn btn-outline"
                style={{ padding: '0.3rem 0.6rem', fontSize: '0.78rem' }}
                title={`Strategy: ${preset.strategy}`}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Strategy selector */}
      <div className="form-group">
        <label htmlFor="strategy-select" className="form-label">
          Solving Strategy:
        </label>
        <select
          id="strategy-select"
          className="form-select"
          value={strategy}
          onChange={(e) => onStrategyChange(e.target.value)}
          disabled={isLoading}
        >
          {algorithm.strategies.map((strat) => (
            <option key={strat} value={strat}>
              {strat.charAt(0).toUpperCase() + strat.slice(1)}
              {strat === 'tabulation' ? ' (Bottom-Up Table)' : ''}
              {strat === 'memoization' ? ' (Top-Down Cache)' : ''}
              {strat === 'recursive' ? ' (Naive Baseline)' : ''}
            </option>
          ))}
        </select>
        {validationErrors.strategy && <span className="form-error">{validationErrors.strategy}</span>}
      </div>

      {/* Inputs for Fibonacci & Climbing Stairs */}
      {(algorithm.id === 'fibonacci' || algorithm.id === 'climbing_stairs') && (
        <div className="form-group">
          <label htmlFor="input-n" className="form-label">
            Target Value (n):
          </label>
          <input
            id="input-n"
            type="number"
            className="form-input"
            value={inputValues.n ?? ''}
            onChange={(e) => onInputChange({ ...inputValues, n: parseInt(e.target.value, 10) || 0 })}
            disabled={isLoading}
            placeholder="e.g. 10"
          />
          {algorithm.constraints?.n?.help && (
            <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginTop: '0.25rem' }}>
              {algorithm.constraints.n.help}
            </span>
          )}
          {validationErrors.n && <span className="form-error">{validationErrors.n}</span>}
        </div>
      )}

      {/* Inputs for 0/1 Knapsack */}
      {algorithm.id === 'knapsack_01' && (
        <>
          <div className="form-group">
            <label htmlFor="input-capacity" className="form-label">
              Knapsack Capacity (W):
            </label>
            <input
              id="input-capacity"
              type="number"
              className="form-input"
              value={inputValues.capacity ?? ''}
              onChange={(e) => onInputChange({ ...inputValues, capacity: parseInt(e.target.value, 10) || 0 })}
              disabled={isLoading}
              placeholder="e.g. 7"
            />
            {validationErrors.capacity && <span className="form-error">{validationErrors.capacity}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="input-weights" className="form-label">
              Item Weights (comma separated):
            </label>
            <input
              id="input-weights"
              type="text"
              className="form-input"
              value={Array.isArray(inputValues.weights) ? inputValues.weights.join(', ') : (inputValues.weights ?? '')}
              onChange={(e) => {
                const parts = e.target.value
                  .split(',')
                  .map((s) => s.trim())
                  .filter((s) => s.length > 0)
                  .map(Number);
                onInputChange({ ...inputValues, weights: parts });
              }}
              disabled={isLoading}
              placeholder="e.g. 1, 3, 4, 5"
            />
            {validationErrors.weights && <span className="form-error">{validationErrors.weights}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="input-values" className="form-label">
              Item Values (comma separated):
            </label>
            <input
              id="input-values"
              type="text"
              className="form-input"
              value={Array.isArray(inputValues.values) ? inputValues.values.join(', ') : (inputValues.values ?? '')}
              onChange={(e) => {
                const parts = e.target.value
                  .split(',')
                  .map((s) => s.trim())
                  .filter((s) => s.length > 0)
                  .map(Number);
                onInputChange({ ...inputValues, values: parts });
              }}
              disabled={isLoading}
              placeholder="e.g. 1, 4, 5, 7"
            />
            {validationErrors.values && <span className="form-error">{validationErrors.values}</span>}
          </div>
        </>
      )}

      {/* Trace toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
        <input
          id="checkbox-include-trace"
          type="checkbox"
          checked={includeTrace}
          onChange={(e) => onIncludeTraceChange(e.target.checked)}
          disabled={isLoading}
          style={{ width: '16px', height: '16px', accentColor: 'var(--primary)', cursor: 'pointer' }}
        />
        <label htmlFor="checkbox-include-trace" style={{ fontSize: '0.85rem', color: '#334155', cursor: 'pointer', userSelect: 'none' }}>
          Include execution trace for playback
        </label>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
        <button
          type="submit"
          className="btn btn-primary"
          style={{ flex: 1, justifyContent: 'center' }}
          disabled={isLoading}
          aria-label="Run algorithm"
        >
          <Play size={16} />
          <span>{isLoading ? 'Executing...' : 'Run algorithm'}</span>
        </button>

        <button
          type="button"
          onClick={onReset}
          className="btn btn-outline"
          disabled={isLoading}
          title="Restore algorithm defaults"
          aria-label="Restore algorithm defaults"
        >
          <RotateCcw size={16} />
          <span>Reset</span>
        </button>
      </div>
    </form>
  );
};
