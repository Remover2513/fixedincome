import { useState, useMemo } from 'react';
import './ArbitrageOpportunities.css';

interface Bond {
  id: string;
  maturity: number;
  couponRate: number;
  marketPrice: number;
  faceValue: number;
}

interface ScenarioType {
  name: string;
  bonds: Bond[];
}

const SCENARIOS: Record<string, ScenarioType> = {
  noArbitrage: {
    name: 'No Arbitrage',
    bonds: [
      { id: 'B1', maturity: 1, couponRate: 0, marketPrice: 952.38, faceValue: 1000 },
      { id: 'B2', maturity: 2, couponRate: 0, marketPrice: 907.03, faceValue: 1000 },
      { id: 'B3', maturity: 3, couponRate: 5, marketPrice: 1000.00, faceValue: 1000 },
    ],
  },
  mispricedBond: {
    name: 'Mispriced Bond',
    bonds: [
      { id: 'B1', maturity: 1, couponRate: 0, marketPrice: 952.38, faceValue: 1000 },
      { id: 'B2', maturity: 2, couponRate: 0, marketPrice: 907.03, faceValue: 1000 },
      { id: 'B3', maturity: 3, couponRate: 5, marketPrice: 1020.00, faceValue: 1000 }, // Overpriced
    ],
  },
  multipleMispricings: {
    name: 'Multiple Mispricings',
    bonds: [
      { id: 'B1', maturity: 1, couponRate: 0, marketPrice: 960.00, faceValue: 1000 }, // Overpriced
      { id: 'B2', maturity: 2, couponRate: 0, marketPrice: 900.00, faceValue: 1000 }, // Underpriced
      { id: 'B3', maturity: 3, couponRate: 5, marketPrice: 1015.00, faceValue: 1000 }, // Overpriced
      { id: 'B4', maturity: 4, couponRate: 6, marketPrice: 1050.00, faceValue: 1000 }, // Check
    ],
  },
};

