import re
import json
import os
import tkinter as tk
from tkinter import filedialog

def parse_lrc_file(lrc_path):
    entries = []
    with open(lrc_path, 'r', encoding='utf-8') as file:
        for line in file:
            timestamps = re.findall(r'\[(\d{2}:\d{2}\.\d{2})\]', line)
            parts = re.split(r'\[\d{2}:\d{2}\.\d{2}\]', line)
            lyrics = [part.strip() for part in parts[1:]]

            for i, timestamp in enumerate(timestamps):
                lyric = lyrics[i] if i < len(lyrics) else ""
                entries.append({"time": timestamp, "lyric": lyric})
    return entries

def convert_all_lrc_in_folder(folder_path):
    lrc_files = [f for f in os.listdir(folder_path) if f.lower().endswith('.lrc')]

    if not lrc_files:
        print("⚠️ No .lrc files found in the selected folder.")
        return

    for lrc_file in lrc_files:
        full_path = os.path.join(folder_path, lrc_file)
        entries = parse_lrc_file(full_path)

        json_filename = os.path.splitext(lrc_file)[0] + '.json'
        json_path = os.path.join(folder_path, json_filename)

        with open(json_path, 'w', encoding='utf-8') as json_file:
            json.dump(entries, json_file, ensure_ascii=False, indent=2)

        print(f"✅ Converted {lrc_file} → {json_filename}")

def choose_folder_and_convert():
    root = tk.Tk()
    root.withdraw()  # Hide the main window
    folder_selected = filedialog.askdirectory(title="Select Folder with .lrc Files")

    if folder_selected:
        print(f"📁 Selected folder: {folder_selected}")
        convert_all_lrc_in_folder(folder_selected)
    else:
        print("❌ No folder selected.")

# Run the script
if __name__ == "__main__":
    choose_folder_and_convert()
