# train_model.py
# Train clustering models on student_features.csv and save the best model as student_cluster_model.pkl

import pandas as pd
import numpy as np
from sklearn.cluster import KMeans, DBSCAN, AgglomerativeClustering
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score
from sklearn.decomposition import PCA
import joblib


# Load features
import os
features_path = os.path.join(os.path.dirname(__file__), 'student_features.csv')
df = pd.read_csv(features_path)
feature_cols = [col for col in df.columns if col not in ['user_id', 'username']]
X = df[feature_cols].fillna(0)
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# KMeans
kmeans = KMeans(n_clusters=3, random_state=42)
kmeans_labels = kmeans.fit_predict(X_scaled)
kmeans_sil = silhouette_score(X_scaled, kmeans_labels)

# DBSCAN
dbscan = DBSCAN(eps=1.5, min_samples=2)
dbscan_labels = dbscan.fit_predict(X_scaled)
try:
    dbscan_sil = silhouette_score(X_scaled, dbscan_labels)
except Exception:
    dbscan_sil = -1

# Agglomerative
agglo = AgglomerativeClustering(n_clusters=3)
agglo_labels = agglo.fit_predict(X_scaled)
agglo_sil = silhouette_score(X_scaled, agglo_labels)

print(f'KMeans Silhouette: {kmeans_sil:.3f}')
print(f'DBSCAN Silhouette: {dbscan_sil:.3f}')
print(f'Agglomerative Silhouette: {agglo_sil:.3f}')

# Save the best model (highest silhouette)
scores = {'kmeans': kmeans_sil, 'dbscan': dbscan_sil, 'agglo': agglo_sil}
best = max(scores, key=scores.get)
if best == 'kmeans':
    joblib.dump(kmeans, 'student_cluster_model.pkl')
    print('Saved KMeans model to student_cluster_model.pkl')
elif best == 'agglo':
    joblib.dump(agglo, 'student_cluster_model.pkl')
    print('Saved Agglomerative model to student_cluster_model.pkl')
else:
    joblib.dump(dbscan, 'student_cluster_model.pkl')
    print('Saved DBSCAN model to student_cluster_model.pkl')
