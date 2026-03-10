# 📚 Exemple d'intégration complète

## Étape 1: Modifier app.component.ts

```typescript
import { Component, ViewChild } from '@angular/core';
import { SidebarComponent } from './sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [
    // ... autres imports ...
    SidebarComponent
  ]
})
export class AppComponent {
  @ViewChild(SidebarComponent) sidebar!: SidebarComponent;

  // Méthode pour ouvrir/fermer la sidebar
  toggleSidebar(): void {
    this.sidebar?.toggleSidebar();
  }
}
```

## Étape 2: Modifier app.component.html

```html
<!DOCTYPE html>
<html>
<head>
  <!-- ... -->
</head>
<body>
  <!-- HEADER -->
  <header>
    <div class="header-container">
      <!-- Logo -->
      <div class="logo">
        <h1>AGS Concept</h1>
      </div>

      <!-- Navigation principale (desktop) -->
      <nav class="header-nav">
        <a href="#home">Accueil</a>
        <a href="#services">Services</a>
        <a href="#portfolio">Portfolio</a>
        <a href="#contact">Contact</a>
      </nav>

      <!-- Bouton toggle (mobile only) -->
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
    </div>
  </header>

  <!-- SIDEBAR MOBILE -->
  <app-sidebar></app-sidebar>

  <!-- CONTENU PRINCIPAL -->
  <main>
    <router-outlet></router-outlet>
  </main>

  <!-- FOOTER -->
  <footer>
    <!-- ... -->
  </footer>
</body>
</html>
```

## Étape 3: Modifier app.component.css

```css
/* Importer le CSS du bouton toggle */
@import './sidebar/sidebar-toggle.css';

/* Header styles */
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

.logo {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.5rem;
  font-weight: 600;
  color: #0F1923;
}

.header-nav {
  display: flex;
  gap: 2rem;
}

.header-nav a {
  color: #F7F4EF;
  text-decoration: none;
  transition: color 0.3s ease;
}

.header-nav a:hover {
  color: #E06732;
}

/* Cacher nav desktop sur mobile */
@media (max-width: 768px) {
  .header-nav {
    display: none;
  }
}

/* Main layout */
main {
  min-height: calc(100vh - 80px);
}
```

## Étape 4: Résultat

### Desktop (> 768px)
- ✅ Bouton hamburger **caché**
- ✅ Navigation **visible** dans le header
- ✅ Sidebar prête mais **fermée**

### Mobile (≤ 768px)
- ✅ Bouton hamburger **visible**
- ✅ Navigation **cachée**
- ✅ Clic sur le hamburger = sidebar s'ouvre
- ✅ Clic sur backdrop ou ✕ = sidebar se ferme
- ✅ Clic sur un lien = navigation + fermeture auto

---

## Personnalisations avancées

### Modifier les liens de la sidebar

Éditer `sidebar/sidebar.component.html`:

```html
<nav class="sidebar-nav">
  <a href="#home" class="sidebar-link active" data-page="home">
    <svg><!-- Votre icône --></svg>
    <span>Accueil</span>
  </a>

  <!-- Ajouter vos propres liens ici -->
  <a href="#blog" class="sidebar-link" data-page="blog">
    <svg><!-- Icône blog --></svg>
    <span>Blog</span>
  </a>
</nav>
```

### Utiliser un routeur au lieu de hash

Modifier `sidebar/sidebar.component.ts`:

```typescript
// Ajouter au constructeur
constructor(private router: Router) {}

private handleLinkClick(link: HTMLElement): void {
  // Récupérer la page
  const page = link.getAttribute('data-page');

  // Retirer l'active de tous les liens
  if (this.links) {
    this.links.forEach((l) => l.classList.remove('active'));
  }

  // Ajouter l'active au lien cliqué
  link.classList.add('active');

  // Navigation avec routeur
  if (page) {
    this.router.navigate([`/${page}`]);
  }

  // Fermer sur mobile
  if (window.innerWidth < 768) {
    this.closeSidebar();
  }
}
```

### Adapter les couleurs pour un thème sombre

Dans `sidebar/sidebar.component.css`, créer une variant:

```css
:host.dark-theme {
  --light: #1a2332;
  --dark: #F7F4EF;
}

.sidebar.dark-theme {
  background: var(--light);
  color: var(--dark);
}
```

---

## Tester l'intégration

### Test 1: Desktop
- [ ] Actualiser la page
- [ ] Vérifier que le bouton hamburger est **caché**
- [ ] Vérifier que la navigation est **visible**

### Test 2: Mobile (DevTools)
- [ ] Passer en mode responsive (< 768px)
- [ ] Vérifier que le bouton hamburger est **visible**
- [ ] Vérifier que la navigation est **cachée**
- [ ] Cliquer sur le hamburger → la sidebar **s'ouvre**

### Test 3: Interactions
- [ ] Cliquer sur un lien → l'item devient **actif** (orange)
- [ ] Cliquer sur le backdrop → la sidebar **se ferme**
- [ ] Appuyer sur Échap → la sidebar **se ferme**
- [ ] Cliquer sur ✕ → la sidebar **se ferme**

### Test 4: Performance
- [ ] Ouvrir DevTools (F12)
- [ ] Aller à Performance
- [ ] Enregistrer une ouverture/fermeture
- [ ] Vérifier qu'il n'y a **pas de jank** (animation fluide)

---

## Déploiement

Avant de déployer en production:

1. ✅ Vérifier tous les fichiers sont en place
2. ✅ Tester sur vrais appareils mobiles
3. ✅ Tester l'accessibilité (navigation au clavier)
4. ✅ Vérifier les performances (Lighthouse)
5. ✅ Nettoyer les logs et commentaires

---

Voilà ! La sidebar est prête à l'emploi. 🚀
