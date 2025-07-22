import React, { useEffect, useState } from 'react';

export default function MessageDisplay({ successMessage, errorMessage, setSuccessMessage, setErrorMessage }) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        if (successMessage || errorMessage) {
            setVisible(true);
            const timer = setTimeout(() => {
                setVisible(false);
                setSuccessMessage('');
                setErrorMessage('');
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [successMessage, errorMessage]);

    return (
        <div className="w-full flex justify-center mt-4">
            {visible && successMessage && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4"><span className="block sm:inline">{successMessage}</span></div>}
            {visible && errorMessage && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"><span className="block sm:inline">{errorMessage}</span></div>}
        </div>
    );
}
