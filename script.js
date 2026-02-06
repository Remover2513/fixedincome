// ===================================
// Bond Pricing Calculator
// ===================================
function calculateBondPrice() {
    const faceValue = parseFloat(document.getElementById('face-value').value);
    const couponRate = parseFloat(document.getElementById('coupon-rate').value) / 100;
    const yieldRate = parseFloat(document.getElementById('yield-rate').value) / 100;
    const years = parseFloat(document.getElementById('years').value);
    const frequency = parseFloat(document.getElementById('frequency').value);
    
    const periods = years * frequency;
    const couponPayment = (faceValue * couponRate) / frequency;
    const yieldPerPeriod = yieldRate / frequency;
    
    // Calculate present value of coupon payments
    let pvCoupons = 0;
    for (let i = 1; i <= periods; i++) {
        pvCoupons += couponPayment / Math.pow(1 + yieldPerPeriod, i);
    }
    
    // Calculate present value of face value
    const pvFaceValue = faceValue / Math.pow(1 + yieldPerPeriod, periods);
    
    // Total bond price
    const bondPrice = pvCoupons + pvFaceValue;
    
    // Calculate premium/discount
    const premiumDiscount = bondPrice - faceValue;
    const premiumDiscountPercent = (premiumDiscount / faceValue) * 100;
    
    // Calculate current yield
    const annualCoupon = faceValue * couponRate;
    const currentYield = (annualCoupon / bondPrice) * 100;
    
    // Display results
    document.getElementById('bond-price').textContent = `$${bondPrice.toFixed(2)}`;
    
    let pdText = '';
    if (premiumDiscount > 0) {
        pdText = `Premium of $${Math.abs(premiumDiscount).toFixed(2)} (${premiumDiscountPercent.toFixed(2)}%)`;
    } else if (premiumDiscount < 0) {
        pdText = `Discount of $${Math.abs(premiumDiscount).toFixed(2)} (${Math.abs(premiumDiscountPercent).toFixed(2)}%)`;
    } else {
        pdText = 'At Par';
    }
    document.getElementById('premium-discount').textContent = pdText;
    document.getElementById('current-yield').textContent = `${currentYield.toFixed(2)}%`;
}

// ===================================
// Yield Curve Visualization (SVG)
// ===================================
let currentCurveType = 'normal';
let currentYields = [];
let currentMaturities = [0.25, 0.5, 1, 2, 3, 5, 7, 10, 20, 30];
let editingEnabled = false;
let compareMode = false;
let savedCurves = [];

const curvePresets = {
    normal: [2.0, 2.2, 2.5, 2.8, 3.1, 3.5, 3.8, 4.0, 4.3, 4.5],
    inverted: [5.0, 4.8, 4.5, 4.2, 3.9, 3.5, 3.2, 3.0, 2.7, 2.5],
    flat: [3.5, 3.5, 3.5, 3.5, 3.5, 3.5, 3.5, 3.5, 3.5, 3.5],
    humped: [2.5, 2.8, 3.2, 3.8, 4.2, 4.5, 4.3, 4.0, 3.7, 3.5],
    custom: [3.0, 3.2, 3.4, 3.6, 3.8, 4.0, 4.2, 4.4, 4.6, 4.8]
};

