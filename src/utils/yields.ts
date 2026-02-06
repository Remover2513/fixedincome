import type { DiscountFactors, SpotRate, CompoundingConvention, Bond } from '../types';

/**
 * Convert discount factors to spot rates under different compounding conventions
 */
export function discountFactorsToSpotRates(
  df: DiscountFactors,
  convention: CompoundingConvention = 'continuous'
): SpotRate[] {
  return df.times.map((time, i) => {
    const factor = df.factors[i];
    let rate: number;
    
    switch (convention) {
      case 'continuous':
        // s(t) = -ln(DF(t)) / t
        rate = -Math.log(factor) / time;
        break;
      case 'annual':
        // DF(t) = 1 / (1 + s)^t => s = (1/DF)^(1/t) - 1
        rate = Math.pow(1 / factor, 1 / time) - 1;
        break;
      case 'semiannual':
        // DF(t) = 1 / (1 + s/2)^(2t) => s = 2 * ((1/DF)^(1/(2t)) - 1)
        rate = 2 * (Math.pow(1 / factor, 1 / (2 * time)) - 1);
        break;
    }
    
    return { time, rate };
  });
}

/**
 * Calculate yield to maturity for a coupon bond
 * Uses Newton-Raphson method to solve for YTM
 */
export function calculateYTM(bond: Bond, maxIterations = 100, tolerance = 1e-8): number {
  const { maturity, couponRate, frequency, price, faceValue } = bond;
  const couponPayment = (faceValue * couponRate) / frequency;
  const numPayments = Math.round(maturity * frequency);
  
  // Initial guess: use coupon rate
  let ytm = couponRate;
  
  for (let iter = 0; iter < maxIterations; iter++) {
    let pv = 0;
    let pvDerivative = 0;
    
    for (let i = 1; i <= numPayments; i++) {
      const discountFactor = Math.pow(1 + ytm / frequency, -i);
      
      // Present value of this cashflow
      const cashflow = i === numPayments ? couponPayment + faceValue : couponPayment;
      pv += cashflow * discountFactor;
      
      // Derivative for Newton-Raphson
      pvDerivative -= (cashflow * i * discountFactor) / (frequency * (1 + ytm / frequency));
    }
    
    const error = pv - price;
    
    if (Math.abs(error) < tolerance) {
      return ytm;
    }
    
    // Newton-Raphson update
    ytm = ytm - error / pvDerivative;
    
    // Ensure YTM stays reasonable
    if (ytm < -0.5 || ytm > 2) {
      ytm = couponRate; // Reset to initial guess
      break;
    }
  }
  
  return ytm;
}

/**
 * Calculate forward rates from spot rates
 * f(t1, t2) = (s(t2)*t2 - s(t1)*t1) / (t2 - t1)
 */
export function spotRatesToForwardRates(spotRates: SpotRate[]): SpotRate[] {
  if (spotRates.length < 2) return [];
  
  const forwardRates: SpotRate[] = [];
  
  for (let i = 1; i < spotRates.length; i++) {
    const t1 = spotRates[i - 1].time;
    const t2 = spotRates[i].time;
    const s1 = spotRates[i - 1].rate;
    const s2 = spotRates[i].rate;
    
    const forwardRate = (s2 * t2 - s1 * t1) / (t2 - t1);
    
    forwardRates.push({
      time: t2,
      rate: forwardRate
    });
  }
  
  return forwardRates;
}

/**
 * Price a bond using discount factors
 */
export function priceBondWithDiscountFactors(
  bond: Bond,
  discountFactors: DiscountFactors
): number {
  const couponPayment = (bond.faceValue * bond.couponRate) / bond.frequency;
  const numPayments = Math.round(bond.maturity * bond.frequency);
  
  let price = 0;
  
  for (let i = 1; i <= numPayments; i++) {
    const time = Math.round((i / bond.frequency) * 1000) / 1000;
    const timeIndex = discountFactors.times.indexOf(time);
    
    if (timeIndex !== -1) {
      const cashflow = i === numPayments ? couponPayment + bond.faceValue : couponPayment;
      price += cashflow * discountFactors.factors[timeIndex];
    }
  }
  
  return price;
}
