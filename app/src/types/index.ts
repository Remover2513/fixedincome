export interface Bond {
  id: string;
  maturity: number; // years
  couponRate: number; // annual rate (e.g., 0.05 for 5%)
  frequency: number; // payments per year (e.g., 2 for semi-annual)
  price: number; // clean price
  faceValue: number; // typically 100
}

export interface CashflowDate {
  time: number; // in years
  index: number; // index in the discount factor array
}

export interface CashflowMatrix {
  matrix: number[][]; // C[bond][time]
  times: number[]; // sorted unique cashflow times
  prices: number[]; // bond prices
  bonds: Bond[];
}

export interface DiscountFactors {
  times: number[];
  factors: number[];
}

export interface SpotRate {
  time: number;
  rate: number; // in decimal (e.g., 0.05 for 5%)
}

export interface YTMResult {
  bondId: string;
  ytm: number; // yield to maturity in decimal
}

export interface BootstrapStep {
  stepNumber: number;
  time: number;
  description: string;
  equation: string;
  discountFactor: number;
  spotRate: number;
}

export type CompoundingConvention = 'continuous' | 'annual' | 'semiannual';

export interface LeastSquaresResult {
  discountFactors: number[];
  residuals: number[];
  conditionNumber: number;
}
