import React, { useState } from 'react';
import { AlgorithmDetail } from '../types';
import { AlgorithmCard } from '../components/AlgorithmCard';
import { Search } from 'lucide-react';

interface CatalogueProps {
  algorithms: AlgorithmDetail[];
  onSelectAlgorithm: (id: string) => void;
}

export const Catalogue: React.FC<CatalogueProps> = ({ algorithms, onSelectAlgorithm }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedFamily, setSelectedFamily] = useState<string>('All');

  const filteredAlgorithms = algorithms.filter((algo) => {
    const matchesSearch =
      algo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      algo.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      algo.topics.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDifficulty = selectedDifficulty === 'All' || algo.difficulty === selectedDifficulty;
    const matchesFamily = selectedFamily === 'All' || algo.family === selectedFamily;

    return matchesSearch && matchesDifficulty && matchesFamily;
  });

  const families = ['All', ...Array.from(new Set(algorithms.map((a) => a.family)))];

  return (
    <div className="container">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
          Algorithm Catalogue
        </h1>
        <p style={{ fontSize: '0.95rem', color: '#64748b' }}>
          Explore our curriculum of dynamic programming problems, sorted by state formulation and problem family.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          marginBottom: '2rem',
          padding: '1rem',
          background: '#ffffff',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <div style={{ flex: '1 1 280px', position: 'relative' }}>
          <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '11px' }} />
          <input
            type="text"
            className="form-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by algorithm name, topic, or keyword..."
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Difficulty:</span>
            <select
              className="form-select"
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              style={{ width: 'auto' }}
            >
              <option value="All">All Difficulties</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Family:</span>
            <select
              className="form-select"
              value={selectedFamily}
              onChange={(e) => setSelectedFamily(e.target.value)}
              style={{ width: 'auto' }}
            >
              {families.map((f) => (
                <option key={f} value={f}>
                  {f === 'All' ? 'All Families' : f}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Results */}
      {filteredAlgorithms.length > 0 ? (
        <div className="card-grid">
          {filteredAlgorithms.map((algo) => (
            <AlgorithmCard key={algo.id} algorithm={algo} onSelect={onSelectAlgorithm} />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '3rem', background: '#ffffff', borderRadius: '8px' }}>
          <p style={{ color: '#64748b' }}>No algorithms matched your filter criteria.</p>
        </div>
      )}
    </div>
  );
};
