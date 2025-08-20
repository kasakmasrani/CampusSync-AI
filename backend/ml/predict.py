import pickle

def predict_event_success(data):
    with open("ml/model.pkl", "rb") as f:
        model_data = pickle.load(f)

    model = model_data["model"]
    cat_map = model_data["category_map"]
    dept_map = model_data["department_map"]
    year_map = model_data["year_map"]

    # Convert incoming fields
    cat = cat_map.get(data["category"].capitalize(), 0)
    dept = dept_map.get(data["department"].capitalize(), 0)
    year = year_map.get(str(data["target_year"]), 0)
    capacity = int(data["max_capacity"])
    num_tags = len(data.get("tags", []))

    X = [[cat, dept, year, capacity, num_tags]]
    success_rate = round(model.predict(X)[0])

    return {
        "success_rate": success_rate,
        "expected_attendees": round(success_rate * capacity / 100),
        "engagement": min(100, round(success_rate + 5)),  # mock boost
        "sentiment": "Positive" if success_rate > 70 else "Neutral" if success_rate > 50 else "Negative",
        
    }
