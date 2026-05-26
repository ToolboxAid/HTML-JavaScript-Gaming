import plistlib
import csv
import os

# Define file paths
xml_file = 'iTunes Music Library.xml'
csv_file = 'itunes_tracks.csv'

# Check if the XML file exists in the folder
if not os.path.exists(xml_file):
    print(f"Error: Could not find '{xml_file}' in this folder.")
    exit()

print("Reading iTunes library file...")

# Load and parse the Apple Property List (.plist) file safely
with open(xml_file, 'rb') as f:
    plist_data = plistlib.load(f)

# Extract the tracks dictionary
tracks = plist_data.get('Tracks', {})

# Open the CSV file for writing
with open(csv_file, 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow(['Artist', 'Song Name'])  # Headers

    # Loop through each individual track record
    for track_id, track_info in tracks.items():
        artist = track_info.get('Artist', 'Unknown Artist')
        song_name = track_info.get('Name', 'Unknown Song')
        
        writer.writerow([artist, song_name])

print(f"Success! Processed {len(tracks)} tracks.")
print(f"Your file is saved at: {os.path.abspath(csv_file)}")
