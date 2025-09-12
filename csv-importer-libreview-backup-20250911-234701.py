#!/usr/bin/env python3
import csv
import json
from datetime import datetime
import os

def parse_libreview_csv(csv_file_path):
    """Parse le CSV LibreView avec le bon format"""
    daily_averages = {}
    
    try:
        with open(csv_file_path, 'r', encoding='utf-8') as file:
            # Lire toutes les lignes
            lines = file.readlines()
            
            # Trouver la ligne d'en-tête (ligne 2)
            header_line = 1  # Index 1 = ligne 2
            headers = lines[header_line].strip().split(',')
            
            print(f"En-têtes détectés: {len(headers)} colonnes")
            
            # Trouver les indices des colonnes importantes
            date_col = headers.index('Horodatage de l\'appareil')
            glucose_col = headers.index('Numérisation de la glycémie mg/dL')
            
            print(f"Colonne date: {date_col}, Colonne glucose: {glucose_col}")
            
            daily_data = {}
            processed_count = 0
            
            # Traiter les données (à partir de la ligne 3)
            for line_num, line in enumerate(lines[2:], start=3):
                try:
                    parts = line.strip().split(',')
                    
                    if len(parts) > max(date_col, glucose_col):
                        date_str = parts[date_col].strip()
                        glucose_str = parts[glucose_col].strip()
                        
                        # Vérifier que nous avons une vraie valeur glucose
                        if glucose_str and glucose_str.isdigit():
                            try:
                                # Format date LibreView: DD-MM-YYYY HH:MM
                                date_obj = datetime.strptime(date_str, "%d-%m-%Y %H:%M")
                                date_key = date_obj.strftime("%Y-%m-%d")
                                glucose_value = float(glucose_str)
                                
                                if 50 <= glucose_value <= 500:  # Valeurs raisonnables
                                    if date_key not in daily_data:
                                        daily_data[date_key] = []
                                    
                                    daily_data[date_key].append(glucose_value)
                                    processed_count += 1
                                
                            except ValueError:
                                continue
                        
                except Exception as e:
                    continue
            
            print(f"Points de données traités: {processed_count}")
            
            # Calculer moyennes quotidiennes
            for date_key, values in daily_data.items():
                if len(values) > 0:
                    average = round(sum(values) / len(values))
                    daily_averages[date_key] = average
            
            print(f"Moyennes calculées: {len(daily_averages)} jours")
            if daily_averages:
                sorted_dates = sorted(daily_averages.keys())
                print(f"Période complète: {sorted_dates[0]} à {sorted_dates[-1]}")
                print(f"Exemples récents: {dict(list(sorted(daily_averages.items()))[-5:])}")
            
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
        
        # Injecter les données après la déclaration de dailyAverages
        js_injection = f'''
    // Données historiques CSV LibreView ({len(daily_averages)} jours)
    const csvDailyAverages = {json.dumps(daily_averages)};
    
    // Fusionner les données CSV avec les données Nightscout existantes
    Object.keys(csvDailyAverages).forEach(date => {{
        if (!dailyAverages[date]) {{
            dailyAverages[date] = csvDailyAverages[date];
        }}
    }});
    
    console.log("Historique CSV chargé:", Object.keys(csvDailyAverages).length, "jours");
    console.log("Données totales:", Object.keys(dailyAverages).length, "jours");
'''
        
        # Trouver le point d'insertion
        insert_point = content.find('let dailyAverages = {};')
        if insert_point != -1:
            end_point = content.find('\n', insert_point)
            new_content = (content[:end_point] + 
                          js_injection + 
                          content[end_point:])
            
            with open(moydays_file, 'w') as file:
                file.write(new_content)
            
            print(f"✅ moydays.html mis à jour avec {len(daily_averages)} jours d'historique LibreView")
            return True
        else:
            print("❌ Point d'insertion non trouvé dans moydays.html")
            return False
            
    except Exception as e:
        print(f"❌ Erreur mise à jour moydays.html: {e}")
        return False

# Exécution
if __name__ == "__main__":
    csv_file = "/srv/nsdash/glucose.csv"
    
    print(f"🔄 Traitement du fichier LibreView: {csv_file}")
    daily_data = parse_libreview_csv(csv_file)
    
    if daily_data:
        print(f"\n📊 Import réussi: {len(daily_data)} jours de moyennes quotidiennes")
        success = update_moydays_with_csv_data(daily_data)
        
        if success:
            print("\n🎉 Import terminé ! Rechargez moydays.html pour voir votre historique complet FreeStyle Libre.")
            print("📅 Votre calendrier devrait maintenant afficher des années de données !")
        else:
            print("\n❌ Erreur lors de la mise à jour de moydays.html")
    else:
        print("\n❌ Aucune donnée trouvée dans le CSV")
