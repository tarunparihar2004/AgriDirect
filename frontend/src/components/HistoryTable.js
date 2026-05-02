import React, { useEffect, useState } from 'react';
import axios from 'axios';

const HistoryTable = () => {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/history');
                setHistory(res.data);
            } catch (err) {
                console.error("Error fetching history", err);
            }
        };
        fetchHistory();
    }, []);

    return (
        <div style={{ marginTop: '20px', padding: '20px', backgroundColor: 'white', borderRadius: '8px' }}>
            <h3>📜 Prediction History</h3>
            <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ backgroundColor: '#4CAF50', color: 'white' }}>
                        <th>Date</th>
                        <th>Crop</th>
                        <th>Temp</th>
                        <th>Humidity</th>
                    </tr>
                </thead>
                <tbody>
                    {history.map((item, index) => (
                        <tr key={index}>
                            <td>{new Date(item.timestamp).toLocaleDateString()}</td>
                            <td style={{ fontWeight: 'bold', color: '#2e7d32' }}>{item.crop}</td>
                            <td>{item.temperature}°C</td>
                            <td>{item.humidity}%</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default HistoryTable;