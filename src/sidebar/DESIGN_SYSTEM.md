# 🎨 Design System Analysé

## Analyse complète des fichiers CSS du projet

### 📍 Fichiers CSS analysés
- `src/styles.css` (global)
- `src/app.component.css` (app header)
- `src/services/services.component.css` (services)
- `src/contact/contact.component.css` (contact)
- `src/hero/hero.component.css` (hero)

---

## 🎯 Couleurs

### Variables principales

| Nom | Valeur | Usage |
|-----|--------|-------|
| `--orange` | `#E06732` | Accents, hover, bordures actives |
| `--orange-light` | `rgba(224, 103, 50, 0.1)` | Backgrounds légers |
| `--orange-dim` | `rgba(224, 103, 50, 0.15)` | Bordures subtiles |
| `--dark` | `#0F1923` | Texte principal, fonds sombres |
| `--dark-2` | `#1a2332` | Variation sombre |
| `--light` | `#F7F4EF` | Fond clair/crème |
| `--gray` | `#6B7280` | Texte secondaire |
| `--muted` | `rgba(247, 244, 239, 0.4)` | Texte très léger |
| `--border-color` | `rgba(224, 103, 50, 0.15)` | Bordures |

### Autres couleurs utilisées
- `#1a1a1a` - Texte sur fond clair (header dark)
- `rgba(255, 255, 255, 0.08)` - Fond header semi-transparent
- `rgba(255, 255, 255, 0.95)` - Fond header clair

### Palette résumée

```
Primaire:     #E06732 (Orange)
Sombre:       #0F1923 (Navy)
Clair:        #F7F4EF (Crème/Beige)
Gris:         #6B7280 (Gris moyen)
Transparent:  rgba(224, 103, 50, 0.1) à 0.15
```

---

## 📝 Typographie

### Polices importées
```css
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,600&family=Syne:wght@400;500;600;700;800&display=swap');
```

### Familles de polices

| Nom | Type | Usage |
|-----|------|-------|
| **Cormorant Garamond** | Serif élégante | Titres, h1-h6, grands textes |
| **Syne** | Sans-serif moderne | Texte courant, UI, navigation |

### Poids de polices

#### Cormorant Garamond
- 300 (light) - Titres élancés
- 400 (normal) - Texte courant
- 600 (semibold) - Accents

#### Syne
- 400 (normal) - Texte courant
- 500 (medium) - Texte important
- 600 (semibold) - Labels, boutons
- 700 (bold) - Titres navigation
- 800 (extrabold) - Accents forts

### Tailles courantes

| Taille | Classe/Usage |
|--------|--------------|
| `0.6rem` | Labels, petits textes |
| `0.65rem` | Labels décoratifs |
| `0.85rem` | Texte menu secondaire |
| `0.9rem` - `0.95rem` | Texte navigation |
| `1rem` | Texte courant |
| `1.8rem` | Titres cartes |
| `2rem` à `3rem` | Sous-titres |
| `6rem` | Grands titres |

### Line-height courants

| Valeur | Usage |
|--------|-------|
| `1` | Titres compacts |
| `1.05` | Grands titres |
| `1.1` | Titres |
| `1.4` | Listes, petit texte |
| `1.6` - `1.7` | Texte courant |
| `1.8` | Texte relaxé |

---

## 📐 Espacements

### Padding courants
- `0.35rem` - Très petit
- `0.75rem` à `1rem` - Petit
- `1.5rem` à `2rem` - Moyen
- `2.5rem` - Grand
- `3rem` à `4rem` - Très grand
- `6rem` - Section padding

### Gaps (flexbox)
- `0.25rem` - Très serré
- `0.5rem` - Serré
- `0.75rem` - Normal
- `1rem` - Confortable
- `1.5rem` - Large
- `2rem` - Très large
- `3rem` - Section spacing
- `8rem` - Grid large

### Margins courants
- `0.5rem` - Petit espacement
- `0.75rem` - Normal
- `1.5rem` - Moyen
- `2rem` - Grand

---

## 🎨 Border-radius

### Valeurs utilisées

| Valeur | Usage |
|--------|-------|
| `0.25rem` - `0.5rem` | Petits éléments |
| `1rem` | Bordures standard |
| `1.5rem` à `2rem` | Cartes, sections |
| `20px` à `24px` | Composants UI |
| `9999px` | Pills, éléments arrondis |

### Pas de border-radius cohérent
Le projet utilise des valeurs variées selon le contexte (1rem, 2rem, 20px, 24px, 9999px).

---

## ⏱️ Transitions & Animations

