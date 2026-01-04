# Corrections du Système d'Annotations PDF
**Date**: 2026-01-04

## Problèmes Résolus

### 1. Boucle Infinie de Reloads
**Symptôme**: La page se rechargeait en boucle indéfiniment, rendant impossible l'utilisation des annotations.

**Cause**: Dans `reloadPDFAnnotations()`, le code vérifiait si `annotations.length === 0`. Si vrai, il demandait les annotations au serveur. Le serveur répondait avec un tableau vide `[]`, ce qui déclenchait à nouveau `reloadPDFAnnotations()` → boucle infinie.

**Solution** ([annotations.html:485](../views/plugins/annotations.html#L485), [annotations.html:1040](../views/plugins/annotations.html#L1040)):
- Ajout d'un flag `annotationsLoaded` pour distinguer "pas encore chargé" de "chargé mais vide"
- Le flag est mis à `true` quand les annotations sont reçues du serveur (même si le tableau est vide)
- Le flag est remis à `false` quand le fichier change
- `reloadPDFAnnotations()` vérifie maintenant le flag au lieu de la longueur du tableau

**Fichiers modifiés**:
- [views/plugins/annotations.html](../views/plugins/annotations.html)
  - Ligne 485: Set flag à true quand annotations chargées
  - Lignes 253-320: Reset flag quand fichier change dans `detectCurrentFile()`
  - Ligne 1040: Vérification du flag au lieu de `length === 0`
- [views/basics/pdf_annotations_button.html](../views/basics/pdf_annotations_button.html#L41-L43)
  - Reset flag quand PDF ouvert
- [views/plugins/pdf_helper.html](../views/plugins/pdf_helper.html#L52)
  - Reset flag quand modal fermé

---

### 2. Position Y Incorrecte du Panneau d'Annotation
**Symptôme**: Le panneau d'annotation apparaissait de plus en plus loin du point de clic, l'écart augmentant proportionnellement à la hauteur du clic dans la page.

**Cause**:
- Double problème de handlers :
  1. Le handler PDF.js détectait une sélection de texte (créée par le double-clic) et retournait sans créer d'annotation
  2. L'ancien handler général se déclenchait alors et créait l'annotation avec des coordonnées canvas-relative incorrectes
- Le canvas PDF pouvait avoir un `rect.top` négatif (quand scrollé), rendant les calculs `rect.top + y` incorrects

**Solution** ([annotations.html:1087-1100](../views/plugins/annotations.html#L1087-L1100)):

1. **Stopper la propagation immédiatement**:
   ```javascript
   // Déplacé preventDefault/stopPropagation AVANT la vérification de sélection
   e.preventDefault();
   e.stopPropagation();
   ```

2. **Effacer la sélection de texte**:
   ```javascript
   // Clear any text selection created by the double-click
   if (window.getSelection) {
       window.getSelection().removeAllRanges();
   }
   ```

3. **Utiliser des coordonnées viewport absolues**:
   ```javascript
   var location = {
       x: canvasX,  // Pour stocker la position sur le canvas
       y: canvasY,
       // ...
       viewportX: e.clientX,  // Pour positionner le panneau
       viewportY: e.clientY
   };
   ```

4. **Positionnement direct** ([annotations.html:723-730](../views/plugins/annotations.html#L723-L730)):
   ```javascript
   if (isViewportCoords) {
       screenX = x;  // Utilisation directe, pas de conversion
       screenY = y;
   }
   ```

**Résultat**: Le panneau apparaît maintenant exactement où l'utilisateur clique, quelle que soit la position de scroll du PDF.

---

### 3. Position X Incorrecte (Résolu automatiquement)
**Symptôme initial**: Position X incorrecte du panneau.

**Résolution**: Résolu automatiquement par la correction du problème 2. L'utilisation de coordonnées viewport (`e.clientX`) au lieu de coordonnées canvas-relative a corrigé simultanément les positions X et Y.

**Logs de validation**:
```
Test 1 (gauche): clientX: 56 → leftPos: 66 ✅
Test 2 (droite): clientX: 754 → leftPos: 444 (ajusté pour rester à l'écran) ✅
```

---

## Logs de Debug Ajoutés

Pour faciliter le diagnostic futur, des logs détaillés ont été ajoutés ([annotations.html:773-806](../views/plugins/annotations.html#L773-L806)):

```javascript
console.log('BEFORE X adjustment: leftPos =', leftPos, 'screenX =', screenX, 'windowWidth =', windowWidth);
console.log('AFTER X adjustment: leftPos =', leftPos);
console.log('BEFORE Y adjustment: topPos =', topPos, 'screenY =', screenY);
console.log('AFTER adjustment: topPos =', topPos);
console.log('Final panel position: left=', leftPos, 'top=', topPos);
```

---

## Architecture du Système

### Flux de Création d'Annotation

1. **Double-click sur PDF** → Handler `setupPDFJSAnnotationHandlers()`
2. **Capture des coordonnées**:
   - `canvasX, canvasY`: Position relative au canvas PDF (pour stockage)
   - `viewportX, viewportY`: Position relative au viewport (pour affichage du panneau)
3. **Création de l'annotation** → `createNewAnnotation(location)`
4. **Affichage du panneau** → `showAnnotationPanel(viewportX, viewportY, title, true)`
5. **Positionnement intelligent**:
   - Si le panneau sortirait à droite → placer à gauche du clic
   - Si le panneau sortirait en bas → remonter
   - Si le panneau sortirait en haut → descendre à 10px

### Système de Coordonnées

- **Canvas-relative** (`x, y`): Position sur le canvas PDF, utilisée pour stocker l'annotation dans YAML
- **Viewport-relative** (`viewportX, viewportY`): Position relative au viewport du navigateur, utilisée pour positionner le panneau `position: fixed`

---

## Fichiers Principaux

- [views/plugins/annotations.html](../views/plugins/annotations.html): Système d'annotations complet (1072 lignes)
- [views/plugins/pdfjs_viewer.html](../views/plugins/pdfjs_viewer.html): Viewer PDF.js
- [lib/annotations.js](../lib/annotations.js): Backend Node.js pour gérer les annotations
- [static/annotations.yaml](../static/annotations.yaml): Stockage des annotations

---

## Tests de Validation

✅ Reload infini: Corrigé
✅ Position Y: Parfaite à tous les niveaux de scroll
✅ Position X: Parfaite avec ajustement intelligent pour rester à l'écran
✅ Double-click sur texte: Fonctionne (sélection effacée automatiquement)
✅ Plusieurs PDFs: Chaque PDF garde ses propres annotations

---

## Notes Techniques

- Le panneau utilise `position: fixed` donc il est positionné relativement au viewport
- Le PDF modal utilise aussi `position: fixed`
- Le conteneur `#pdfjs-viewer-content` a `overflow: auto` donc peut scroller
- Les coordonnées `e.clientX/clientY` sont toujours relatives au viewport, parfaites pour `position: fixed`
- Le système fonctionne quel que soit l'état de scroll du PDF ou de la page principale
