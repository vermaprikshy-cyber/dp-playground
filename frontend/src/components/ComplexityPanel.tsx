import React from 'react';
import { AlgorithmComplexity, RunMetrics } from '../types';
import { Cpu, Info } from 'lucide-react';

interface ComplexityPanelProps {
  complexity: AlgorithmComplexity;
  metrics?: RunMetrics;
  strategy: string;
}

export const ComplexityPanel: React.FC<ComplexityPanelProps> = ({ complexity, metrics, strategy }) => {
  return (
    <div className="panel" style={{ marginTop: '1.25rem' }}>
      <div className="panel-header">
        <h4 className="panel-title">
          <Cpu size={18} />
          <span>Complexity & Metrics</span>
        </h4>
        <span className="tag" style={{ textTransform: 'capitalize' }}>
          {strategy}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
        <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Time (Big-O)</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', fontFamily: 'var(--font-mono)' }}>
            {complexity.time}
          </div>
        </div>

        <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Space (Big-O)</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', fontFamily: 'var(--font-mono)' }}>
            {complexity.space}
          </div>
        </div>

        {metrics && (
          <>
            <div style={{ background: '#f0fdfa', padding: '0.75rem', borderRadius: '6px', border: '1px solid #99f6e4' }}>
              <div style={{ fontSize: '0.75rem', color: '#0f766e', fontWeight: 600 }}>State Evaluated</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0d9488', fontFamily: 'var(--font-mono)' }}>
                {metrics.state_count}
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Engine Runtime</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#334155', fontFamily: 'var(--font-mono)' }}>
                {metrics.elapsed_ms.toFixed(3)} ms
              </div>
            </div>
          </>
        )}
      </div>

      <div
        style={{
          marginTop: '0.75rem',
          padding: '0.5rem 0.75rem',
          background: '#eff6ff',
          borderRadius: '4px',
          border: '1px solid #bfdbfe',
          fontSize: '0.75rem',
          color: '#1e40af',
          display: 'flex',
          gap: '0.4rem',
        }}
      >
        <Info size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
        <span>
          <strong>Asymptotic Big-O vs Measured Time:</strong> Big-O characterizes algorithmic scalability as input sizes grow, while measured milliseconds reflect machine CPU clock time and OS thread scheduling.
        </span>
      </div>
    </div>
  );
};
