# Interactive Yield Curve & Bootstrapping Visualizer

An educational web application that teaches how to derive **zero-coupon (spot) rates** from coupon-bearing bonds using **bootstrapping** and **linear algebra**.

## 🎯 Learning Objectives

Students will learn:
- How coupon bonds are portfolios of zero-coupon bonds
- That bond prices are linear combinations of discount factors
- How to solve for discount factors using bootstrapping and least squares
- The relationship between discount factors, spot rates, and forward rates
- Different compounding conventions (continuous, annual, semi-annual)

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation & Running

```bash
cd app
npm install
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
npm run preview
```

## 📚 Features

### 1. **Interactive Bond Input Panel**
- Edit bond parameters in real-time:
  - Maturity (years)
  - Coupon rate (%)
  - Payment frequency (annual, semi-annual, quarterly)
  - Price
  - Face value
- Add or remove bonds dynamically
- Load example datasets (triangular or overdetermined systems)
- Add random noise to prices to demonstrate least squares

### 2. **Yield Curve Charts**
Toggle between three different curves:
- **YTM Curve**: Yield-to-maturity computed from each bond's price
- **Spot/Zero Curve**: Derived via bootstrapping or least squares
- **Forward Curve**: Implied forward rates from spot curve

Interactive features:
- Hover tooltips showing values
- Zoom and pan capabilities
- Professional Plotly-based charts

### 3. **Linear Algebra Visualization**
The educational centerpiece showing:

#### Matrix View
- **Cashflow Matrix (C)**: Rows = bonds, columns = time periods
- **Discount Factor Vector (d)**: The unknowns we're solving for
- **Price Vector (p)**: Observed bond prices
- Shows the equation: **C · d = p**

#### Interactive Features
- Click a bond to highlight its cashflows in the matrix
- See the explicit pricing equation for selected bonds
- View discount factors and spot rates in a table
- Toggle between compounding conventions

#### Bootstrapping Step-by-Step
- Switch to bootstrap view to see sequential solving
- Student exercise mode: predict the next discount factor before revealing
- Each step shows:
  - The pricing equation
  - Calculation of the discount factor
  - Conversion to spot rate

#### Least Squares Analysis
When the system is overdetermined:
- Shows residuals (C·d - p)
- Displays condition number of the matrix
- Explains why least squares is needed

### 4. **Educational Content**
- Collapsible "Why This Works" section explaining:
  - Coupon bonds as portfolios of zeros
  - Discount factors as state prices
  - Bootstrapping vs least squares
  - When to use each method

## 🔬 Mathematical Details

### Inputs
For each bond i:
- Maturity T_i
- Coupon rate c_i (annual)
- Payment frequency m_i
- Face value F (typically 100)
- Price P_i

### Computation Process

1. **Generate Cashflow Times**
   - Union of all coupon payment dates
   - Sorted unique times: t_1, t_2, ..., t_n

2. **Build Cashflow Matrix C**
   - Coupon payment per period: F × c_i / m_i
   - Principal repayment at maturity: +F
   - C[i,j] = cashflow from bond i at time j

3. **Solve for Discount Factors**
   - If triangular matrix: use bootstrapping (back-substitution)
   - Otherwise: least squares solution min ||Cd - p||²

4. **Convert to Spot Rates**
   - Continuous: s(t) = -ln(DF(t)) / t
   - Annual: s = (1/DF)^(1/t) - 1
   - Semi-annual: s = 2 × ((1/DF)^(1/(2t)) - 1)

5. **Compute YTM** (for each bond)
   - Numerical solve using Newton-Raphson
   - Find yield that prices all cashflows

6. **Derive Forward Rates**
   - f(t1, t2) = (s(t2)×t2 - s(t1)×t1) / (t2 - t1)

## 📊 Example Datasets

### Triangular Example
Six bonds with aligned semi-annual maturities (0.5y to 3.0y). This creates a lower-triangular cashflow matrix that can be solved sequentially via bootstrapping.

### Overdetermined Example
Seven bonds with mixed frequencies and overlapping maturities. This creates an overdetermined system requiring least squares solution.

## 🛠️ Technical Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Charting**: Plotly.js via react-plotly.js
- **Math Library**: math.js (for linear algebra operations)
- **Styling**: Custom CSS with responsive design

## 📖 Usage Guide

### For Students

1. **Start with the Triangular Example**
   - Click "Load Triangular Example"
   - Observe how the matrix is lower-triangular
   - Switch to "Bootstrap Steps" view
   - Enable "Student Exercise Mode"
   - Try to predict each discount factor before revealing

2. **Explore the Linear Algebra**
   - Click on different bonds in the input table
   - Watch how their cashflows highlight in the matrix
   - See the explicit pricing equation
   - Understand how each bond price is a weighted sum of discount factors

3. **Try the Overdetermined Example**
   - Click "Load Overdetermined Example"
   - See how the system becomes rectangular
   - Observe the residuals from least squares
   - Add noise to see how the solution handles imperfect data

4. **Experiment**
   - Change coupon rates and see curves shift
   - Add new bonds
   - Try different compounding conventions
   - Toggle between YTM, spot, and forward curves

### For Instructors

The app can be used to demonstrate:
- The equivalence between coupon bonds and zero portfolios
- The bootstrap method for aligned maturities
- Least squares when markets provide redundant information
- The impact of compounding conventions on rates
- The relationship between spot rates and forward rates

## 🧪 Testing

The codebase includes TypeScript for type safety. To run type checking:

```bash
npm run build
```

## 🌐 Deployment

This application is deployed to GitHub Pages and automatically updates when changes are pushed to the main branch.

**Live URL**: [https://remover2513.github.io/fixedincome/](https://remover2513.github.io/fixedincome/)

The deployment process:
1. GitHub Actions workflow triggers on push to main
2. Builds the app with `npm run build`
3. Deploys the `dist/` folder to GitHub Pages

To build locally:
```bash
npm run build
npm run preview  # Preview the production build locally
```

## 📝 Future Enhancements

Potential additions:
- Export data to CSV
- Import custom bond datasets
- More sophisticated error handling for edge cases
- Duration and convexity calculations
- Par curve construction
- Historical yield curve comparison

## 🤝 Contributing

This is an educational tool. Contributions that improve clarity, add educational features, or fix bugs are welcome.

## 📄 License

MIT License - feel free to use for educational purposes.

## 🙏 Acknowledgments

Built to help students understand the fundamental relationship between bond prices and discount factors through interactive visualization and step-by-step mathematical explanations.
