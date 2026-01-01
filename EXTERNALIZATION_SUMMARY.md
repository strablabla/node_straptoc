# Résumé de l'Externalisation des Configurations

## Vue d'ensemble

Ce document résume les modifications apportées pour externaliser les paramètres utilisateur afin qu'ils ne soient plus écrasés par `git pull`.

## Problème résolu

Avant ces modifications:
- Les configurations utilisateur (chemins de fichiers, agenda, notes) étaient suivies par git
- Un `git pull` pouvait écraser vos paramètres personnels
- Les clés privées SSL pouvaient être accidentellement commitées (risque de sécurité)
- Les données personnelles (agenda, notes) risquaient d'être partagées

## Solution implémentée

### 1. Fichiers Template (.example)

Création de fichiers template pour toutes les configurations utilisateur:

| Fichier Template | Fichier Utilisateur | Description |
|-----------------|-------------------|-------------|
| `static/config.yaml.example` | `static/config.yaml` | Configuration principale (chemins, tags, vocabulaire, **serveur**) |
| `static/agenda.yaml.example` | `static/agenda.yaml` | Agenda personnel |
| `static/notes.json.example` | `static/notes.json` | Notes personnelles |
| `static/pages.json.example` | `static/pages.json` | Liste des pages |
| `static/drawing_state.json.example` | `static/drawing_state.json` | Préférences de dessin |

### 2. Paramètres du serveur externalisés

Le fichier `config.yaml` contient maintenant une section **server**:

```yaml
server:
  port: 3001           # Port HTTPS du serveur
  host: "0.0.0.0"      # Interface d'écoute
  ssl:
    key: "key.pem"     # Clé privée SSL
    cert: "server.crt" # Certificat SSL
```

**Avantages**:
- Changer le port sans modifier le code
- Basculer entre localhost (`127.0.0.1`) et accès réseau (`0.0.0.0`)
- Configurer les chemins des certificats SSL

### 3. Modifications du code

**Fichier modifié**: `html_app.js`

**Changements**:
1. Ajout de `js-yaml` pour lire la configuration
2. Chargement de `static/config.yaml` au démarrage
3. Extraction des paramètres serveur (port, host, ssl)
4. Valeurs par défaut si la configuration n'est pas disponible
5. Affichage du port et de l'hôte au démarrage

**Code ajouté** (lignes 24-54):
```javascript
// Load server configuration from config.yaml
const configPath = './static/config.yaml';
let serverConfig = {
  port: 3001,
  host: '0.0.0.0',
  ssl: {
    key: 'key.pem',
    cert: 'server.crt'
  }
};

try {
  const configFile = fs.readFileSync(configPath, 'utf8');
  const fullConfig = yaml.load(configFile);
  if (fullConfig.server) {
    serverConfig = {
      port: fullConfig.server.port || 3001,
      host: fullConfig.server.host || '0.0.0.0',
      ssl: {
        key: (fullConfig.server.ssl && fullConfig.server.ssl.key) || 'key.pem',
        cert: (fullConfig.server.ssl && fullConfig.server.ssl.cert) || 'server.crt'
      }
    };
  }
  console.log('Server configuration loaded from config.yaml');
} catch (err) {
  console.warn('Warning: Could not load server config from config.yaml, using defaults');
  console.warn('Error:', err.message);
}
```

### 4. .gitignore mis à jour

Ajout de tous les fichiers utilisateur dans `.gitignore`:

```gitignore
# User-specific configuration files
static/config.yaml
static/agenda.yaml
static/notes.json
static/pages.json
static/drawing_state.json
static/latex_voc.json
static/addr_saved.json

# User database
static/js/strap_database.db
*.db

# SSL certificates and private keys
*.pem
*.crt
*.key

# Saved content
views/saved/
```

### 5. Documentation

Création de deux guides:
- **SETUP.md**: Guide complet de configuration initiale
- **EXTERNALIZATION_SUMMARY.md**: Ce document (résumé technique)

## Utilisation

### Pour les nouveaux utilisateurs

