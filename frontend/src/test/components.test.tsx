import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TraceControls } from '../components/TraceControls';
import { StepExplanation } from '../components/StepExplanation';
import { ComplexityPanel } from '../components/ComplexityPanel';
import { AlgorithmCard } from '../components/AlgorithmCard';
import { DPTable } from '../components/DPTable';
import { AlgorithmDetail, TableState, TraceEvent } from '../types';

describe('Frontend UI Components', () => {
  it('renders TraceControls and handles play/next/prev/reset actions', () => {
    const onPlay = vi.fn();
    const onPause = vi.fn();
    const onStepForward = vi.fn();
    const onStepBackward = vi.fn();
    const onReset = vi.fn();
    const onJumpToEnd = vi.fn();
    const onStepChange = vi.fn();
    const onSpeedChange = vi.fn();

    const { rerender } = render(
      <TraceControls
        currentStep={2}
        totalSteps={5}
        isPlaying={false}
        speedMs={600}
        onPlay={onPlay}
        onPause={onPause}
        onStepForward={onStepForward}
        onStepBackward={onStepBackward}
        onReset={onReset}
        onJumpToEnd={onJumpToEnd}
        onStepChange={onStepChange}
        onSpeedChange={onSpeedChange}
      />
    );

    expect(screen.getByText('Step 3 of 5')).toBeInTheDocument();

    const playBtn = screen.getByLabelText('Play execution trace');
    fireEvent.click(playBtn);
    expect(onPlay).toHaveBeenCalledTimes(1);

    const nextBtn = screen.getByLabelText('Step Forward');
    fireEvent.click(nextBtn);
    expect(onStepForward).toHaveBeenCalledTimes(1);

    const prevBtn = screen.getByLabelText('Step Backward');
    fireEvent.click(prevBtn);
    expect(onStepBackward).toHaveBeenCalledTimes(1);

    const resetBtn = screen.getByLabelText('Reset to beginning');
    fireEvent.click(resetBtn);
    expect(onReset).toHaveBeenCalledTimes(1);

    // When playing, pause button should appear
    rerender(
      <TraceControls
        currentStep={2}
        totalSteps={5}
        isPlaying={true}
        speedMs={600}
        onPlay={onPlay}
        onPause={onPause}
        onStepForward={onStepForward}
        onStepBackward={onStepBackward}
        onReset={onReset}
        onJumpToEnd={onJumpToEnd}
        onStepChange={onStepChange}
        onSpeedChange={onSpeedChange}
      />
    );
    const pauseBtn = screen.getByLabelText('Pause playback');
    fireEvent.click(pauseBtn);
    expect(onPause).toHaveBeenCalledTimes(1);
  });

  it('renders StepExplanation with state, operation, and dependencies', () => {
    const event: TraceEvent = {
      step: 3,
      kind: 'update',
      state: { i: 2, w: 5 },
      writes: true,
      value: 7,
      dependencies: [{ i: 1, w: 5 }, { i: 1, w: 2 }],
      operation: 'max(4, 3 + 4)',
      explanation: 'Item 2 included because 7 > 4.',
      label: 'dp[2][5]',
    };

    render(<StepExplanation event={event} stepIndex={3} totalSteps={10} />);

    expect(screen.getByText('State [i=2, w=5]')).toBeInTheDocument();
    expect(screen.getByText('Item 2 included because 7 > 4.')).toBeInTheDocument();
    expect(screen.getByText('max(4, 3 + 4)')).toBeInTheDocument();
    expect(screen.getByText(/Event 4 of 10/)).toBeInTheDocument();
  });

  it('renders ComplexityPanel with separated Big-O and measured metrics', () => {
    render(
      <ComplexityPanel
        complexity={{ time: 'O(n * W)', space: 'O(n * W)' }}
        metrics={{ state_count: 24, elapsed_ms: 0.125 }}
        strategy="tabulation"
      />
    );

    expect(screen.getAllByText('O(n * W)').length).toBe(2);
    expect(screen.getByText('24')).toBeInTheDocument();
    expect(screen.getByText('0.125 ms')).toBeInTheDocument();
    expect(screen.getByText(/Asymptotic Big-O vs Measured Time/)).toBeInTheDocument();
  });

  it('renders AlgorithmCard and handles select', () => {
    const onSelect = vi.fn();
    const algo: AlgorithmDetail = {
      id: 'knapsack_01',
      name: '0/1 Knapsack',
      difficulty: 'Intermediate',
      family: 'Optimization',
      topics: ['2D DP', 'Subset Selection'],
      strategies: ['tabulation', 'memoization'],
      summary: 'Maximize value without exceeding capacity',
      description: 'Full description',
      state_definition: 'dp[i][w]',
      recurrence: 'dp[i][w] = max(...)',
      base_cases: ['dp[0][w] = 0'],
      complexity: { tabulation: { time: 'O(n*W)', space: 'O(n*W)' } },
      constraints: {},
      presets: [],
    };

    render(<AlgorithmCard algorithm={algo} onSelect={onSelect} />);

    expect(screen.getByText('0/1 Knapsack')).toBeInTheDocument();
    expect(screen.getByText('Intermediate')).toBeInTheDocument();
    const openBtn = screen.getByLabelText('Open 0/1 Knapsack workspace');
    fireEvent.click(openBtn);
    expect(onSelect).toHaveBeenCalledWith('knapsack_01');
  });

  it('renders 1D DPTable correctly', () => {
    const tableState: TableState = {
      cells: { 'n=0': 0, 'n=1': 1, 'n=2': 1 },
      activeEvent: {
        step: 2,
        kind: 'update',
        state: { n: 2 },
        writes: true,
        value: 1,
        dependencies: [{ n: 1 }, { n: 0 }],
        explanation: 'F(2) = 1',
      },
      activeDependencies: new Set(['n=1', 'n=0']),
      recentWriteKey: 'n=2',
    };

    render(
      <DPTable
        config={{
          kind: 'row',
          title: 'Fibonacci Array',
          legend: 'States F(0)..F(3)',
          labels: ['F(0)', 'F(1)', 'F(2)', 'F(3)'],
          index_key: 'n',
        }}
        tableState={tableState}
      />
    );

    expect(screen.getByText('Fibonacci Array')).toBeInTheDocument();
    expect(screen.getByText('F(0)')).toBeInTheDocument();
    expect(screen.getByText('CUR')).toBeInTheDocument();
    expect(screen.getAllByText('DEP').length).toBeGreaterThan(0);
  });
});
