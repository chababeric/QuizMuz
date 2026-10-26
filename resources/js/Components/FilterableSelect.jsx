import React, { useState, useEffect, useRef } from 'react';
import { control } from '@/Components/AdminUi';

export default function FilterableSelect({ id, label='', value, onChange, options }) {
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
        <div className="relative w-full" ref={containerRef}>
            {label && <label htmlFor={id} className="mb-2 text-lg font-bold">{label}</label>}
            <div className="relative">
                <input
                    id={id}
                    type="text"
                    className={`${control} w-full pr-10`}
                    value={value}
                    onChange={handleInputChange}
                    onFocus={() => setShowDropdown(true)}
                    autoComplete="off"
                />
                <button
                    type="button"
                    tabIndex={-1}
                    aria-label="Afficher les suggestions"
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    onClick={toggleDropdown}
                >
                    <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            </div>
            {showDropdown && filteredOptions.length > 0 && (
                <ul className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 text-sm shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                    {filteredOptions.map((option, index) => (
                        <li
                            key={index}
                            className="cursor-pointer px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
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
