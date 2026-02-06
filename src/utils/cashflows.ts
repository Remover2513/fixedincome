import type { Bond, CashflowMatrix } from '../types';

/**
 * Generate all unique cashflow times from a set of bonds
 */
export function generateCashflowTimes(bonds: Bond[]): number[] {
  const timesSet = new Set<number>();
  
  for (const bond of bonds) {
    const numPayments = Math.round(bond.maturity * bond.frequency);
    for (let i = 1; i <= numPayments; i++) {
      const time = i / bond.frequency;
      // Round to avoid floating point issues
      timesSet.add(Math.round(time * 1000) / 1000);
    }
  }
  
  return Array.from(timesSet).sort((a, b) => a - b);
}

/**
 * Build the cashflow matrix C where C[i][j] is the cashflow from bond i at time j
 */
export function buildCashflowMatrix(bonds: Bond[]): CashflowMatrix {
  const times = generateCashflowTimes(bonds);
  const matrix: number[][] = [];
  const prices: number[] = [];
  
  for (const bond of bonds) {
    const row: number[] = new Array(times.length).fill(0);
    const couponPayment = (bond.faceValue * bond.couponRate) / bond.frequency;
    const numPayments = Math.round(bond.maturity * bond.frequency);
    
    for (let i = 1; i <= numPayments; i++) {
      const time = Math.round((i / bond.frequency) * 1000) / 1000;
      const timeIndex = times.indexOf(time);
      
      if (timeIndex !== -1) {
        row[timeIndex] = couponPayment;
        
        // Add face value at maturity
        if (i === numPayments) {
          row[timeIndex] += bond.faceValue;
        }
      }
    }
    
    matrix.push(row);
    prices.push(bond.price);
  }
  
  return { matrix, times, prices, bonds };
}

/**
 * Get cashflows for a specific bond
 */
export function getBondCashflows(bond: Bond, times: number[]): number[] {
  const cashflows: number[] = new Array(times.length).fill(0);
  const couponPayment = (bond.faceValue * bond.couponRate) / bond.frequency;
  const numPayments = Math.round(bond.maturity * bond.frequency);
  
  for (let i = 1; i <= numPayments; i++) {
    const time = Math.round((i / bond.frequency) * 1000) / 1000;
    const timeIndex = times.indexOf(time);
    
    if (timeIndex !== -1) {
      cashflows[timeIndex] = couponPayment;
      
      if (i === numPayments) {
        cashflows[timeIndex] += bond.faceValue;
      }
    }
  }
  
  return cashflows;
}
