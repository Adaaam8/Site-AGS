
import { Component, ChangeDetectionStrategy, signal, effect, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser, NgOptimizedImage } from '@angular/common';
import { ContactComponent } from './contact/contact.component';

interface Service {
  icon: string;
  title: string;
  description: string;
}

interface ProcessStep {
  step: string;
  title: string;
  description: string;
}

interface Project {
  image: string;
  title: string;
  category: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgOptimizedImage, ContactComponent]
})
export class AppComponent {
  isMenuOpen = signal(false);
  isScrolled = signal(false);
  currentYear = new Date().getFullYear();
  activeView = signal<'main' | 'contact'>('main');

  services = signal<Service[]>([
    {
      icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" /></svg>`,
      title: 'Création de Sites Web Modernes',
      description: 'Nous concevons des sites web vitrines et e-commerce sur mesure, rapides, responsives et optimisés pour une expérience utilisateur exceptionnelle.'
    },
    {
      icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>`,
      title: 'Image de Marque & Identité Visuelle',
      description: "De la création de votre logo à la charte graphique complète, nous forgeons une identité de marque forte et cohérente qui vous démarque de la concurrence."
    },
    {
      icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" /></svg>`,
      title: 'Visibilité & Hébergement Google',
      description: "Nous optimisons votre référencement naturel (SEO) et assurons un hébergement fiable et performant pour garantir une visibilité maximale sur Google."
    }
  ]);

  processSteps = signal<ProcessStep[]>([
    {
      step: '01',
      title: 'Découverte & Stratégie',
      description: 'Nous analysons vos besoins, vos objectifs et votre marché pour définir une stratégie digitale claire et efficace.'
    },
    {
      step: '02',
      title: 'Conception & Design UX/UI',
      description: "Nous créons des maquettes et un design intuitif, centré sur l'utilisateur, pour une navigation fluide et agréable."
    },
    {
      step: '03',
      title: 'Développement & Intégration',
      description: 'Nos experts transforment le design en un site web fonctionnel, en utilisant les dernières technologies pour la performance.'
    },
    {
      step: '04',
      title: 'Déploiement & Suivi',
      description: 'Nous mettons votre site en ligne, assurons sa maintenance et analysons ses performances pour une amélioration continue.'
    }
  ]);

  projects = signal<Project[]>([
    {
      image: 'https://picsum.photos/seed/project1/800/600',
      title: 'Site Vitrine pour Artisan',
      category: 'Développement Web'
    },
    {
      image: 'https://picsum.photos/seed/project2/800/600',
      title: 'Identité Visuelle pour Startup',
      category: 'Image de Marque'
    },
    {
      image: 'https://picsum.photos/seed/project3/800/600',
      title: 'Plateforme E-commerce',
      category: 'Développement Web'
    },
    {
      image: 'https://picsum.photos/seed/project4/800/600',
      title: 'Campagne de Référencement',
      category: 'Visibilité Google'
    }
  ]);
  currentProjectIndex = signal(0);
  
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      effect(() => {
        const onScroll = () => {
          this.isScrolled.set(window.scrollY > 10);
        };
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
      });
    }
  }

  scrollTo(elementId: string): void {
    if (this.activeView() !== 'main') {
      this.activeView.set('main');
      // Wait for view to render before scrolling
      setTimeout(() => this.executeScroll(elementId), 50);
    } else {
      this.executeScroll(elementId);
    }
  }

  private executeScroll(elementId: string): void {
    if (isPlatformBrowser(this.platformId)) {
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      this.isMenuOpen.set(false);
    }
  }
  
  navigateTo(view: 'main' | 'contact'): void {
    this.activeView.set(view);
    if (isPlatformBrowser(this.platformId)) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    this.isMenuOpen.set(false);
  }
  
  toggleMenu(): void {
    this.isMenuOpen.update(v => !v);
  }

  nextProject(): void {
    this.currentProjectIndex.update(i => (i + 1) % this.projects().length);
  }

  prevProject(): void {
    this.currentProjectIndex.update(i => (i - 1 + this.projects().length) % this.projects().length);
  }

  goToProject(index: number): void {
    this.currentProjectIndex.set(index);
  }
}