function setYieldCurve(curveType) {
    currentCurveType = curveType;
    currentYields = [...curvePresets[curveType]];
    
    // Update button states
    document.querySelectorAll('.curve-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(`btn-${curveType}`).classList.add('active');
    
    updateYieldCurve();
}

function toggleEditing() {
    editingEnabled = document.getElementById('enableEditing').checked;
    updateYieldCurve();
}

function compareModeToggle() {
    compareMode = !compareMode;
    const wrapper = document.getElementById('yield-chart-wrapper');
    
    if (compareMode) {
        // Save current curve
        savedCurves.push({
            type: currentCurveType,
            yields: [...currentYields],
            color: getRandomColor()
        });
        document.getElementById('btn-compare').textContent = 'Exit Compare Mode';
        wrapper.classList.add('compare-mode');
    } else {
        savedCurves = [];
        document.getElementById('btn-compare').textContent = 'Compare Curves';
        wrapper.classList.remove('compare-mode');
    }
    
    updateYieldCurve();
}

function getRandomColor() {
    const colors = ['#003f87', '#990000', '#28a745', '#ffc107', '#6f42c1', '#20c997'];
    return colors[savedCurves.length % colors.length];
}

function updateYieldCurve() {
    const svg = document.getElementById('yieldCurveChart');
    const showGrid = document.getElementById('showGrid').checked;
    const showValues = document.getElementById('showValues').checked;
    
    // Clear SVG
    svg.innerHTML = '';
    
    // SVG dimensions and margins
    const width = 800;
    const height = 400;
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    
    // Scales
    const maxMaturity = Math.max(...currentMaturities);
    const minYield = Math.min(...currentYields, ...(savedCurves.flatMap(c => c.yields) || [])) - 0.5;
    const maxYield = Math.max(...currentYields, ...(savedCurves.flatMap(c => c.yields) || [])) + 0.5;
    
    const xScale = (maturity) => margin.left + (maturity / maxMaturity) * chartWidth;
    const yScale = (yield_val) => margin.top + chartHeight - ((yield_val - minYield) / (maxYield - minYield)) * chartHeight;
    
    // Draw grid lines if enabled
    if (showGrid) {
        // Horizontal grid lines
        for (let y = Math.ceil(minYield); y <= Math.floor(maxYield); y += 0.5) {
            const yPos = yScale(y);
            svg.innerHTML += `<line class="grid-line" x1="${margin.left}" y1="${yPos}" x2="${width - margin.right}" y2="${yPos}"/>`;
        }
        
        // Vertical grid lines
        currentMaturities.forEach(maturity => {
            const xPos = xScale(maturity);
            svg.innerHTML += `<line class="grid-line" x1="${xPos}" y1="${margin.top}" x2="${xPos}" y2="${height - margin.bottom}"/>`;
        });
    }
    
    // Draw axes
    svg.innerHTML += `<line class="axis-line" x1="${margin.left}" y1="${height - margin.bottom}" x2="${width - margin.right}" y2="${height - margin.bottom}"/>`;
    svg.innerHTML += `<line class="axis-line" x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${height - margin.bottom}"/>`;
    
    // X-axis labels
    currentMaturities.forEach(maturity => {
        const xPos = xScale(maturity);
        const label = maturity >= 1 ? `${maturity}Y` : `${maturity * 12}M`;
        svg.innerHTML += `<text class="axis-text" x="${xPos}" y="${height - margin.bottom + 20}" text-anchor="middle">${label}</text>`;
    });
    
    // Y-axis labels
    for (let y = Math.ceil(minYield); y <= Math.floor(maxYield); y += 1) {
        const yPos = yScale(y);
        svg.innerHTML += `<text class="axis-text" x="${margin.left - 10}" y="${yPos + 5}" text-anchor="end">${y.toFixed(1)}%</text>`;
    }
    
    // Axis titles
    svg.innerHTML += `<text class="axis-text" x="${width / 2}" y="${height - 10}" text-anchor="middle" font-weight="bold">Time to Maturity</text>`;
    svg.innerHTML += `<text class="axis-text" x="${-height / 2}" y="20" text-anchor="middle" font-weight="bold" transform="rotate(-90 20 ${height / 2})">Yield (%)</text>`;
    
    // Title
    svg.innerHTML += `<text x="${width / 2}" y="25" text-anchor="middle" font-size="16" font-weight="bold" fill="#003f87">${currentCurveType.charAt(0).toUpperCase() + currentCurveType.slice(1)} Yield Curve</text>`;
    
    // Draw saved curves in compare mode
    if (compareMode && savedCurves.length > 0) {
        savedCurves.forEach(curve => {
            drawCurve(svg, curve.yields, curve.color, xScale, yScale, curve.type, false);
        });
    }
    
    // Draw current curve
    drawCurve(svg, currentYields, '#003f87', xScale, yScale, currentCurveType, true);
    
    // Update statistics
    updateYieldStatistics();
}

function drawCurve(svg, yields, color, xScale, yScale, label, interactive) {
    // Create path for line
    let pathData = '';
    currentMaturities.forEach((maturity, i) => {
        const x = xScale(maturity);
        const y = yScale(yields[i]);
        pathData += (i === 0 ? 'M' : 'L') + `${x},${y} `;
    });
    
    // Create path for area
    let areaData = pathData;
    const lastX = xScale(currentMaturities[currentMaturities.length - 1]);
    const firstX = xScale(currentMaturities[0]);
    const bottomY = yScale(Math.min(...yields) - 1);
    areaData += `L${lastX},${bottomY} L${firstX},${bottomY} Z`;
    
    // Draw area
    svg.innerHTML += `<path class="curve-area" d="${areaData}" fill="${color}"/>`;
    
    // Draw line
    svg.innerHTML += `<path class="curve-line" d="${pathData}" stroke="${color}"/>`;
    
    // Draw points
    currentMaturities.forEach((maturity, i) => {
        const x = xScale(maturity);
        const y = yScale(yields[i]);
        const editable = interactive && editingEnabled ? 'editable' : '';
        const onclick = interactive && editingEnabled ? `onclick="editYieldPoint(${i})"` : '';
        
        svg.innerHTML += `
            <circle class="yield-point ${editable}" 
                    cx="${x}" cy="${y}" r="6" 
                    fill="${color}" 
                    stroke="white" 
                    stroke-width="2"
                    ${onclick}
                    onmouseover="showTooltip(event, '${maturity >= 1 ? maturity + 'Y' : (maturity * 12) + 'M'}', ${yields[i].toFixed(2)})"
                    onmouseout="hideTooltip()"/>
        `;
        
        // Show values if enabled
        if (interactive && document.getElementById('showValues').checked) {
            svg.innerHTML += `<text x="${x}" y="${y - 15}" text-anchor="middle" font-size="11" fill="${color}" font-weight="bold">${yields[i].toFixed(2)}%</text>`;
        }
    });
}

function editYieldPoint(index) {
    if (!editingEnabled) return;
    
    const maturity = currentMaturities[index];
    const currentYield = currentYields[index];
    const label = maturity >= 1 ? `${maturity}Y` : `${maturity * 12}M`;
    
    const newYield = prompt(`Enter new yield for ${label} maturity (current: ${currentYield.toFixed(2)}%):`, currentYield.toFixed(2));
    
    if (newYield !== null && !isNaN(parseFloat(newYield))) {
        currentYields[index] = parseFloat(newYield);
        currentCurveType = 'custom';
        updateYieldCurve();
    }
}

function showTooltip(event, maturity, yield_val) {
    const tooltip = document.getElementById('yield-tooltip');
    tooltip.innerHTML = `<strong>${maturity}</strong><br/>Yield: ${yield_val}%`;
    tooltip.style.left = (event.pageX + 10) + 'px';
    tooltip.style.top = (event.pageY - 30) + 'px';
    tooltip.classList.add('show');
}

function hideTooltip() {
    const tooltip = document.getElementById('yield-tooltip');
    tooltip.classList.remove('show');
}

function updateYieldStatistics() {
    // Curve type
    document.getElementById('curve-type').textContent = currentCurveType.charAt(0).toUpperCase() + currentCurveType.slice(1);
    
    // Find 2Y and 10Y indices
    const index2Y = currentMaturities.indexOf(2);
    const index10Y = currentMaturities.indexOf(10);
    
    if (index2Y !== -1 && index10Y !== -1) {
        const spread = currentYields[index10Y] - currentYields[index2Y];
        document.getElementById('spread-2-10').textContent = spread.toFixed(2) + '%';
        
        // Determine steepness
        let steepness = 'Flat';
        if (spread > 1.0) steepness = 'Steep';
        else if (spread > 0.3) steepness = 'Normal';
        else if (spread < -0.3) steepness = 'Inverted';
        document.getElementById('steepness').textContent = steepness;
    }
    
    // Average yield
    const avgYield = currentYields.reduce((a, b) => a + b, 0) / currentYields.length;
    document.getElementById('avg-yield').textContent = avgYield.toFixed(2) + '%';
}

// ===================================
// Duration Calculator
// ===================================
function calculateDuration() {
    const faceValue = parseFloat(document.getElementById('dur-face-value').value);
    const couponRate = parseFloat(document.getElementById('dur-coupon-rate').value) / 100;
    const yieldRate = parseFloat(document.getElementById('dur-yield-rate').value) / 100;
    const years = parseFloat(document.getElementById('dur-years').value);
    const frequency = 2; // Semi-annual
    
    const periods = years * frequency;
    const couponPayment = (faceValue * couponRate) / frequency;
    const yieldPerPeriod = yieldRate / frequency;
    
    // Calculate bond price and weighted cash flows
    let bondPrice = 0;
    let weightedCashFlows = 0;
    
    for (let i = 1; i <= periods; i++) {
        const pv = couponPayment / Math.pow(1 + yieldPerPeriod, i);
        bondPrice += pv;
        weightedCashFlows += (i / frequency) * pv;
    }
    
    const pvFaceValue = faceValue / Math.pow(1 + yieldPerPeriod, periods);
    bondPrice += pvFaceValue;
    weightedCashFlows += years * pvFaceValue;
    
    // Macaulay Duration
    const macaulayDuration = weightedCashFlows / bondPrice;
    
    // Modified Duration
    const modifiedDuration = macaulayDuration / (1 + yieldPerPeriod);
    
    // Estimated price change for 1% rate increase
    const priceChange = -modifiedDuration * 1;
    
    // Display results
    document.getElementById('macaulay-duration').textContent = macaulayDuration.toFixed(2);
    document.getElementById('modified-duration').textContent = modifiedDuration.toFixed(2);
    document.getElementById('price-change-estimate').textContent = priceChange.toFixed(2);
    
    // Create price-yield chart
    visualizeDuration(faceValue, couponRate, years, yieldRate, modifiedDuration);
}

function visualizeDuration(faceValue, couponRate, years, currentYield, modifiedDuration) {
    const svg = document.getElementById('durationChart');
    svg.innerHTML = '';
    
    const width = 800;
    const height = 400;
    const margin = { top: 40, right: 40, bottom: 60, left: 80 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    
    // Calculate prices for different yields
    const yields = [];
    const actualPrices = [];
    const estimatedPrices = [];
    
    const currentPrice = calculateBondPriceForYield(faceValue, couponRate, years, currentYield);
    
    for (let y = Math.max(0.5, currentYield - 0.05); y <= currentYield + 0.05; y += 0.0025) {
        yields.push(y * 100);
        actualPrices.push(calculateBondPriceForYield(faceValue, couponRate, years, y));
        
        const yieldChange = y - currentYield;
        const estimatedPrice = currentPrice * (1 - modifiedDuration * yieldChange);
        estimatedPrices.push(estimatedPrice);
    }
    
    // Scales
    const minPrice = Math.min(...actualPrices, ...estimatedPrices) * 0.98;
    const maxPrice = Math.max(...actualPrices, ...estimatedPrices) * 1.02;
    
    const xScale = (yieldVal) => {
        const minY = Math.min(...yields);
        const maxY = Math.max(...yields);
        return margin.left + ((yieldVal - minY) / (maxY - minY)) * chartWidth;
    };
    
    const yScale = (price) => margin.top + chartHeight - ((price - minPrice) / (maxPrice - minPrice)) * chartHeight;
    
    // Draw grid
    for (let p = Math.ceil(minPrice / 50) * 50; p <= maxPrice; p += 50) {
        const yPos = yScale(p);
        svg.innerHTML += `<line class="grid-line" x1="${margin.left}" y1="${yPos}" x2="${width - margin.right}" y2="${yPos}"/>`;
    }
    
    // Draw axes
    svg.innerHTML += `<line class="axis-line" x1="${margin.left}" y1="${height - margin.bottom}" x2="${width - margin.right}" y2="${height - margin.bottom}"/>`;
    svg.innerHTML += `<line class="axis-line" x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${height - margin.bottom}"/>`;
    
    // Labels
    svg.innerHTML += `<text x="${width / 2}" y="${height - 10}" text-anchor="middle" font-weight="bold" class="axis-text">Yield to Maturity (%)</text>`;
    svg.innerHTML += `<text x="${-height / 2}" y="25" text-anchor="middle" font-weight="bold" class="axis-text" transform="rotate(-90 25 ${height / 2})">Bond Price ($)</text>`;
    svg.innerHTML += `<text x="${width / 2}" y="25" text-anchor="middle" font-size="16" font-weight="bold" fill="#003f87">Price-Yield Relationship (Convexity)</text>`;
    
    // Draw curves
    let actualPath = '';
    let estimatedPath = '';
    
    yields.forEach((y, i) => {
        const x = xScale(y);
        const yActual = yScale(actualPrices[i]);
        const yEst = yScale(estimatedPrices[i]);
        
        actualPath += (i === 0 ? 'M' : 'L') + `${x},${yActual} `;
        estimatedPath += (i === 0 ? 'M' : 'L') + `${x},${yEst} `;
    });
    
    svg.innerHTML += `<path class="curve-line" d="${actualPath}" stroke="#003f87" stroke-width="3"/>`;
    svg.innerHTML += `<path class="curve-line" d="${estimatedPath}" stroke="#990000" stroke-width="2" stroke-dasharray="5,5"/>`;
    
    // Legend
    svg.innerHTML += `<rect x="${width - 180}" y="50" width="20" height="3" fill="#003f87"/>`;
    svg.innerHTML += `<text x="${width - 155}" y="55" class="axis-text" font-size="13">Actual Price</text>`;
    svg.innerHTML += `<line x1="${width - 180}" y1="70" x2="${width - 160}" y2="70" stroke="#990000" stroke-width="2" stroke-dasharray="5,5"/>`;
    svg.innerHTML += `<text x="${width - 155}" y="75" class="axis-text" font-size="13">Duration Estimate</text>`;
    
    // Y-axis labels
    for (let p = Math.ceil(minPrice / 50) * 50; p <= maxPrice; p += 50) {
        const yPos = yScale(p);
        svg.innerHTML += `<text x="${margin.left - 10}" y="${yPos + 5}" text-anchor="end" class="axis-text">$${p.toFixed(0)}</text>`;
    }
    
    // X-axis labels
    const xLabels = [yields[0], yields[Math.floor(yields.length / 2)], yields[yields.length - 1]];
    xLabels.forEach(y => {
        if (y !== undefined) {
            const xPos = xScale(y);
            svg.innerHTML += `<text x="${xPos}" y="${height - margin.bottom + 20}" text-anchor="middle" class="axis-text">${y.toFixed(2)}%</text>`;
        }
    });
}

function calculateBondPriceForYield(faceValue, couponRate, years, yieldRate) {
    const frequency = 2;
    const periods = years * frequency;
    const couponPayment = (faceValue * couponRate) / frequency;
    const yieldPerPeriod = yieldRate / frequency;
    
    let price = 0;
    for (let i = 1; i <= periods; i++) {
        price += couponPayment / Math.pow(1 + yieldPerPeriod, i);
    }
    price += faceValue / Math.pow(1 + yieldPerPeriod, periods);
    
    return price;
}

// ===================================
// Interest Rate Risk
// ===================================
const bondTypes = [
    { name: 'Short-Term (2Y, 5%)', years: 2, couponRate: 0.05, baseYield: 0.05 },
    { name: 'Medium-Term (5Y, 5%)', years: 5, couponRate: 0.05, baseYield: 0.05 },
    { name: 'Long-Term (10Y, 5%)', years: 10, couponRate: 0.05, baseYield: 0.05 },
    { name: 'Long-Term Low Coupon (10Y, 3%)', years: 10, couponRate: 0.03, baseYield: 0.05 }
];

function updateInterestRateRisk() {
    const rateChange = parseFloat(document.getElementById('risk-rate-change').value) / 100;
    document.getElementById('rate-change-value').textContent = (rateChange * 100).toFixed(2) + '%';
    
    const faceValue = 1000;
    const tableBody = document.getElementById('risk-table-body');
    tableBody.innerHTML = '';
    
    const originalPrices = [];
    const newPrices = [];
    
    bondTypes.forEach(bond => {
        const originalPrice = calculateBondPriceForYield(faceValue, bond.couponRate, bond.years, bond.baseYield);
        const newYield = bond.baseYield + rateChange;
        const newPrice = calculateBondPriceForYield(faceValue, bond.couponRate, bond.years, newYield);
        const priceChange = newPrice - originalPrice;
        const percentChange = (priceChange / originalPrice) * 100;
        
        originalPrices.push(originalPrice);
        newPrices.push(newPrice);
        
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${bond.name}</td>
            <td>$${originalPrice.toFixed(2)}</td>
            <td>$${newPrice.toFixed(2)}</td>
            <td style="color: ${priceChange >= 0 ? 'green' : 'red'}">$${priceChange.toFixed(2)}</td>
            <td style="color: ${percentChange >= 0 ? 'green' : 'red'}">${percentChange.toFixed(2)}%</td>
        `;
    });
    
    updateRiskChart(originalPrices, newPrices);
}

function updateRiskChart(originalPrices, newPrices) {
    const svg = document.getElementById('riskChart');
    svg.innerHTML = '';
    
    const width = 800;
    const height = 400;
    const margin = { top: 40, right: 40, bottom: 100, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    
    const maxPrice = Math.max(...originalPrices, ...newPrices) * 1.1;
    const barWidth = chartWidth / (bondTypes.length * 2.5);
    const groupSpacing = chartWidth / bondTypes.length;
    
    // Scales
    const yScale = (price) => margin.top + chartHeight - (price / maxPrice) * chartHeight;
    
    // Draw grid
    for (let p = 0; p <= maxPrice; p += 200) {
        const yPos = yScale(p);
        svg.innerHTML += `<line class="grid-line" x1="${margin.left}" y1="${yPos}" x2="${width - margin.right}" y2="${yPos}"/>`;
    }
    
    // Draw axes
    svg.innerHTML += `<line class="axis-line" x1="${margin.left}" y1="${height - margin.bottom}" x2="${width - margin.right}" y2="${height - margin.bottom}"/>`;
    svg.innerHTML += `<line class="axis-line" x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${height - margin.bottom}"/>`;
    
    // Title
    svg.innerHTML += `<text x="${width / 2}" y="25" text-anchor="middle" font-size="16" font-weight="bold" fill="#003f87">Bond Price Impact: Interest Rate Changes</text>`;
    
    // Y-axis label
    svg.innerHTML += `<text x="${-height / 2}" y="20" text-anchor="middle" font-weight="bold" class="axis-text" transform="rotate(-90 20 ${height / 2})">Bond Price ($)</text>`;
    
    // Draw bars
    bondTypes.forEach((bond, i) => {
        const xGroup = margin.left + i * groupSpacing + groupSpacing / 4;
        
        // Original price bar
        const origHeight = chartHeight * (originalPrices[i] / maxPrice);
        const origY = yScale(originalPrices[i]);
        svg.innerHTML += `
            <rect x="${xGroup}" y="${origY}" width="${barWidth}" height="${origHeight}" 
                  fill="rgba(0, 63, 135, 0.7)" stroke="#003f87" stroke-width="1"
                  onmouseover="showTooltip(event, 'Original', ${originalPrices[i].toFixed(2)})"
                  onmouseout="hideTooltip()"/>
        `;
        
        // New price bar
        const newHeight = chartHeight * (newPrices[i] / maxPrice);
        const newY = yScale(newPrices[i]);
        svg.innerHTML += `
            <rect x="${xGroup + barWidth + 5}" y="${newY}" width="${barWidth}" height="${newHeight}" 
                  fill="rgba(153, 0, 0, 0.7)" stroke="#990000" stroke-width="1"
                  onmouseover="showTooltip(event, 'New', ${newPrices[i].toFixed(2)})"
                  onmouseout="hideTooltip()"/>
        `;
        
        // Bond name label (rotated)
        const labelX = xGroup + barWidth;
        svg.innerHTML += `
            <text x="${labelX}" y="${height - margin.bottom + 15}" 
                  text-anchor="start" class="axis-text" font-size="11"
                  transform="rotate(45 ${labelX} ${height - margin.bottom + 15})">${bond.name}</text>
        `;
    });
    
    // Y-axis labels
    for (let p = 0; p <= maxPrice; p += 200) {
        const yPos = yScale(p);
        svg.innerHTML += `<text x="${margin.left - 10}" y="${yPos + 5}" text-anchor="end" class="axis-text">$${p.toFixed(0)}</text>`;
    }
    
    // Legend
    svg.innerHTML += `<rect x="${width - 180}" y="50" width="20" height="15" fill="rgba(0, 63, 135, 0.7)" stroke="#003f87"/>`;
    svg.innerHTML += `<text x="${width - 155}" y="62" class="axis-text" font-size="13">Original Price</text>`;
    svg.innerHTML += `<rect x="${width - 180}" y="70" width="20" height="15" fill="rgba(153, 0, 0, 0.7)" stroke="#990000"/>`;
    svg.innerHTML += `<text x="${width - 155}" y="82" class="axis-text" font-size="13">New Price</text>`;
}

// ===================================
// Initialization
// ===================================
window.addEventListener('load', () => {
    // Initialize bond calculator
    calculateBondPrice();
    
    // Initialize yield curve
    setYieldCurve('normal');
    
    // Initialize duration calculator
    calculateDuration();
    
    // Initialize interest rate risk
    const riskSlider = document.getElementById('risk-rate-change');
    if (riskSlider) {
        riskSlider.addEventListener('input', updateInterestRateRisk);
        updateInterestRateRisk();
    }
});

// Smooth scrolling for navigation
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});
