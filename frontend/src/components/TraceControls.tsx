import React, { useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, FastForward } from 'lucide-react';

interface TraceControlsProps {
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  speedMs: number;
  onPlay: () => void;
  onPause: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onReset: () => void;
  onJumpToEnd: () => void;
  onStepChange: (step: number) => void;
  onSpeedChange: (speedMs: number) => void;
  disabled?: boolean;
}

export const TraceControls: React.FC<TraceControlsProps> = ({
  currentStep,
  totalSteps,
  isPlaying,
  speedMs,
  onPlay,
  onPause,
  onStepForward,
  onStepBackward,
  onReset,
  onJumpToEnd,
  onStepChange,
  onSpeedChange,
  disabled = false,
}) => {
  // Global keyboard shortcuts for accessible playback
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled || totalSteps <= 0) return;
      // Don't trigger if user is typing inside an input
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        if (isPlaying) onPause();
        else onPlay();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        onStepForward();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        onStepBackward();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        onReset();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [disabled, totalSteps, isPlaying, onPause, onPlay, onStepForward, onStepBackward, onReset]);

  const isAtStart = currentStep <= 0;
  const isAtEnd = currentStep >= totalSteps - 1;

  return (
    <div className="controls-bar" aria-label="Algorithm Trace Controls">
      <div className="controls-group">
        <button
          onClick={onReset}
          disabled={disabled || isAtStart}
          className="btn btn-outline"
          title="Reset to step 0 (Shortcut: R)"
          aria-label="Reset to beginning"
        >
          <RotateCcw size={16} />
          <span>Reset</span>
        </button>

        <button
          onClick={onStepBackward}
          disabled={disabled || isAtStart}
          className="btn btn-outline"
          title="Previous step (Shortcut: Left Arrow)"
          aria-label="Step Backward"
        >
          <SkipBack size={16} />
          <span>Prev</span>
        </button>

        {isPlaying ? (
          <button
            onClick={onPause}
            disabled={disabled}
            className="btn btn-primary"
            title="Pause playback (Shortcut: Space)"
            aria-label="Pause playback"
          >
            <Pause size={16} />
            <span>Pause</span>
          </button>
        ) : (
          <button
            onClick={onPlay}
            disabled={disabled || isAtEnd}
            className="btn btn-primary"
            title="Play execution trace (Shortcut: Space)"
            aria-label="Play execution trace"
          >
            <Play size={16} />
            <span>Play</span>
          </button>
        )}

        <button
          onClick={onStepForward}
          disabled={disabled || isAtEnd}
          className="btn btn-outline"
          title="Next step (Shortcut: Right Arrow)"
          aria-label="Step Forward"
        >
          <SkipForward size={16} />
          <span>Next</span>
        </button>

        <button
          onClick={onJumpToEnd}
          disabled={disabled || isAtEnd}
          className="btn btn-outline"
          title="Jump to completion"
          aria-label="Jump to End"
        >
          <FastForward size={16} />
        </button>
      </div>

      <div className="controls-group" style={{ flex: '1 1 200px', maxWidth: '300px' }}>
        <input
          type="range"
          min={0}
          max={Math.max(0, totalSteps - 1)}
          value={currentStep}
          onChange={(e) => onStepChange(parseInt(e.target.value, 10))}
          disabled={disabled || totalSteps <= 1}
          style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
          aria-label="Step slider"
        />
      </div>

      <div className="controls-group">
        <span className="step-indicator">
          Step {totalSteps > 0 ? currentStep + 1 : 0} of {totalSteps}
        </span>

        <label htmlFor="speed-select" style={{ fontSize: '0.8rem', color: '#64748b' }}>
          Speed:
        </label>
        <select
          id="speed-select"
          className="speed-select"
          value={speedMs}
          onChange={(e) => onSpeedChange(parseInt(e.target.value, 10))}
          disabled={disabled}
        >
          <option value={1200}>0.5x (Slow)</option>
          <option value={600}>1x (Normal)</option>
          <option value={250}>2x (Fast)</option>
          <option value={80}>5x (Turbo)</option>
        </select>
      </div>
    </div>
  );
};
