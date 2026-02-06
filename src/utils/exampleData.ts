import type { Bond } from '../types';

/**
 * Example dataset with aligned maturities (produces triangular matrix)
 */
export const EXAMPLE_DATASET_TRIANGULAR: Bond[] = [
  {
    id: '1',
    maturity: 0.5,
    couponRate: 0.03,
    frequency: 2,
    price: 100.5,
    faceValue: 100
  },
  {
    id: '2',
    maturity: 1.0,
    couponRate: 0.035,
    frequency: 2,
    price: 101.2,
    faceValue: 100
  },
  {
    id: '3',
    maturity: 1.5,
    couponRate: 0.04,
    frequency: 2,
    price: 102.1,
    faceValue: 100
  },
  {
    id: '4',
    maturity: 2.0,
    couponRate: 0.045,
    frequency: 2,
    price: 103.5,
    faceValue: 100
  },
  {
    id: '5',
    maturity: 2.5,
    couponRate: 0.05,
    frequency: 2,
    price: 105.2,
    faceValue: 100
  },
  {
    id: '6',
    maturity: 3.0,
    couponRate: 0.055,
    frequency: 2,
    price: 107.1,
    faceValue: 100
  }
];

/**
 * Example dataset with misaligned maturities (requires least squares)
 */
export const EXAMPLE_DATASET_OVERDETERMINED: Bond[] = [
  {
    id: '1',
    maturity: 0.5,
    couponRate: 0.03,
    frequency: 2,
    price: 100.5,
    faceValue: 100
  },
  {
    id: '2',
    maturity: 0.75,
    couponRate: 0.032,
    frequency: 4,
    price: 100.8,
    faceValue: 100
  },
  {
    id: '3',
    maturity: 1.0,
    couponRate: 0.035,
    frequency: 2,
    price: 101.2,
    faceValue: 100
  },
  {
    id: '4',
    maturity: 1.0,
    couponRate: 0.036,
    frequency: 4,
    price: 101.5,
    faceValue: 100
  },
  {
    id: '5',
    maturity: 1.5,
    couponRate: 0.04,
    frequency: 2,
    price: 102.1,
    faceValue: 100
  },
  {
    id: '6',
    maturity: 2.0,
    couponRate: 0.045,
    frequency: 2,
    price: 103.5,
    faceValue: 100
  },
  {
    id: '7',
    maturity: 2.0,
    couponRate: 0.046,
    frequency: 4,
    price: 103.8,
    faceValue: 100
  }
];

/**
 * Generate a new bond with default values
 */
export function createNewBond(id: string): Bond {
  return {
    id,
    maturity: 1.0,
    couponRate: 0.05,
    frequency: 2,
    price: 100,
    faceValue: 100
  };
}

/**
 * Add random noise to bond prices
 */
export function addNoiseToPrices(bonds: Bond[], noiseMagnitude = 0.1): Bond[] {
  return bonds.map(bond => ({
    ...bond,
    price: bond.price + (Math.random() - 0.5) * noiseMagnitude
  }));
}
