
import React, { useState, useEffect } from "react";

export default function SelectOption({ name, col, data, onChange, lastUpdatedTime, difficulty, value, disabled }) {
    const [selected, setSelected] = useState(value || '');

    const uniqueData = Array.from(new Set(data.map(a => a[col]))).filter((item) => item !== null).sort();

    useEffect(() => {
        setSelected(value || '');
    }, [value]);

    useEffect(() => {
        setSelected('');
    }, [lastUpdatedTime]);

    const handleChange = (event) => {
        const newValue = event.target.value;
        setSelected(newValue);
        onChange(col, newValue);
    };

    const getDifficultyIcon = () => {
        switch (difficulty) {
            case '1': return '🟢';
            case '2': return '🟡';
            case '3': return '🔴';
            default: return '❓';
        }
    };

    return (
        <div className="w-full">
            <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 backdrop-blur-sm rounded-xl border border-indigo-400/30 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 px-4 py-3 border-b border-indigo-400/20">
                    <div className="flex items-center gap-3">
                        <span className="text-lg">{getDifficultyIcon()}</span>
                        <label className="text-white font-semibold text-lg">
                            {name}
                        </label>
                        {difficulty === '3' && (
                            <div className="ml-auto bg-red-500/20 rounded-lg px-2 py-1">
                                <span className="text-xs text-red-200 font-medium">Saisie libre</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Input */}
                <div className="p-4">
                    {difficulty === '1' || difficulty === '2' ? (
                        <select
                            id={name}
                            name={name}
                            value={selected}
                            onChange={handleChange}
                            disabled={disabled}
                            className="w-full p-4 bg-black/40 backdrop-blur-sm text-white border border-indigo-400/40 rounded-xl
                                     focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30 focus:outline-none
                                     transition-all duration-300 font-medium text-lg cursor-pointer
                                     disabled:opacity-50 disabled:cursor-not-allowed
                                     hover:border-indigo-300 hover:bg-black/50"
                        >
                            <option className="bg-black/90 text-white py-2" value="">
                                Sélectionnez {name.toLowerCase()}...
                            </option>
                            {uniqueData.map((item, index) => (
                                <option className="bg-black/90 text-white py-2" key={index} value={item}>
                                    {item}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <input
                            type="text"
                            id={name}
                            name={name}
                            value={selected}
                            onChange={handleChange}
                            disabled={disabled}
                            className="w-full p-4 bg-black/40 backdrop-blur-sm text-white border border-indigo-400/40 rounded-xl
                                     focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30 focus:outline-none
                                     transition-all duration-300 font-medium text-lg
                                     disabled:opacity-50 disabled:cursor-not-allowed
                                     hover:border-indigo-300 hover:bg-black/50
                                     placeholder-indigo-300"
                            placeholder={`Tapez ${name.toLowerCase()}...`}
                        />
                    )}
                </div>

                {/* Visual indicator for filled/empty state */}
                <div className={`h-1 transition-all duration-300 ${
                    selected
                        ? 'bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400'
                        : 'bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600'
                }`}></div>
            </div>
        </div>
    );
}
