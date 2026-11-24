import React, { useState } from 'react';
import { AlgorithmDetail, RunResponse } from '../types';
import { executeAlgorithm } from '../lib/api';
import { Scale, X } from 'lucide-react';

interface ComparisonModalProps {
  algorithm: AlgorithmDetail;
  currentInput: Record<string, any>;
  isOpen: boolean;
  onClose: () => void;
}

export const ComparisonModal: React.FC<ComparisonModalProps> = ({
  algorithm,
  currentInput,
  isOpen,
  onClose,
}) => {
  const [results, setResults] = useState<Record<string, RunResponse | { error: string }>>({});
  const [isRunning, setIsRunning] = useState(false);

  if (!isOpen) return null;

  const handleRunComparison = async () => {
    setIsRunning(true);
    const newResults: Record<string, RunResponse | { error: string }> = {};

    for (const strat of algorithm.strategies) {
      try {
        const resp = await executeAlgorithm({
          algorithm_id: algorithm.id,
          strategy: strat,
          input: currentInput,
          include_trace: false,
        });
        newResults[strat] = resp;
      } catch (err: any) {
        newResults[strat] = { error: err.message || 'Comparison execution failed' };
      }
    }

    setResults(newResults);
    setIsRunning(false);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: '1rem',
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="comparison-title"
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '800px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
          padding: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Scale size={22} color="var(--primary)" />
            <h3 id="comparison-title" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
              Strategy Comparison: {algorithm.name}
            </h3>
          </div>
          <button onClick={onClose} className="btn" style={{ padding: '4px' }} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: '0.875rem', color: '#475569', marginBottom: '1rem' }}>
          Evaluate how <strong>Tabulation (Bottom-Up)</strong>, <strong>Memoization (Top-Down)</strong>, and{' '}
          <strong>Naive Recursion</strong> behave on identical input:{' '}
          <code style={{ fontFamily: 'var(--font-mono)', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
            {JSON.stringify(currentInput)}
          </code>
        </p>

        <div style={{ marginBottom: '1.25rem' }}>
          <button
            onClick={handleRunComparison}
            disabled={isRunning}
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {isRunning ? 'Running All Strategies...' : 'Run Side-by-Side Comparison'}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {algorithm.strategies.map((strat) => {
            const data = results[strat];
            const comp = algorithm.complexity[strat] || { time: 'N/A', space: 'N/A' };

            return (
              <div
                key={strat}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '1rem',
                  background: '#f8fafc',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, textTransform: 'capitalize', color: '#0f172a' }}>
                    {strat}
                  </h4>
                  <span className="tag">{strat === 'tabulation' ? 'Iterative' : 'Recursive'}</span>
                </div>

                <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem' }}>
                  <strong>Theoretical:</strong>
                  <div>Time: {comp.time}</div>
                  <div>Space: {comp.space}</div>
                </div>

                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                  <strong>Measured Outcome:</strong>
                  {data ? (
                    'error' in data ? (
                      <div style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '4px' }}>{data.error}</div>
                    ) : (
                      <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                        <div>Answer: <strong style={{ color: '#0d9488' }}>{JSON.stringify(data.result.value ?? data.result.ways ?? data.result.max_value)}</strong></div>
                        <div>States Evaluated: <strong>{data.metrics.state_count}</strong></div>
                        <div>Runtime: <strong>{data.metrics.elapsed_ms.toFixed(3)} ms</strong></div>
                      </div>
                    )
                  ) : (
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic', marginTop: '4px' }}>
                      Click 'Run' to compute
                    </div>
                  )}
                </div>

                <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#475569', background: '#ffffff', padding: '0.5rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                  {strat === 'tabulation' && 'Systematically computes all subproblems from smallest to largest without recursion call overhead.'}
                  {strat === 'memoization' && 'Computes subproblems on demand and caches them in a table to prevent recalculating overlapping states.'}
                  {strat === 'recursive' && 'Repeats subproblem computations exponentially. Suitable only as a baseline on tiny inputs.'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
