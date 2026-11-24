import React from 'react';
import { AlgorithmDetail } from '../types';
import { ArrowRight } from 'lucide-react';

interface AlgorithmCardProps {
  algorithm: AlgorithmDetail;
  onSelect: (algorithmId: string) => void;
}

export const AlgorithmCard: React.FC<AlgorithmCardProps> = ({ algorithm, onSelect }) => {
  const isBeginner = algorithm.difficulty === 'Beginner';

  return (
    <div className="algo-card" tabIndex={0} role="article">
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>{algorithm.name}</h3>
          <span className={`tag ${isBeginner ? 'tag-beginner' : 'tag-intermediate'}`}>
            {algorithm.difficulty}
          </span>
        </div>

        <p style={{ fontSize: '0.875rem', color: '#475569', marginBottom: '1rem', lineHeight: '1.5' }}>
          {algorithm.summary}
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1.25rem' }}>
          <span className="tag" style={{ background: '#eff6ff', color: '#2563eb' }}>
            {algorithm.family}
          </span>
          {algorithm.topics.map((t, idx) => (
            <span key={idx} className="tag">
              {t}
            </span>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
          Strategies: {algorithm.strategies.join(', ')}
        </div>
        <button
          onClick={() => onSelect(algorithm.id)}
          className="btn btn-primary"
          style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
          aria-label={`Open ${algorithm.name} workspace`}
        >
          <span>Open</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};