function ArbitrageOpportunities() {
  const [scenario, setScenario] = useState('noArbitrage');
  const [bonds, setBonds] = useState<Bond[]>(SCENARIOS.noArbitrage.bonds);
  const [selectedBond, setSelectedBond] = useState<string | null>(null);

  const handleScenarioChange = (scenarioKey: string) => {
    setScenario(scenarioKey);
    setBonds([...SCENARIOS[scenarioKey].bonds]);
    setSelectedBond(null);
  };

  const handleBondChange = (id: string, field: keyof Bond, value: number) => {
    setBonds(bonds.map(b => b.id === id ? { ...b, [field]: value } : b));
    setScenario('custom');
  };

  const addBond = () => {
    const newId = `B${bonds.length + 1}`;
    setBonds([...bonds, { id: newId, maturity: bonds.length + 1, couponRate: 5, marketPrice: 1000, faceValue: 1000 }]);
    setScenario('custom');
  };

  const removeBond = (id: string) => {
    setBonds(bonds.filter(b => b.id !== id));
    if (selectedBond === id) setSelectedBond(null);
    setScenario('custom');
  };

  // Bootstrap spot rates from bonds
  const { spotRates, bondAnalysis } = useMemo(() => {
    // Sort bonds by maturity
    const sortedBonds = [...bonds].sort((a, b) => a.maturity - b.maturity);
    const rates: number[] = [];
    const analysis: Array<{
      bond: Bond;
      theoreticalPrice: number;
      mispricing: number;
      percentMispricing: number;
      arbitrage: 'buy' | 'sell' | 'fair';
    }> = [];

    // Bootstrap spot rates
    for (let i = 0; i < sortedBonds.length; i++) {
      const bond = sortedBonds[i];
      
      if (bond.couponRate === 0) {
        // Zero-coupon bond: directly calculate spot rate
        const spotRate = (Math.pow(bond.faceValue / bond.marketPrice, 1 / bond.maturity) - 1) * 100;
        rates.push(spotRate);
      } else {
        // Coupon bond: use bootstrapping
        const couponPayment = (bond.faceValue * bond.couponRate) / 100;
        let pvCoupons = 0;
        
        // Discount coupons using previously calculated spot rates
        for (let t = 1; t < bond.maturity; t++) {
          if (rates[t - 1] !== undefined) {
            pvCoupons += couponPayment / Math.pow(1 + rates[t - 1] / 100, t);
          }
        }
        
        // Solve for the spot rate at this maturity
        const finalCashFlow = bond.faceValue + couponPayment;
        const pvFinal = bond.marketPrice - pvCoupons;
        const spotRate = (Math.pow(finalCashFlow / pvFinal, 1 / bond.maturity) - 1) * 100;
        rates.push(spotRate);
      }
    }

    // Calculate theoretical prices using bootstrapped spot rates
    for (const bond of bonds) {
      let theoreticalPrice = 0;
      const couponPayment = (bond.faceValue * bond.couponRate) / 100;
      
      for (let t = 1; t <= bond.maturity; t++) {
        const cashFlow = t === bond.maturity ? bond.faceValue + couponPayment : couponPayment;
        const rate = rates[t - 1] || rates[rates.length - 1]; // Use last rate if needed
        theoreticalPrice += cashFlow / Math.pow(1 + rate / 100, t);
      }
      
      const mispricing = bond.marketPrice - theoreticalPrice;
      const percentMispricing = (mispricing / theoreticalPrice) * 100;
      
      let arbitrage: 'buy' | 'sell' | 'fair' = 'fair';
      if (percentMispricing < -0.5) arbitrage = 'buy';  // Underpriced - buy
      else if (percentMispricing > 0.5) arbitrage = 'sell';  // Overpriced - sell
      
      analysis.push({
        bond,
        theoreticalPrice,
        mispricing,
        percentMispricing,
        arbitrage,
      });
    }

    return { spotRates: rates, bondAnalysis: analysis };
  }, [bonds]);

  const selectedAnalysis = selectedBond 
    ? bondAnalysis.find(a => a.bond.id === selectedBond) 
    : null;

  return (
    <div className="section arbitrage">
      <h2>Bootstrapping & Arbitrage Opportunities</h2>
      <p>Learn how bootstrapping can reveal mispricing and create arbitrage opportunities in bond markets.</p>

      <div className="scenario-controls">
        <h3>Preset Scenarios</h3>
        <div className="scenario-buttons">
          {Object.keys(SCENARIOS).map(key => (
            <button
              key={key}
              className={`scenario-btn ${scenario === key ? 'active' : ''}`}
              onClick={() => handleScenarioChange(key)}
            >
              {SCENARIOS[key].name}
            </button>
          ))}
          <button
            className={`scenario-btn ${scenario === 'custom' ? 'active' : ''}`}
            disabled
          >
            Custom {scenario === 'custom' ? '(Active)' : ''}
          </button>
        </div>
      </div>

      <div className="arbitrage-layout">
        <div className="bond-input-section">
          <h3>Bond Portfolio</h3>
          <p className="section-hint">Edit bonds to create custom scenarios</p>
          
          <div className="bond-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Maturity (Y)</th>
                  <th>Coupon (%)</th>
                  <th>Market Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bonds.map(bond => (
                  <tr key={bond.id} className={selectedBond === bond.id ? 'selected' : ''}>
                    <td>{bond.id}</td>
                    <td>
                      <input
                        type="number"
                        value={bond.maturity}
                        onChange={(e) => handleBondChange(bond.id, 'maturity', parseFloat(e.target.value))}
                        min="1"
                        max="30"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={bond.couponRate}
                        onChange={(e) => handleBondChange(bond.id, 'couponRate', parseFloat(e.target.value))}
                        min="0"
                        max="20"
                        step="0.5"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={bond.marketPrice}
                        onChange={(e) => handleBondChange(bond.id, 'marketPrice', parseFloat(e.target.value))}
                        min="100"
                        max="2000"
                        step="1"
                      />
                    </td>
                    <td>
                      <button className="btn-small" onClick={() => setSelectedBond(bond.id)}>
                        Analyze
                      </button>
                      <button className="btn-small btn-danger" onClick={() => removeBond(bond.id)}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <button className="btn btn-primary" onClick={addBond}>
            + Add Bond
          </button>
        </div>

        <div className="analysis-section">
          <h3>Arbitrage Analysis</h3>
          <p className="section-hint">Bootstrapped spot rates reveal mispricing</p>
          
          <div className="spot-rates-panel">
            <h4>Bootstrapped Spot Rates</h4>
            <div className="rates-grid">
              {spotRates.map((rate, i) => (
                <div key={i} className="rate-card">
                  <div className="rate-label">Year {i + 1}</div>
                  <div className="rate-value">{rate.toFixed(3)}%</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mispricing-table">
            <h4>Mispricing Detector</h4>
            <table>
              <thead>
                <tr>
                  <th>Bond</th>
                  <th>Market Price</th>
                  <th>Theoretical Price</th>
                  <th>Mispricing</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {bondAnalysis.map(({ bond, theoreticalPrice, mispricing, percentMispricing, arbitrage }) => (
                  <tr key={bond.id} className={arbitrage}>
                    <td>{bond.id}</td>
                    <td>${bond.marketPrice.toFixed(2)}</td>
                    <td>${theoreticalPrice.toFixed(2)}</td>
                    <td className={mispricing < 0 ? 'negative' : mispricing > 0 ? 'positive' : ''}>
                      ${mispricing.toFixed(2)} ({percentMispricing.toFixed(2)}%)
                    </td>
                    <td>
                      {arbitrage === 'buy' && <span className="action-badge buy">BUY (Cheap)</span>}
                      {arbitrage === 'sell' && <span className="action-badge sell">SELL (Expensive)</span>}
                      {arbitrage === 'fair' && <span className="action-badge fair">Fair Value</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedAnalysis && (
        <div className="strip-reconstruct-demo">
          <h3>Strip & Reconstruct: {selectedAnalysis.bond.id}</h3>
          <p>This demo shows how to decompose a bond into zero-coupon components</p>
          
          <div className="demo-layout">
            <div className="cash-flows">
              <h4>Cash Flows</h4>
              {Array.from({ length: selectedAnalysis.bond.maturity }).map((_, t) => {
                const year = t + 1;
                const isFinal = year === selectedAnalysis.bond.maturity;
                const coupon = (selectedAnalysis.bond.faceValue * selectedAnalysis.bond.couponRate) / 100;
                const cashFlow = isFinal ? selectedAnalysis.bond.faceValue + coupon : coupon;
                const spotRate = spotRates[t] || spotRates[spotRates.length - 1];
                const pv = cashFlow / Math.pow(1 + spotRate / 100, year);
                
                return (
                  <div key={year} className="cash-flow-item">
                    <div className="flow-year">Year {year}</div>
                    <div className="flow-amount">${cashFlow.toFixed(2)}</div>
                    <div className="flow-discount">÷ (1 + {spotRate.toFixed(2)}%)^{year}</div>
                    <div className="flow-pv">= ${pv.toFixed(2)}</div>
                  </div>
                );
              })}
            </div>
            
            <div className="demo-summary">
              <h4>Arbitrage Opportunity</h4>
              <div className="summary-card">
                <div className="summary-row">
                  <span>Sum of PVs (Theoretical):</span>
                  <strong>${selectedAnalysis.theoreticalPrice.toFixed(2)}</strong>
                </div>
                <div className="summary-row">
                  <span>Market Price:</span>
                  <strong>${selectedAnalysis.bond.marketPrice.toFixed(2)}</strong>
                </div>
                <div className="summary-row highlight">
                  <span>Profit Opportunity:</span>
                  <strong className={selectedAnalysis.mispricing < 0 ? 'negative' : selectedAnalysis.mispricing > 0 ? 'positive' : ''}>
                    ${Math.abs(selectedAnalysis.mispricing).toFixed(2)}
                  </strong>
                </div>
                <div className="summary-action">
                  {selectedAnalysis.arbitrage === 'buy' && (
                    <p><strong>Strategy:</strong> Buy bond at ${selectedAnalysis.bond.marketPrice.toFixed(2)}, strip coupons, sell for ${selectedAnalysis.theoreticalPrice.toFixed(2)}</p>
                  )}
                  {selectedAnalysis.arbitrage === 'sell' && (
                    <p><strong>Strategy:</strong> Sell bond at ${selectedAnalysis.bond.marketPrice.toFixed(2)}, buy zero-coupon equivalents for ${selectedAnalysis.theoreticalPrice.toFixed(2)}</p>
                  )}
                  {selectedAnalysis.arbitrage === 'fair' && (
                    <p><strong>No arbitrage:</strong> Bond is fairly priced relative to the spot curve</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="educational-content">
        <h3>Educational Concepts</h3>
        
        <div className="concept-grid">
          <div className="concept-card">
            <h4>Law of One Price</h4>
            <p>Identical cash flows must have the same price. If a bond's market price differs from the value of its replicating portfolio of zero-coupon bonds, an arbitrage opportunity exists.</p>
          </div>
          
          <div className="concept-card">
            <h4>Bootstrapping Enforces No-Arbitrage</h4>
            <p>The spot curve is derived so that all bonds in the market are consistently priced. Any deviation from this curve represents potential mispricing.</p>
          </div>
          
          <div className="concept-card">
            <h4>Arbitrage Strategy</h4>
            <p>When a bond deviates from fair value: (1) Buy the cheap asset, (2) Sell the expensive asset, (3) Capture the risk-free profit from the price difference.</p>
          </div>
          
          <div className="concept-card">
            <h4>Real-World Frictions</h4>
            <p>In practice, pure arbitrage is rare due to transaction costs, bid-ask spreads, liquidity constraints, and the speed at which markets correct mispricings.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ArbitrageOpportunities;