```bash
# 1. Cloner le dépôt
git clone https://github.com/strablabla/node_straptoc.git
cd node_straptoc

# 2. Installer les dépendances
npm install

# 3. Copier les templates
cd static/
cp config.yaml.example config.yaml
cp agenda.yaml.example agenda.yaml
cp notes.json.example notes.json
cp pages.json.example pages.json
cp drawing_state.json.example drawing_state.json

# 4. Éditer config.yaml avec vos chemins
nano config.yaml

# 5. Générer les certificats SSL
cd ..
openssl genrsa -out key.pem 2048
openssl req -new -key key.pem -out csr.pem
openssl x509 -req -days 365 -in csr.pem -signkey key.pem -out server.crt

# 6. Lancer le serveur
node html_app.js
```

### Pour les utilisateurs existants

Si vous avez déjà des fichiers de configuration:

```bash
# 1. Vos fichiers sont déjà créés, git ne les suivra plus
git pull  # Récupère les nouvelles fonctionnalités sans écraser vos configs

# 2. Si git suit encore vos fichiers personnels, les retirer:
git rm --cached static/config.yaml static/agenda.yaml static/notes.json
git rm --cached static/pages.json static/drawing_state.json
git rm --cached *.pem *.crt
git commit -m "Remove user-specific files from git tracking"
```

### Changer le port du serveur

Éditez `static/config.yaml`:

```yaml
server:
  port: 8080           # Au lieu de 3001
  host: "127.0.0.1"    # Localhost uniquement
```

Redémarrez le serveur:
```bash
node html_app.js
# Sortie: Server running at https://127.0.0.1:8080/
#         Port: 8080 | Host: 127.0.0.1
```

## Sécurité

### Fichiers critiques JAMAIS à commiter:

- `*.pem` - Clés privées
- `*.crt` - Certificats SSL
- `*.db` - Bases de données avec données utilisateur
- `static/config.yaml` - Contient les chemins personnels
- `static/agenda.yaml` - Agenda personnel
- `static/notes.json` - Notes personnelles

Le `.gitignore` mis à jour empêche cela automatiquement.

### Vérification avant commit:

```bash
git status
# Ne devrait PAS afficher de fichiers *.pem, *.crt, *.db, ou config.yaml
```

## Avantages

### ✅ Mises à jour sans conflits
- `git pull` met à jour le code sans toucher à vos configurations
- Les templates (`.example`) sont mis à jour, pas vos fichiers personnels

### ✅ Confidentialité
- Vos données personnelles restent locales
- Pas de risque de commit accidentel d'informations privées

### ✅ Flexibilité
- Changer le port sans modifier le code
- Configurations différentes par environnement (dev/prod)
- Partager le code sans partager vos données

### ✅ Sécurité
- Clés SSL jamais commitées
- Base de données personnelle protégée
- Conformité aux bonnes pratiques de sécurité

## Migration des anciennes installations

Si vous migrez depuis une version antérieure:

1. **Sauvegarder** vos configurations actuelles
2. **Retirer** du suivi git: `git rm --cached <fichier>`
3. **Ajouter** la section `server` à votre `config.yaml`
4. **Tester** le démarrage du serveur

## Compatibilité descendante

Le code inclut des valeurs par défaut pour garantir la compatibilité:

- Si `config.yaml` n'existe pas → utilise les valeurs par défaut
- Si la section `server` est absente → port 3001, host 0.0.0.0
- Si un paramètre est manquant → utilise la valeur par défaut correspondante

Le serveur démarrera toujours, même sans fichier de configuration.

## Tests

### Test de démarrage

```bash
node html_app.js
```

**Sortie attendue**:
```
Server configuration loaded from config.yaml
...
Server running at https://0.0.0.0:3001/
Port: 3001 | Host: 0.0.0.0
```

### Test de changement de port

Modifiez `config.yaml`:
```yaml
server:
  port: 8443
```

Redémarrez:
```bash
node html_app.js
```

**Sortie attendue**:
```
Server running at https://0.0.0.0:8443/
Port: 8443 | Host: 0.0.0.0
```

## Conclusion

L'externalisation complète des paramètres utilisateur permet:
- Une séparation claire entre code et configuration
- Des mises à jour git sans conflits
- Une meilleure sécurité des données sensibles
- Une flexibilité de configuration accrue

Les utilisateurs peuvent désormais personnaliser leur installation sans craindre de perdre leurs paramètres lors des mises à jour.
