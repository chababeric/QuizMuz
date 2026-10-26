
import React, { useState, useEffect, useMemo } from "react";
import { fieldClass } from '@/Components/QuizUi';

export default function SelectOption({ name, col, data, onChange, lastUpdatedTime, difficulty, value, disabled }) {
    const [selected, setSelected] = useState(value || '');

    // Rebuilt only when the list changes, not on every keystroke
    const uniqueData = useMemo(
        () => Array.from(new Set(data.map(a => a[col]))).filter((item) => item !== null).sort(),
        [data, col]
    );

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

    const inputId = `answer-${col}`;
    // A filled answer gets a green border instead of the old progress bar
    const borderClass = selected ? 'border-[rgba(30,158,98,0.6)]' : 'border-white/[0.12] hover:border-white/[0.25]';

    return (
        <div className="w-full">
            <div className="mb-2 flex items-center justify-between gap-2">
                <label htmlFor={inputId} className="text-[15px] font-semibold text-[#F2F3F8]">
                    {name}
                </label>
                {difficulty === '3' && (
                    <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-0.5 text-[12px] font-medium text-[#C9CCDA]">
                        Saisie libre
                    </span>
                )}
            </div>

            {difficulty === '1' || difficulty === '2' ? (
                <select
                    id={inputId}
                    name={name}
                    value={selected}
                    onChange={handleChange}
                    disabled={disabled}
                    className={`${fieldClass} ${borderClass} cursor-pointer`}
                >
                    <option className="bg-[#0B0D18] text-[#F2F3F8]" value="">
                        Sélectionnez {name.toLowerCase()}...
                    </option>
                    {uniqueData.map((item, index) => (
                        <option className="bg-[#0B0D18] text-[#F2F3F8]" key={index} value={item}>
                            {item}
                        </option>
                    ))}
                </select>
            ) : (
                <input
                    type="text"
                    id={inputId}
                    name={name}
                    value={selected}
                    onChange={handleChange}
                    disabled={disabled}
                    className={`${fieldClass} ${borderClass}`}
                    placeholder={`Tapez ${name.toLowerCase()}...`}
                />
            )}
        </div>
    );
}
