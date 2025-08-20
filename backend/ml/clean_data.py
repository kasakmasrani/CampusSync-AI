from sklearn.model_selection import TimeSeriesSplit
import pandas as pd
from datetime import datetime
import numpy as np
import json

class NumpyEncoder(json.JSONEncoder):
    """ Custom encoder for numpy data types """
    def default(self, obj):
        if isinstance(obj, (np.int32, np.int64, np.int_)):
            return int(obj)
        elif isinstance(obj, (np.float32, np.float64, np.float_)):
            return float(obj)
        elif isinstance(obj, np.ndarray):
            return obj.tolist()
        elif isinstance(obj, datetime):
            return obj.isoformat()
        return super().default(obj)


def clean_event_dataset(filepath="event_dataset.csv", top_features_only=False):
    # Data freshness check
    df = pd.read_csv(filepath, quotechar='"', skipinitialspace=True)
    # Remove rows with invalid dates
    def is_valid_date(date_str):
        try:
            dt = pd.to_datetime(date_str, errors='coerce')
            if pd.isnull(dt):
                return False
            return dt.year >= 1900 and dt.year <= 2100
            # pd.to_datetime(date_str)
            # return True
        except Exception:
            return False

    if 'date' in df.columns:
        df = df[df['date'].apply(is_valid_date)]
    if 'date' in df.columns and not df.empty:
        newest_date = pd.to_datetime(df['date']).max()
        print(f"Newest event date in data: {newest_date}")
        if (datetime.now() - newest_date).days > 365:
            print("⚠️ Warning: Data appears stale (>1 year old)")
    # data = pd.read_csv(filepath)
    # if 'date' in data.columns:
    #     newest_date = pd.to_datetime(data['date']).max()
    #     print(f"Newest event date in data: {newest_date}")
    #     if (datetime.now() - newest_date).days > 365:
    #         print("⚠️ Warning: Data appears stale (>1 year old)")
    """
    Clean the college event dataset with comprehensive data wrangling,
    including duplicate handling.
    
    Parameters:
    - filepath: Path to the raw CSV file
    - top_features_only: If True, return only the top features for modeling
    
    Returns:
    - Cleaned DataFrame ready for ML training
    """
    
    # Load the raw data
    # df = pd.read_csv(filepath)
    df = pd.read_csv(filepath, quotechar='"', skipinitialspace=True)

    
    print(f"Initial shape: {df.shape}")
    
    # 1. Handle duplicates (NEW SECTION)
    print("\nHandling duplicates...")
    dup_before = df.duplicated().sum()
    print(f"Found {dup_before} exact duplicate rows")
    
    # More sophisticated duplicate check using key columns
    key_columns = ['event_title', 'date', 'time', 'location']
    # Only use key columns that exist in the DataFrame
    key_columns_present = [col for col in key_columns if col in df.columns]
    if key_columns_present:
        dup_key_before = df.duplicated(subset=key_columns_present, keep=False).sum()
        print(f"Found {dup_key_before} potential duplicates based on key columns: {key_columns_present}")
        # Remove exact duplicates
        df = df.drop_duplicates()
        # For key-column duplicates, keep first occurrence and log removed ones
        duplicates = df[df.duplicated(subset=key_columns_present, keep=False)]
        if not duplicates.empty:
            print("\nExamples of similar events being deduplicated:")
            print(duplicates.sort_values(key_columns_present).head(4))
        df = df.drop_duplicates(subset=key_columns_present, keep='first')
    else:
        print("No key columns found for duplicate detection. Skipping key-based deduplication.")
    print(f"Shape after deduplication: {df.shape}")

    # 2. Handle missing values
    print("\nHandling missing values...")
    # Drop rows with null event_title (critical field)
    initial_count = len(df)
    df = df.dropna(subset=['event_title'])
    print(f"Dropped {initial_count - len(df)} rows with missing event titles")
    
    # Debug: print column types and sample values before median imputation
    print("Column types before median imputation:\n", df.dtypes)
    print("Sample capacity values:", df['capacity'].head(5))

    # Handle 'target_year' conversion: map 'all' to 0, others to int
    if df['target_year'].dtype == object:
        df['target_year'] = df['target_year'].replace('all', 0)
        df['target_year'] = pd.to_numeric(df['target_year'], errors='coerce')

    # Convert capacity to numeric (in case of any string issues)
    df['capacity'] = pd.to_numeric(df['capacity'], errors='coerce')

    # Now you can safely fill missing numeric values
    median_values = {
        'target_year': df['target_year'].median(),
        'capacity': df['capacity'].median()
    }

    df = df.assign(target_year=df['target_year'].fillna(median_values['target_year']))
    df = df.assign(capacity=df['capacity'].fillna(median_values['capacity']))

    # Fill other missing values intelligently
    fill_values = {
        'category': 'Unknown',
        'department': 'Unknown',
        'location': 'Unknown',
        'event_tags': '',
        'success_rate': df['success_rate'].median()
    }
    df = df.fillna(fill_values)

    # 3. Clip numerical values to valid ranges
    print("\nClipping numerical values...")
    df['target_year'] = df['target_year'].clip(1, 4).astype(int)
    df['capacity'] = df['capacity'].clip(50, 400).astype(int)
    df['success_rate'] = df['success_rate'].clip(30, 99).astype(int)
    
    # 4. Parse and transform datetime features
    print("\nProcessing datetime features...")
    if 'date' in df.columns and 'time' in df.columns:
        try:
            # Parse dates with error handling
            df['date'] = pd.to_datetime(df['date'], errors='coerce', format='%Y-%m-%d')
            df['time'] = pd.to_datetime(df['time'], format='%H:%M', errors='coerce').dt.time
            # Handle failed parses
            if df['date'].isna().any():
                print(f"Warning: {df['date'].isna().sum()} invalid dates found - filling with mode")
                df['date'] = df['date'].fillna(df['date'].mode()[0])
            if df['time'].isna().any():
                print(f"Warning: {df['time'].isna().sum()} invalid times found - filling with mode")
                df['time'] = df['time'].fillna(df['time'].mode()[0])
        except Exception as e:
            print(f"Critical error processing dates: {e}")
            return None
        # Combine date and time into datetime object
        df['datetime'] = df.apply(lambda row: datetime.combine(row['date'], row['time']), axis=1)
        # Extract temporal features
        df['month'] = df['datetime'].dt.month
        df['day_of_week'] = df['datetime'].dt.dayofweek  # Monday=0, Sunday=6
        df['hour'] = df['datetime'].dt.hour
        df['minute'] = df['datetime'].dt.minute
    else:
        print("'date' or 'time' column not found. Skipping datetime feature engineering.")
    
    # 5. Clean text fields
    print("\nCleaning text fields...")
    text_columns = ['event_title', 'category', 'department', 'location', 'event_tags']
    for col in text_columns:
        if col in df.columns:
            if col == 'event_tags':
                df[col] = df[col].str.lower().str.strip()
            else:
                df[col] = df[col].astype(str).str.strip().str.title()
    

    # 6. Feature engineering
    print("\nFeature engineering...")
    # 1. Create popularity indicators from event titles
    df['title_length'] = df['event_title'].str.len()
    df['title_word_count'] = df['event_title'].str.split().str.len()

    # 2. Extract tag features
    df['num_tags'] = df['event_tags'].str.count(',') + 1

    # 3. Time-based features
    df['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)
    df['time_of_day'] = pd.cut(
        df['hour'],
        bins=[0, 12, 17, 24],
        labels=['morning', 'afternoon', 'evening'],
        right=False,
        include_lowest=True
    )

    # 4. Event type flag: is_workshop
    df['is_workshop'] = df['event_title'].str.contains('Workshop', case=False).astype(int)

    # 5. Department popularity feature
    dept_counts = df['department'].value_counts(normalize=True)
    df['dept_popularity'] = df['department'].map(dept_counts)

    # 6. Feature versioning
    df['feature_version'] = 'v1.1'

    # 7. Final cleanup
    print("\nFinalizing clean dataset...")
    df = df.drop(columns=['date', 'time', 'datetime'], errors='ignore')

    # Ensure columns match form fields and new features
    final_columns = [
        'event_title',
        'category',
        'department',
        'target_year',
        'capacity',
        'location',
        'month',        # From date
        'day_of_week',  # From date
        'hour',         # From time
        'event_tags',
        'title_length',
        'title_word_count',
        'num_tags',
        'is_weekend',
        'time_of_day',
        'is_workshop',
        'is_tech_event',
        'senior_audience',
        'dept_popularity',
        'feature_version',
        'success_rate'  # Target
    ]
    # Only keep columns that exist in df
    df = df[[col for col in final_columns if col in df.columns]]

    print("\nCleaning complete!")
    print(f"Final shape: {df.shape}")
    print("\nSample of cleaned data:")
    print(df.head(3))

    # Feature selection: keep only top features if requested
    if top_features_only:
        top_features = ['capacity', 'month', 'hour', 'target_year', 'is_weekend']
        final_columns = [f for f in top_features if f in df.columns] + ['success_rate']
        df = df[final_columns]

    monitoring_metrics = {
        'missing_rate': {k: float(v) for k, v in df.isna().mean().items()},  # Convert to float
        'value_ranges': {
            'capacity': (int(df['capacity'].min()), int(df['capacity'].max())),  # Convert to int
            'success_rate': (int(df['success_rate'].min()), int(df['success_rate'].max()))
        }
    }
    
    metadata = {
        'created_on': datetime.now().isoformat(),
        'feature_list': list(df.columns),
        'row_count': int(len(df)),  # Ensure integer
        'expected_important_features': [
            'capacity',
            'is_workshop',
            'dept_popularity',
            'month'
        ],
        'monitoring_metrics': monitoring_metrics,
        'performance_benchmark': {
            'expected_r2_range': (float(0.25), float(0.40)),  # Explicit float
            'expected_mae_range': (float(5.0), float(7.0))
        }
    }

    with open('cleaned_metadata.json', 'w') as f:
        json.dump(metadata, f, cls=NumpyEncoder, indent=2)  # Use custom encoder

    return df

# Example usage
if __name__ == "__main__":
    clean_df = clean_event_dataset("data\\event_dataset.csv")
    clean_df.to_csv("cleaned_event_dataset.csv", index=False)
    print("\nSaved cleaned data to 'cleaned_event_dataset.csv'")
