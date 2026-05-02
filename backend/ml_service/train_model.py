import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
import pickle

from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier

# 1. Create a Pipeline (The "Cleaning" Factory)
# This ensures data is normalized (StandardScaler) before reaching the AI
pipeline = Pipeline([
    ('scaler', StandardScaler()), 
    ('classifier', RandomForestClassifier(n_estimators=100, random_state=42))
])

# 2. Train the Pipeline
pipeline.fit(X_train, y_train)

# 3. Save the WHOLE pipeline as the .pkl
# Now, the 'scaler' (cleaning logic) is saved inside the brain!
with open('model.pkl', 'wb') as f:
    pickle.dump(pipeline, f)

# 1. Load the real dataset
df = pd.read_csv('Crop_recommendation.csv')

# 2. Separate Features (X) and Target (y)
X = df[['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']]
y = df['label']

# 3. Split the data for real validation
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 4. Train a Real-World Model
model = RandomForestClassifier(n_estimators=100)
model.fit(X_train, y_train)

# 5. Check accuracy (so you can talk about it in your presentation)
print(f"Model Accuracy: {model.score(X_test, y_test) * 100:.2f}%")

# 6. Save the model as a .pkl file
with open('model.pkl', 'wb') as f:
    pickle.dump(model, f)

print("model.pkl has been created successfully!")