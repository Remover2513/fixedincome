import { useState } from 'react';
import Home from './components/Home';
import BondPricingCalculator from './components/BondPricingCalculator';
import YieldCurveVisualization from './components/YieldCurveVisualization';
import DurationConvexityCalculator from './components/DurationConvexityCalculator';
import InterestRateRiskVisualizer from './components/InterestRateRiskVisualizer';
import BootstrappingVisualizer from './components/BootstrappingVisualizer';
import ArbitrageOpportunities from './components/ArbitrageOpportunities';
import './App.css';

type TabId = 'home' | 'bond-pricing' | 'yield-curve' | 'duration' | 'risk' | 'bootstrapping' | 'arbitrage';

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('home');

  return (
    <div className="app">
      <header className="app-header">
        <div className="container">
          <h1>Fixed Income Securities</h1>
          <p className="subtitle">Wharton School MBA Course - Interactive Examples</p>
          <nav className="nav-tabs">
            <button 
              className={activeTab === 'home' ? 'active' : ''} 
              onClick={() => setActiveTab('home')}
            >
              Home
            </button>
            <button 
              className={activeTab === 'bond-pricing' ? 'active' : ''} 
              onClick={() => setActiveTab('bond-pricing')}
            >
              Bond Pricing
            </button>
            <button 
              className={activeTab === 'yield-curve' ? 'active' : ''} 
              onClick={() => setActiveTab('yield-curve')}
            >
              Yield Curve
            </button>
            <button 
              className={activeTab === 'duration' ? 'active' : ''} 
              onClick={() => setActiveTab('duration')}
            >
              Duration & Convexity
            </button>
            <button 
              className={activeTab === 'risk' ? 'active' : ''} 
              onClick={() => setActiveTab('risk')}
            >
              Interest Rate Risk
            </button>
            <button 
              className={activeTab === 'bootstrapping' ? 'active' : ''} 
              onClick={() => setActiveTab('bootstrapping')}
            >
              Bootstrapping
            </button>
            <button 
              className={activeTab === 'arbitrage' ? 'active' : ''} 
              onClick={() => setActiveTab('arbitrage')}
            >
              Arbitrage Opportunities
            </button>
          </nav>
        </div>
      </header>

      <main className="main-content">
        {activeTab === 'home' && <Home setActiveTab={setActiveTab} />}
        {activeTab === 'bond-pricing' && <BondPricingCalculator />}
        {activeTab === 'yield-curve' && <YieldCurveVisualization />}
        {activeTab === 'duration' && <DurationConvexityCalculator />}
        {activeTab === 'risk' && <InterestRateRiskVisualizer />}
        {activeTab === 'bootstrapping' && <BootstrappingVisualizer />}
        {activeTab === 'arbitrage' && <ArbitrageOpportunities />}
      </main>
    </div>
  );
}

export default App;
