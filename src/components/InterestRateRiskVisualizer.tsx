import { useState } from 'react';
import './InterestRateRiskVisualizer.css';

interface BondType {
  name: string;
  couponRate: number;
  maturity: number;
  frequency: number;
}

const BOND_TYPES: BondType[] = [
  { name: 'Short-term (2Y, 3%)', couponRate: 3, maturity: 2, frequency: 2 },
  { name: 'Medium-term (5Y, 4%)', couponRate: 4, maturity: 5, frequency: 2 },
  { name: 'Long-term (10Y, 5%)', couponRate: 5, maturity: 10, frequency: 2 },
  { name: 'Long-term (30Y, 5.5%)', couponRate: 5.5, maturity: 30, frequency: 2 },
];

function InterestRateRiskVisualizer() {
  const [rateChange, setRateChange] = useState(0);
  const [baseYield] = useState(5);
  const faceValue = 1000;

  const calculateBondPrice = (couponRate: number, ytm: number, maturity: number, frequency: number): number => {
    const periods = maturity * frequency;
    const couponPayment = (faceValue * (couponRate / 100)) / frequency;
    const yieldPerPeriod = (ytm / 100) / frequency;

    let pvCoupons = 0;
    for (let i = 1; i <= periods; i++) {
      pvCoupons += couponPayment / Math.pow(1 + yieldPerPeriod, i);
    }

    const pvFaceValue = faceValue / Math.pow(1 + yieldPerPeriod, periods);
    return pvCoupons + pvFaceValue;
  };

  const bondData = BOND_TYPES.map(bond => {
    const originalPrice = calculateBondPrice(bond.couponRate, baseYield, bond.maturity, bond.frequency);
    const newPrice = calculateBondPrice(bond.couponRate, baseYield + rateChange, bond.maturity, bond.frequency);
    const priceChange = newPrice - originalPrice;
    const percentChange = (priceChange / originalPrice) * 100;

    return {
      ...bond,
      originalPrice,
      newPrice,
      priceChange,
      percentChange
    };
  });

  // SVG Chart
  const width = 700;
  const height = 400;
  const margin = { top: 20, right: 40, bottom: 80, left: 80 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const maxPrice = Math.max(...bondData.flatMap(d => [d.originalPrice, d.newPrice]));
  const minPrice = Math.min(...bondData.flatMap(d => [d.originalPrice, d.newPrice]));

  const barWidth = chartWidth / (bondData.length * 2 + bondData.length);
  const groupWidth = barWidth * 2 + barWidth / 2;

  return (
    <div className="section interest-rate-risk">
      <h2>Interest Rate Risk Visualizer</h2>
      <p>Visualize how bond prices change with interest rate movements across different bond types and maturities.</p>

      <div className="risk-controls">
        <div className="slider-container">
          <label htmlFor="rate-change">Interest Rate Change:</label>
          <div className="slider-wrapper">
            <input
              type="range"
              id="rate-change"
              min="-5"
              max="5"
              step="0.25"
              value={rateChange}
              onChange={(e) => setRateChange(parseFloat(e.target.value))}
            />
            <div className="slider-value">
              <span className={rateChange < 0 ? 'negative' : rateChange > 0 ? 'positive' : ''}>
                {rateChange > 0 ? '+' : ''}{rateChange.toFixed(2)}%
              </span>
            </div>
          </div>
          <div className="slider-labels">
            <span>-5%</span>
            <span>0%</span>
            <span>+5%</span>
          </div>
        </div>
      </div>

      <div className="comparison-section">
        <h3>Price Impact Comparison</h3>
        <p className="subtitle">Base Yield: {baseYield}% | New Yield: {(baseYield + rateChange).toFixed(2)}%</p>

        <div className="comparison-table">
          <table>
            <thead>
              <tr>
                <th>Bond Type</th>
                <th>Original Price</th>
                <th>New Price</th>
                <th>Price Change</th>
                <th>% Change</th>
              </tr>
            </thead>
            <tbody>
              {bondData.map((bond, i) => (
                <tr key={i}>
                  <td>{bond.name}</td>
                  <td>${bond.originalPrice.toFixed(2)}</td>
                  <td>${bond.newPrice.toFixed(2)}</td>
                  <td className={bond.priceChange < 0 ? 'negative' : bond.priceChange > 0 ? 'positive' : ''}>
                    ${bond.priceChange.toFixed(2)}
                  </td>
                  <td className={bond.percentChange < 0 ? 'negative' : bond.percentChange > 0 ? 'positive' : ''}>
                    {bond.percentChange > 0 ? '+' : ''}{bond.percentChange.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="chart-container">
          <svg width={width} height={height} className="risk-svg">
            <g transform={`translate(${margin.left},${margin.top})`}>
              {/* Grid */}
              <g className="grid">
                {[0, 1, 2, 3, 4].map(i => {
                  const y = (i / 4) * chartHeight;
                  return (
                    <line
                      key={`grid-${i}`}
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

              {/* Axes */}
              <line x1={0} y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke="#333" strokeWidth={2} />
              <line x1={0} y1={0} x2={0} y2={chartHeight} stroke="#333" strokeWidth={2} />

              {/* Bars */}
              {bondData.map((bond, i) => {
                const x = i * groupWidth;
                const originalHeight = ((bond.originalPrice - minPrice) / (maxPrice - minPrice)) * chartHeight;
                const newHeight = ((bond.newPrice - minPrice) / (maxPrice - minPrice)) * chartHeight;

                return (
                  <g key={i}>
                    {/* Original price bar */}
                    <rect
                      x={x}
                      y={chartHeight - originalHeight}
                      width={barWidth}
                      height={originalHeight}
                      fill="var(--wharton-navy)"
                      opacity={0.8}
                    />
                    {/* New price bar */}
                    <rect
                      x={x + barWidth + barWidth / 4}
                      y={chartHeight - newHeight}
                      width={barWidth}
                      height={newHeight}
                      fill="var(--wharton-red)"
                      opacity={0.8}
                    />
                    {/* Labels */}
                    <text
                      x={x + groupWidth / 2}
                      y={chartHeight + 20}
                      textAnchor="middle"
                      fontSize={10}
                      transform={`rotate(25, ${x + groupWidth / 2}, ${chartHeight + 20})`}
                    >
                      {bond.name}
                    </text>
                  </g>
                );
              })}

              {/* Y-axis title */}
              <text
                x={-chartHeight / 2}
                y={-60}
                textAnchor="middle"
                fontSize={14}
                fontWeight="600"
                transform={`rotate(-90, -${chartHeight / 2}, -60)`}
              >
                Bond Price ($)
              </text>
            </g>
          </svg>

          <div className="chart-legend">
            <div className="legend-item">
              <span className="legend-box original"></span>
              <span>Original Price (Yield: {baseYield}%)</span>
            </div>
            <div className="legend-item">
              <span className="legend-box new"></span>
              <span>New Price (Yield: {(baseYield + rateChange).toFixed(2)}%)</span>
            </div>
          </div>
        </div>

        <div className="insights">
          <h4>Key Insights</h4>
          <ul>
            <li><strong>Longer maturity bonds are more sensitive to interest rate changes</strong> - Compare the 30Y bond to the 2Y bond</li>
            <li><strong>Price and yield move inversely</strong> - When yields rise, prices fall, and vice versa</li>
            <li><strong>Duration increases with maturity</strong> - This explains why long-term bonds have larger price swings</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default InterestRateRiskVisualizer;
