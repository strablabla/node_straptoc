# Guide du Système d'Annotations avec PDF.js

## Vue d'ensemble

Le système d'annotations utilise maintenant **PDF.js** pour offrir un contrôle total sur l'affichage des PDFs et permettre des annotations précises qui suivent le contenu.

## Fonctionnalités

✅ **Annotations positionnelles** - Les markers restent collés au texte même lors du scroll
✅ **Support multi-pages** - Les annotations sont liées à des pages spécifiques
✅ **Markers cliquables** - Cliquez sur une étoile pour voir/éditer l'annotation
✅ **Zoom** - Contrôles de zoom intégrés (50% à 250%)
✅ **Navigation** - Naviguez facilement entre les pages
✅ **Sauvegarde YAML** - Toutes les annotations sont sauvegardées dans `static/annotations.yaml`

## Utilisation

### 1. Activer le mode annotation

Appuyez sur **Alt+A** pour activer le mode annotation. Une icône apparaîtra dans la barre de navigation.

### 2. Ouvrir un PDF avec le viewer PDF.js

#### Option A: En modal (popup)

```javascript
openPDFViewer('pdfs/mon-fichier.pdf');
```

#### Option B: Remplacer un object PDF existant

```javascript
// Trouve l'object PDF et le remplace par le viewer PDF.js
var pdfObject = $('object[type="application/pdf"]').first();
replacePDFObjectWithViewer('pdfs/mon-fichier.pdf', pdfObject);
```

### 3. Créer une annotation

1. **Double-cliquez** sur le PDF à l'endroit où vous voulez annoter
2. Un panneau blanc avec bordure rouge apparaît
3. Tapez votre annotation dans le **textarea jaune avec bordure bleue**
4. Cliquez sur **Save**

### 4. Voir/éditer une annotation

Cliquez sur une **étoile rouge** pour voir et éditer l'annotation correspondante.

### 5. Naviguer entre les pages

- Utilisez les boutons **◀ Previous** et **Next ▶**
- Ou tapez directement le numéro de page
- Les annotations s'affichent automatiquement sur la bonne page

## Structure des données

Les annotations sont sauvegardées avec:

```yaml
annotations:
  pdfs/mon-fichier.pdf:
    - id: ann-1234567890-123
      type: text
      content: "Mon annotation"
      location:
        x: 250
        y: 400
        width: 0
        height: 0
      page: 1  # Numéro de page
      timestamp: '2026-01-03T15:30:00.000Z'
      filePath: pdfs/mon-fichier.pdf
      fileType: pdf
      color: '#ffff00'
```

## API

### Fonctions globales disponibles

```javascript
// Ouvrir un PDF dans un modal
openPDFViewer(pdfPath, options);

// Options disponibles:
// - modalId: ID du modal (default: 'pdf-viewer-modal')
// - width: Largeur du modal (default: '95%')
// - height: Hauteur du modal (default: '90%')

// Remplacer un element par le viewer
replacePDFObjectWithViewer(pdfPath, $element);

// Naviguer vers une page spécifique
renderPage(pageNumber);

// Recharger les annotations de la page courante
reloadPDFAnnotations();
```

### État du viewer

```javascript
// Accéder à l'état du viewer PDF
window.PDFViewer = {
    pdfDoc: null,           // Document PDF chargé
    currentPage: 1,         // Page actuelle
    totalPages: 0,          // Nombre total de pages
    scale: 1.5,             // Niveau de zoom
    rendering: false,       // En cours de rendu?
    currentPdfPath: null    // Chemin du PDF actuel
};

// Accéder à l'état des annotations
window.annotationSystem = {
    active: false,          // Mode annotation actif?
    currentFile: null,      // Fichier actuel
    fileType: null,         // Type de fichier
    annotations: [],        // Liste des annotations
    currentAnnotation: null,// Annotation en cours d'édition
    pdfReady: false,        // PDF.js viewer prêt?
    currentPdfPage: 1       // Page actuelle
};
```

## Exemple complet

```javascript
// 1. Ouvrir un PDF
openPDFViewer('pdfs/Classical_and_Relativistic_Derivation_of_the_Sagnac_Effect.pdf');

// 2. Attendre que le PDF soit chargé
setTimeout(function() {

    // 3. Activer les annotations (ou utiliser Alt+A)
    if (window.toggleAnnotationMode) {
        toggleAnnotationMode();
    }

    // 4. Le système est prêt!
    // Double-cliquez pour créer des annotations

}, 1000);
```

## Raccourcis clavier

- **Alt+A** : Activer/désactiver le mode annotation
- **Shift+F** : Ouvrir la recherche globale

## Dépannage

### Les markers ne s'affichent pas

1. Vérifiez que le mode annotation est actif (Alt+A)
2. Vérifiez la console (F12) pour voir les logs
3. Assurez-vous que `window.PDFViewer` est défini

### Les annotations ne se sauvegardent pas

1. Vérifiez que le serveur Node.js tourne
2. Regardez les logs du serveur pour les erreurs
3. Vérifiez que `static/annotations.yaml` existe et est accessible

### Le PDF ne s'affiche pas

1. Vérifiez que le chemin du PDF est correct
2. Vérifiez la console pour les erreurs de chargement
3. Assurez-vous que PDF.js est bien chargé (`/static/pdfjs/build/`)

## Fichiers importants

- `views/plugins/pdfjs_viewer.html` - Viewer PDF.js personnalisé
- `views/plugins/annotations.html` - Système d'annotations
- `views/plugins/pdf_helper.html` - Fonctions helper
- `lib/annotations.js` - Gestion serveur des annotations
- `static/annotations.yaml` - Stockage des annotations
- `static/pdfjs/` - Bibliothèque PDF.js

## Limitations connues

- Les anciens PDFs dans des tags `<object>` ne supportent PAS les annotations positionnelles
- Pour utiliser les annotations, utilisez TOUJOURS le viewer PDF.js
- Les annotations sont liées aux pages, donc le renommage/déplacement de fichiers PDF peut casser les liens

## Prochaines améliorations possibles

- [ ] Support des annotations EPUB avec CFI
- [ ] Annotations avec surbrillance de texte
- [ ] Export des annotations en PDF
- [ ] Recherche dans les annotations
- [ ] Partage d'annotations entre utilisateurs
