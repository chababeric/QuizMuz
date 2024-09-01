import React, { useState, useEffect } from "react";

export default function SelectOption({ name, col, data, onChange, lastUpdatedTime, difficulty }) {
    const [selected, setSelected] = useState('');

    const uniqueData = Array.from(new Set(data.map(a => a[col]))).filter((item) => item !== null).sort();

    useEffect(() => {
        setSelected('');
    }, [lastUpdatedTime]);

    const handleChange = (event) => {
        setSelected(event.target.value);
        onChange(event.target.value);
    };

    return (
        <div className="w-full mt-4 flex justify-center">
            {difficulty === '1' || difficulty === '2' ? (
                <select id={name} name={name} value={selected} onChange={handleChange} className="user-input hover:cursor-pointer">
                    <option className="bg-black/80 text-white" value="">{name}</option>
                    {uniqueData.map((item, index) => (
                        <option className="bg-black/80 text-white" key={index} value={item}>{item}</option>
                    ))}
                </select>
            ) : (
                <input
                    type="text"
                    id={name}
                    name={name}
                    value={selected}
                    onChange={handleChange}
                    className="user-input hover:cursor-text"
                    placeholder={name}
                />
            )}
        </div>
    );
}
