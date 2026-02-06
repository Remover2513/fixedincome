import { useState, useEffect } from 'react';
import './BondPricingCalculator.css';

function BondPricingCalculator() {
  const [faceValue, setFaceValue] = useState(1000);
  const [couponRate, setCouponRate] = useState(5);
  const [yieldRate, setYieldRate] = useState(6);
  const [years, setYears] = useState(10);
  const [frequency, setFrequency] = useState(2);
  
  const [bondPrice, setBondPrice] = useState(0);
  const [premiumDiscount, setPremiumDiscount] = useState({ text: '-', value: 0 });
  const [currentYield, setCurrentYield] = useState(0);
  const [timeline, setTimeline] = useState<Array<{ period: number; time: number; payment: number; type: string }>>([]);

  useEffect(() => {
    calculateBondPrice();
  }, [faceValue, couponRate, yieldRate, years, frequency]);

  const calculateBondPrice = () => {
    const periods = years * frequency;
    const couponPayment = (faceValue * (couponRate / 100)) / frequency;
    const yieldPerPeriod = (yieldRate / 100) / frequency;
    
    // Calculate present value of coupon payments
    let pvCoupons = 0;
    for (let i = 1; i <= periods; i++) {
      pvCoupons += couponPayment / Math.pow(1 + yieldPerPeriod, i);
    }
    
    // Calculate present value of face value
    const pvFaceValue = faceValue / Math.pow(1 + yieldPerPeriod, periods);
    
    // Total bond price
    const price = pvCoupons + pvFaceValue;
    setBondPrice(price);
    
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
          
          <div className="result-box">
            <h3>Bond Price: ${bondPrice.toFixed(2)}</h3>
            <p><strong>Premium/Discount:</strong> {premiumDiscount.text}</p>
            <p><strong>Current Yield:</strong> {currentYield.toFixed(2)}%</p>
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
