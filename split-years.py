#!/usr/bin/env python3
import json
import re

# Lire les données depuis moydays.html
def extract_csv_data():
    with open('/var/www/nsdash/test/moydays.html', 'r') as f:
        content = f.read()
    
    # Extraire les données CSV
    match = re.search(r'const csvDailyAverages = ({.*?});', content, re.DOTALL)
    if match:
        return json.loads(match.group(1))
    return {}

# Filtrer par année et injecter
def update_year_file(year, data):
    filename = f'/var/www/nsdash/test/{year}.html'
    
    # Filtrer les données pour cette année
    year_data = {date: avg for date, avg in data.items() if date.startswith(str(year))}
    
    with open(filename, 'r') as f:
        content = f.read()
    
    # Remplacer les données
    js_injection = f'''
    const csvDailyAverages = {json.dumps(year_data)};
    Object.keys(csvDailyAverages).forEach(date => {{
        if (!dailyAverages[date]) {{
            dailyAverages[date] = csvDailyAverages[date];
        }}
    }});'''
    
    # Injecter
    insert_point = content.find('let dailyAverages = {};')
    if insert_point != -1:
        end_point = content.find('\n', insert_point)
        new_content = content[:end_point] + js_injection + content[end_point:]
        
        with open(filename, 'w') as f:
            f.write(new_content)
        
        print(f"Page {year}.html mise à jour avec {len(year_data)} jours")

# Exécution
data = extract_csv_data()
if data:
    for year in [2022, 2023, 2024]:
        update_year_file(year, data)
    print("Toutes les pages années créées avec succès")
