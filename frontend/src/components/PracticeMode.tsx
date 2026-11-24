import React, { useState } from 'react';
import { AlgorithmDetail, RunResponse } from '../types';
import { Target, CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';

interface PracticeModeProps {
  algorithm: AlgorithmDetail;
  runResponse: RunResponse | null;
  onExit: () => void;
}

export const PracticeMode: React.FC<PracticeModeProps> = ({ runResponse, onExit }) => {
  const [selectedCell, setSelectedCell] = useState<{ step: number; stateStr: string; actualValue: number } | null>(null);
  const [userGuess, setUserGuess] = useState('');
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null);

  if (!runResponse || !runResponse.trace || runResponse.trace.length === 0) {
    return (
      <div className="panel" style={{ marginTop: '1rem', textAlign: 'center', padding: '2rem' }}>
        <HelpCircle size={32} color="#64748b" style={{ margin: '0 auto 0.75rem' }} />
        <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>Run the algorithm first</h4>
        <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
          Please execute a run in the workspace to generate trace states for practice mode.
        </p>
      </div>
    );
  }

  // Filter trace steps that write a value and have dependencies (great for quizzes!)
  const quizCandidates = runResponse.trace.filter(
    (e) => e.writes && e.dependencies && e.dependencies.length > 0 && typeof e.value === 'number'
  );

  const startQuizForStep = (stepIdx: number) => {
    const event = runResponse.trace![stepIdx];
    const stateStr = Object.entries(event.state)
      .map(([k, v]) => `${k}=${v}`)
      .join(', ');
    setSelectedCell({
      step: stepIdx,
      stateStr,
      actualValue: event.value,
    });
    setUserGuess('');
    setFeedback(null);
  };

  const handleCheckAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCell) return;
    const guessNum = parseInt(userGuess, 10);
    if (isNaN(guessNum)) {
      setFeedback({ correct: false, message: 'Please enter a valid integer.' });
      return;
    }

    const event = runResponse.trace![selectedCell.step];
    if (guessNum === selectedCell.actualValue) {
      setFeedback({
        correct: true,
        message: `Correct! ${event.explanation} (${event.operation || ''})`,
      });
    } else {
      setFeedback({
        correct: false,
        message: `Not quite. Expected ${selectedCell.actualValue}. Hint: ${event.operation || 'Check the recurrence dependencies!'}`,
      });
    }
  };

  return (
    <div className="panel" style={{ marginTop: '1.25rem' }}>
      <div className="panel-header">
        <h4 className="panel-title">
          <Target size={18} color="var(--primary)" />
          <span>Practice Mode: State Value Prediction</span>
        </h4>
        <button onClick={onExit} className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.25rem 0.6rem' }}>
          Exit Practice
        </button>
      </div>

      <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '1rem' }}>
        Select a DP state below, deduce its value using the recurrence relation and earlier dependency states, and submit your prediction!
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
        {quizCandidates.slice(0, 12).map((cand) => {
          const sStr = Object.entries(cand.state)
            .map(([k, v]) => `${k}=${v}`)
            .join(', ');
          const isSelected = selectedCell?.step === cand.step;

          return (
            <button
              key={cand.step}
              onClick={() => startQuizForStep(cand.step)}
              className="btn"
              style={{
                background: isSelected ? 'var(--primary)' : '#f1f5f9',
                color: isSelected ? '#ffffff' : '#334155',
                padding: '0.3rem 0.6rem',
                fontSize: '0.8rem',
                fontFamily: 'var(--font-mono)',
              }}
            >
              [{sStr}]
            </button>
          );
        })}
      </div>

      {selectedCell && (
        <form onSubmit={handleCheckAnswer} style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ marginBottom: '0.75rem', fontWeight: 600, color: '#0f172a' }}>
            Predict value for State: <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>[{selectedCell.stateStr}]</code>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input
              type="number"
              className="form-input"
              value={userGuess}
              onChange={(e) => setUserGuess(e.target.value)}
              placeholder="Enter your calculated value..."
              style={{ maxWidth: '240px' }}
              autoFocus
            />
            <button type="submit" className="btn btn-primary">
              Check Answer
            </button>
          </div>

          {feedback && (
            <div
              style={{
                marginTop: '0.75rem',
                padding: '0.6rem 0.85rem',
                borderRadius: '6px',
                background: feedback.correct ? '#f0fdfa' : '#fef2f2',
                border: `1px solid ${feedback.correct ? '#99f6e4' : '#fecaca'}`,
                color: feedback.correct ? '#0f766e' : '#991b1b',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.85rem',
              }}
            >
              {feedback.correct ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              <span>{feedback.message}</span>
            </div>
          )}
        </form>
      )}
    </div>
  );
};
