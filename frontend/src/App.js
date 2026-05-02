import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import SoilAnalyzer from './components/AIAdvisor/SoilAnalyzer';

function App() {
  const [history, setHistory] = useState([]);

  // Function to fetch history from MongoDB via Node.js


  const fetchHistory = async () => {
    try {
        const res = await axios.get('http://localhost:5000/api/history');
        console.log("History Data Received:", res.data); // Add this to debug
        setHistory(res.data);
    } catch (err) {
        console.error("History fetch failed", err);
    }
};
<SoilAnalyzer onAnalysisComplete={fetchHistory} />
 

  // Load history on page refresh
  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="App">
      <header style={{ backgroundColor: '#2e7d32', padding: '20px', color: 'white', textAlign: 'center' }}>
        <h1>AgriDirect: Smart Farmer Assistant</h1>
      </header>

      <main style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Pass fetchHistory to SoilAnalyzer so it can refresh the table after a new prediction */}
        <SoilAnalyzer onAnalysisComplete={fetchHistory} />

        {/* --- History Table Section --- */}
        <div className="history-section" style={{ marginTop: '40px', width: '100%', maxWidth: '800px' }}>
          <h3 style={{ color: '#2e7d32', borderBottom: '2px solid #2e7d32', paddingBottom: '10px' }}>
            Recent Field Analysis
          </h3>
          <div style={{ backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f1f8e9' }}>
                <tr>
                  <th style={{ padding: '15px' }}>Crop</th>
                  <th style={{ padding: '15px' }}>Temp</th>
                  <th style={{ padding: '15px' }}>Humidity</th>
                  <th style={{ padding: '15px' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {history.length > 0 ? (
                  history.map((item, index) => (
                    <tr key={index} style={{ borderTop: '1px solid #eee' }}>
                      <td style={{ padding: '15px', fontWeight: 'bold', color: '#2e7d32', textTransform: 'capitalize' }}>
                        {item.crop}
                      </td>
                      <td style={{ padding: '15px' }}>{item.temperature}°C</td>
                      <td style={{ padding: '15px' }}>{item.humidity}%</td>
                      <td style={{ padding: '15px', fontSize: '0.85rem', color: '#666' }}>
                        {new Date(item.timestamp).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                      No history records found in database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;