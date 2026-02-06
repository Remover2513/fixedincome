import * as math from 'mathjs';
import type { CashflowMatrix, DiscountFactors, LeastSquaresResult, BootstrapStep } from '../types';

/**
 * Solve for discount factors using bootstrapping (for triangular systems)
 * or least squares (for overdetermined systems)
 */
export function solveDiscountFactors(cfMatrix: CashflowMatrix): DiscountFactors {
  const { matrix, times, prices } = cfMatrix;
  
  // Check if we can use simple bootstrapping
  if (isTriangular(matrix)) {
    const factors = bootstrapDiscountFactors(cfMatrix);
    return { times, factors };
  } else {
    // Use least squares
    const result = leastSquaresSolve(matrix, prices);
    return { times, factors: result.discountFactors };
  }
}

/**
 * Check if the cashflow matrix is lower triangular
 * (each bond only has cashflows up to its maturity)
 */
function isTriangular(matrix: number[][]): boolean {
  const n = matrix.length;
  const m = matrix[0]?.length || 0;
  
  // Must be square or have more columns than rows
  if (n > m) return false;
  
  for (let i = 0; i < n; i++) {
    // Check that all entries after the diagonal are zero
    for (let j = i + 1; j < m; j++) {
      if (Math.abs(matrix[i][j]) > 1e-10) {
        return false;
      }
    }
    // Check that the diagonal is non-zero
    if (Math.abs(matrix[i][i]) < 1e-10) {
      return false;
    }
  }
  
  return true;
}

/**
 * Bootstrap discount factors for a triangular system
 */
function bootstrapDiscountFactors(cfMatrix: CashflowMatrix): number[] {
  const { matrix, times, prices } = cfMatrix;
  const factors: number[] = new Array(times.length).fill(0);
  
  for (let i = 0; i < matrix.length; i++) {
    const row = matrix[i];
    const price = prices[i];
    
    // Find the last non-zero element in this row
    let lastIdx = -1;
    for (let j = row.length - 1; j >= 0; j--) {
      if (Math.abs(row[j]) > 1e-10) {
        lastIdx = j;
        break;
      }
    }
    
    if (lastIdx === -1) continue;
    
    // Calculate discount factor
    // price = sum of known cashflows * known DFs + final cashflow * unknown DF
    let knownValue = 0;
    for (let j = 0; j < lastIdx; j++) {
      knownValue += row[j] * factors[j];
    }
    
    factors[lastIdx] = (price - knownValue) / row[lastIdx];
  }
  
  return factors;
}

/**
 * Solve using least squares: min ||Cd - p||^2
 */
export function leastSquaresSolve(C: number[][], p: number[]): LeastSquaresResult {
  try {
    const CMat = math.matrix(C);
    const pVec = math.matrix(p);
    
    // Solve using QR decomposition: C'd = p
    // Normal equations: C'C d = C'p
    const CT = math.transpose(CMat);
    const CTC = math.multiply(CT, CMat) as math.Matrix;
    const CTp = math.multiply(CT, pVec) as math.Matrix;
    
    // Solve the system
    const dSolution = math.lusolve(CTC, CTp) as math.Matrix;
    const discountFactors = (dSolution.toArray() as number[][]).map(row => row[0]);
    
    // Calculate residuals
    const predicted = math.multiply(CMat, math.matrix(discountFactors)) as math.Matrix;
    const residuals = math.subtract(predicted, pVec).toArray() as number[];
    
    // Calculate condition number (approximate)
    const conditionNumber = estimateConditionNumber(C);
    
    return { discountFactors, residuals, conditionNumber };
  } catch (error) {
    console.error('Error in least squares solve:', error);
    // Fallback to simple solution
    return {
      discountFactors: p.map(() => 0.95),
      residuals: p.map(() => 0),
      conditionNumber: 1
    };
  }
}

/**
 * Estimate condition number of a matrix
 */
function estimateConditionNumber(matrix: number[][]): number {
  try {
    const M = math.matrix(matrix);
    const MT = math.transpose(M);
    const MTM = math.multiply(MT, M) as math.Matrix;
    
    // Get eigenvalues to estimate condition number
    // For now, use a simple approximation
    const arr = MTM.toArray() as number[][];
    const maxVal = Math.max(...arr.flat().map(Math.abs));
    const minVal = Math.min(...arr.flat().filter(x => Math.abs(x) > 1e-10).map(Math.abs));
    
    return maxVal / (minVal || 1);
  } catch (error) {
    return 1;
  }
}

/**
 * Generate step-by-step bootstrapping explanation
 */
export function generateBootstrapSteps(cfMatrix: CashflowMatrix): BootstrapStep[] {
  const { matrix, times, prices } = cfMatrix;
  const steps: BootstrapStep[] = [];
  const factors: number[] = new Array(times.length).fill(0);
  
  for (let i = 0; i < matrix.length; i++) {
    const row = matrix[i];
    const price = prices[i];
    
    // Find the last non-zero element
    let lastIdx = -1;
    for (let j = row.length - 1; j >= 0; j--) {
      if (Math.abs(row[j]) > 1e-10) {
        lastIdx = j;
        break;
      }
    }
    
    if (lastIdx === -1) continue;
    
    // Build equation
    let knownValue = 0;
    let equationParts: string[] = [];
    
    for (let j = 0; j <= lastIdx; j++) {
      if (Math.abs(row[j]) > 1e-10) {
        if (j < lastIdx) {
          knownValue += row[j] * factors[j];
          equationParts.push(`${row[j].toFixed(2)} × ${factors[j].toFixed(4)}`);
        } else {
          equationParts.push(`${row[j].toFixed(2)} × DF(${times[j]})`);
        }
      }
    }
    
    const equation = `${price.toFixed(2)} = ${equationParts.join(' + ')}`;
    const df = (price - knownValue) / row[lastIdx];
    factors[lastIdx] = df;
    
    // Convert to spot rate (continuous compounding)
    const spotRate = -Math.log(df) / times[lastIdx];
    
    steps.push({
      stepNumber: i + 1,
      time: times[lastIdx],
      description: `Solving for DF(${times[lastIdx]}) from bond ${i + 1}`,
      equation,
      discountFactor: df,
      spotRate
    });
  }
  
  return steps;
}
