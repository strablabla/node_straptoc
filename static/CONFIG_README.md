# Configuration centralisée

## Fichier principal : `config.yaml`

Tous les paramètres de configuration ont été regroupés dans un seul fichier YAML pour faciliter la maintenance.

### Structure du fichier

```yaml
# Adresses et chemins statiques
addresses:
  - "chemin/vers/dossier"
  - path: "chemin/parent"
    subdirs:
      - "sous-dossier-1"
      - "sous-dossier-2"

# Tags de couleur pour l'interface
color_tags:
  nom_tag:
    inside:
      color: "#hexcolor"
    title:
      color: "#hexcolor"

# Vocabulaire pour les commandes vocales
vocabulaire:
  "#Catégorie_":
    - "Item 1"
    - "Item 2"

# Chemin vers les sous-titres
subtitles_path: "chemin/vers/subtitles"

# Configuration de l'interface
config:
  page:
    tag:
      propriété: "valeur"
```

## Fichiers migrés

Les anciens fichiers ont été consolidés dans `config.yaml` :

| Ancien fichier | Section dans config.yaml |
|----------------|--------------------------|
| `addr.yaml` | `addresses` |
| `color_tags.json` | `color_tags` |
| `comm_voc.json` | `vocabulaire` |
| `subtit.json` | `subtitles_path` |
| `config.json` | `config` |

Les anciens fichiers ont été sauvegardés avec l'extension `.old` et peuvent être supprimés une fois que tout fonctionne correctement.

## Fichiers modifiés

Les fichiers JavaScript suivants ont été mis à jour pour charger depuis `config.yaml` :

- `js/init.js` : Charge addresses, color_tags, vocabulaire, config
- `js/config.js` : Lit et écrit la section config
- `js/make_subtit.js` : Charge le chemin des sous-titres

## Avantages

✅ **Source unique** : Une seule configuration à maintenir
✅ **Organisation** : Structure claire avec sections commentées
✅ **Lisibilité** : Format YAML plus facile à lire que JSON
✅ **Versioning** : Plus facile à suivre dans git
✅ **Maintenance** : Modifications centralisées

## Utilisation

Le fichier est automatiquement chargé au démarrage de l'application. Les modifications sont sauvegardées automatiquement lorsque vous changez les paramètres via l'interface.
