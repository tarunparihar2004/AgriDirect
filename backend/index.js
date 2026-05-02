const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// IMPORT THE MODEL
const Record = require('./models/Record'); 

const app = express();
app.use(cors());
app.use(express.json());

// 1. MONGODB CONNECTION
// Added /AgriDirect to ensure it points to the right database
const mongoURI = "mongodb+srv://parihartarun04_db_user:ovWHUMkt2u334AHj@cluster0.g0wvxxo.mongodb.net/AgriDirect?appName=Cluster0";

mongoose.connect(mongoURI)
    .then(() => console.log("☁️ Connected to MongoDB Atlas"))
    .catch(err => {
        console.error("❌ MongoDB Connection Error:", err.message);
        process.exit(1); 
    });

// 2. FILE STORAGE SETUP
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, 'soil-' + Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage: storage });

// 3. HISTORY API ROUTE
app.get('/api/history', async (req, res) => {
    try {
        const history = await Record.find().sort({ timestamp: -1 }).limit(10);
        res.json(history);
    } catch (err) {
        res.status(500).json({ error: "Could not fetch history: " + err.message });
    }
});

// 4. MAIN PREDICTION ROUTE
app.post('/api/recommend-crop', upload.single('soilImage'), async (req, res) => {
    console.log("Request received from Frontend!");
    try {
        const { n, p, k, ph, lat, lon } = req.body;
        const soilImagePath = req.file ? req.file.path : null;

        // Fetch Weather
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=0d2d3ceb960ca07f3a64eb6971014d5c&units=metric`;
        const weatherRes = await axios.get(weatherUrl);
        const { temp, humidity } = weatherRes.data.main;

        // Call Python AI
        const aiRes = await axios.post('http://localhost:8000/predict', {
            n: Number(n), p: Number(p), k: Number(k), ph: Number(ph),
            temp, humidity, rainfall: 100, image_path: soilImagePath
        });

        // SAVE TO DATABASE
        const newRecord = new Record({
            crop: aiRes.data.crop,
            temperature: temp,
            humidity: humidity,
            soilImagePath: soilImagePath,
            location: { lat: Number(lat), lon: Number(lon) }
        });

        await newRecord.save();
        console.log("✅ Record saved to Cloud!");

        res.json({
            recommendedCrop: aiRes.data.crop,
            currentWeather: { temp, humidity }
        });

    } catch (error) {
        if (error.response && error.response.status === 422) {
            return res.status(422).json({ error: error.response.data.error });
        }
        console.error("Route Error:", error.message);
        res.status(500).json({ error: "Analysis failed." });
    }
});

app.listen(5000, () => console.log("🚀 Gatekeeper active on Port 5000"));