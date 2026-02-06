import { useState, useEffect } from 'react';
import './BondPricingCalculator.css';

function BondPricingCalculator() {
  const [faceValue, setFaceValue] = useState(1000);
  const [couponRate, setCouponRate] = useState(5);
  const [yieldRate, setYieldRate] = useState(6);
  const [years, setYears] = useState(10);
  const [frequency, setFrequency] = useState(2);
  const [compoundingConvention, setCompoundingConvention] = useState<'discrete' | 'continuous'>('discrete');
  
  const [bondPrice, setBondPrice] = useState(0);
  const [premiumDiscount, setPremiumDiscount] = useState({ text: '-', value: 0 });
  const [currentYield, setCurrentYield] = useState(0);
  const [timeline, setTimeline] = useState<Array<{ period: number; time: number; payment: number; type: string }>>([]);
  const [pvCoupons, setPvCoupons] = useState(0);
  const [pvFaceValue, setPvFaceValue] = useState(0);

  useEffect(() => {
    calculateBondPrice();
  }, [faceValue, couponRate, yieldRate, years, frequency, compoundingConvention]);

  const calculateBondPrice = () => {
    const periods = years * frequency;
    const couponPayment = (faceValue * (couponRate / 100)) / frequency;
    
    let pvCoupons = 0;
    let pvFace = 0;
    
    if (compoundingConvention === 'discrete') {
      // Discrete compounding: PV = C / (1 + y/m)^i
      const yieldPerPeriod = (yieldRate / 100) / frequency;
      
      for (let i = 1; i <= periods; i++) {
        pvCoupons += couponPayment / Math.pow(1 + yieldPerPeriod, i);
      }
      
      pvFace = faceValue / Math.pow(1 + yieldPerPeriod, periods);
    } else {
      // Continuous compounding: PV = C * e^(-y * t)
      const annualYield = yieldRate / 100;
      
      for (let i = 1; i <= periods; i++) {
        const timeInYears = i / frequency;
        pvCoupons += couponPayment * Math.exp(-annualYield * timeInYears);
      }
      
      pvFace = faceValue * Math.exp(-annualYield * years);
    }
    
    // Total bond price
    const price = pvCoupons + pvFace;
    setBondPrice(price);
    setPvCoupons(pvCoupons);
    setPvFaceValue(pvFace);
    
    // Calculate premium/discount
    const pd = price - faceValue;
    const pdPercent = (pd / faceValue) * 100;
    
    let pdText = '';
    if (pd > 0) {
      pdText = `Premium of $${Math.abs(pd).toFixed(2)} (${pdPercent.toFixed(2)}%)`;
    } else if (pd < 0) {
      pdText = `Discount of $${Math.abs(pd).toFixed(2)} (${Math.abs(pdPercent).toFixed(2)}%)`;
    } else {
      pdText = 'At Par';
    }
    setPremiumDiscount({ text: pdText, value: pd });
    
    // Calculate current yield
    const annualCoupon = faceValue * (couponRate / 100);
    const cy = (annualCoupon / price) * 100;
    setCurrentYield(cy);
    
    // Generate timeline
    generateTimeline(periods, couponPayment);
  };

  const generateTimeline = (periods: number, couponPayment: number) => {
    const events: Array<{ period: number; time: number; payment: number; type: string }> = [];
    
    for (let i = 1; i <= periods; i++) {
      const timeInYears = i / frequency;
      events.push({
        period: i,
        time: timeInYears,
        payment: couponPayment,
        type: 'coupon'
      });
    }
    
    // Add principal repayment at the end
    events[events.length - 1].payment += faceValue;
    events[events.length - 1].type = 'principal';
    
    setTimeline(events);
  };

  const frequencyText = frequency === 1 ? 'Annual' : frequency === 2 ? 'Semi-Annual' : 'Quarterly';

  return (
    <div className="section bond-pricing">
      <h2>Bond Pricing Calculator</h2>
      <p>Adjust the parameters below to see how bond prices are calculated using present value of cash flows.</p>
      
      <div className="calculator-grid">
        <div className="input-section">
          <div className="input-group">
            <label htmlFor="face-value">Face Value ($):</label>
            <input
              type="number"
              id="face-value"
              value={faceValue}
              onChange={(e) => setFaceValue(parseFloat(e.target.value))}
              min="100"
              step="100"
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="coupon-rate">Coupon Rate (%):</label>
            <input
              type="number"
              id="coupon-rate"
              value={couponRate}
              onChange={(e) => setCouponRate(parseFloat(e.target.value))}
              min="0"
              max="20"
              step="0.25"
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="yield-rate">Yield to Maturity (%):</label>
            <input
              type="number"
              id="yield-rate"
              value={yieldRate}
              onChange={(e) => setYieldRate(parseFloat(e.target.value))}
              min="0"
              max="20"
              step="0.25"
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="years">Years to Maturity:</label>
            <input
              type="number"
              id="years"
              value={years}
              onChange={(e) => setYears(parseInt(e.target.value))}
              min="1"
              max="30"
              step="1"
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="frequency">Payment Frequency:</label>
            <select 
              id="frequency" 
              value={frequency}
              onChange={(e) => setFrequency(parseInt(e.target.value))}
            >
              <option value="1">Annual</option>
              <option value="2">Semi-Annual</option>
              <option value="4">Quarterly</option>
            </select>
          </div>
          
          <div className="input-group">
            <label htmlFor="compounding">Compounding Convention:</label>
            <select 
              id="compounding" 
              value={compoundingConvention}
              onChange={(e) => setCompoundingConvention(e.target.value as 'discrete' | 'continuous')}
            >
              <option value="discrete">Discrete</option>
              <option value="continuous">Continuous</option>
            </select>
          </div>
          
          <div className="result-box">
            <h3>Bond Price: ${bondPrice.toFixed(2)}</h3>
            <p><strong>Premium/Discount:</strong> {premiumDiscount.text}</p>
            <p><strong>Current Yield:</strong> {currentYield.toFixed(2)}%</p>
          </div>
          
          <div className="formula-box">
            <h4>Pricing Formula</h4>
            {compoundingConvention === 'discrete' ? (
              <div>
                <div className="formula-general">
                  <strong>General Formula:</strong>
                  <div className="formula-equation">
                    P = Σ (i=1 to n) [C / (1 + y/m)^i] + F / (1 + y/m)^n
                  </div>
                </div>
                
                <div className="formula-specific">
                  <strong>With Your Values:</strong>
                  <div className="formula-equation">
                    P = Σ (i=1 to {years * frequency}) [${((faceValue * couponRate / 100) / frequency).toFixed(2)} / (1 + {((yieldRate / 100) / frequency).toFixed(4)})^i] + ${faceValue} / (1 + {((yieldRate / 100) / frequency).toFixed(4)})^{years * frequency}
                  </div>
                  <div className="formula-breakdown">
                    P = ${pvCoupons.toFixed(2)} (PV of coupons) + ${pvFaceValue.toFixed(2)} (PV of face value)
                  </div>
                  <div className="formula-result">
                    P = ${bondPrice.toFixed(2)}
                  </div>
                </div>
                
                <div className="formula-definitions">
                  <strong>Where:</strong>
                  <ul>
                    <li>C = coupon payment per period = ${((faceValue * couponRate / 100) / frequency).toFixed(2)}</li>
                    <li>y/m = yield per period = {((yieldRate / 100) / frequency * 100).toFixed(2)}%</li>
                    <li>n = total periods = {years * frequency}</li>
                    <li>F = face value = ${faceValue.toFixed(2)}</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div>
                <div className="formula-general">
                  <strong>General Formula:</strong>
                  <div className="formula-equation">
                    P = Σ (i=1 to n) [C × e^(-y × t_i)] + F × e^(-y × T)
                  </div>
                </div>
                
                <div className="formula-specific">
                  <strong>With Your Values:</strong>
                  <div className="formula-equation">
                    P = Σ (i=1 to {years * frequency}) [${((faceValue * couponRate / 100) / frequency).toFixed(2)} × e^(-{(yieldRate / 100).toFixed(4)} × t_i)] + ${faceValue} × e^(-{(yieldRate / 100).toFixed(4)} × {years})
                  </div>
                  <div className="formula-breakdown">
                    P = ${pvCoupons.toFixed(2)} (PV of coupons) + ${pvFaceValue.toFixed(2)} (PV of face value)
                  </div>
                  <div className="formula-result">
                    P = ${bondPrice.toFixed(2)}
                  </div>
                </div>
                
                <div className="formula-definitions">
                  <strong>Where:</strong>
                  <ul>
                    <li>C = coupon payment per period = ${((faceValue * couponRate / 100) / frequency).toFixed(2)}</li>
                    <li>y = annual yield = {(yieldRate).toFixed(2)}%</li>
                    <li>t_i = time of payment i in years</li>
                    <li>T = maturity = {years} years</li>
                    <li>F = face value = ${faceValue.toFixed(2)}</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="timeline-section">
          <h3>Coupon Payment Timeline</h3>
          <p className="timeline-subtitle">Frequency: {frequencyText} | Total Periods: {timeline.length}</p>
          
          <div className="timeline-visualization">
            <div className="timeline-track">
              {timeline.map((event, index) => (
                <div
                  key={index}
                  className={`timeline-event ${event.type}`}
                  style={{ left: `${(event.period / timeline.length) * 100}%` }}
                  title={`Period ${event.period} (Year ${event.time.toFixed(2)}): $${event.payment.toFixed(2)}`}
                >
                  <div className="timeline-marker"></div>
                  <div className="timeline-label">
                    {event.type === 'principal' ? 'P+C' : 'C'}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="timeline-legend">
              <div className="legend-item">
                <span className="legend-marker coupon"></span>
                <span>Coupon Payment</span>
              </div>
              <div className="legend-item">
                <span className="legend-marker principal"></span>
                <span>Coupon + Principal</span>
              </div>
            </div>
          </div>
          
          <div className="payment-schedule">
            <h4>Payment Schedule</h4>
            <div className="schedule-table">
              <table>
                <thead>
                  <tr>
                    <th>Period</th>
                    <th>Time (Years)</th>
                    <th>Payment</th>
                    <th>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {timeline.slice(0, 5).map((event, index) => (
                    <tr key={index}>
                      <td>{event.period}</td>
                      <td>{event.time.toFixed(2)}</td>
                      <td>${event.payment.toFixed(2)}</td>
                      <td>{event.type === 'principal' ? 'Principal + Coupon' : 'Coupon'}</td>
                    </tr>
                  ))}
                  {timeline.length > 5 && (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', fontStyle: 'italic' }}>
                        ... {timeline.length - 5} more periods ...
                      </td>
                    </tr>
                  )}
                  {timeline.length > 5 && (
                    <tr>
                      <td>{timeline[timeline.length - 1].period}</td>
                      <td>{timeline[timeline.length - 1].time.toFixed(2)}</td>
                      <td>${timeline[timeline.length - 1].payment.toFixed(2)}</td>
                      <td>Principal + Coupon</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BondPricingCalculator;
