import React from 'react';
import { AlgorithmDetail } from '../types';
import { AlgorithmCard } from '../components/AlgorithmCard';
import { Sparkles, ArrowRight, Play, Cpu, ShieldCheck } from 'lucide-react';

interface HomeProps {
  algorithms: AlgorithmDetail[];
  onSelectAlgorithm: (id: string) => void;
  onExplore: () => void;
}

export const Home: React.FC<HomeProps> = ({ algorithms, onSelectAlgorithm, onExplore }) => {
  return (
    <div className="container">
      {/* Hero Section */}
      <section style={{ textAlign: 'center', padding: '3.5rem 1rem 2.5rem', maxWidth: '840px', margin: '0 auto' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'var(--primary-subtle)',
            color: 'var(--primary)',
            padding: '0.3rem 0.8rem',
            borderRadius: '9999px',
            fontSize: '0.8rem',
            fontWeight: 600,
            marginBottom: '1rem',
          }}
        >
          <Sparkles size={14} />
          <span>Interactive DSA Course Project</span>
        </div>

        <h1
          style={{
            fontSize: '2.5rem',
            fontWeight: 800,
            lineHeight: 1.2,
            color: '#0f172a',
            marginBottom: '1rem',
            letterSpacing: '-0.02em',
          }}
        >
          Make Dynamic Programming <span style={{ color: 'var(--primary)' }}>Visible, Testable</span> & Explainable
        </h1>

        <p style={{ fontSize: '1.1rem', color: '#475569', lineHeight: 1.6, marginBottom: '2rem' }}>
          Stop treating DP tables as static magic numbers. Explore how subproblems are computed step-by-step, trace earlier dependencies in real time, and compare memoization, tabulation, and recursion.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button onClick={onExplore} className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}>
            <span>Explore Algorithms</span>
            <ArrowRight size={18} />
          </button>
          <button
            onClick={() => onSelectAlgorithm('knapsack_01')}
            className="btn btn-outline"
            style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}
          >
            <span>Try 0/1 Knapsack</span>
          </button>
        </div>
      </section>

      {/* Product Pillars / Principles */}
      <section style={{ margin: '2rem 0 3.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
          <div className="panel" style={{ background: '#ffffff' }}>
            <ShieldCheck size={26} color="var(--primary)" style={{ marginBottom: '0.75rem' }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.4rem', color: '#0f172a' }}>
              Correctness Before Animation
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.5 }}>
              All visual states derive from a real, deterministic algorithm execution engine—not hardcoded or fake mock UI animations.
            </p>
          </div>

          <div className="panel" style={{ background: '#ffffff' }}>
            <Play size={26} color="#0d9488" style={{ marginBottom: '0.75rem' }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.4rem', color: '#0f172a' }}>
              Explain Every Transition
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.5 }}>
              Every step isolates the target state, the exact earlier states read, and the arithmetic substitution that determined its value.
            </p>
          </div>

          <div className="panel" style={{ background: '#ffffff' }}>
            <Cpu size={26} color="#d97706" style={{ marginBottom: '0.75rem' }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.4rem', color: '#0f172a' }}>
              Transparent Measurements
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.5 }}>
              Theoretical Big-O time and space complexities are kept rigorously distinct from measured wall-clock milliseconds.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Algorithms */}
      <section style={{ marginBottom: '4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>Featured Algorithms</h2>
            <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
              Choose a problem to inspect its recurrence, state table, and execution trace.
            </p>
          </div>
          <button onClick={onExplore} className="btn btn-outline" style={{ fontSize: '0.85rem' }}>
            View All ({algorithms.length})
          </button>
        </div>

        <div className="card-grid">
          {algorithms.map((algo) => (
            <AlgorithmCard key={algo.id} algorithm={algo} onSelect={onSelectAlgorithm} />
          ))}
        </div>
      </section>
    </div>
  );
};
