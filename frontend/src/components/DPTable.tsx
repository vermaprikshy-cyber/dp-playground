import React from 'react';
import { TableState } from '../types';
import { VisualizationConfig } from '../types';
import { stateToKey } from '../features/trace-player/traceReducer';

interface DPTableProps {
  config: VisualizationConfig;
  tableState: TableState;
}

export const DPTable: React.FC<DPTableProps> = ({ config, tableState }) => {
  const { cells, activeEvent, activeDependencies, recentWriteKey } = tableState;

  if (config.kind === 'row') {
    // 1D Table for linear DP (Fibonacci, Climbing Stairs)
    const labels = config.labels || [];
    const indexKey = config.index_key || 'n';

    return (
      <div className="dp-table-container">
        <div style={{ marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#334155' }}>{config.title}</h4>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{config.legend}</span>
        </div>

        <div className="table-viewport">
          <table className="dp-table" aria-label={config.title}>
            <thead>
              <tr>
                <th className="corner-cell" style={{ width: '80px' }}>State</th>
                {labels.map((label, idx) => (
                  <th key={idx}>{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th className="row-header">Value</th>
                {labels.map((_, idx) => {
                  const stateKey = stateToKey({ [indexKey]: idx });
                  const isFilled = Object.prototype.hasOwnProperty.call(cells, stateKey);
                  const val = isFilled ? cells[stateKey] : '—';
                  const isActive = activeEvent ? stateToKey(activeEvent.state) === stateKey : false;
                  const isDep = activeDependencies.has(stateKey);
                  const isRecent = recentWriteKey === stateKey;

                  let cellClass = 'dp-cell';
                  if (isActive) cellClass += ' cell-active';
                  else if (isDep) cellClass += ' cell-dependency';
                  else if (isRecent) cellClass += ' cell-written';
                  else if (isFilled) cellClass += ' cell-filled';
                  else cellClass += ' cell-empty';

                  return (
                    <td key={idx} className={cellClass} title={`${indexKey}=${idx}: ${val}`}>
                      {isActive && <span className="cell-badge active-badge">CUR</span>}
                      {isDep && !isActive && <span className="cell-badge dep-badge">DEP</span>}
                      <span>{val}</span>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // 2D Grid Table for Knapsack
  const rowLabels = config.row_labels || [];
  const colLabels = config.col_labels || [];
  const rowKey = config.row_key || 'i';
  const colKey = config.col_key || 'w';

  return (
    <div className="dp-table-container">
      <div style={{ marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#334155' }}>{config.title}</h4>
        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{config.legend}</span>
      </div>

      <div className="table-viewport">
        <table className="dp-table" aria-label={config.title}>
          <thead>
            <tr>
              <th className="corner-cell" style={{ minWidth: '120px' }}>Items \ Cap</th>
              {colLabels.map((cLabel, cIdx) => (
                <th key={cIdx}>{cLabel}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rowLabels.map((rLabel, rIdx) => (
              <tr key={rIdx}>
                <th className="row-header">{rLabel}</th>
                {colLabels.map((_, cIdx) => {
                  const stateKey = stateToKey({ [rowKey]: rIdx, [colKey]: cIdx });
                  const isFilled = Object.prototype.hasOwnProperty.call(cells, stateKey);
                  const val = isFilled ? cells[stateKey] : '—';
                  const isActive = activeEvent ? stateToKey(activeEvent.state) === stateKey : false;
                  const isDep = activeDependencies.has(stateKey);
                  const isRecent = recentWriteKey === stateKey;

                  let cellClass = 'dp-cell';
                  if (isActive) cellClass += ' cell-active';
                  else if (isDep) cellClass += ' cell-dependency';
                  else if (isRecent) cellClass += ' cell-written';
                  else if (isFilled) cellClass += ' cell-filled';
                  else cellClass += ' cell-empty';

                  return (
                    <td key={cIdx} className={cellClass} title={`dp[${rIdx}][${cIdx}] = ${val}`}>
                      {isActive && <span className="cell-badge active-badge">CUR</span>}
                      {isDep && !isActive && <span className="cell-badge dep-badge">DEP</span>}
                      <span>{val}</span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
