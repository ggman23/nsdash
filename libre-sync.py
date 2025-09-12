#!/usr/bin/env python3
import requests
import json
from datetime import datetime, timedelta
import os

# Configuration
EMAIL = "isabelle.larde@gmail.com"
PASSWORD = "Justine2511&&"
REGION = "EU"  # ou "US" selon votre région

# URLs LibreView selon la région
URLS = {
    "EU": "https://api-eu.libreview.io",
    "US": "https://api-us.libreview.io"
}

def connect_librelinkup():
    """Se connecter à LibreLinkUp"""
    url = f"{URLS[REGION]}/lsl/api/nisperson/getauthenticateduser"    
    headers = {
        'Content-Type': 'application/json',
    'User-Agent': 'FreeStyle LibreLink/2.8.2 (iPhone; iOS 15.0; Build:5)',
    'Accept': 'application/json',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate',
    'Connection': 'keep-alive'
    }
    
    data = {
        "email": EMAIL,
        "password": PASSWORD
    }
    
    try:
        response = requests.post(url, json=data, headers=headers)
        print(f"Status de connexion: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            if result['status'] == 0:
                print("✅ Connexion LibreView réussie")
                return result['data']['authTicket']['token']
            else:
                print("❌ Erreur d'authentification")
                return None
        else:
            print(f"❌ Erreur HTTP: {response.status_code}")
            return None
            
    except Exception as e:
        print(f"❌ Erreur de connexion: {e}")
        return None

def get_connections(token):
    """Récupérer les connexions LibreLinkUp"""
    url = f"{URLS[REGION]}/lsl/api/nisperson/getconnections"    
    headers = {
        'Authorization': f'Bearer {token}',
        'User-Agent': 'LibreLinkUp/4.7.0'
    }
    
    try:
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            if data['status'] == 0 and data['data']:
                print(f"✅ Données récupérées pour {len(data['data'])} connexion(s)")
                return data['data']
            else:
                print("❌ Aucune donnée disponible")
                return None
        else:
            print(f"❌ Erreur récupération données: {response.status_code}")
            return None
            
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return None

# Test de connexion
print("🔄 Test de connexion LibreView...")
token = connect_librelinkup()
if token:
    print("🔄 Récupération des données...")
    connections = get_connections(token)
    if glucose_data:
        # Afficher un résumé des données
        for connection in glucose_data:
            print(f"\n📊 Capteur: {connection.get('firstName', 'Inconnu')}")
            
            if 'glucoseMeasurement' in connection:
                measurement = connection['glucoseMeasurement']
                print(f"Dernière mesure: {measurement.get('Value', 'N/A')} mg/dL")
                print(f"Timestamp: {measurement.get('Timestamp', 'N/A')}")
            
            if 'graphData' in connection:
                graph_data = connection['graphData']
                print(f"Données graphique: {len(graph_data)} points")
                
                # Afficher les 5 dernières valeurs
                print("5 dernières valeurs:")
                for i, point in enumerate(graph_data[-5:]):
                    timestamp = datetime.fromtimestamp(point['Timestamp']/1000)
                    print(f"  {timestamp}: {point['Value']} mg/dL")
    else:
        print("❌ Impossible de récupérer les données")
else:
    print("❌ Échec de la connexion")
