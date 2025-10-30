import React, { useState, useEffect } from 'react';
import { COLORS } from '../constants';

interface ColorPickerProps {
    selectedColor: string;
    onChange: (color: string) => void;
}

const isHexColor = (color: string) => /^#[0-9A-F]{6}$/i.test(color);

const ColorPicker: React.FC<ColorPickerProps> = ({ selectedColor, onChange }) => {
    const [customColor, setCustomColor] = useState('');

    useEffect(() => {
        if (isHexColor(selectedColor)) {
            setCustomColor(selectedColor);
        } else {
            setCustomColor('');
        }
    }, [selectedColor]);
    
    const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setCustomColor(value);
        if (isHexColor(value)) {
            onChange(value);
        }
    }

    return (
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
                Colore Cliente
            </label>
            <div className="grid grid-cols-8 gap-2 mb-2">
                {COLORS.map(colorName => (
                    <button
                        key={colorName}
                        type="button"
                        onClick={() => onChange(colorName)}
                        className={`w-full h-8 rounded-md bg-${colorName}-500 transition-transform duration-150 ${selectedColor === colorName ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : 'hover:scale-110'}`}
                        aria-label={`Select ${colorName} color`}
                    />
                ))}
            </div>
            <div>
                 <label htmlFor="custom-color" className="block text-xs font-medium text-slate-500 mb-1">
                    O inserisci un codice esadecimale
                </label>
                <div className="relative">
                    <div 
                        className="w-8 h-8 absolute left-1 top-1/2 -translate-y-1/2 rounded-md border border-slate-300"
                        style={{ backgroundColor: isHexColor(customColor) ? customColor : '#ffffff' }}
                    ></div>
                    <input
                        id="custom-color"
                        type="text"
                        value={customColor}
                        onChange={handleCustomColorChange}
                        className="w-full pl-11 pr-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="#RRGGBB"
                        maxLength={7}
                    />
                </div>
            </div>
        </div>
    );
};

export default ColorPicker;