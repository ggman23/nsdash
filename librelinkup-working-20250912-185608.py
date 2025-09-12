#!/usr/bin/env python3
"""
Script moderne LibreLinkUp utilisant PyLibreLinkUp
"""
from pylibrelinkup import PyLibreLinkUp
from pylibrelinkup.api_url import APIUrl
import json
from datetime import datetime

def test_librelinkup_connection():
    """Test de connexion LibreLinkUp moderne"""
    
    # Vos identifiants LibreLinkUp (follower)
    EMAIL = "isabelle.larde@gmail.com"
    PASSWORD = "Justine2511&&"
    
    try:
        print("Connexion LibreLinkUp avec PyLibreLinkUp...")
        
        # Utiliser la région France spécifique
        client = PyLibreLinkUp(email=EMAIL, password=PASSWORD, api_url=APIUrl.FR)
        
        # Authentification
        client.authenticate()
        print("Authentification LibreLinkUp réussie")
        
        # Récupération des patients (connexions)
        patients = client.get_patients()
        print(f"Patients trouvés: {len(patients)}")
        
        if patients:
            patient = patients[0]
            print(f"Patient trouvé: {patient}")
            print(f"Attributs du patient: {dir(patient)}")
            
            # Dernière mesure
            try:
                latest = client.latest(patient_identifier=patient)
                print(f"Dernière glycémie: {latest.value} mg/dL")
                print(f"Timestamp: {latest.timestamp}")
                print(f"Tendance: {latest.trend}")
                
                # Données graphique (12h)
                graph_data = client.graph(patient_identifier=patient)
                print(f"Données graphique: {len(graph_data)} points (12h)")
                
                # Dernières valeurs
                print("\n5 dernières valeurs:")
                for measurement in graph_data[-5:]:
                    print(f"  {measurement.timestamp}: {measurement.value} mg/dL")
                
                return True, {
                    'latest': latest,
                    'graph': graph_data,
                    'patient': patient
                }
            except Exception as e:
                print(f"Erreur récupération données: {e}")
                return False, None
        else:
            print("Aucun patient trouvé")
            return False, None
            
    except Exception as e:
        print(f"Erreur LibreLinkUp: {e}")
        return False, None

if __name__ == "__main__":
    print("=== Test PyLibreLinkUp pour NSdash ===")
    
    success, data = test_librelinkup_connection()
    
    if success:
        print("\nLibreLinkUp fonctionne parfaitement !")
        print("Données disponibles:")
        print(f"   - Dernière mesure temps réel")
        print(f"   - Graphique 12h avec {len(data['graph'])} points")
    else:
        print("\nÉchec du test LibreLinkUp")
