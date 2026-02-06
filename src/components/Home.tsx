import './Home.css';

interface HomeProps {
  setActiveTab: (tab: string) => void;
}

function Home({ setActiveTab }: HomeProps) {
  return (
    <div className="section">
      <h2>Welcome to Fixed Income Securities Interactive Learning</h2>
      <p>This site provides interactive examples, charts, and diagrams to help you develop intuition about fixed income securities concepts taught in the Wharton School MBA program.</p>
      
      <div className="features-grid">
        <div className="feature-card" onClick={() => setActiveTab('bond-pricing')}>
          <div className="feature-icon">📊</div>
          <h3>Bond Pricing Calculator</h3>
          <p>Calculate bond prices and understand the relationship between coupon rates, yield, and maturity. Includes an interactive payment timeline visualization.</p>
        </div>
        
        <div className="feature-card" onClick={() => setActiveTab('yield-curve')}>
          <div className="feature-icon">📈</div>
          <h3>Yield Curve Visualization</h3>
          <p>Explore different yield curve shapes (normal, inverted, flat, humped) and understand the term structure of interest rates with interactive editing.</p>
        </div>
        
        <div className="feature-card" onClick={() => setActiveTab('duration')}>
          <div className="feature-icon">⏱️</div>
          <h3>Duration & Convexity</h3>
          <p>Interactive tools to understand price sensitivity to interest rate changes, with visualizations of the price-yield relationship.</p>
        </div>
        
        <div className="feature-card" onClick={() => setActiveTab('risk')}>
          <div className="feature-icon">⚠️</div>
          <h3>Interest Rate Risk</h3>
          <p>Visualize how bond prices change with interest rate movements across different bond types and maturities.</p>
        </div>
        
        <div className="feature-card" onClick={() => setActiveTab('bootstrapping')}>
          <div className="feature-icon">🔬</div>
          <h3>Bootstrapping Visualizer</h3>
          <p>Learn how to derive zero-coupon (spot) rates from coupon-bearing bonds using linear algebra and bootstrapping methods.</p>
        </div>
        
        <div className="feature-card" onClick={() => setActiveTab('arbitrage')}>
          <div className="feature-icon">💰</div>
          <h3>Arbitrage Opportunities</h3>
          <p>Discover how bootstrapping can reveal mispricing and create arbitrage opportunities. Interactive scenarios and strip & reconstruct demonstrations.</p>
        </div>
      </div>
    </div>
  );
}

export default Home;
