import os
import joblib
import numpy as np

class SymptomBasedModel:
    def __init__(self, X_train, y_train, feature_names):
        self.X_train = X_train
        self.y_train = y_train
        self.feature_names_in_ = feature_names

    def predict(self, X):
        # X is (n_samples, n_features)
        # For each sample, find the row in X_train that has the most matching 1s
        predictions = []
        for sample in X:
            # sample is a binary vector
            # valid indices for input
            active_indices = [i for i, x in enumerate(sample) if x == 1]
            
            best_score = -1
            best_label = None
            
            # Simple linear scan (dataset is tiny)
            # convert X_train to numpy array if not already
            import numpy as np
            X_arr = np.array(self.X_train)
            
            # Score = Number of matching 1s - 0.1 * Number of mismatching 1s (penalize extra symptoms slightly)
            # Actually, simpler: just count matching 1s.
            # dot product sample . train_row
            scores = X_arr.dot(sample)
            
            best_idx = np.argmax(scores)
            best_label = self.y_train.iloc[best_idx]
            predictions.append(best_label)
            
        return predictions




try:
    # Load trained disease prediction model
    model_path = os.path.join(os.path.dirname(__file__), "disease_model.pkl")
    model = joblib.load(model_path)
    # Extract symptom feature list from model
    SYMPTOM_LIST = model.feature_names_in_ # type: ignore
except Exception as e:
    print(f"CRITICAL ERROR: Failed to load model: {e}")
    print("WARNING: Using Fallback Model (MockModel) due to load failure.")
    
    # Fallback Rule-Based Model
    class MockModel:
        def predict(self, X):
            return ["Consult a Doctor (Model Unavailable)"]
            
    model = MockModel() 
    # Fallback symptom list (basic set to prevent crash)
    SYMPTOM_LIST = [
        "fever", "cough", "headache", "chest_pain", "shortness_of_breath",
        "nausea", "fatigue", "sore_throat", "runny_nose"
    ]
