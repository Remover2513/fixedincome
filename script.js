// Bond Pricing Calculator
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
    
    // Generate timeline visualization
    generateTimeline(faceValue, couponPayment, years, frequency, periods);
}

/**
 * Generates an interactive timeline visualization showing coupon payments and compounding periods
 * @param {number} faceValue - The face value of the bond
 * @param {number} couponPayment - The coupon payment amount per period
 * @param {number} years - Years to maturity
 * @param {number} frequency - Payment frequency (1=Annual, 2=Semi-Annual, 4=Quarterly)
 * @param {number} periods - Total number of payment periods
 */
function generateTimeline(faceValue, couponPayment, years, frequency, periods) {
    const container = document.getElementById('timeline-visualization');
    container.innerHTML = '';
    
    // Create timeline track
    const track = document.createElement('div');
    track.className = 'timeline-track';
    container.appendChild(track);
    
    // Get frequency description
    const frequencyText = {
        1: 'Annual',
        2: 'Semi-Annual',
        4: 'Quarterly'
    };
    
    const periodsPerYear = frequency;
    const monthsPerPeriod = 12 / frequency;
    
    // Add compounding period indicators
    for (let i = 0; i < periods; i++) {
        const startPercent = (i / periods) * 100;
        const endPercent = ((i + 1) / periods) * 100;
        const width = endPercent - startPercent;
        
        const compoundingIndicator = document.createElement('div');
        compoundingIndicator.className = 'timeline-compounding-indicator';
        compoundingIndicator.style.left = `${startPercent}%`;
        compoundingIndicator.style.width = `${width}%`;
        compoundingIndicator.title = `Compounding Period ${i + 1}`;
        track.appendChild(compoundingIndicator);
    }
    
    // Add coupon payment events
    for (let i = 1; i <= periods; i++) {
        const position = (i / periods) * 100;
        const timeInYears = i / frequency;
        
        const event = document.createElement('div');
        event.className = 'timeline-event';
        event.style.left = `${position}%`;
        
        const marker = document.createElement('div');
        marker.className = 'timeline-marker coupon';
        
        const label = document.createElement('div');
        label.className = 'timeline-label';
        label.textContent = `${timeInYears.toFixed(2)}Y`;
        
        const amount = document.createElement('div');
        amount.className = 'timeline-amount';
        amount.textContent = `$${couponPayment.toFixed(2)}`;
        
        event.appendChild(marker);
        event.appendChild(label);
        event.appendChild(amount);
        
        event.title = `Period ${i}: Coupon payment of $${couponPayment.toFixed(2)} at year ${timeInYears.toFixed(2)}`;
        
        container.appendChild(event);
    }
    
    // Add principal repayment at maturity (position at last period to avoid overflow)
    const maturityEvent = document.createElement('div');
    maturityEvent.className = 'timeline-event';
    maturityEvent.style.left = `${(periods / periods) * 100}%`;
    
    const principalMarker = document.createElement('div');
    principalMarker.className = 'timeline-marker principal';
    
    const principalLabel = document.createElement('div');
    principalLabel.className = 'timeline-label';
    principalLabel.textContent = `${years}Y`;
    
    const principalAmount = document.createElement('div');
    principalAmount.className = 'timeline-amount';
    principalAmount.textContent = `$${faceValue.toFixed(2)}`;
    
    maturityEvent.appendChild(principalMarker);
    maturityEvent.appendChild(principalLabel);
    maturityEvent.appendChild(principalAmount);
    maturityEvent.title = `Maturity: Principal repayment of $${faceValue.toFixed(2)}`;
    
    container.appendChild(maturityEvent);
    
    // Update timeline details
    const detailsContainer = document.getElementById('timeline-details');
    detailsContainer.innerHTML = `
        <h4>Payment Schedule Summary</h4>
        <div class="timeline-details-grid">
            <div class="timeline-detail-item">
                <div class="timeline-detail-label">Payment Frequency</div>
                <div class="timeline-detail-value">${frequencyText[frequency]}</div>
            </div>
            <div class="timeline-detail-item">
                <div class="timeline-detail-label">Total Payments</div>
                <div class="timeline-detail-value">${periods} payments</div>
            </div>
            <div class="timeline-detail-item">
                <div class="timeline-detail-label">Coupon per Payment</div>
                <div class="timeline-detail-value">$${couponPayment.toFixed(2)}</div>
            </div>
            <div class="timeline-detail-item">
                <div class="timeline-detail-label">Total Coupons</div>
                <div class="timeline-detail-value">$${(couponPayment * periods).toFixed(2)}</div>
            </div>
            <div class="timeline-detail-item">
                <div class="timeline-detail-label">Payment Periods</div>
                <div class="timeline-detail-value">${periods} periods (${monthsPerPeriod} months each)</div>
            </div>
            <div class="timeline-detail-item">
                <div class="timeline-detail-label">Final Principal</div>
                <div class="timeline-detail-value">$${faceValue.toFixed(2)}</div>
            </div>
        </div>
    `;
}

// Initialize bond calculator on page load
window.addEventListener('load', () => {
    calculateBondPrice();
});

// Yield Curve Visualization
let yieldCurveChart = null;

