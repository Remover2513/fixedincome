import React from 'react';
import type { Bond } from '../types';
import './BondInputPanel.css';

interface BondInputPanelProps {
  bonds: Bond[];
  onBondsChange: (bonds: Bond[]) => void;
  onBondSelect: (bondId: string | null) => void;
  selectedBondId: string | null;
  onLoadExample: (type: 'triangular' | 'overdetermined') => void;
  onAddNoise: () => void;
}

export const BondInputPanel: React.FC<BondInputPanelProps> = ({
  bonds,
  onBondsChange,
  onBondSelect,
  selectedBondId,
  onLoadExample,
  onAddNoise
}) => {
  const handleBondChange = (id: string, field: keyof Bond, value: string | number) => {
    const newBonds = bonds.map(bond => {
      if (bond.id === id) {
        return { ...bond, [field]: typeof value === 'string' ? parseFloat(value) : value };
      }
      return bond;
    });
    onBondsChange(newBonds);
  };

  const handleAddBond = () => {
    const newId = (Math.max(...bonds.map(b => parseInt(b.id)), 0) + 1).toString();
    const newBond: Bond = {
      id: newId,
      maturity: 1.0,
      couponRate: 0.05,
      frequency: 2,
      price: 100,
      faceValue: 100
    };
    onBondsChange([...bonds, newBond]);
  };

  const handleRemoveBond = (id: string) => {
    if (bonds.length > 1) {
      onBondsChange(bonds.filter(b => b.id !== id));
      if (selectedBondId === id) {
        onBondSelect(null);
      }
    }
  };

  return (
    <div className="bond-input-panel">
      <h2>Bond Inputs</h2>
      
      <div className="button-group">
        <button onClick={() => onLoadExample('triangular')} className="btn-primary">
          Load Triangular Example
        </button>
        <button onClick={() => onLoadExample('overdetermined')} className="btn-primary">
          Load Overdetermined Example
        </button>
        <button onClick={onAddNoise} className="btn-secondary">
          Add Noise
        </button>
      </div>

      <div className="bond-table-container">
        <table className="bond-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Maturity (yr)</th>
              <th>Coupon Rate (%)</th>
              <th>Frequency</th>
              <th>Price</th>
              <th>Face Value</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bonds.map(bond => (
              <tr
                key={bond.id}
                className={selectedBondId === bond.id ? 'selected' : ''}
                onClick={() => onBondSelect(bond.id)}
              >
                <td>{bond.id}</td>
                <td>
                  <input
                    type="number"
                    step="0.25"
                    min="0.25"
                    value={bond.maturity}
                    onChange={(e) => handleBondChange(bond.id, 'maturity', e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    value={(bond.couponRate * 100).toFixed(3)}
                    onChange={(e) => handleBondChange(bond.id, 'couponRate', parseFloat(e.target.value) / 100)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>
                <td>
                  <select
                    value={bond.frequency}
                    onChange={(e) => handleBondChange(bond.id, 'frequency', parseInt(e.target.value))}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="1">Annual</option>
                    <option value="2">Semi-annual</option>
                    <option value="4">Quarterly</option>
                  </select>
                </td>
                <td>
                  <input
                    type="number"
                    step="0.01"
                    value={bond.price.toFixed(2)}
                    onChange={(e) => handleBondChange(bond.id, 'price', e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    step="1"
                    value={bond.faceValue}
                    onChange={(e) => handleBondChange(bond.id, 'faceValue', e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>
                <td>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveBond(bond.id);
                    }}
                    className="btn-danger"
                    disabled={bonds.length <= 1}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button onClick={handleAddBond} className="btn-add">
        + Add Bond
      </button>
    </div>
  );
};
