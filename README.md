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
