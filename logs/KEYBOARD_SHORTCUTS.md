# Raccourcis Clavier - Node Straptoc

Ce document liste tous les raccourcis clavier disponibles dans l'application Node Straptoc.

## 🎨 Éditeur de Color Tags (NOUVEAU)

### **Ctrl + C** - Ouvrir l'éditeur de color tags

Ouvre une fenêtre modale permettant de:
- Visualiser tous les color_tags définis dans `config.yaml`
- Modifier les couleurs intérieures (inside) et de titre (title) de chaque tag
- Ajouter de nouveaux tags personnalisés
- Supprimer des tags existants
- Sauvegarder les modifications directement dans `config.yaml`

**Utilisation:**
1. Appuyez sur **Ctrl + C** n'importe où dans l'application
2. La fenêtre modale s'ouvre avec tous vos color_tags
3. Modifiez les couleurs en utilisant:
   - Le sélecteur de couleur (color picker)
   - Le champ texte pour entrer un code hexadécimal (ex: `#ff0000`)
4. Ajoutez un nouveau tag en bas de la fenêtre
5. Cliquez sur **"💾 Sauvegarder les modifications"**
6. Fermez avec **Échap** ou le bouton ✕

**Caractéristiques:**
- Interface intuitive avec preview des couleurs
- Validation automatique des codes hexadécimaux
- Confirmation avant suppression d'un tag
- Synchronisation temps réel entre color picker et champ texte
- Feedback visuel lors de la sauvegarde

---

## ✏️ Éditeur de Texte

### **Alt + S** - Sauvegarder le texte

Sauvegarde le contenu actuel du textarea dans l'éditeur de texte.

**Fichier:** `views/struct/text.html`

---

## 💬 Chat (Tchat)

### **Entrée** - Soumettre le nom d'utilisateur

Lorsque vous entrez votre nom d'utilisateur dans le chat, appuyez sur Entrée pour valider.

**Fichier:** `views/basics/tchat.html`

### **Ctrl + Entrée** - Envoyer un message

Envoie le message tapé dans le textarea du chat.

**Combinaison:**
- Maintenez **Ctrl** enfoncée
- Appuyez sur **Entrée**

**Fichier:** `views/basics/tchat.html`

---

## ⌨️ Navigation Générale

### **Échap** - Fermer les fenêtres modales

