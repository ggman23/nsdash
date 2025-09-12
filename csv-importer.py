#!/usr/bin/env python3
import csv
import json
from datetime import datetime
import os
import re

def parse_libreview_csv(csv_file_path):
    """Parse le CSV exporté de LibreView"""
    daily_averages = {}
    
    try:
        with open(csv_file_path, 'r', encoding='utf-8') as file:
            content = file.read()
            lines = content.split('\n')
            
            print(f"Fichier ouvert, {len(lines)} lignes trouvées")
            
            # Chercher les données de glucose
            data_lines = []
            for i, line in enumerate(lines):
                # Rechercher les lignes contenant des données glycémiques
                if re.search(r'\d{2}-\d{2}-\d{4}.*\d{2}:\d{2}.*\d+', line):
                    data_lines.append(line)
            
            print(f"Lignes de données détectées: {len(data_lines)}")
            
            if len(data_lines) < 10:
                # Essayer une autre méthode de détection
                print("Analyse alternative du CSV...")
                for i, line in enumerate(lines[:20]):
                    print(f"Ligne {i}: {line[:100]}...")
            
            daily_data = {}
            processed_count = 0
            
            for line in data_lines:
                try:
                    # Séparer par tabulation ou virgule
                    parts = line.split('\t') if '\t' in line else line.split(',')
                    
                    if len(parts) >= 3:
                        # Chercher date et glucose dans les parties
                        date_str = None
                        glucose_str = None
                        
                        for part in parts:
                            # Format date LibreView: DD-MM-YYYY HH:MM
                            if re.match(r'\d{2}-\d{2}-\d{4} \d{2}:\d{2}', part.strip()):
                                date_str = part.strip()
                            # Valeur glucose (nombre)
                            elif re.match(r'^\d{2,3}$', part.strip()):
                                glucose_str = part.strip()
                        
                        if date_str and glucose_str:
                            try:
                                date_obj = datetime.strptime(date_str, "%d-%m-%Y %H:%M")
                                date_key = date_obj.strftime("%Y-%m-%d")
                                glucose_value = float(glucose_str)
                                
                                if date_key not in daily_data:
                                    daily_data[date_key] = []
                                
                                daily_data[date_key].append(glucose_value)
                                processed_count += 1
                                
                            except ValueError:
                                continue
                        
                except Exception:
                    continue
            
            print(f"Points de données traités: {processed_count}")
            
            # Calculer moyennes quotidiennes
            for date_key, values in daily_data.items():
                if len(values) > 0:
                    average = round(sum(values) / len(values))
                    daily_averages[date_key] = average
            
            print(f"Moyennes calculées: {len(daily_averages)} jours")
            if daily_averages:
                print(f"Période: {min(daily_averages.keys())} à {max(daily_averages.keys())}")
                print(f"Exemples: {dict(list(daily_averages.items())[:5])}")
            
            return daily_averages
            
    except Exception as e:
        print(f"Erreur traitement CSV: {e}")
        return {}

def update_moydays_with_csv_data(daily_averages):
    """Met à jour moydays.html avec les données CSV"""
    moydays_file = '/var/www/nsdash/test/moydays.html'
    
    try:
        with open(moydays_file, 'r') as file:
            content = file.read()
        
        # Créer le JavaScript d'injection des données
        js_injection = f'''
    // Données CSV injectées
    const csvDailyAverages = {json.dumps(daily_averages)};
    
    // Fusionner avec les données existantes
    Object.keys(csvDailyAverages).forEach(date => {{
        if (!dailyAverages[date]) {{
            dailyAverages[date] = csvDailyAverages[date];
        }}
    }});
    
    console.log("Données CSV chargées:", Object.keys(csvDailyAverages).length, "jours");
'''
        
        # Injecter après la déclaration de dailyAverages
        insert_point = content.find('let dailyAverages = {};')
        if insert_point != -1:
            end_point = content.find('\n', insert_point)
            new_content = (content[:end_point] + 
                          js_injection + 
                          content[end_point:])
            
            with open(moydays_file, 'w') as file:
                file.write(new_content)
            
            print(f"moydays.html mis à jour avec {len(daily_averages)} jours d'historique")
            return True
        else:
            print("Point d'insertion non trouvé dans moydays.html")
            return False
            
    except Exception as e:
        print(f"Erreur mise à jour moydays.html: {e}")
        return False

# Exécution
if __name__ == "__main__":
    csv_file = "/srv/nsdash/glucose.csv"
    
    print(f"Traitement du fichier: {csv_file}")
    daily_data = parse_libreview_csv(csv_file)
    
    if daily_data:
        print(f"\nMoyennes quotidiennes calculées: {len(daily_data)} jours")
        update_moydays_with_csv_data(daily_data)
        print("\nImport terminé ! Rechargez moydays.html pour voir l'historique complet.")
    else:
        print("Aucune donnée trouvée ou erreur de parsing")
