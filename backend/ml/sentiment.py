# ml/sentiment.py
def predict_sentiment(text):
    if not text.strip():
        return "neutral"
    if any(word in text.lower() for word in ["great", "awesome", "amazing", "good", "love"]):
        return "positive"
    elif any(word in text.lower() for word in ["bad", "worst", "terrible", "poor"]):
        return "negative"
    return "neutral"
