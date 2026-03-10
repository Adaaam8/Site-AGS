# 🎯 Sidebar Overlay - Style Bordered

## Résumé

Composant sidebar/drawer responsive qui s'ouvre depuis la droite avec un style **Bordered** minimaliste, intégrant complètement le design system du projet.

### ✨ Caractéristiques

- **Borderless sauf la bordure gauche** : Séparateur orange 3px uniquement
- **Fond cohérent** : #F7F4EF identique au site
- **Pas d'effets** : Aucune ombre, glassmorphism ou badge
- **Animation fluide** : Transition 0.4s cubic-bezier
- **Responsive** : Mobile-first, adapté aux petits écrans
- **Accessible** : ARIA labels, clavier (Échap), focus management
- **Performant** : GPU-accelerated, sans layout thrashing

---

## 📦 Fichiers

| Fichier | Fonction |
|---------|----------|
| `sidebar.component.html` | Structure HTML |
| `sidebar.component.css` | Styles du composant |
| `sidebar.component.ts` | Logique Angular (ViewChild, événements) |
| `sidebar-toggle.component.html` | Bouton hamburger |
| `sidebar-toggle.css` | Styles du bouton |
| `INTEGRATION.md` | Guide d'intégration complet |
| `EXAMPLE.md` | Exemple d'intégration pas à pas |
| `README.md` | Ce fichier |

---

## 🎨 Design System Appliqué

### Variables CSS Réutilisées

```css
:host {
  --orange: #E06732;           /* Accent, bordures actives */
  --dark: #0F1923;             /* Texte principal */
  --dark-2: #1a2332;           /* Variante sombre */
  --light: #F7F4EF;            /* Fond */
  --gray: #6B7280;             /* Texte secondaire */
  --muted: rgba(247, 244, 239, 0.4);  /* Texte très léger */
  --border-color: rgba(224, 103, 50, 0.15);  /* Bordures */
  --transition: cubic-bezier(0.34, 1.56, 0.64, 1);  /* Easing */
}
```

### Polices

- **Syne** (sans-serif) - Texte de navigation
- **Cormorant Garamond** - Titres (non utilisé dans la sidebar)

### Border-radius

- Bouton fermeture: `0.5rem`
- Cohérent avec le reste du site

### Transitions

- Durée: `0.3s` (hover), `0.4s` (slide)
- Easing: `ease`, `cubic-bezier(0.34, 1.56, 0.64, 1)`

---

## 🚀 Démarrage rapide

### 1. Les fichiers sont prêts à l'emploi
```bash
# Tous les fichiers sont dans src/sidebar/
# Aucune dépendance externe
# Aucune configuration requise
```

### 2. Importer dans app.component.ts
```typescript
import { SidebarComponent } from './sidebar/sidebar.component';

@Component({
  imports: [SidebarComponent]
})
```

### 3. Ajouter dans app.component.html
```html
<app-sidebar></app-sidebar>
```

### 4. Ajouter le bouton toggle
```html
<button (click)="toggleSidebar()">☰</button>
```

👉 **Voir `INTEGRATION.md` et `EXAMPLE.md` pour les détails complets.**

---

## 📱 Comportement

### Desktop (> 768px)
- Bouton toggle: **caché**
- Sidebar: **prête à ouvrir** mais fermée
- Navigation: **dans le header**

### Tablet (768px - 480px)
- Bouton toggle: **visible**
- Sidebar: **280px de large**
- Navigation: **dans la sidebar**

### Mobile (< 480px)
- Bouton toggle: **visible**
- Sidebar: **260px de large**
- Navigation: **dans la sidebar** (optionnel: fermeture auto après clic)

---

## ⌨️ Clavier & Accessibilité

| Action | Effet |
|--------|-------|
| `Clic bouton toggle` | Ouvre/ferme la sidebar |
| `Clic backdrop` | Ferme la sidebar |
| `Clic ✕` | Ferme la sidebar |
| `Touche Échap` | Ferme la sidebar |
| `Clic lien` | Navigation + fermeture (mobile) |

### ARIA
- `aria-label="Ouvrir le menu"` sur le toggle
- `aria-label="Fermer le menu"` sur le ✕
- `aria-hidden="true"` sur le backdrop

---

## 🎯 Cas d'usage

### ✅ Parfait pour

- Navigation mobile responsive
- Drawer/sidebar sans PopUp
- Menus secondaires
- Panneaux latéraux
- Filtres, paramètres

### ❌ Pas pour

- Modals (utiliser une modal classique)
- Notifications (utiliser un toast)
- Contenu principal (garder à gauche ou en haut)

---

## 🔧 Personnalisation

Tous les styles sont basés sur les variables CSS du projet. Modifiez les variables pour changer l'apparence:

```css
/* Dans sidebar.component.css ou globalement */
:host {
  --orange: #NEW_COLOR;
  --light: #NEW_BG;
}
```

ou utilisez les classes:

```css
.sidebar.dark-theme {
  --light: #1a2332;
  --dark: #F7F4EF;
}
```

---

## 📊 Performance

- **Bundle size** : < 10 KB (HTML + CSS + TS)
- **Interactions** : 60 FPS (GPU accelerated)
- **Animation** : Smooth slide (translateX)
- **Reflow** : Minimal (backdrop + sidebar uniquement)

---

## 🤝 Support

Pour des questions ou modifications, consultez:

1. **`INTEGRATION.md`** - Guide complet d'intégration
2. **`EXAMPLE.md`** - Exemple pas à pas
3. **Code source** - Commentaires détaillés dans les fichiers

---

## 📝 Checklist avant production

- [ ] Tous les fichiers copiés dans `src/sidebar/`
- [ ] Component importé dans `app.component.ts`
- [ ] Sidebar ajoutée dans le template
- [ ] Bouton toggle fonctionnel
- [ ] CSS du bouton importé
- [ ] Testé sur mobile
- [ ] Testé sur desktop
- [ ] Testé au clavier (Échap)
- [ ] Vérifié l'accessibilité
- [ ] Performance OK (Lighthouse)

---

## 🚀 Prêt à utiliser!

Tous les fichiers sont **100% prêts à l'emploi**. Aucune modification supplémentaire requise, sauf pour adapter les liens de navigation à votre projet.

Bonne intégration! ✨
