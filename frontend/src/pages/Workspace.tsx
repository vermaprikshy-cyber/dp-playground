import React, { useState, useEffect, useRef } from 'react';
import { AlgorithmDetail, Preset, RunResponse } from '../types';
import { executeAlgorithm } from '../lib/api';
import { validateAlgorithmInput } from '../lib/validation';
import { deriveTableState } from '../features/trace-player/traceReducer';
import { DPTable } from '../components/DPTable';
import { TraceControls } from '../components/TraceControls';
import { InputForm } from '../components/InputForm';
import { StepExplanation } from '../components/StepExplanation';
import { ComplexityPanel } from '../components/ComplexityPanel';
import { RecurrencePanel } from '../components/RecurrencePanel';
import { ErrorBanner } from '../components/ErrorBanner';
import { ComparisonModal } from '../components/ComparisonModal';
import { PracticeMode } from '../components/PracticeMode';
import { Scale, Target, AlertTriangle, ChevronRight } from 'lucide-react';

interface WorkspaceProps {
  algorithm: AlgorithmDetail;
  onNavigateCatalogue: () => void;
}

export const Workspace: React.FC<WorkspaceProps> = ({ algorithm, onNavigateCatalogue }) => {
  // Strategy & inputs
  const [strategy, setStrategy] = useState<string>(algorithm.strategies[0] || 'tabulation');
  const [inputValues, setInputValues] = useState<Record<string, any>>(() => {
    if (algorithm.presets && algorithm.presets.length > 0) {
      return algorithm.presets[0].input;
    }
    if (algorithm.id === 'fibonacci' || algorithm.id === 'climbing_stairs') {
      return { n: 5 };
    }
    return { weights: [1, 3, 4, 5], values: [1, 4, 5, 7], capacity: 7 };
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Authoritative run response from API
  const [runResponse, setRunResponse] = useState<RunResponse | null>(null);
  const [isResultStale, setIsResultStale] = useState<boolean>(false);
  const [includeTrace, setIncludeTrace] = useState<boolean>(true);

  // Playback state
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speedMs, setSpeedMs] = useState<number>(600);

  // Modals / optional modes
  const [isComparisonOpen, setIsComparisonOpen] = useState<boolean>(false);
  const [isPracticeMode, setIsPracticeMode] = useState<boolean>(false);

  // Reset inputs when algorithm changes
  useEffect(() => {
    const defaultStrat = algorithm.strategies.includes('tabulation')
      ? 'tabulation'
      : algorithm.strategies[0];
    setStrategy(defaultStrat);

    const defaultInput =
      algorithm.presets && algorithm.presets.length > 0
        ? algorithm.presets[0].input
        : algorithm.id === 'knapsack_01'
        ? { weights: [1, 3, 4, 5], values: [1, 4, 5, 7], capacity: 7 }
        : { n: 5 };

    setInputValues(defaultInput);
    setValidationErrors({});
    setRunResponse(null);
    setIsResultStale(false);
    setActiveStep(0);
    setIsPlaying(false);
    setApiError(null);
    setIsPracticeMode(false);
  }, [algorithm.id]);

  // Handle inputs change
  const handleInputChange = (newVals: Record<string, any>) => {
    setInputValues(newVals);
    setValidationErrors({});
    if (runResponse) {
      setIsResultStale(true);
    }
  };

  const handleStrategyChange = (newStrat: string) => {
    setStrategy(newStrat);
    setValidationErrors({});
    if (runResponse) {
      setIsResultStale(true);
    }
  };

  const handleApplyPreset = (preset: Preset) => {
    setStrategy(preset.strategy);
    setInputValues(preset.input);
    setValidationErrors({});
    setIsResultStale(true);
  };

  const handleReset = () => {
    if (algorithm.presets && algorithm.presets.length > 0) {
      setStrategy(algorithm.presets[0].strategy);
      setInputValues(algorithm.presets[0].input);
    } else {
      setInputValues(algorithm.id === 'knapsack_01' ? { weights: [1, 3, 4, 5], values: [1, 4, 5, 7], capacity: 7 } : { n: 5 });
    }
    setValidationErrors({});
    setRunResponse(null);
    setIsResultStale(false);
    setActiveStep(0);
    setIsPlaying(false);
    setApiError(null);
  };

  // Run execution
  const handleRun = async () => {
    // 1. Client-side validation
    const validation = validateAlgorithmInput(algorithm.id, strategy, inputValues);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    setValidationErrors({});
    setApiError(null);
    setIsLoading(true);
    setIsPlaying(false);

    try {
      const response = await executeAlgorithm({
        algorithm_id: algorithm.id,
        strategy,
        input: inputValues,
        include_trace: includeTrace,
      });

      setRunResponse(response);
      setIsResultStale(false);
      setActiveStep(0);
    } catch (err: any) {
      setApiError(err.message || 'Failed to execute algorithm.');
    } finally {
      setIsLoading(false);
    }
  };

  // Playback loop
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  useEffect(() => {
    if (!isPlaying || !runResponse?.trace) return;

    const timer = setInterval(() => {
      setActiveStep((prev) => {
        if (!runResponse.trace) return prev;
        if (prev >= runResponse.trace.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, speedMs);

    return () => clearInterval(timer);
  }, [isPlaying, runResponse, speedMs]);

  const trace = runResponse?.trace || [];
  const totalSteps = trace.length;
  const currentEvent = trace.length > 0 ? trace[activeStep] : null;

  // Derived immutable table state
  const tableState = deriveTableState(trace, activeStep);

  return (
    <div className="container">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" style={{ marginBottom: '1.25rem', fontSize: '0.875rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <button onClick={onNavigateCatalogue} className="nav-link" style={{ padding: 0 }}>
          Algorithms
        </button>
        <ChevronRight size={14} />
        <span style={{ fontWeight: 600, color: '#0f172a' }}>{algorithm.name}</span>
      </nav>

      {apiError && <ErrorBanner message={apiError} onDismiss={() => setApiError(null)} />}

      <div className="workspace-grid">
        {/* Left Column (approx 30%): Configuration & Inputs */}
        <aside>
          <div className="panel">
            <div className="panel-header">
              <h2 className="panel-title">{algorithm.name}</h2>
              <span className={`tag ${algorithm.difficulty === 'Beginner' ? 'tag-beginner' : 'tag-intermediate'}`}>
                {algorithm.difficulty}
              </span>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '1.25rem', lineHeight: '1.5' }}>
              {algorithm.summary}
            </p>

            <InputForm
              algorithm={algorithm}
              strategy={strategy}
              onStrategyChange={handleStrategyChange}
              inputValues={inputValues}
              onInputChange={handleInputChange}
              includeTrace={includeTrace}
              onIncludeTraceChange={setIncludeTrace}
              onRun={handleRun}
              onReset={handleReset}
              onApplyPreset={handleApplyPreset}
              validationErrors={validationErrors}
              isLoading={isLoading}
            />

            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setIsComparisonOpen(true)}
                className="btn btn-outline"
                style={{ flex: 1, fontSize: '0.8rem', justifyContent: 'center' }}
                title="Compare Tabulation vs Memoization vs Recursion side-by-side"
              >
                <Scale size={14} />
                <span>Compare</span>
              </button>

              <button
                type="button"
                onClick={() => setIsPracticeMode(!isPracticeMode)}
                className={`btn ${isPracticeMode ? 'btn-teal' : 'btn-outline'}`}
                style={{ flex: 1, fontSize: '0.8rem', justifyContent: 'center' }}
                title="Practice predicting missing DP cell values"
              >
                <Target size={14} />
                <span>Practice</span>
              </button>
            </div>
          </div>

          {/* Recurrence and Base Cases Panel */}
          <RecurrencePanel algorithm={algorithm} />

          {/* Complexity & Metrics Panel */}
          <ComplexityPanel
            complexity={
              runResponse?.complexity ||
              algorithm.complexity[strategy] || { time: 'O(?)', space: 'O(?)' }
            }
            metrics={runResponse?.metrics}
            strategy={strategy}
          />
        </aside>

        {/* Main Column (approx 70%): Visualizer Table, Controls, Explanations */}
        <main>
          {/* Stale result warning if inputs changed */}
          {isResultStale && (
            <div
              style={{
                background: '#fffbeb',
                border: '1px solid #fde68a',
                color: '#b45309',
                padding: '0.6rem 0.85rem',
                borderRadius: '6px',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.85rem',
              }}
            >
              <AlertTriangle size={16} />
              <span>Inputs or strategy changed. Click <strong>Run Algorithm</strong> to recompute the table.</span>
            </div>
          )}

          {/* Result Banner */}
          {runResponse && (
            <div className="result-summary-box">
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                  Authoritative Result:
                </span>
                <div className="result-value">
                  {algorithm.id === 'knapsack_01' ? (
                    <span>
                      Max Value: <strong style={{ color: '#0d9488' }}>{runResponse.result.max_value}</strong>
                      {runResponse.result.selected_item_indices && (
                        <span style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 500, marginLeft: '0.75rem' }}>
                          (Items chosen: [{runResponse.result.selected_item_indices.join(', ')}])
                        </span>
                      )}
                    </span>
                  ) : algorithm.id === 'climbing_stairs' ? (
                    <span>
                      Distinct Ways: <strong style={{ color: '#0d9488' }}>{runResponse.result.ways}</strong>
                    </span>
                  ) : (
                    <span>
                      F({inputValues.n}) = <strong style={{ color: '#0d9488' }}>{runResponse.result.value}</strong>
                    </span>
                  )}
                </div>
              </div>

              <div style={{ fontSize: '0.8rem', color: '#64748b', textAlign: 'right' }}>
                <div>Total Events: <strong>{totalSteps}</strong></div>
                <div>Status: <span style={{ color: '#0d9488', fontWeight: 600 }}>Optimal</span></div>
              </div>
            </div>
          )}

          {/* DP Table Panel */}
          <div className="panel">
            <div className="panel-header">
              <h3 className="panel-title">
                <span>Dynamic Programming State Table</span>
              </h3>
              {runResponse?.visualization && (
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  {runResponse.visualization.kind === 'grid' ? '2D Matrix' : '1D Linear Array'}
                </span>
              )}
            </div>

            {runResponse && (!runResponse.trace || runResponse.trace.length === 0) ? (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b' }}>Trace Output Omitted</h4>
                <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.35rem' }}>
                  This run completed without emitting intermediate trace steps (<code>include_trace: false</code>). The final authoritative result is displayed in the summary banner above.
                </p>
                <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                  To replay step-by-step state transitions, check <strong>Include execution trace</strong> and run again.
                </p>
              </div>
            ) : runResponse?.visualization ? (
              <DPTable config={runResponse.visualization} tableState={tableState} />
            ) : (
              <div style={{ textAlign: 'center', padding: '3.5rem 1rem', background: '#f8fafc', borderRadius: '6px', border: '1px dashed #cbd5e1' }}>
                <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
                  No execution trace loaded yet. Click <strong>Run algorithm</strong> in the left panel to populate the DP table.
                </p>
              </div>
            )}

            {/* Playback Controls */}
            {totalSteps > 0 && (
              <TraceControls
                currentStep={activeStep}
                totalSteps={totalSteps}
                isPlaying={isPlaying}
                speedMs={speedMs}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onStepForward={() => setActiveStep((prev) => Math.min(prev + 1, totalSteps - 1))}
                onStepBackward={() => setActiveStep((prev) => Math.max(prev - 1, 0))}
                onReset={() => {
                  setIsPlaying(false);
                  setActiveStep(0);
                }}
                onJumpToEnd={() => {
                  setIsPlaying(false);
                  setActiveStep(totalSteps - 1);
                }}
                onStepChange={(step) => {
                  setIsPlaying(false);
                  setActiveStep(step);
                }}
                onSpeedChange={(newSpeed) => setSpeedMs(newSpeed)}
                disabled={isLoading}
              />
            )}
          </div>

          {/* Current Step Explanation */}
          <StepExplanation event={currentEvent} stepIndex={activeStep} totalSteps={totalSteps} />

          {/* Practice Mode */}
          {isPracticeMode && (
            <PracticeMode
              algorithm={algorithm}
              runResponse={runResponse}
              onExit={() => setIsPracticeMode(false)}
            />
          )}
        </main>
      </div>

      {/* Comparison Modal */}
      <ComparisonModal
        algorithm={algorithm}
        currentInput={inputValues}
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
      />
    </div>
  );
};
