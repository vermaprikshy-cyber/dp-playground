import React from 'react';
import { AlgorithmDetail } from '../types';
import { BookOpen } from 'lucide-react';

interface RecurrencePanelProps {
  algorithm: AlgorithmDetail;
}

export const RecurrencePanel: React.FC<RecurrencePanelProps> = ({ algorithm }) => {
  return (
    <div className="panel" style={{ marginTop: '1.25rem' }}>
      <div className="panel-header">
        <h4 className="panel-title">
          <BookOpen size={18} />
          <span>Recurrence & Base Cases</span>
        </h4>
      </div>

      <div style={{ marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '2px' }}>
          State Definition:
        </span>
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '0.5rem 0.75rem', fontSize: '0.85rem', color: '#0f172a' }}>
          {algorithm.state_definition}
        </div>
      </div>

      <div style={{ marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '2px' }}>
          Recurrence Relation:
        </span>
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '0.5rem 0.75rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#1e40af' }}>
          {algorithm.recurrence}
        </div>
      </div>

      <div>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '2px' }}>
          Base Cases:
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {algorithm.base_cases.map((base, idx) => (
            <span
              key={idx}
              style={{
                background: '#f0fdfa',
                border: '1px solid #99f6e4',
                color: '#0f766e',
                borderRadius: '4px',
                padding: '0.3rem 0.6rem',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
              }}
            >
              {base}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
