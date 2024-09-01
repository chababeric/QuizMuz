import React from 'react';

export default function Table({ data, columnNames, columnKeys, action, actionColumn, customRender }) {
    return (
        <table className="mt-4 min-w-full bg-white">
            <thead>
                <tr>
                    {columnNames.map((column, index) => (
                        <th key={index} className="px-4 py-2">{column}</th>
                    ))}
                    {actionColumn && <th className="px-4 py-2">Action</th>}
                </tr>
            </thead>
            <tbody>
            {data.map((item, rowIndex) => (
                <tr key={rowIndex} className="text-center">
                    {columnKeys.map((key, colIndex) => (
                        customRender && key === 'last_action_time' ? (
                            customRender(item)
                        ) : (
                            <td key={colIndex} className="border px-4 py-2">{item[key]}</td>
                        )
                    ))}

                    {actionColumn &&
                        <td className="border px-4 py-2 flex justify-center items-center">
                            <img
                                src={item.icon}
                                alt={item.altIcon}
                                className="w-8 h-8 cursor-pointer"
                                onClick={() => action(item)}
                            />
                        </td>
                    }
                </tr>
            ))}
            </tbody>
        </table>
    );
}
