// components/CustomTable.js
import React from 'react';

const CustomTable = ({ headers, data, renderRow, columnWidths }) => {
    if (!Array.isArray(data)) {
        console.error('Expected `data` to be an array but got:', data);
        return <p>No data available</p>;
    }
    return (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
                <tr>
                    {headers.map((header, index) => (
                        <th 
                            key={index} 
                            style={{
                                borderBottom: '1px solid #ddd',
                                padding: '10px',
                                textAlign: 'left',
                                backgroundColor: 'rgb(247 247 247)',
                                width: columnWidths ? columnWidths[index] : 'auto', // Apply width
                            }}
                        >
                            {header}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {data.map((item, index) => (
                    renderRow(item, index) // Pass index to renderRow
                ))}
            </tbody>
        </table>
    );
};

export default CustomTable;
