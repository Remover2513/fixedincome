# Fixed Income - Interactive Learning Platform

This repository contains **two educational web applications** for teaching fixed income securities concepts:

1. **Interactive Yield Curve & Bootstrapping Visualizer** (React app in `/app`)
2. **Fixed Income Securities Learning Platform** (Vanilla JS interactive site at root)

## 🌐 Live Demo

**[Try it now on GitHub Pages!](https://remover2513.github.io/fixedincome/)**

The React bootstrapping visualizer is deployed at the root URL above.

![Interactive Yield Curve Visualizer](app/public/screenshot.png)

---

## 📦 Component 1: React Bootstrapping Visualizer (`/app`)

An advanced educational tool that teaches how to derive **zero-coupon (spot) rates** from coupon-bearing bonds using **bootstrapping** and **linear algebra**.

### What is This?

This interactive tool demonstrates the fundamental relationship between bond prices and discount factors by:
- Visualizing how coupon bonds are portfolios of zero-coupon bonds
- Showing that bond pricing is fundamentally a linear algebra problem (C·d = p)
- Teaching both bootstrapping (for triangular systems) and least squares (for overdetermined systems)
- Providing step-by-step explanations with student exercise mode

### Key Features

- **Interactive Bond Input**: Edit parameters in real-time, load example datasets, add noise
- **Yield Curve Visualization**: YTM curve, spot/zero curve, forward curve
- **Linear Algebra View**: See cashflow matrix C, discount factors d, and pricing equation
- **Step-by-Step Bootstrapping**: Sequential solving with student exercise mode

### Technology Stack

- React + TypeScript
- Plotly.js for interactive charts
- math.js for linear algebra
- Vite for fast development

### Quick Start

```bash
cd app
npm install
npm run dev
```

Visit `http://localhost:5173` to start learning!

### Learn More

See the [detailed README](app/README.md) in the `app/` directory for complete documentation, mathematical specifications, and usage guide.

---

## 📦 Component 2: Interactive Learning Platform (Root)

A vanilla JavaScript educational website with interactive tools for the Wharton School MBA course "Fixed Income Securities."

### Features

1. **Bond Pricing Calculator**: Calculate bond prices and understand the relationship between coupon rates, yield, and maturity
2. **Yield Curve Visualization**: Explore different yield curve shapes (normal, inverted, flat, humped) and the term structure of interest rates
3. **Duration & Convexity**: Interactive tools to understand bond price sensitivity to interest rate changes
4. **Interest Rate Risk**: Visualize how bond prices change with interest rate movements

### Technology Stack

- HTML5 + CSS3
- Vanilla JavaScript (ES6+)
- Hand-built SVG charts
- No build tools required

### Quick Start

Simply open `index.html` in your web browser:
```bash
# On macOS
open index.html

# On Linux
xdg-open index.html

# Or use a local server
npm run dev
```

---

## 🚀 Deployment

The React bootstrapping visualizer is automatically deployed to GitHub Pages via GitHub Actions whenever changes are pushed to the `main` branch.

The deployment workflow:
1. Builds the React application with Vite
2. Uploads the build artifacts from `./app/dist`
3. Deploys to GitHub Pages at [https://remover2513.github.io/fixedincome/](https://remover2513.github.io/fixedincome/)

To build manually:
```bash
cd app
npm run build
# The built files will be in app/dist/
```

---

## 🎓 Educational Use

Perfect for:
- Fixed income courses
- Quantitative finance programs
- Self-study of bond mathematics
- Understanding yield curve construction
- MBA and graduate-level finance education

---

## 📄 License

MIT License - Free for educational use
