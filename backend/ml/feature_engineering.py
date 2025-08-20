# feature_engineering.py
# This script loads student_ml_data.csv and performs feature engineering for clustering.
# It outputs student_features.csv for ML model training.

import pandas as pd
from sklearn.preprocessing import MultiLabelBinarizer, OneHotEncoder
import numpy as np

# Load data
csv_path = 'student_ml_data.csv'
df = pd.read_csv(csv_path, sep=',')

# Fill NaN with empty string for split
for col in ['event_tags', 'department', 'year', 'feedback_sentiments']:
    df[col] = df[col].fillna('')

# Convert tags to list
all_tags = set()
tag_lists = []
for tags in df['event_tags']:
    tag_list = [t.strip() for t in tags.split(';') if t.strip()]
    tag_lists.append(tag_list)
    all_tags.update(tag_list)

mlb = MultiLabelBinarizer()
tag_matrix = mlb.fit_transform(tag_lists)
tag_df = pd.DataFrame(tag_matrix, columns=[f'tag_{t}' for t in mlb.classes_])

# One-hot encode department and year
ohe = OneHotEncoder(sparse_output=False, handle_unknown='ignore')
dep_year = df[['department', 'year']].astype(str)
dep_year_ohe = ohe.fit_transform(dep_year)
dep_year_df = pd.DataFrame(dep_year_ohe, columns=ohe.get_feature_names_out(['department', 'year']))

# Sentiment features (count of positive/negative/neutral)
def count_sentiments(sentiments, target):
    return sentiments.count(target)

sentiment_counts = pd.DataFrame({
    'sentiment_positive': df['feedback_sentiments'].apply(lambda s: count_sentiments(s, 'positive')),
    'sentiment_negative': df['feedback_sentiments'].apply(lambda s: count_sentiments(s, 'negative')),
    'sentiment_neutral': df['feedback_sentiments'].apply(lambda s: count_sentiments(s, 'neutral')),
})

# Combine all features
features = pd.concat([tag_df, dep_year_df, sentiment_counts], axis=1)
features['user_id'] = df['user_id']
features['username'] = df['username']

# Save features for ML
features.to_csv('student_features.csv', index=False)
print('Feature engineering complete. Output: student_features.csv')