function setYieldCurve(curveType) {
    const maturities = [0.25, 0.5, 1, 2, 3, 5, 7, 10, 20, 30];
    let yields = [];
    
    switch(curveType) {
        case 'normal':
            yields = [2.0, 2.2, 2.5, 2.8, 3.1, 3.5, 3.8, 4.0, 4.3, 4.5];
            break;
        case 'inverted':
            yields = [5.0, 4.8, 4.5, 4.2, 3.9, 3.5, 3.2, 3.0, 2.7, 2.5];
            break;
        case 'flat':
            yields = [3.5, 3.5, 3.5, 3.5, 3.5, 3.5, 3.5, 3.5, 3.5, 3.5];
            break;
        case 'humped':
            yields = [2.5, 2.8, 3.2, 3.8, 4.2, 4.5, 4.3, 4.0, 3.7, 3.5];
            break;
    }
    
    const ctx = document.getElementById('yieldCurveChart').getContext('2d');
    
    if (yieldCurveChart) {
        yieldCurveChart.destroy();
    }
    
    yieldCurveChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: maturities.map(m => m >= 1 ? `${m}Y` : `${m*12}M`),
            datasets: [{
                label: 'Yield (%)',
                data: yields,
                borderColor: '#003f87',
                backgroundColor: 'rgba(0, 63, 135, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: `${curveType.charAt(0).toUpperCase() + curveType.slice(1)} Yield Curve`,
                    font: { size: 16 }
                },
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Yield (%)'
                    },
                    ticks: {
                        callback: function(value) {
                            return value.toFixed(1) + '%';
                        }
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Time to Maturity'
                    }
                }
            }
        }
    });
}

// Initialize yield curve on page load
window.addEventListener('load', () => {
    setYieldCurve('normal');
});

// Duration Calculator
let durationChart = null;

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
    const priceChange = -modifiedDuration * 1; // 1% change
    
    // Display results
    document.getElementById('macaulay-duration').textContent = macaulayDuration.toFixed(2);
    document.getElementById('modified-duration').textContent = modifiedDuration.toFixed(2);
    document.getElementById('price-change-estimate').textContent = priceChange.toFixed(2);
    
    // Create price-yield chart
    visualizeDuration(faceValue, couponRate, years, yieldRate, modifiedDuration);
}

function visualizeDuration(faceValue, couponRate, years, currentYield, modifiedDuration) {
    const yields = [];
    const prices = [];
    const durationEstimates = [];
    
    const currentPrice = calculateBondPriceForYield(faceValue, couponRate, years, currentYield);
    
    for (let y = Math.max(0.5, currentYield - 5); y <= currentYield + 5; y += 0.25) {
        yields.push(y);
        prices.push(calculateBondPriceForYield(faceValue, couponRate, years, y / 100));
        
        // Duration approximation
        const yieldChange = (y - currentYield * 100) / 100;
        const estimatedPrice = currentPrice * (1 - modifiedDuration * yieldChange);
        durationEstimates.push(estimatedPrice);
    }
    
    const ctx = document.getElementById('durationChart').getContext('2d');
    
    if (durationChart) {
        durationChart.destroy();
    }
    
    durationChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: yields.map(y => y.toFixed(2) + '%'),
            datasets: [
                {
                    label: 'Actual Price',
                    data: prices,
                    borderColor: '#003f87',
                    backgroundColor: 'rgba(0, 63, 135, 0.1)',
                    tension: 0.4,
                    pointRadius: 2
                },
                {
                    label: 'Duration Estimate',
                    data: durationEstimates,
                    borderColor: '#990000',
                    borderDash: [5, 5],
                    backgroundColor: 'transparent',
                    tension: 0,
                    pointRadius: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Price-Yield Relationship (Convexity)',
                    font: { size: 16 }
                },
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    title: {
                        display: true,
                        text: 'Bond Price ($)'
                    },
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toFixed(0);
                        }
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Yield to Maturity (%)'
                    }
                }
            }
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

// Initialize duration calculator on page load
window.addEventListener('load', () => {
    calculateDuration();
});

// Interest Rate Risk
let riskChart = null;

// Define bond types for comparison
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
    
    const chartData = {
        labels: bondTypes.map(b => b.name),
        datasets: [
            {
                label: 'Original Price',
                data: [],
                backgroundColor: 'rgba(0, 63, 135, 0.7)'
            },
            {
                label: 'New Price',
                data: [],
                backgroundColor: 'rgba(153, 0, 0, 0.7)'
            }
        ]
    };
    
    bondTypes.forEach(bond => {
        const originalPrice = calculateBondPriceForYield(faceValue, bond.couponRate, bond.years, bond.baseYield);
        const newYield = bond.baseYield + rateChange;
        const newPrice = calculateBondPriceForYield(faceValue, bond.couponRate, bond.years, newYield);
        const priceChange = newPrice - originalPrice;
        const percentChange = (priceChange / originalPrice) * 100;
        
        chartData.datasets[0].data.push(originalPrice.toFixed(2));
        chartData.datasets[1].data.push(newPrice.toFixed(2));
        
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${bond.name}</td>
            <td>$${originalPrice.toFixed(2)}</td>
            <td>$${newPrice.toFixed(2)}</td>
            <td style="color: ${priceChange >= 0 ? 'green' : 'red'}">$${priceChange.toFixed(2)}</td>
            <td style="color: ${percentChange >= 0 ? 'green' : 'red'}">${percentChange.toFixed(2)}%</td>
        `;
    });
    
    updateRiskChart(chartData);
}

function updateRiskChart(data) {
    const ctx = document.getElementById('riskChart').getContext('2d');
    
    if (riskChart) {
        riskChart.destroy();
    }
    
    riskChart = new Chart(ctx, {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Bond Price Comparison: Impact of Interest Rate Changes',
                    font: { size: 16 }
                },
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Bond Price ($)'
                    },
                    ticks: {
                        callback: function(value) {
                            return '$' + value;
                        }
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Bond Type'
                    }
                }
            }
        }
    });
}

// Event listener for rate change slider
document.addEventListener('DOMContentLoaded', () => {
    const riskSlider = document.getElementById('risk-rate-change');
    if (riskSlider) {
        riskSlider.addEventListener('input', updateInterestRateRisk);
        updateInterestRateRisk();
    }
});

// Smooth scrolling for navigation
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