### Durées courantes
- `0.15s` - Micro-animation
- `0.3s` - Hover/focus
- `0.35s` - Transition UI
- `0.4s` - Modal/slide
- `0.5s` - Animation visible
- `0.7s` - Animation longue

### Easing functions

| Nom | Valeur | Usage |
|-----|--------|-------|
| `ease` | Défaut | Interactions normales |
| `ease-in` | Accélération | Sorties |
| `ease-out` | Décélération | Entrées |
| `ease-in-out` | Les deux | Transitions douces |
| `cubic-bezier(0.34, 1.56, 0.64, 1)` | Spring | Pop-in, scale animations |

### Animations clés du projet

```css
/* Fade */
@keyframes fadeIn { /* 0.3s - 0.4s */ }
@keyframes fadeOut { /* 0.5s */ }
@keyframes fadeUp { /* 0.5s - 0.7s */ }

/* Slide */
@keyframes slideUp { /* 0.4s */ }
@keyframes slideDown { /* 0.4s */ }

/* Scale */
@keyframes scaleIn { /* 0.5s cubic-bezier */ }

/* Transform */
@keyframes lineUp { /* 0.7s */ }
@keyframes translateY { /* 0.3s */ }
```

---

## 💫 Patterns UI

### Bordures

| Style | Usage |
|-------|-------|
| `1px solid` | Bordure fine |
| `1.5px solid` | Bordure moyenne |
| `2px solid` - `3px solid` | Bordure forte |
| `rgba(224, 103, 50, 0.15)` | Couleur bordure |

### Shadows

| Style | Usage |
|-------|-------|
| `0 4px 6px rgba(0,0,0,0.1)` | Ombre légère |
| `0 8px 30px rgba(224,103,50,0.35)` | Ombre accent |
| `0 4px 20px rgba(224,103,50,0.25)` | Ombre accent modérée |
| Aucune | Sidebar/overlay |

### Backgrounds semi-transparents

```css
rgba(255, 255, 255, 0.08)  /* Header blur */
rgba(224, 103, 50, 0.08)   /* Hover backgrounds */
rgba(224, 103, 50, 0.1)    /* Backgrounds légers */
rgba(247, 244, 239, 0.4)   /* Texte muted */
rgba(15, 25, 35, 0.5)      /* Backdrop dark */
```

---

## 🎯 Conventions détectées

### Spacing
- **Vertical** : `6rem` pour les sections, `2rem` pour les blocks
- **Horizontal** : `2rem` pour les sides, `1.5rem` pour le contenu
- **Gaps** : `0.75rem` pour les éléments serrés, `2rem` pour les spaced

### Typography
- **Titres** : Cormorant Garamond 300-600, line-height 1.05-1.1
- **Texte** : Syne 400-500, line-height 1.6-1.8
- **Labels** : Syne 700-800, uppercase, tracking 0.2em-0.3em

### Colors
- **Fond** : #F7F4EF (clair) ou #0F1923 (sombre)
- **Accents** : #E06732 (orange)
- **Texte** : #0F1923 (sombre) ou #F7F4EF (clair)
- **Subtil** : Rgba avec 0.15-0.4 d'opacité

### Animation
- **Rapide** : 0.3s ease (hover)
- **Normal** : 0.4s ease (transitions UI)
- **Lent** : 0.7s ease (animations visibles)
- **Spring** : cubic-bezier pour les pop-ins

---

## 📋 Utilisation dans la Sidebar

### ✅ Appliqué dans la sidebar

1. **Couleurs** : Toutes les variables CSS du projet
2. **Polices** : Syne pour la navigation
3. **Border-radius** : 0.5rem pour les boutons
4. **Transitions** : 0.3s - 0.4s ease/cubic-bezier
5. **Padding** : Cohérent avec le site (1.5rem, 1rem)
6. **Bordures** : 3px solid orange (accent)
7. **Shadows** : Aucune (style bordered)

### ✅ Variables CSS créées (basées sur l'analyse)

```css
:host {
  --orange: #E06732;
  --orange-light: rgba(224, 103, 50, 0.1);
  --dark: #0F1923;
  --dark-2: #1a2332;
  --light: #F7F4EF;
  --gray: #6B7280;
  --muted: rgba(247, 244, 239, 0.4);
  --border-color: rgba(224, 103, 50, 0.15);
  --transition: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

---

## 🎓 Conclusion

Le design system est **cohérent et minimaliste** :
- Palette limée (3 couleurs + variations)
- Polices épurées (2 seulement)
- Espacements proportionnels
- Animations fluides et rapides
- Border-radius adapté au contexte

La sidebar **respecte parfaitement** ce système sans introduire de nouvelles valeurs "en dur".

---

Voir `/sidebar/INTEGRATION.md` pour l'intégration.
