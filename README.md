# Application Cloud Run Connectée à PostgreSQL sur GCE

Ce projet est une application Node.js conçue pour être déployée sur Google Cloud Run et se connecter à une base de données PostgreSQL hébergée sur une VM Google Compute Engine.

## Prérequis

1.  **Google Cloud Project** actif.
2.  **VM Compute Engine** avec PostgreSQL installé et running.
3.  **Cloud Run** activé sur le projet.
4.  Optionnel mais recommandé : **Serverless VPC Access** configuré pour permettre à Cloud Run d'accéder à l'IP interne de la VM.

## Configuration Locale (Pour le développement)

1.  Installer les dépendances :
    ```bash
    npm install
    ```
2.  Créer un fichier `.env` à la racine avec vos identifiants (ne pas commiter ce fichier) :
    ```env
    DB_USER=votre_user
    DB_PASSWORD=votre_password
    DB_HOST=localhost # ou IP de la VM si tunnel SSH
    DB_NAME=votre_db
    DB_PORT=5432
    ```
3.  Lancer le serveur :
    ```bash
    npm run dev
    ```

## Déploiement sur Cloud Run

### 1. Construire l'image Docker

Remplacez `PROJECT_ID` par votre ID de projet GCP.

```bash
gcloud builds submit --tag gcr.io/PROJECT_ID/postgres-viewer
```

### 2. Déployer

Remplacez les valeurs de variables d'environnement par celles de votre VM.

**Option A : Via VPC Connector (Recommandé - IP Interne)**
Si vous avez configuré un connecteur VPC (ex: `my-vpc-connector`) :

```bash
gcloud run deploy postgres-viewer \
  --image gcr.io/PROJECT_ID/postgres-viewer \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --vpc-connector my-vpc-connector \
  --set-env-vars DB_HOST=10.x.x.x,DB_USER=postgres,DB_PASSWORD=secret,DB_NAME=postgres
```

**Option B : Via IP Publique (Moins sécurisé)**
Nécessite que PostgreSQL écoute sur `0.0.0.0` et que le firewall autorise les connexions entrantes (à restreindre autant que possible).

```bash
gcloud run deploy postgres-viewer \
  --image gcr.io/PROJECT_ID/postgres-viewer \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars DB_HOST=IP_PUBLIQUE_VM,DB_USER=postgres,DB_PASSWORD=secret,DB_NAME=postgres
```

## Dépannage

- **Erreur de connexion** : Vérifiez les règles de pare-feu (Firewall) sur GCE. Le port 5432 doit être accessible.
- **Accès refusé** : Vérifiez le fichier `pg_hba.conf` sur la VM PostgreSQL pour s'assurer qu'il accepte les connexions venant de l'extérieur (ou du range IP du VPC Connector).
