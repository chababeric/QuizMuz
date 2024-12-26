import React, { useState, useEffect, useRef } from 'react';

export default function FilterableSelect({ label='', value, onChange, options }) {
    const [filteredOptions, setFilteredOptions] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        let filtered = options
            .filter(option => option.toLowerCase().includes(value.toLowerCase()))
            .filter(Boolean); // Remove any empty values

        filtered = [...new Set(filtered)]; // Remove duplicates
        filtered.sort((a, b) => a.localeCompare(b)); // Sort alphabetically

        setFilteredOptions(filtered);
    }, [value, options]);

    const handleInputChange = (e) => {
        onChange(e.target.value);
        setShowDropdown(true);
    };

    const handleOptionClick = (option) => {
        onChange(option);
        setShowDropdown(false);
    };

    const toggleDropdown = () => {
        setShowDropdown(prevState => !prevState);
    };

    const handleClickOutside = (e) => {
        if (containerRef.current && !containerRef.current.contains(e.target)) {
            setShowDropdown(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="relative w-full mb-4" ref={containerRef}>
            <label className="text-lg font-bold mb-2">{label}</label>
            <div className="relative">
                <input
                    type="text"
                    className="mt-1 block w-full rounded-md"
                    value={value}
                    onChange={handleInputChange}
                    onFocus={() => setShowDropdown(true)}
                    autoComplete="off"
                />
                <div
                    className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                    onClick={toggleDropdown}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
            {showDropdown && filteredOptions.length > 0 && (
                <ul className="absolute z-10 bg-white border border-gray-300 w-full mt-1 max-h-40 overflow-y-auto">
                    {filteredOptions.map((option, index) => (
                        <li
                            key={index}
                            className="cursor-pointer px-4 py-2 hover:bg-gray-200"
                            onClick={() => handleOptionClick(option)}
                        >
                            {option}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
