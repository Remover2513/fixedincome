import React from 'react';
import Plot from 'react-plotly.js';
import type { Bond, SpotRate, YTMResult } from '../types';
import './ChartPanel.css';

interface ChartPanelProps {
  bonds: Bond[];
  ytmResults: YTMResult[];
  spotRates: SpotRate[];
  forwardRates: SpotRate[];
  showYTM: boolean;
  showSpot: boolean;
  showForward: boolean;
  onToggleYTM: () => void;
  onToggleSpot: () => void;
  onToggleForward: () => void;
}

export const ChartPanel: React.FC<ChartPanelProps> = ({
  bonds,
  ytmResults,
  spotRates,
  forwardRates,
  showYTM,
  showSpot,
  showForward,
  onToggleYTM,
  onToggleSpot,
  onToggleForward
}) => {
  // Prepare YTM curve data
  const ytmData = ytmResults.map(result => {
    const bond = bonds.find(b => b.id === result.bondId);
    return {
      maturity: bond?.maturity || 0,
      ytm: result.ytm * 100 // Convert to percentage
    };
  }).sort((a, b) => a.maturity - b.maturity);

  // Prepare spot rate data
  const spotData = spotRates.map(sr => ({
    maturity: sr.time,
    rate: sr.rate * 100 // Convert to percentage
  }));

  // Prepare forward rate data
  const forwardData = forwardRates.map(fr => ({
    maturity: fr.time,
    rate: fr.rate * 100 // Convert to percentage
  }));

  const traces: Plotly.Data[] = [];

  if (showYTM && ytmData.length > 0) {
    traces.push({
      x: ytmData.map(d => d.maturity),
      y: ytmData.map(d => d.ytm),
      type: 'scatter',
      mode: 'lines+markers',
      name: 'YTM Curve',
      line: { color: '#007bff', width: 2 },
      marker: { size: 8 },
      hovertemplate: 'Maturity: %{x:.2f}y<br>YTM: %{y:.3f}%<extra></extra>'
    } as Plotly.Data);
  }

  if (showSpot && spotData.length > 0) {
    traces.push({
      x: spotData.map(d => d.maturity),
      y: spotData.map(d => d.rate),
      type: 'scatter',
      mode: 'lines+markers',
      name: 'Spot/Zero Curve',
      line: { color: '#28a745', width: 2 },
      marker: { size: 8 },
      hovertemplate: 'Maturity: %{x:.2f}y<br>Spot Rate: %{y:.3f}%<extra></extra>'
    } as Plotly.Data);
  }

  if (showForward && forwardData.length > 0) {
    traces.push({
      x: forwardData.map(d => d.maturity),
      y: forwardData.map(d => d.rate),
      type: 'scatter',
      mode: 'lines+markers',
      name: 'Forward Curve',
      line: { color: '#fd7e14', width: 2, dash: 'dash' },
      marker: { size: 8 },
      hovertemplate: 'Maturity: %{x:.2f}y<br>Forward Rate: %{y:.3f}%<extra></extra>'
    } as Plotly.Data);
  }

  return (
    <div className="chart-panel">
      <div className="chart-header">
        <h2>Yield Curves</h2>
        <div className="chart-toggles">
          <label>
            <input
              type="checkbox"
              checked={showYTM}
              onChange={onToggleYTM}
            />
            YTM Curve
          </label>
          <label>
            <input
              type="checkbox"
              checked={showSpot}
              onChange={onToggleSpot}
            />
            Spot/Zero Curve
          </label>
          <label>
            <input
              type="checkbox"
              checked={showForward}
              onChange={onToggleForward}
            />
            Forward Curve
          </label>
        </div>
      </div>

      <Plot
        data={traces}
        layout={{
          autosize: true,
          margin: { l: 60, r: 40, t: 40, b: 60 },
          xaxis: {
            title: { text: 'Maturity (years)' },
            gridcolor: '#e0e0e0'
          },
          yaxis: {
            title: { text: 'Yield (%)' },
            gridcolor: '#e0e0e0'
          },
          hovermode: 'closest',
          showlegend: true,
          legend: {
            x: 0.02,
            y: 0.98,
            bgcolor: 'rgba(255,255,255,0.8)',
            bordercolor: '#ccc',
            borderwidth: 1
          },
          paper_bgcolor: 'white',
          plot_bgcolor: 'white'
        }}
        config={{
          responsive: true,
          displayModeBar: true,
          displaylogo: false
        }}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};
