# 📍 Intégration de la Sidebar

## Vue d'ensemble
Sidebar/drawer overlay à droite avec style **Bordered**, respectant le design system existant du projet.

### Caractéristiques
- ✅ Bordure gauche orange franche (3px) comme seul séparateur
- ✅ Fond identique au principal (#F7F4EF)
- ✅ Aucune ombre, aucun glassmorphism
- ✅ Items actifs avec underline/couleur orange
- ✅ Animation fluide (0.4s cubic-bezier)
- ✅ Backdrop semi-transparent (rgba)
- ✅ HTML/CSS pur + vanilla JavaScript
- ✅ Réutilise toutes les variables CSS existantes

---

## 📁 Fichiers créés

```
src/sidebar/
├── sidebar.component.html          # Template HTML
├── sidebar.component.css            # Styles CSS
├── sidebar.component.ts             # Logique Angular
├── sidebar-toggle.component.html    # Bouton hamburger
├── sidebar-toggle.css               # Styles du bouton
└── INTEGRATION.md                   # Ce fichier
```

---

## 🔌 Intégration dans app.component

### 1. Importer le composant
```typescript
// app.component.ts
import { SidebarComponent } from './sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [
    // ... autres imports
    SidebarComponent
  ]
})
export class AppComponent {
  sidebarComponent: SidebarComponent | null = null;

  @ViewChild(SidebarComponent) sidebar!: SidebarComponent;

  toggleSidebar() {
    this.sidebar?.toggleSidebar();
  }
}
```

### 2. Ajouter dans le template
```html
<!-- app.component.html -->
<header>
  <!-- ... contenu du header ... -->

  <!-- Bouton toggle -->
  <button
    class="sidebar-toggle"
    (click)="toggleSidebar()"
    aria-label="Ouvrir le menu">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <line x1="3" y1="6" x2="21" y2="6"/>
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  </button>
</header>

<!-- Sidebar -->
<app-sidebar></app-sidebar>

<!-- Contenu principal -->
<main>
  <router-outlet></router-outlet>
</main>
```

### 3. Importer le CSS du bouton toggle
```typescript
// app.component.ts
import './sidebar/sidebar-toggle.css';
```

Ou dans `app.component.css`:
```css
@import './sidebar/sidebar-toggle.css';
```

---

## 🎯 API du Composant Sidebar

### Méthodes publiques

```typescript
// Ouvrir la sidebar
sidebar.openSidebar();

// Fermer la sidebar
sidebar.closeSidebar();

// Basculer ouverture/fermeture
sidebar.toggleSidebar();
```

### Utilisation avec ViewChild
```typescript
import { ViewChild } from '@angular/core';
import { SidebarComponent } from './sidebar/sidebar.component';

export class AppComponent {
  @ViewChild(SidebarComponent) sidebar!: SidebarComponent;

  onToggleClick() {
    this.sidebar.toggleSidebar();
  }
}
```

---

## 🎨 Personnalisation

### Variables CSS (déjà définies)
Toutes les couleurs sont basées sur le design system existant:

```css
--orange: #E06732              /* Accent principal */
--dark: #0F1923                /* Fond sombre */
--light: #F7F4EF               /* Fond clair */
--gray: #6B7280                /* Texte secondaire */
--border-color: rgba(224, 103, 50, 0.15)  /* Bordures */
```

### Modifier la largeur
```css
.sidebar {
  width: 320px;  /* Changer cette valeur */
}
```

### Modifier la durée d'animation
```css
.sidebar {
  transition: transform 0.4s var(--transition);  /* Changer 0.4s */
}
```

### Ajouter/Modifier des liens
Éditer `sidebar.component.html` section `.sidebar-nav`:
```html
<a href="#nouveau-lien" class="sidebar-link" data-page="nouveau">
  <svg><!-- Icône SVG --></svg>
  <span>Nouveau Lien</span>
</a>
```

---

## 📱 Comportement responsive

| Taille écran | Comportement |
|---|---|
| > 768px | Sidebar fermée, bouton toggle caché |
| ≤ 768px | Bouton toggle visible, sidebar s'ouvre/ferme |
| ≤ 480px | Sidebar réduite à 260px (moins large) |

---

## ♿ Accessibilité

- ✅ Attributs `aria-label` sur tous les boutons
- ✅ `aria-hidden` sur le backdrop
- ✅ Clavier: Échap pour fermer
- ✅ Fermeture en cliquant dehors
- ✅ Gestion `overflow: hidden` pour le body

---

## 🚀 Événements et Interactions

### Fermeture automatique
La sidebar se ferme automatiquement sur mobile après avoir cliqué sur un lien.

### Navigation
```typescript
// Les liens naviguent via window.location.hash
// Vous pouvez modifier handleLinkClick() pour utiliser votre routeur

// Exemple avec Angular Router:
constructor(private router: Router) {}

private handleLinkClick(link: HTMLElement): void {
  const page = link.getAttribute('data-page');

  // Navigation avec routeur
  this.router.navigate([`/${page}`]);
}
```

---

## 🐛 Dépannage

### La sidebar ne s'ouvre pas
- Vérifier que `SidebarComponent` est importé dans `app.component.ts`
- Vérifier que le bouton toggle a un `(click)="toggleSidebar()"` ou appelle la méthode correctement
- Vérifier la console pour les erreurs

### Les styles ne s'appliquent pas
- Vérifier que `sidebar-toggle.css` est importé
- Nettoyer le cache du navigateur (Ctrl+Shift+R)
- Vérifier les variables CSS sont disponibles

### Animation saccadée
- Réduire les autres animations sur la page
- Vérifier les performances avec DevTools (Lighthouse)
- Réduire la durée de transition si nécessaire

---

## 📋 Checklist d'intégration

- [ ] Copier les 5 fichiers dans `src/sidebar/`
- [ ] Importer `SidebarComponent` dans `app.component.ts`
- [ ] Ajouter `<app-sidebar></app-sidebar>` dans `app.component.html`
- [ ] Ajouter le bouton toggle dans le header
- [ ] Importer `sidebar-toggle.css`
- [ ] Ajouter la méthode `toggleSidebar()` au composant
- [ ] Tester l'ouverture/fermeture
- [ ] Tester sur mobile
- [ ] Tester le clavier (Échap)
- [ ] Tester l'accessibilité avec un lecteur d'écran

---

## 📝 Notes

- **Pas de dépendances externes** : HTML/CSS pur + Angular natif
- **Variables CSS réutilisées** : Tous les styles sont conformes au design system
- **Mobile-first** : Responsive et optimisé pour mobiles
- **Performant** : Transitions GPU, pas de layout thrashing

---

Questions ? Consultez le code source ou les commentaires CSS pour plus de détails.
