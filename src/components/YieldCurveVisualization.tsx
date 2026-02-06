import { useState } from 'react';
import './YieldCurveVisualization.css';

type CurveType = 'normal' | 'inverted' | 'flat' | 'humped' | 'custom';

interface YieldPoint {
  maturity: string;
  years: number;
  yield: number;
}

const INITIAL_CURVES: Record<CurveType, YieldPoint[]> = {
  normal: [
    { maturity: '3M', years: 0.25, yield: 2.5 },
    { maturity: '6M', years: 0.5, yield: 2.8 },
    { maturity: '1Y', years: 1, yield: 3.2 },
    { maturity: '2Y', years: 2, yield: 3.8 },
    { maturity: '5Y', years: 5, yield: 4.5 },
    { maturity: '7Y', years: 7, yield: 4.8 },
    { maturity: '10Y', years: 10, yield: 5.0 },
    { maturity: '20Y', years: 20, yield: 5.3 },
    { maturity: '30Y', years: 30, yield: 5.5 },
  ],
  inverted: [
    { maturity: '3M', years: 0.25, yield: 5.5 },
    { maturity: '6M', years: 0.5, yield: 5.2 },
    { maturity: '1Y', years: 1, yield: 4.8 },
    { maturity: '2Y', years: 2, yield: 4.2 },
    { maturity: '5Y', years: 5, yield: 3.5 },
    { maturity: '7Y', years: 7, yield: 3.2 },
    { maturity: '10Y', years: 10, yield: 3.0 },
    { maturity: '20Y', years: 20, yield: 2.8 },
    { maturity: '30Y', years: 30, yield: 2.7 },
  ],
  flat: [
    { maturity: '3M', years: 0.25, yield: 4.0 },
    { maturity: '6M', years: 0.5, yield: 4.0 },
    { maturity: '1Y', years: 1, yield: 4.0 },
    { maturity: '2Y', years: 2, yield: 4.0 },
    { maturity: '5Y', years: 5, yield: 4.0 },
    { maturity: '7Y', years: 7, yield: 4.0 },
    { maturity: '10Y', years: 10, yield: 4.0 },
    { maturity: '20Y', years: 20, yield: 4.0 },
    { maturity: '30Y', years: 30, yield: 4.0 },
  ],
  humped: [
    { maturity: '3M', years: 0.25, yield: 3.0 },
    { maturity: '6M', years: 0.5, yield: 3.5 },
    { maturity: '1Y', years: 1, yield: 4.0 },
    { maturity: '2Y', years: 2, yield: 4.8 },
    { maturity: '5Y', years: 5, yield: 5.2 },
    { maturity: '7Y', years: 7, yield: 4.8 },
    { maturity: '10Y', years: 10, yield: 4.2 },
    { maturity: '20Y', years: 20, yield: 3.8 },
    { maturity: '30Y', years: 30, yield: 3.5 },
  ],
  custom: [
    { maturity: '3M', years: 0.25, yield: 3.0 },
    { maturity: '6M', years: 0.5, yield: 3.2 },
    { maturity: '1Y', years: 1, yield: 3.5 },
    { maturity: '2Y', years: 2, yield: 4.0 },
    { maturity: '5Y', years: 5, yield: 4.5 },
    { maturity: '7Y', years: 7, yield: 4.7 },
    { maturity: '10Y', years: 10, yield: 5.0 },
    { maturity: '20Y', years: 20, yield: 5.2 },
    { maturity: '30Y', years: 30, yield: 5.4 },
  ],
};

