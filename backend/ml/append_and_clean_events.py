import pandas as pd

# Use relative paths from backend folder
df_main = pd.read_csv('ml/data/event_dataset.csv')
df_update = pd.read_csv('updated_event_dataset.csv')

df_combined = pd.concat([df_main, df_update], ignore_index=True)
df_combined = df_combined.drop_duplicates(subset=['event_title', 'date', 'time'], keep='last')
df_combined.to_csv('ml/data/event_dataset.csv', index=False)
df_update.iloc[0:0].to_csv('updated_event_dataset.csv', index=False)