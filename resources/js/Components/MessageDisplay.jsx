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
            {visible && successMessage && <div className="bg-green-500 text-white p-2 rounded">{successMessage}</div>}
            {visible && errorMessage && <div className="bg-red-500 text-white p-2 rounded">{errorMessage}</div>}
        </div>
    );
}