function YieldCurveVisualization() {
  const [curveType, setCurveType] = useState<CurveType>('normal');
  const [curve, setCurve] = useState<YieldPoint[]>(INITIAL_CURVES.normal);
  const [showGrid, setShowGrid] = useState(true);
  const [showLabels, setShowLabels] = useState(true);

  const handleCurveChange = (type: CurveType) => {
    setCurveType(type);
    setCurve([...INITIAL_CURVES[type]]);
  };

  const handleYieldChange = (index: number, newYield: number) => {
    const newCurve = [...curve];
    newCurve[index].yield = newYield;
    setCurve(newCurve);
    setCurveType('custom');
  };

  // Calculate statistics
  const yield2Y = curve.find(p => p.years === 2)?.yield || 0;
  const yield10Y = curve.find(p => p.years === 10)?.yield || 0;
  const spread = yield10Y - yield2Y;
  const avgYield = curve.reduce((sum, p) => sum + p.yield, 0) / curve.length;

  let steepness = 'Flat';
  if (spread > 1) steepness = 'Steep (Normal)';
  else if (spread < -1) steepness = 'Inverted';
  else if (spread > 0) steepness = 'Slightly Upward';
  else if (spread < 0) steepness = 'Slightly Inverted';

  // SVG dimensions
  const width = 800;
  const height = 400;
  const margin = { top: 20, right: 40, bottom: 60, left: 60 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const maxYears = Math.max(...curve.map(p => p.years));
  const maxYield = Math.max(...curve.map(p => p.yield));
  const minYield = Math.min(...curve.map(p => p.yield));

  const xScale = (years: number) => (years / maxYears) * chartWidth;
  const yScale = (yieldVal: number) => chartHeight - ((yieldVal - minYield + 0.5) / (maxYield - minYield + 1)) * chartHeight;

  // Generate path
  const pathD = curve.map((point, i) => {
    const x = xScale(point.years);
    const y = yScale(point.yield);
    return i === 0 ? `M ${x},${y}` : `L ${x},${y}`;
  }).join(' ');

  return (
    <div className="section yield-curve">
      <h2>Yield Curve Visualization</h2>
      <p>Explore different yield curve shapes and understand the term structure of interest rates.</p>

      <div className="curve-controls">
        <div className="curve-buttons">
          <button
            className={`curve-btn ${curveType === 'normal' ? 'active' : ''}`}
            onClick={() => handleCurveChange('normal')}
          >
            Normal
          </button>
          <button
            className={`curve-btn ${curveType === 'inverted' ? 'active' : ''}`}
            onClick={() => handleCurveChange('inverted')}
          >
            Inverted
          </button>
          <button
            className={`curve-btn ${curveType === 'flat' ? 'active' : ''}`}
            onClick={() => handleCurveChange('flat')}
          >
            Flat
          </button>
          <button
            className={`curve-btn ${curveType === 'humped' ? 'active' : ''}`}
            onClick={() => handleCurveChange('humped')}
          >
            Humped
          </button>
          <button
            className={`curve-btn ${curveType === 'custom' ? 'active' : ''}`}
            onClick={() => handleCurveChange('custom')}
          >
            Custom
          </button>
        </div>

        <div className="view-controls">
          <label>
            <input
              type="checkbox"
              checked={showGrid}
              onChange={(e) => setShowGrid(e.target.checked)}
            />
            Show Grid
          </label>
          <label>
            <input
              type="checkbox"
              checked={showLabels}
              onChange={(e) => setShowLabels(e.target.checked)}
            />
            Show Labels
          </label>
        </div>
      </div>

      <div className="chart-container">
        <svg width={width} height={height} className="yield-curve-svg">
          <g transform={`translate(${margin.left},${margin.top})`}>
            {/* Grid lines */}
            {showGrid && (
              <g className="grid">
                {[0, 1, 2, 3, 4, 5, 6].map(i => {
                  const y = (i / 6) * chartHeight;
                  return (
                    <line
                      key={`grid-h-${i}`}
                      x1={0}
                      y1={y}
                      x2={chartWidth}
                      y2={y}
                      stroke="#e0e0e0"
                      strokeWidth={1}
                    />
                  );
                })}
              </g>
            )}

            {/* Axes */}
            <line x1={0} y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke="#333" strokeWidth={2} />
            <line x1={0} y1={0} x2={0} y2={chartHeight} stroke="#333" strokeWidth={2} />

            {/* Curve */}
            <path d={pathD} fill="none" stroke="var(--wharton-navy)" strokeWidth={3} />

            {/* Points */}
            {curve.map((point, i) => (
              <g key={i}>
                <circle
                  cx={xScale(point.years)}
                  cy={yScale(point.yield)}
                  r={6}
                  fill="var(--wharton-red)"
                  stroke="white"
                  strokeWidth={2}
                  style={{ cursor: 'pointer' }}
                />
                {showLabels && (
                  <text
                    x={xScale(point.years)}
                    y={yScale(point.yield) - 15}
                    textAnchor="middle"
                    fontSize={11}
                    fill="#333"
                  >
                    {point.yield.toFixed(1)}%
                  </text>
                )}
              </g>
            ))}

            {/* X-axis labels */}
            {curve.map((point, i) => (
              <text
                key={`x-label-${i}`}
                x={xScale(point.years)}
                y={chartHeight + 20}
                textAnchor="middle"
                fontSize={12}
                fill="#333"
              >
                {point.maturity}
              </text>
            ))}

            {/* Axis titles */}
            <text
              x={chartWidth / 2}
              y={chartHeight + 50}
              textAnchor="middle"
              fontSize={14}
              fontWeight="600"
              fill="#333"
            >
              Time to Maturity
            </text>
            <text
              x={-chartHeight / 2}
              y={-45}
              textAnchor="middle"
              fontSize={14}
              fontWeight="600"
              fill="#333"
              transform={`rotate(-90, -${chartHeight / 2}, -45)`}
            >
              Yield (%)
            </text>
          </g>
        </svg>
      </div>

      <div className="statistics-panel">
        <h3>Curve Statistics</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">2Y-10Y Spread</div>
            <div className="stat-value">{spread.toFixed(2)}%</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Curve Shape</div>
            <div className="stat-value">{steepness}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Average Yield</div>
            <div className="stat-value">{avgYield.toFixed(2)}%</div>
          </div>
        </div>
      </div>

      <div className="edit-panel">
        <h3>Edit Yields</h3>
        <p className="edit-hint">Adjust individual yield points to create custom curves</p>
        <div className="edit-grid">
          {curve.map((point, i) => (
            <div key={i} className="edit-item">
              <label>{point.maturity}</label>
              <input
                type="number"
                value={point.yield.toFixed(2)}
                onChange={(e) => handleYieldChange(i, parseFloat(e.target.value))}
                min="0"
                max="10"
                step="0.1"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default YieldCurveVisualization;
