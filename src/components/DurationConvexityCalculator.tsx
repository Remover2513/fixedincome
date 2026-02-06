import { useState, useEffect } from 'react';
import './DurationConvexityCalculator.css';

function DurationConvexityCalculator() {
  const [faceValue, setFaceValue] = useState(1000);
  const [couponRate, setCouponRate] = useState(5);
  const [yieldRate, setYieldRate] = useState(6);
  const [years, setYears] = useState(10);
  const [frequency, setFrequency] = useState(2);

  const [macaulayDuration, setMacaulayDuration] = useState(0);
  const [modifiedDuration, setModifiedDuration] = useState(0);
  const [convexity, setConvexity] = useState(0);

  useEffect(() => {
    calculateDuration();
  }, [faceValue, couponRate, yieldRate, years, frequency]);

  const calculateBondPriceForYield = (ytm: number): number => {
    const periods = years * frequency;
    const couponPayment = (faceValue * (couponRate / 100)) / frequency;
    const yieldPerPeriod = (ytm / 100) / frequency;

    let pvCoupons = 0;
    for (let i = 1; i <= periods; i++) {
      pvCoupons += couponPayment / Math.pow(1 + yieldPerPeriod, i);
    }

    const pvFaceValue = faceValue / Math.pow(1 + yieldPerPeriod, periods);
    return pvCoupons + pvFaceValue;
  };

  const calculateDuration = () => {
    const periods = years * frequency;
    const couponPayment = (faceValue * (couponRate / 100)) / frequency;
    const yieldPerPeriod = (yieldRate / 100) / frequency;

    // Calculate bond price
    const bondPrice = calculateBondPriceForYield(yieldRate);

    // Calculate Macaulay Duration
    let weightedTime = 0;
    for (let i = 1; i <= periods; i++) {
      const timeInYears = i / frequency;
      const cashFlow = i === periods ? couponPayment + faceValue : couponPayment;
      const pv = cashFlow / Math.pow(1 + yieldPerPeriod, i);
      weightedTime += timeInYears * pv;
    }

    const macDuration = weightedTime / bondPrice;
    setMacaulayDuration(macDuration);

    // Calculate Modified Duration
    const modDuration = macDuration / (1 + yieldPerPeriod);
    setModifiedDuration(modDuration);

    // Simple convexity approximation
    const conv = macDuration * (macDuration + 1) / Math.pow(1 + yieldPerPeriod, 2);
    setConvexity(conv);
  };

  // Generate price-yield data for visualization
  const priceYieldData = [];
  for (let y = Math.max(0, yieldRate - 4); y <= yieldRate + 4; y += 0.5) {
    const price = calculateBondPriceForYield(y);
    const durationEstimate = calculateBondPriceForYield(yieldRate) - 
      modifiedDuration * calculateBondPriceForYield(yieldRate) * (y - yieldRate) / 100;
    
    priceYieldData.push({
      yield: y,
      actualPrice: price,
      durationEstimate: durationEstimate
    });
  }

  // SVG setup for price-yield chart
  const width = 700;
  const height = 400;
  const margin = { top: 20, right: 40, bottom: 60, left: 80 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const minYield = Math.max(0, yieldRate - 4);
  const maxYield = yieldRate + 4;
  const minPrice = Math.min(...priceYieldData.map(d => Math.min(d.actualPrice, d.durationEstimate)));
  const maxPrice = Math.max(...priceYieldData.map(d => Math.max(d.actualPrice, d.durationEstimate)));

  const xScale = (yieldVal: number) => ((yieldVal - minYield) / (maxYield - minYield)) * chartWidth;
  const yScale = (price: number) => chartHeight - ((price - minPrice) / (maxPrice - minPrice)) * chartHeight;

  const actualPath = priceYieldData.map((d, i) => {
    const x = xScale(d.yield);
    const y = yScale(d.actualPrice);
    return i === 0 ? `M ${x},${y}` : `L ${x},${y}`;
  }).join(' ');

  const durationPath = priceYieldData.map((d, i) => {
    const x = xScale(d.yield);
    const y = yScale(d.durationEstimate);
    return i === 0 ? `M ${x},${y}` : `L ${x},${y}`;
  }).join(' ');

  return (
    <div className="section duration-convexity">
      <h2>Duration & Convexity Calculator</h2>
      <p>Understand how bond prices change with interest rate movements and measure price sensitivity.</p>

      <div className="calculator-layout">
        <div className="input-panel">
          <h3>Bond Parameters</h3>
          
          <div className="input-group">
            <label>Face Value ($):</label>
            <input
              type="number"
              value={faceValue}
              onChange={(e) => setFaceValue(parseFloat(e.target.value))}
              min="100"
              step="100"
            />
          </div>

          <div className="input-group">
            <label>Coupon Rate (%):</label>
            <input
              type="number"
              value={couponRate}
              onChange={(e) => setCouponRate(parseFloat(e.target.value))}
              min="0"
              max="20"
              step="0.25"
            />
          </div>

          <div className="input-group">
            <label>Yield to Maturity (%):</label>
            <input
              type="number"
              value={yieldRate}
              onChange={(e) => setYieldRate(parseFloat(e.target.value))}
              min="0"
              max="20"
              step="0.25"
            />
          </div>

          <div className="input-group">
            <label>Years to Maturity:</label>
            <input
              type="number"
              value={years}
              onChange={(e) => setYears(parseInt(e.target.value))}
              min="1"
              max="30"
            />
          </div>

          <div className="input-group">
            <label>Payment Frequency:</label>
            <select value={frequency} onChange={(e) => setFrequency(parseInt(e.target.value))}>
              <option value="1">Annual</option>
              <option value="2">Semi-Annual</option>
              <option value="4">Quarterly</option>
            </select>
          </div>

          <div className="result-box">
            <h4>Results</h4>
            <p><strong>Macaulay Duration:</strong> {macaulayDuration.toFixed(3)} years</p>
            <p><strong>Modified Duration:</strong> {modifiedDuration.toFixed(3)}</p>
            <p><strong>Convexity:</strong> {convexity.toFixed(3)}</p>
          </div>
        </div>

        <div className="chart-panel">
          <h3>Price-Yield Relationship</h3>
          <p className="chart-subtitle">Blue: Actual Price | Red: Duration Estimate</p>
          
          <svg width={width} height={height} className="duration-svg">
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

              {/* Actual price curve */}
              <path d={actualPath} fill="none" stroke="var(--wharton-navy)" strokeWidth={3} />

              {/* Duration estimate line */}
              <path d={durationPath} fill="none" stroke="var(--wharton-red)" strokeWidth={2} strokeDasharray="5,5" />

              {/* Current point */}
              <circle
                cx={xScale(yieldRate)}
                cy={yScale(calculateBondPriceForYield(yieldRate))}
                r={6}
                fill="var(--wharton-gold)"
                stroke="white"
                strokeWidth={2}
              />

              {/* X-axis labels */}
              {[minYield, (minYield + maxYield) / 2, maxYield].map((y, i) => (
                <text
                  key={`x-${i}`}
                  x={xScale(y)}
                  y={chartHeight + 20}
                  textAnchor="middle"
                  fontSize={12}
                >
                  {y.toFixed(1)}%
                </text>
              ))}

              {/* Axis titles */}
              <text
                x={chartWidth / 2}
                y={chartHeight + 50}
                textAnchor="middle"
                fontSize={14}
                fontWeight="600"
              >
                Yield to Maturity (%)
              </text>
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
              <span className="legend-line actual"></span>
              <span>Actual Price Curve</span>
            </div>
            <div className="legend-item">
              <span className="legend-line duration"></span>
              <span>Duration Estimate (Linear)</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot"></span>
              <span>Current Yield</span>
            </div>
          </div>

          <div className="explanation">
            <p><strong>Convexity:</strong> The difference between the actual price curve (convex) and the duration estimate (linear) demonstrates convexity. Duration underestimates price increases when yields fall and overestimates price decreases when yields rise.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DurationConvexityCalculator;
