import sys
import pandas as pd
from nptdms import TdmsFile

tdms_path = sys.argv[1]
csv_path = sys.argv[2]

# Form metadata
article_id = sys.argv[3]
test_type = sys.argv[4]
test_date = sys.argv[5]
test_operator = sys.argv[6]
building_temp = float(sys.argv[7])
ambient_temp = float(sys.argv[8])

tdms_file = TdmsFile.read(tdms_path)
df = tdms_file.as_dataframe()

# Clean column names
df.columns = [col.split('/')[-1] for col in df.columns]

# Insert metadata columns at the front
metadata = {
    'Article ID': article_id,
    'Test Type': test_type,
    'Test Date': test_date,
    'Test Operator': test_operator,
    'Ambient Building Temp': building_temp,
    'Ambient Temp': ambient_temp
}

# Repeat metadata values for all rows
for key, value in reversed(metadata.items()):
    df.insert(0, key, value)

df.to_csv(csv_path, index=False)