import React, { useState } from 'react';
import axios from 'axios';

const SoilAnalyzer = (props) => {
    const [file, setFile] = useState(null);
    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleAnalyze = () => {
        if (!file) {
            alert("Please upload a soil image first!");
            return;
        }

        setLoading(true);
        
        // 1. Get Live Location with a 10s safety timeout
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                // 2. Prepare FormData
                const formData = new FormData();
                formData.append('soilImage', file);
                formData.append('lat', latitude);
                formData.append('lon', longitude);
                formData.append('n', 90); 
                formData.append('p', 42);
                formData.append('k', 43);
                formData.append('ph', 6.5);

                try {
                    // 3. Send to Node.js Backend
                    const response = await axios.post('http://localhost:5000/api/recommend-crop', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });

                    setPrediction(response.data);

                    // 4. Trigger History Table Refresh
                    if (props.onAnalysisComplete) {
                        props.onAnalysisComplete();
                    }

                } catch (err) {
                    console.error("Analysis failed", err);
                    alert("Analysis failed. Check if Backend/Python is running.");
                } finally {
                    // THIS LINE IS CRITICAL: It stops the "Processing" state
                    setLoading(false);
                }
            },
            (error) => {
                console.error("Location Error:", error);
                alert("Could not get location. Check browser permissions.");
                setLoading(false);
            },
            { timeout: 10000 } // Stop waiting for GPS after 10 seconds
        );
    };

    return (
        <div style={{ padding: '30px', border: '2px solid #2e7d32', borderRadius: '15px', backgroundColor: '#f9fff9', maxWidth: '500px', margin: 'auto' }}>
            <h2 style={{ color: '#2e7d32' }}>🌱 AI Soil Analyzer</h2>
            
            <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>Upload Soil Photo:</label>
                <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => setFile(e.target.files[0])} 
                    style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '5px', width: '100%' }}
                />
            </div>

            <button 
                onClick={handleAnalyze} 
                disabled={loading}
                style={{
                    width: '100%',
                    padding: '15px',
                    backgroundColor: loading ? '#ccc' : '#2e7d32',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold'
                }}
            >
                {loading ? "Processing Field Data..." : "Analyze & Recommend Crop"}
            </button>

            {prediction && (
                <div style={{ marginTop: '20px', padding: '15px', background: 'white', borderLeft: '10px solid #2e7d32', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ margin: '0 0 10px 0' }}>Recommendation: <span style={{ color: '#d32f2f' }}>{prediction.recommendedCrop}</span></h3>
                    <p style={{ margin: '5px 0' }}>🌡️ Temp: {prediction.currentWeather.temp}°C</p>
                    <p style={{ margin: '5px 0' }}>💧 Humidity: {prediction.currentWeather.humidity}%</p>
                </div>
            )}
        </div>
    );
};

export default SoilAnalyzer;