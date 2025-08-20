import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
import pickle
import os
from .clean_data import clean_event_dataset

def preprocess_data(df):
    # Map categories manually (you can save these too)
    category_map = {
        "Technology": 0,
        "Cultural": 1,
        "Sports": 2,
        "Academic": 3,
        "Professional": 4,
        "Workshop": 5,
        "Seminar": 6,
        "Competition": 7,
    }
    year_map = {
        "1": 0, "2": 1, "3": 2, "4": 3
    }
    dept_map = {
        "Computer": 0, "Management": 1, "Science": 2,
        "Civil": 3, "Mechanical": 4, "Electrical": 5
    }

    df["category"] = df["category"].map(category_map)
    df["target_year"] = df["target_year"].astype(str).map(year_map)
    df["department"] = df["department"].map(dept_map)

    # Create new features
    df["num_tags"] = df["event_tags"].apply(lambda x: len(x.split(",")))
    df["capacity"] = df["capacity"].astype(int)

    return df, category_map, dept_map, year_map

def train_model():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    # data_path = os.path.join(base_dir, "ml", "data", "event_dataset.csv")
    # df = pd.read_csv(data_path)
    df = clean_event_dataset("ml/data/event_dataset.csv")
    # df = pd.read_csv("data/event_dataset.csv")
    df, cat_map, dept_map, year_map = preprocess_data(df)

    features = ["category", "department", "target_year", "capacity", "num_tags"]
    X = df[features]
    y = df["success_rate"]

    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X, y)
    model_path = os.path.join(base_dir, "ml", "model.pkl")
    with open(model_path, "wb") as f:
        pickle.dump({
            "model": model,
            "category_map": cat_map,
            "department_map": dept_map,
            "year_map": year_map
        }, f)

if __name__ == "__main__":
    train_model()
