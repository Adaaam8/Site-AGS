import { Component, ChangeDetectionStrategy, signal, effect, PLATFORM_ID, Inject, AfterViewChecked } from '@angular/core';
import { isPlatformBrowser, NgOptimizedImage, CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ContactComponent } from './contact/contact.component';

interface Service {
  icon: string;
  title: string;
  titleHighlight: string;
  description: string;
  image: string;
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
  imports: [NgOptimizedImage, CommonModule, ContactComponent]
})
export class AppComponent implements AfterViewChecked{
  isMenuOpen = signal(false);
  isScrolled = signal(false);
  currentYear = new Date().getFullYear();
  activeView = signal<'main' | 'contact'>('main');
  private videoStarted = false;

  services = signal<Service[]>([
    {
      icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8"><path stroke-linecap="round" stroke-linejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25A2.25 2.25 0 0 1 5.25 3h13.5A2.25 2.25 0 0 1 21 5.25Z" /></svg>`,
      title: 'Création de Sites Web Modernes',
      titleHighlight: '<span class="text-[#E06732]">Création de Sites Web</span> Modernes',
      description: 'Nous concevons des sites web vitrines et e-commerce sur mesure, rapides, responsives et optimisés pour une expérience utilisateur exceptionnelle.',
      image: 'assets/service-web.png'
    },
    {
      icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>`,
      title: 'Image de Marque & Identité Visuelle',
      titleHighlight: '<span class="text-[#E06732]">Image de Marque &</span> Identité Visuelle',
      description: "De la création de votre logo à la charte graphique complète, nous forgeons une identité de marque forte et cohérente qui vous démarque de la concurrence.",
      image: 'assets/service-visu.png'
    },
    {
      icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8"><path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" /></svg>`,
      title: 'Visibilité & Hébergement Google',
      titleHighlight: '<span class="text-[#E06732]">Visibilité &</span> Hébergement Google',
      description: "Nous optimisons votre référencement naturel (SEO) et assurons un hébergement fiable et performant pour garantir une visibilité maximale sur Google.",
      image: 'assets/service-seo.png'
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
      image: 'assets/projects-real.png',
      title: 'Site Vitrine pour Consultant en Affaires',
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
  
  constructor(@Inject(PLATFORM_ID) private platformId: Object, private sanitizer: DomSanitizer) {
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

ngAfterViewChecked(): void {
  if (isPlatformBrowser(this.platformId) && !this.videoStarted) {
    const video = document.querySelector('video') as HTMLVideoElement;
    if (video) {
      video.muted = true;
      video.play().then(() => {
        this.videoStarted = false;
      }).catch(() => {});
      this.videoStarted = true;
    }
  }
}
  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  scrollTo(elementId: string): void {
  if (this.activeView() !== 'main') {
    this.activeView.set('main');
    setTimeout(() => this.executeScroll(elementId), 50);
  } else {
    this.executeScroll(elementId);
  }
}

  scrollToTop(): void {
  if (isPlatformBrowser(this.platformId)) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
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
    this.videoStarted = false; // Reset video state to allow replay when returning to main view
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

  callPhone(): void {
    window.location.href = 'tel:0782928620';
  }
}