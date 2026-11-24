import React, { useEffect, useState } from 'react';
import { fetchHealth } from '../lib/api';
import { Server, Code2, ShieldAlert, Cpu } from 'lucide-react';

export const About: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<any>(null);

  useEffect(() => {
    fetchHealth()
      .then((data) => setHealthStatus(data))
      .catch((err) => setHealthStatus({ status: 'error', message: err.message }));
  }, []);

  return (
    <div className="container" style={{ maxWidth: '960px' }}>
      <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>
          Architecture & Design Specifications
        </h1>
        <p style={{ fontSize: '1.05rem', color: '#475569', lineHeight: 1.6 }}>
          How Dynamic Programming Playground enforces correctness, security, and strict separation of concerns.
        </p>
      </div>

      {/* Live System Diagnostics */}
      <section className="panel" style={{ marginBottom: '2rem', background: '#f8fafc' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Server size={20} color="var(--primary)" />
          <span>Live Service Diagnostic</span>
        </h2>
        <div style={{ fontSize: '0.875rem', color: '#334155' }}>
          <div>FastAPI API Health: <strong>{healthStatus?.status || 'Checking...'}</strong></div>
          <div>C++ Engine Worker Status: <strong>{healthStatus?.worker_ready ? 'Compiled and Verified' : 'Checking...'}</strong></div>
        </div>
      </section>

      {/* Layer breakdown */}
      <section className="panel" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem' }}>
          3-Tier System Architecture
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e40af', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Code2 size={18} />
              <span>1. React + TypeScript UI</span>
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
              Collects user input, validates field ranges, dispatches execution requests, and deterministically renders the DP state table and dependency highlights.
            </p>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0d9488', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Server size={18} />
              <span>2. Python FastAPI Gateway</span>
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
              Enforces schema validation via Pydantic, applies algorithmic boundary limits, manages child subprocess timeouts, and strips internal stack traces from error responses.
            </p>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#d97706', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Cpu size={18} />
              <span>3. C++14 Algorithm Engine</span>
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
              Provides authoritative algorithmic implementations for Fibonacci, Climbing Stairs, and 0/1 Knapsack, emitting fine-grained state updates over stdout.
            </p>
          </div>
        </div>
      </section>

      {/* Security Safeguards */}
      <section className="panel">
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldAlert size={20} color="#dc2626" />
          <span>Security & Operational Safeguards</span>
        </h2>

        <ul style={{ paddingLeft: '1.25rem', fontSize: '0.875rem', color: '#475569', lineHeight: 1.7 }}>
          <li><strong>No arbitrary code execution:</strong> Only fixed pre-compiled DSA algorithms are executed. No user-supplied code is ever run.</li>
          <li><strong>Subprocess timeouts:</strong> Strict execution time caps prevent infinite loops or hung processes.</li>
          <li><strong>Memory and trace event bounds:</strong> Limits cap max items, table capacity, and trace event length to ensure instant responsiveness.</li>
          <li><strong>Clean error boundary:</strong> Malformed or out-of-range inputs return learner-friendly 4xx responses without exposing internal server paths or stack traces.</li>
        </ul>
      </section>
    </div>
  );
};
