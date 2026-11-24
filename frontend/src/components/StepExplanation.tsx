import React from 'react';
import { TraceEvent } from '../types';
import { CheckCircle2, RefreshCw, Zap } from 'lucide-react';

interface StepExplanationProps {
  event: TraceEvent | null;
  stepIndex: number;
  totalSteps: number;
}

export const StepExplanation: React.FC<StepExplanationProps> = ({ event, stepIndex, totalSteps }) => {
  if (!event) {
    return (
      <div className="explanation-card" style={{ background: '#f8fafc', borderColor: '#e2e8f0' }}>
        <div style={{ color: '#64748b', fontSize: '0.875rem' }}>
          Click <strong>Run</strong> or use the playback controls to start stepping through the dynamic programming execution trace.
        </div>
      </div>
    );
  }

  const kindColors: Record<string, { bg: string; text: string; label: string }> = {
    initialize: { bg: '#e0f2fe', text: '#0369a1', label: 'Base Case' },
    update: { bg: '#ccfbf1', text: '#0f766e', label: 'Transition' },
    evaluate: { bg: '#fef3c7', text: '#b45309', label: 'Evaluating' },
    choose: { bg: '#fae8ff', text: '#86198f', label: 'Decision' },
    finish: { bg: '#dcfce7', text: '#15803d', label: 'Completed' },
  };

  const badge = kindColors[event.kind] || { bg: '#f1f5f9', text: '#475569', label: event.kind };

  const stateStr = Object.entries(event.state)
    .map(([k, v]) => `${k}=${v}`)
    .join(', ');

  return (
    <div className="explanation-card" aria-live="polite">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <div className="explanation-title">
          {event.kind === 'finish' ? (
            <CheckCircle2 size={18} color="#15803d" />
          ) : event.kind === 'initialize' ? (
            <Zap size={18} color="#0369a1" />
          ) : (
            <RefreshCw size={18} color="#0f766e" />
          )}
          <span>State [{stateStr}]</span>
          {event.label && (
            <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#475569' }}>({event.label})</span>
          )}
        </div>

        <span
          style={{
            background: badge.bg,
            color: badge.text,
            padding: '2px 8px',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 600,
            textTransform: 'uppercase',
          }}
        >
          {badge.label}
        </span>
      </div>

      <p className="explanation-text">{event.explanation}</p>

      {event.operation && (
        <div style={{ marginTop: '0.6rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '2px' }}>
            Formula Substitution:
          </span>
          <div className="operation-box">
            <code>{event.operation}</code>
            {event.writes && (
              <span style={{ color: '#0d9488', fontWeight: 600 }}> → writes {event.value}</span>
            )}
          </div>
        </div>
      )}

      {event.dependencies && event.dependencies.length > 0 && (
        <div style={{ marginTop: '0.6rem', fontSize: '0.8rem', color: '#475569' }}>
          <span style={{ fontWeight: 600 }}>Dependencies read: </span>
          {event.dependencies.map((dep, idx) => {
            const depStr = Object.entries(dep)
              .map(([k, v]) => `${k}=${v}`)
              .join(', ');
            return (
              <span
                key={idx}
                style={{
                  display: 'inline-block',
                  background: '#fef3c7',
                  color: '#92400e',
                  padding: '1px 6px',
                  borderRadius: '4px',
                  marginRight: '4px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                }}
              >
                [{depStr}]
              </span>
            );
          })}
        </div>
      )}

      <div style={{ marginTop: '0.5rem', textAlign: 'right', fontSize: '0.75rem', color: '#94a3b8' }}>
        Event {stepIndex + 1} of {totalSteps}
      </div>
    </div>
  );
};