Ferme la fenêtre modale actuellement ouverte (par exemple, l'éditeur de color tags).

---

## 📚 Raccourcis Disponibles (Non Utilisés)

L'application inclut la bibliothèque **keymaster.js** qui supporte de nombreux raccourcis clavier. Voici quelques suggestions pour de futurs raccourcis:

### Suggestions d'Implémentation Future:

| Raccourci | Action Suggérée |
|-----------|----------------|
| `Ctrl + N` | Créer une nouvelle note |
| `Ctrl + A` | Ouvrir l'agenda |
| `Ctrl + H` | Afficher/masquer l'aide |
| `Ctrl + /` | Basculer la table des matières |
| `Ctrl + D` | Ouvrir le mode dessin |
| `Ctrl + S` | Sauvegarder (global) |
| `Ctrl + E` | Ouvrir l'éditeur de manuscrit |
| `F1` | Aide contextuelle |

---

## 🔧 Configuration Avancée

### Ajouter Vos Propres Raccourcis

Les raccourcis clavier utilisent la bibliothèque **keymaster.js** ([lib/keymaster.js](lib/keymaster.js)).

**Syntaxe de base:**

```javascript
// Raccourci simple
key('ctrl+s', function() {
    // Votre action
    console.log('Ctrl+S appuyé!');
});

// Avec plusieurs modificateurs
key('ctrl+shift+d', function() {
    // Action avec Ctrl+Shift+D
});

// Empêcher le comportement par défaut
key('ctrl+p', function(e) {
    e.preventDefault();
    // Votre action (empêche l'impression)
    return false;
});
```

**Modificateurs supportés:**
- `ctrl` - Touche Contrôle
- `shift` - Touche Majuscule
- `alt` - Touche Alt
- `meta` / `cmd` - Touche Commande (Mac) / Windows

**Touches spéciales supportées:**
- Fonction: `f1` à `f19`
- Navigation: `home`, `end`, `pageup`, `pagedown`, `left`, `right`, `up`, `down`
- Contrôle: `backspace`, `tab`, `enter`, `return`, `esc`, `escape`, `space`, `del`, `delete`
- Symboles: `,`, `.`, `/`, `` ` ``, `-`, `=`, `;`, `'`, `[`, `]`, `\`

---

## 🎤 Commandes Vocales

En alternative aux raccourcis clavier, l'application supporte également les commandes vocales (français):

**Activation:**
- **"écoute mammouth"** - Active la reconnaissance vocale
- **"arrête ton char"** - Désactive la reconnaissance vocale

**Commandes disponibles:**
- Table des matières
- Notes
- Agenda
- Dessin
- Configuration
- Aide

**Fichier:** `scripts/voice.js`

---

## 📝 Notes Techniques

### Bibliothèques Utilisées

1. **keymaster.js** - Gestion des raccourcis clavier
   - Chemin: `lib/keymaster.js`
   - Documentation: Supporte la détection de combinaisons complexes
   - Scopes: Permet différents comportements selon le contexte

2. **jQuery** - Event handling pour les interactions
   - Utilisé pour les événements `keydown`, `keyup`, `keypress`

3. **Socket.io** - Communication temps réel
   - Les actions déclenchées par raccourcis peuvent communiquer avec le serveur

### Fichiers Concernés

- **Frontend:**
  - `views/basics/color_tags_editor.html` - Éditeur de color tags (Ctrl+C)
  - `views/struct/text.html` - Éditeur de texte (Alt+S)
  - `views/basics/tchat.html` - Chat (Entrée, Ctrl+Entrée)
  - `lib/keymaster.js` - Bibliothèque de raccourcis

- **Backend:**
  - `static/js/config.js` - Endpoints pour color_tags
  - `html_app.js` - Serveur principal

---

## 🐛 Dépannage

### Le raccourci ne fonctionne pas

1. Vérifiez que `lib/keymaster.js` est bien chargé
2. Vérifiez la console JavaScript pour les erreurs
3. Certains raccourcis peuvent être interceptés par le navigateur
4. Utilisez `e.preventDefault()` pour empêcher le comportement par défaut

### Conflit avec les raccourcis du navigateur

Certains raccourcis sont réservés par le navigateur:
- `Ctrl + S` - Sauvegarder la page
- `Ctrl + P` - Imprimer
- `Ctrl + W` - Fermer l'onglet
- `Ctrl + T` - Nouvel onglet

Utilisez `preventDefault()` si vous voulez les surcharger.

### L'éditeur de color tags ne s'ouvre pas

1. Vérifiez que le fichier `views/basics/color_tags_editor.html` est bien inclus dans `base.html`
2. Vérifiez la console pour les erreurs JavaScript
3. Assurez-vous que Socket.io est connecté
4. Vérifiez que `config.yaml` existe et est accessible

---

## 📖 Ressources

- [Keymaster.js Documentation](https://github.com/madrobby/keymaster)
- [MDN - KeyboardEvent](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent)
- [Socket.io Documentation](https://socket.io/docs/)

---

## 🎯 Roadmap

Fonctionnalités futures potentielles:

- [ ] Personnalisation complète des raccourcis dans l'interface
- [ ] Export/Import des configurations de raccourcis
- [ ] Aide contextuelle avec liste des raccourcis disponibles (F1)
- [ ] Mode sans souris avec navigation complète au clavier
- [ ] Enregistrement de macros (séquences de raccourcis)

---

**Dernière mise à jour:** 2026-01-01
