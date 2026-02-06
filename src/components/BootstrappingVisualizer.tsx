import { useState, useMemo } from 'react';
import { BondInputPanel } from './BondInputPanel';
import { ChartPanel } from './ChartPanel';
import { LinearAlgebraPanel } from './LinearAlgebraPanel';
import { buildCashflowMatrix } from '../utils/cashflows';
import { solveDiscountFactors, leastSquaresSolve, generateBootstrapSteps } from '../utils/discountFactors';
import { discountFactorsToSpotRates, calculateYTM, spotRatesToForwardRates } from '../utils/yields';
import { EXAMPLE_DATASET_TRIANGULAR, EXAMPLE_DATASET_OVERDETERMINED, addNoiseToPrices } from '../utils/exampleData';
import type { Bond, CompoundingConvention, YTMResult } from '../types';
import './BootstrappingVisualizer.css';

function BootstrappingVisualizer() {
  const [bonds, setBonds] = useState<Bond[]>(EXAMPLE_DATASET_TRIANGULAR);
  const [selectedBondId, setSelectedBondId] = useState<string | null>(null);
  const [compoundingConvention, setCompoundingConvention] = useState<CompoundingConvention>('continuous');
  const [showYTM, setShowYTM] = useState(true);
  const [showSpot, setShowSpot] = useState(true);
  const [showForward, setShowForward] = useState(false);
  const [isIntuitionExpanded, setIsIntuitionExpanded] = useState(true);

  // Compute all derived values
  const cashflowMatrix = useMemo(() => buildCashflowMatrix(bonds), [bonds]);
  
  const discountFactors = useMemo(() => solveDiscountFactors(cashflowMatrix), [cashflowMatrix]);
  
  const spotRates = useMemo(
    () => discountFactorsToSpotRates(discountFactors, compoundingConvention),
    [discountFactors, compoundingConvention]
  );
  
  const forwardRates = useMemo(() => spotRatesToForwardRates(spotRates), [spotRates]);
  
  const ytmResults = useMemo<YTMResult[]>(
    () => bonds.map(bond => ({ bondId: bond.id, ytm: calculateYTM(bond) })),
    [bonds]
  );

  const bootstrapSteps = useMemo(() => generateBootstrapSteps(cashflowMatrix), [cashflowMatrix]);

  // Calculate residuals for least squares case
  const { residuals, conditionNumber } = useMemo(() => {
    if (cashflowMatrix.matrix.length !== cashflowMatrix.times.length) {
      return leastSquaresSolve(cashflowMatrix.matrix, cashflowMatrix.prices);
    }
    return { residuals: [], conditionNumber: undefined };
  }, [cashflowMatrix]);

  const handleLoadExample = (type: 'triangular' | 'overdetermined') => {
    if (type === 'triangular') {
      setBonds(EXAMPLE_DATASET_TRIANGULAR);
    } else {
      setBonds(EXAMPLE_DATASET_OVERDETERMINED);
    }
    setSelectedBondId(null);
  };

  const handleAddNoise = () => {
    setBonds(addNoiseToPrices(bonds, 0.5));
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Interactive Yield Curve & Bootstrapping Visualizer</h1>
        <p className="subtitle">
          Discover how market bond prices reveal the hidden zero-coupon yield curve — one maturity at a time
        </p>
      </header>

      {/* Building Intuition Section */}
      <div className="intuition-section-wrapper">
        <div className="intuition-section">
          <div className="intuition-header" onClick={() => setIsIntuitionExpanded(!isIntuitionExpanded)}>
            <div className="intuition-title">
              <span className="intuition-icon">💡</span>
              <h2>Building Intuition</h2>
            </div>
            <span className={`expand-icon ${isIntuitionExpanded ? 'expanded' : ''}`}>▼</span>
          </div>
          
          {isIntuitionExpanded && (
            <div className="intuition-content">
              <div className="analogy-section">
                <h3>The Recipe Analogy</h3>
                <p>
                  Imagine you go to a bakery and see prices for different cakes: a plain vanilla cake, 
                  a chocolate cake, and a cake that combines vanilla and chocolate layers.
                </p>
                <p>
                  Each cake is made of known quantities of "ingredients" (flour, eggs, vanilla extract, 
                  chocolate, etc.), and you can see the final price of each cake.
                </p>
                <p className="highlight">
                  <strong>Bootstrapping is like figuring out the cost of each individual ingredient 
                  by looking at the prices of the finished cakes.</strong>
                </p>
                <ul>
                  <li>The <strong>simplest cake</strong> (plain vanilla) uses only one ingredient you 
                  don't know → you can solve for it directly.</li>
                  <li>The <strong>next cake</strong> uses that ingredient plus one more unknown → now 
                  you can solve for the second ingredient.</li>
                  <li>You keep <strong>"bootstrapping"</strong> your way up, using what you already 
                  know to solve for the next unknown.</li>
                </ul>
                <p>
                  In fixed income: the "cakes" are coupon bonds with known market prices, the "ingredients" 
                  are discount factors (the price of $1 at each future time), and "figuring out ingredient 
                  costs" is deriving the zero-coupon yield curve.
                </p>
              </div>

              <div className="mapping-section">
                <h3>How it Maps to Finance</h3>
                <div className="mapping-table">
                  <div className="mapping-row mapping-header">
                    <div className="mapping-col">Bakery Concept</div>
                    <div className="mapping-col">Fixed Income Equivalent</div>
                  </div>
                  <div className="mapping-row">
                    <div className="mapping-col">🎂 Cakes</div>
                    <div className="mapping-col">Coupon Bonds</div>
                  </div>
                  <div className="mapping-row">
                    <div className="mapping-col">🧂 Ingredient Prices</div>
                    <div className="mapping-col">Discount Factors</div>
                  </div>
                  <div className="mapping-row">
                    <div className="mapping-col">📋 Recipe (Quantities)</div>
                    <div className="mapping-col">Cashflow Matrix</div>
                  </div>
                  <div className="mapping-row">
                    <div className="mapping-col">💰 Final Cake Prices</div>
                    <div className="mapping-col">Market Bond Prices</div>
                  </div>
                  <div className="mapping-row">
                    <div className="mapping-col">🔍 Solving Ingredient Costs</div>
                    <div className="mapping-col">Bootstrapping Spot Rates</div>
                  </div>
                </div>
              </div>

              <div className="key-takeaway">
                <strong>Key Takeaway:</strong> Just as you solve for ingredient costs one at a time 
                starting with the simplest recipe, bootstrapping derives spot rates one maturity at 
                a time, starting with the shortest-maturity bond.
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="app-layout">
        <div className="left-panel">
          <BondInputPanel
            bonds={bonds}
            onBondsChange={setBonds}
            onBondSelect={setSelectedBondId}
            selectedBondId={selectedBondId}
            onLoadExample={handleLoadExample}
            onAddNoise={handleAddNoise}
          />
        </div>

        <div className="main-content">
          <div className="chart-container">
            <ChartPanel
              bonds={bonds}
              ytmResults={ytmResults}
              spotRates={spotRates}
              forwardRates={forwardRates}
              showYTM={showYTM}
              showSpot={showSpot}
              showForward={showForward}
              onToggleYTM={() => setShowYTM(!showYTM)}
              onToggleSpot={() => setShowSpot(!showSpot)}
              onToggleForward={() => setShowForward(!showForward)}
            />
          </div>

          <div className="algebra-container">
            <LinearAlgebraPanel
              cashflowMatrix={cashflowMatrix}
              discountFactors={discountFactors}
              selectedBondId={selectedBondId}
              compoundingConvention={compoundingConvention}
              onCompoundingChange={setCompoundingConvention}
              residuals={residuals}
              conditionNumber={conditionNumber}
              bootstrapSteps={bootstrapSteps}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default BootstrappingVisualizer;
