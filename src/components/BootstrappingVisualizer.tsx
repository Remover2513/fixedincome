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
          Learn how to derive zero-coupon (spot) rates from coupon-bearing bonds using linear algebra
        </p>
      </header>

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
