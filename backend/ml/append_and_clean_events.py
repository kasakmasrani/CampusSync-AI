import pandas as pd
import os

# Get project root (backend/)
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
main_path = os.path.join(project_root, "ml", "data", "event_dataset.csv")
update_path = os.path.join(project_root, "updated_event_dataset.csv")

df_main = pd.read_csv(main_path)
df_update = pd.read_csv(update_path)

if not df_update.empty:
    df_combined = pd.concat([df_main, df_update], ignore_index=True)
    df_combined = df_combined.drop_duplicates(subset=['event_title', 'date', 'time'], keep='last')
    df_combined.to_csv(main_path, index=False)
    df_update.iloc[0:0].to_csv(update_path, index=False)