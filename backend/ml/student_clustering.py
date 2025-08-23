# ml/student_clustering.py
# Utilities for loading the clustering model and finding similar students

import joblib
import pandas as pd
import numpy as np
import os
from sklearn.cluster import KMeans

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'student_cluster_model.pkl')
FEATURES_PATH = os.path.join(os.path.dirname(__file__), 'student_features.csv')
FEATURE_LIST_PATH = os.path.join(os.path.dirname(__file__), 'student_cluster_features.txt')

_model = None
_features_df = None

def load_model():
    # Always reload the model from disk to avoid caching issues after retrain
    return joblib.load(MODEL_PATH)

def load_features():
    # Always reload features from disk (optional, but safe for dynamic updates)
    return pd.read_csv(FEATURES_PATH)

def load_feature_list():
    # Each line is a feature column name
    with open(FEATURE_LIST_PATH, 'r') as f:
        return [line.strip() for line in f if line.strip() and line.strip() not in ('user_id', 'username')]

def get_student_features(user_id):
    df = load_features()
    feature_cols = load_feature_list()
    row = df[df['user_id'] == user_id]
    if row.empty:
        return None
    return row[feature_cols].fillna(0).values

def get_similar_students(user_id, top_n=5):
    model = load_model()
    df = load_features()
    feature_cols = load_feature_list()
    user_feats = get_student_features(user_id)
    if user_feats is None:
        return []
    cluster = model.predict(user_feats)[0]
    all_feats = df[feature_cols].fillna(0).values
    all_clusters = model.predict(all_feats)
    df['cluster'] = all_clusters
    similar = df[(df['cluster'] == cluster) & (df['user_id'] != user_id)]
    dists = np.linalg.norm(similar[feature_cols].values - user_feats, axis=1)
    similar = similar.copy()
    similar['distance'] = dists
    similar = similar.sort_values('distance').head(top_n)
    # Build full response for frontend
    results = []
    for _, row in similar.iterrows():
        # Use username as name fallback
        name = row.get('username', f"Student {row.get('user_id', '')}")
        # Dummy events count (could be improved)
        events = int(row.get('events', 0)) if 'events' in row else 0
        # Similarity: convert distance to similarity percentage (simple inverse)
        similarity = max(0, int(100 - row['distance']))
        # Interests: collect all tag columns with value 1
        interests = [col.replace('tag_', '') for col in df.columns if col.startswith('tag_') and row.get(col, 0) == 1]
        results.append({
            'user_id': row['user_id'],
            'name': name,
            'events': events,
            'similarity': similarity,
            'interests': interests
        })
    return results

def train_clustering_model():
    df = pd.read_csv(FEATURES_PATH)
    feature_cols = load_feature_list()
    X = df[feature_cols].fillna(0).values
    kmeans = KMeans(n_clusters=5, random_state=42)
    kmeans.fit(X)
    joblib.dump(kmeans, MODEL_PATH)
    print("Clustering model trained and saved.")

