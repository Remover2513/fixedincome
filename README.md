# Fixed Income - Interactive Yield Curve & Bootstrapping Visualizer

An educational web application that teaches students and practitioners how to derive **zero-coupon (spot) rates** from coupon-bearing bonds using **bootstrapping** and **linear algebra**.

## 🌐 Live Demo

**[Try it now on GitHub Pages!](https://remover2513.github.io/fixedincome/)**

![Interactive Yield Curve Visualizer](app/public/screenshot.png)

## 🎯 What is This?

This interactive tool demonstrates the fundamental relationship between bond prices and discount factors by:
- Visualizing how coupon bonds are portfolios of zero-coupon bonds
- Showing that bond pricing is fundamentally a linear algebra problem (C·d = p)
- Teaching both bootstrapping (for triangular systems) and least squares (for overdetermined systems)
- Providing step-by-step explanations with student exercise mode

## 🚀 Quick Start

### Option 1: Use the Live Demo
Visit **[https://remover2513.github.io/fixedincome/](https://remover2513.github.io/fixedincome/)** - no installation required!

### Option 2: Run Locally

```bash
cd app
npm install
npm run dev
```

Visit `http://localhost:5173` to start learning!

## 📚 Key Features

### Interactive Bond Input
- Edit bond parameters in real-time
- Load example datasets (triangular or overdetermined systems)
- Add noise to demonstrate least squares robustness

### Yield Curve Visualization
- YTM curve (from bond prices)
- Spot/zero curve (bootstrapped)
- Forward curve (derived from spot rates)

### Linear Algebra View
- See the cashflow matrix C
- Watch discount factors d being solved
- Understand the pricing equation C·d = p
- Interactive highlighting of selected bonds

### Step-by-Step Bootstrapping
- Sequential solving from short to long maturity
- Student exercise mode to predict before revealing
- Clear mathematical explanations at each step

## 📖 Learn More

See the [detailed README](app/README.md) in the `app/` directory for:
- Complete mathematical specifications
- Usage guide for students and instructors
- Technical stack details
- Example datasets explanation

## 🎓 Educational Use

Perfect for:
- Fixed income courses
- Quantitative finance programs
- Self-study of bond mathematics
- Understanding yield curve construction

## 🛠️ Built With

- React + TypeScript
- Plotly.js for interactive charts
- math.js for linear algebra
- Vite for fast development

## 🚀 Deployment

This app is automatically deployed to GitHub Pages via GitHub Actions whenever changes are pushed to the `main` branch.

The deployment workflow:
1. Builds the React application with Vite
2. Uploads the build artifacts
3. Deploys to GitHub Pages at [https://remover2513.github.io/fixedincome/](https://remover2513.github.io/fixedincome/)

To deploy manually:
```bash
cd app
npm run build
# The built files will be in app/dist/
```

## 📄 License

MIT License - Free for educational use
# Fixed Income Securities - Interactive Learning Platform

An interactive educational website for the Wharton School MBA course "Fixed Income Securities." This site provides interactive examples, charts, and diagrams to help students develop intuition about fixed income securities concepts.

> **⚠️ DEPLOYMENT NOTE:** If you're seeing a blank page at the GitHub Pages URL, this means the Pull Request has not been merged to the `main` branch yet. 
> 
> **Quick Fix:** See [QUICKFIX.md](QUICKFIX.md) for step-by-step instructions (takes 2 minutes!)
> 
> **Detailed Guide:** See [DEPLOYMENT.md](DEPLOYMENT.md) for comprehensive troubleshooting.

## 🎯 Purpose

This platform offers hands-on tools to understand key fixed income concepts:

- **Bond Pricing Calculator**: Calculate bond prices and understand the relationship between coupon rates, yield, and maturity
- **Yield Curve Visualization**: Explore different yield curve shapes and the term structure of interest rates
- **Duration & Convexity**: Interactive tools to understand bond price sensitivity to interest rate changes
- **Interest Rate Risk**: Visualize how bond prices change with interest rate movements

## 🚀 Getting Started

### ⚠️ First Time Setup

**If the GitHub Pages site shows a blank page:**
This repository is currently on a feature branch. To deploy the website, you need to either:
1. **Merge this Pull Request to `main`** (recommended), or
2. **Configure GitHub Pages** to serve from this branch

See detailed instructions in [DEPLOYMENT.md](DEPLOYMENT.md).

### Option 1: View Online (GitHub Pages)

Visit the live site at: `https://remover2513.github.io/fixedincome/`

**Note:** The site will only work after the PR is merged to `main` or GitHub Pages is configured to use the feature branch.

### Option 2: Run Locally (Works Immediately)

1. Clone this repository:
```bash
git clone https://github.com/Remover2513/fixedincome.git
cd fixedincome

# If the PR hasn't been merged yet, checkout the feature branch:
git checkout copilot/add-interactive-examples-charts
```

2. Open `index.html` in your web browser:
   - **On macOS**: `open index.html`
   - **On Linux**: `xdg-open index.html`
   - **On Windows**: Double-click the `index.html` file
   - **Or**: Simply drag and drop `index.html` into your browser

No build process or dependencies required! The site uses vanilla JavaScript and loads Chart.js from a CDN.

## 📚 Features

### 1. Bond Pricing Calculator
- Input bond parameters (face value, coupon rate, yield, maturity, frequency)
- Instantly calculate bond price
- See premium/discount status
- Calculate current yield
- Understand the inverse relationship between price and yield

### 2. Yield Curve Visualization
- View different yield curve shapes:
  - Normal (upward sloping)
  - Inverted (downward sloping)
  - Flat
  - Humped
- Interactive chart powered by Chart.js
- Learn what each curve shape indicates about the economy

### 3. Duration & Convexity
- Calculate Macaulay and Modified Duration
- Visualize the price-yield relationship
- Compare actual prices vs. duration-based estimates
- Understand convexity effects
- See price sensitivity to rate changes

### 4. Interest Rate Risk
- Interactive slider to change interest rates
- Real-time comparison across different bond types:
  - Short-term vs. long-term bonds
  - High coupon vs. low coupon bonds
- Comparison table showing price impacts
- Visual chart comparing price changes

## 🛠️ Technology Stack

- **HTML5**: Semantic structure
- **CSS3**: Modern responsive design with CSS Grid and Flexbox
- **Vanilla JavaScript**: No frameworks, pure ES6+
- **Chart.js 4.4.0**: Interactive, responsive charts
- **No build tools required**: Works directly in any modern browser

## 📱 Responsive Design

The site is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## 🎓 Educational Content

### Key Concepts Covered

1. **Bond Pricing**
   - Present value of cash flows
   - Coupon payments vs. yield
   - Premium, par, and discount bonds

2. **Yield Curves**
   - Term structure of interest rates
   - Normal vs. inverted curves
   - Economic implications

3. **Duration**
   - Macaulay Duration (weighted average time to cash flows)
   - Modified Duration (price sensitivity measure)
   - Duration as a risk measure

4. **Convexity**
   - Non-linear price-yield relationship
   - Why duration estimates are imperfect
   - Price asymmetry

5. **Interest Rate Risk**
   - Inverse relationship between rates and prices
   - Impact of maturity on price sensitivity
   - Impact of coupon rate on price sensitivity

## 📖 Usage Examples

### Calculate a Bond Price

1. Navigate to the "Bond Pricing" section
2. Enter your bond parameters:
   - Face Value: $1,000
   - Coupon Rate: 5%
   - Yield to Maturity: 6%
   - Years to Maturity: 10
   - Payment Frequency: Semi-Annual
3. Click "Calculate Price"
4. Review the results showing the bond price, premium/discount status, and current yield

### Explore Yield Curves

1. Go to the "Yield Curve" section
2. Click different curve shape buttons (Normal, Inverted, Flat, Humped)
3. Observe how the curve changes
4. Read the explanations for each curve type

### Analyze Duration

1. Navigate to "Duration & Convexity"
2. Input bond parameters
3. Click "Calculate Duration"
4. See Macaulay and Modified Duration calculations
5. View the price-yield chart showing actual vs. estimated prices

### Simulate Rate Changes

1. Go to "Interest Rate Risk"
2. Use the slider to adjust interest rates
3. Watch the chart and table update in real-time
4. Compare impacts across different bond types

## 🤝 Contributing

This is an educational project. Suggestions and improvements are welcome!

## ⚠️ Disclaimer

This site is for educational purposes only. It is not investment advice. All calculations are simplified models for learning purposes.

## 📄 License

MIT License - Educational use for Wharton School MBA Program

## 🏫 About

Created for the Wharton School MBA course "Fixed Income Securities" to provide interactive learning tools for students.

---

**Note**: This is a static educational website. All calculations are performed client-side in your browser. No data is collected or stored.
