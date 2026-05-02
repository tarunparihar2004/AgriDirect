from flask import Flask, request, jsonify
import pickle
import os
import cv2
import numpy as np

# 1. INITIALIZE THE APP FIRST
app = Flask(__name__)

# 2. LOAD THE MODEL
model_path = 'model.pkl'
if os.path.exists(model_path):
    with open(model_path, 'rb') as f:
        model = pickle.load(f)
else:
    model = None

# 3. SOIL VALIDATION LOGIC
def is_actually_soil(image_path):
    img = cv2.imread(image_path)
    if img is None: 
        return False
    
    # Convert to HSV to detect "Earthy" tones
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    lower_earth = np.array([0, 20, 20])
    upper_earth = np.array([40, 255, 200])
    
    mask = cv2.inRange(hsv, lower_earth, upper_earth)
    ratio = np.sum(mask > 0) / (img.shape[0] * img.shape[1])
    
    # Validation: Must be at least 40% soil-colored
    return ratio > 0.4

# 4. THE PREDICT ROUTE
@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        img_path = data.get('image_path')

        # Real-World Validation: Check if it's soil
        if img_path and os.path.exists(img_path):
            if not is_actually_soil(img_path):
                return jsonify({"error": "Image does not appear to be soil. Please upload a clear field photo."}), 422

        # Extract features
        n = data.get('n', 0)
        p = data.get('p', 0)
        k = data.get('k', 0)
        temp = data.get('temp', 25)
        humidity = data.get('humidity', 50)
        ph = data.get('ph', 6.5)
        rainfall = data.get('rainfall', 100)

        if model:
            features = [n, p, k, temp, humidity, ph, rainfall]
            prediction = model.predict([features])
            return jsonify({"crop": str(prediction[0])})
        else:
            return jsonify({"crop": "Model file missing"}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(port=8000, debug=True)