import React, { useState } from 'react';
import type { CashflowMatrix, DiscountFactors, CompoundingConvention, BootstrapStep } from '../types';
import './LinearAlgebraPanel.css';

interface LinearAlgebraPanelProps {
  cashflowMatrix: CashflowMatrix;
  discountFactors: DiscountFactors;
  selectedBondId: string | null;
  compoundingConvention: CompoundingConvention;
  onCompoundingChange: (convention: CompoundingConvention) => void;
  residuals?: number[];
  conditionNumber?: number;
  bootstrapSteps: BootstrapStep[];
}

export const LinearAlgebraPanel: React.FC<LinearAlgebraPanelProps> = ({
  cashflowMatrix,
  discountFactors,
  selectedBondId,
  compoundingConvention,
  onCompoundingChange,
  residuals,
  conditionNumber,
  bootstrapSteps
}) => {
  const [showBootstrap, setShowBootstrap] = useState(false);
  const [revealedSteps, setRevealedSteps] = useState<number>(0);
  const [studentMode, setStudentMode] = useState(false);

  const selectedBondIndex = selectedBondId
    ? cashflowMatrix.bonds.findIndex(b => b.id === selectedBondId)
    : -1;

  const handleRevealNext = () => {
    if (revealedSteps < bootstrapSteps.length) {
      setRevealedSteps(revealedSteps + 1);
    }
  };

  const handleRevealAll = () => {
    setRevealedSteps(bootstrapSteps.length);
  };

  const handleReset = () => {
    setRevealedSteps(0);
  };

  return (
    <div className="linear-algebra-panel">
      <h2>Linear Algebra View</h2>

      <div className="controls">
        <div className="compounding-selector">
          <label>Compounding Convention:</label>
          <select
            value={compoundingConvention}
            onChange={(e) => onCompoundingChange(e.target.value as CompoundingConvention)}
          >
            <option value="continuous">Continuous</option>
            <option value="annual">Annual</option>
            <option value="semiannual">Semi-annual</option>
          </select>
        </div>

        <div className="view-toggle">
          <label>
            <input
              type="checkbox"
              checked={showBootstrap}
              onChange={(e) => setShowBootstrap(e.target.checked)}
            />
            Show Bootstrap Steps
          </label>
          {showBootstrap && (
            <label>
              <input
                type="checkbox"
                checked={studentMode}
                onChange={(e) => {
                  setStudentMode(e.target.checked);
                  if (e.target.checked) {
                    setRevealedSteps(0);
                  } else {
                    setRevealedSteps(bootstrapSteps.length);
                  }
                }}
              />
              Student Exercise Mode
            </label>
          )}
        </div>
      </div>

      {!showBootstrap ? (
        <>
          <div className="matrix-section">
            <h3>Matrix Equation: C · d = p</h3>
            
            <div className="explanation-box">
              <p><strong>Cashflow Matrix (C):</strong> Each row represents a bond, each column represents a time period.</p>
              <p>Entry C[i,j] = cashflow from bond i at time j</p>
            </div>

            <div className="matrix-display">
              <div className="matrix-container">
                <div className="matrix-label">C =</div>
                <table className="matrix-table">
                  <thead>
                    <tr>
                      <th></th>
                      {cashflowMatrix.times.map((time, i) => (
                        <th key={i}>t={time.toFixed(2)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cashflowMatrix.matrix.map((row, bondIdx) => (
                      <tr key={bondIdx} className={bondIdx === selectedBondIndex ? 'highlighted' : ''}>
                        <td className="row-label">Bond {bondIdx + 1}</td>
                        {row.map((value, colIdx) => (
                          <td
                            key={colIdx}
                            className={
                              bondIdx === selectedBondIndex && Math.abs(value) > 1e-10
                                ? 'highlighted-cell'
                                : ''
                            }
                          >
                            {value.toFixed(2)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="matrix-container">
                <div className="matrix-label">d =</div>
                <table className="matrix-table vector">
                  <tbody>
                    {discountFactors.factors.map((df, i) => (
                      <tr key={i}>
                        <td>{df.toFixed(6)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="matrix-container">
                <div className="matrix-label">p =</div>
                <table className="matrix-table vector">
                  <tbody>
                    {cashflowMatrix.prices.map((price, i) => (
                      <tr key={i} className={i === selectedBondIndex ? 'highlighted' : ''}>
                        <td>{price.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {selectedBondIndex !== -1 && (
              <div className="bond-equation">
                <h4>Pricing Equation for Bond {selectedBondIndex + 1}:</h4>
                <div className="equation">
                  {cashflowMatrix.prices[selectedBondIndex].toFixed(2)} ={' '}
                  {cashflowMatrix.matrix[selectedBondIndex]
                    .map((cf, i) => {
                      if (Math.abs(cf) > 1e-10) {
                        return `${cf.toFixed(2)} × ${discountFactors.factors[i].toFixed(4)}`;
                      }
                      return null;
                    })
                    .filter(x => x !== null)
                    .join(' + ')}
                </div>
              </div>
            )}
          </div>

          <div className="discount-factors-section">
            <h3>Discount Factors & Spot Rates</h3>
            <table className="results-table">
              <thead>
                <tr>
                  <th>Time (years)</th>
                  <th>Discount Factor</th>
                  <th>Spot Rate (%)</th>
                </tr>
              </thead>
              <tbody>
                {discountFactors.times.map((time, i) => {
                  const df = discountFactors.factors[i];
                  let spotRate: number;
                  
                  switch (compoundingConvention) {
                    case 'continuous':
                      spotRate = -Math.log(df) / time;
                      break;
                    case 'annual':
                      spotRate = Math.pow(1 / df, 1 / time) - 1;
                      break;
                    case 'semiannual':
                      spotRate = 2 * (Math.pow(1 / df, 1 / (2 * time)) - 1);
                      break;
                  }

                  return (
                    <tr key={i}>
                      <td>{time.toFixed(2)}</td>
                      <td>{df.toFixed(6)}</td>
                      <td>{(spotRate * 100).toFixed(3)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {residuals && residuals.length > 0 && (
            <div className="residuals-section">
              <h3>Least Squares Analysis</h3>
              <p>Residuals (C·d - p):</p>
              <div className="residuals-display">
                {residuals.map((r, i) => (
                  <div key={i} className="residual-item">
                    Bond {i + 1}: {r.toFixed(4)}
                  </div>
                ))}
              </div>
              {conditionNumber && (
                <p className="condition-number">
                  Matrix Condition Number: {conditionNumber.toFixed(2)}
                </p>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="bootstrap-section">
          <h3>Step-by-Step Bootstrapping</h3>
          
          {studentMode && (
            <div className="student-controls">
              <button onClick={handleRevealNext} disabled={revealedSteps >= bootstrapSteps.length}>
                Reveal Next Step
              </button>
              <button onClick={handleRevealAll}>Reveal All</button>
              <button onClick={handleReset}>Reset</button>
              <span className="step-counter">
                Step {revealedSteps} of {bootstrapSteps.length}
              </span>
            </div>
          )}

          <div className="bootstrap-steps">
            {bootstrapSteps.map((step, i) => {
              const isRevealed = !studentMode || i < revealedSteps;
              
              return (
                <div
                  key={i}
                  className={`bootstrap-step ${isRevealed ? 'revealed' : 'hidden'}`}
                >
                  <h4>Step {step.stepNumber}: {step.description}</h4>
                  {isRevealed ? (
                    <>
                      <div className="step-equation">{step.equation}</div>
                      <div className="step-results">
                        <div>DF({step.time}) = {step.discountFactor.toFixed(6)}</div>
                        <div>Spot Rate = {(step.spotRate * 100).toFixed(3)}%</div>
                      </div>
                    </>
                  ) : (
                    <div className="step-hidden">Click "Reveal Next Step" to see the solution</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="explanation-section">
        <details>
          <summary>Why This Works: The Theory</summary>
          <div className="theory-content">
            <h4>Coupon Bonds as Portfolios of Zeros</h4>
            <p>
              A coupon-bearing bond is equivalent to a portfolio of zero-coupon bonds.
              Each coupon payment and the principal repayment can be thought of as a separate zero-coupon bond.
            </p>
            
            <h4>Discount Factors as State Prices</h4>
            <p>
              A discount factor DF(t) represents the present value of $1 received at time t.
              These are the fundamental building blocks for pricing any fixed-income security.
            </p>
            
            <h4>Linear System</h4>
            <p>
              When we observe prices of coupon bonds, we're seeing the market's valuation of
              linear combinations of discount factors. Solving for the discount factors is
              essentially inverting this relationship.
            </p>
            
            <h4>Bootstrapping vs Least Squares</h4>
            <p>
              <strong>Bootstrapping:</strong> When bond maturities align perfectly (triangular matrix),
              we can solve sequentially from shortest to longest maturity.
            </p>
            <p>
              <strong>Least Squares:</strong> When we have more bonds than unique cashflow dates,
              or maturities don't align, we solve min ||Cd - p||² to find the best-fit discount factors.
            </p>
          </div>
        </details>
      </div>
    </div>
  );
};
