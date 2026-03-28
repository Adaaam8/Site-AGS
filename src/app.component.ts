import { Component, ChangeDetectionStrategy, signal, effect, PLATFORM_ID, Inject, AfterViewChecked, HostListener, ViewChild } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ContactComponent } from './contact/contact.component';
import { PortfolioV2Component } from './portfolio/portfolio.component';
import { CookieBannerComponent } from './cookie-banner/cookie-banner.component';
import { HeroComponent } from './hero/hero.component';
import { ServicesComponent } from './services/services.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { MentionsLegalesComponent } from './mentions-legales/mentions-legales.component';
import { PolitiqueConfidentialiteComponent } from './politique-confidentialite/politique-confidentialite.component';

interface Service {
  icon: string;
  title: string;
  titleHighlight: string;
  description: string;
  image: string;
}

interface ServiceCard {
  title: string;
  desc: string;
  detail: string;
  price: string;
  tags: string[];
}

interface Pack {
  name: string;
  price: string;
  desc: string;
  features: string[];
  cta: string;
  popular?: boolean;
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
  styleUrl: './app.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ContactComponent, PortfolioV2Component, CookieBannerComponent, HeroComponent, ServicesComponent, SidebarComponent, MentionsLegalesComponent, PolitiqueConfidentialiteComponent]
})
export class AppComponent implements AfterViewChecked{
  @ViewChild(SidebarComponent) sidebar!: SidebarComponent;

  isMenuOpen = signal(false);
  isScrolled = signal(false);
  headerDark = signal(false);
  currentYear = new Date().getFullYear();
  activeView = signal<'main' | 'contact' | 'services' | 'portfolio' | 'mentions-legales' | 'politique-confidentialite'>('main');
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

  serviceCards = signal<ServiceCard[]>([
    {
      title: "Site Vitrine Haut de Gamme",
      desc: "Pour les consultants, cabinets et marques de luxe.",
      detail: "Design immersif, storytelling captivant, crédibilité instantanée. Une vitrine qui travaille pour vous 24/7.",
      price: "À partir de 650€",
      tags: ["Web Design", "Copywriting", "Direction Artistique"]
    },
    {
      title: "E-commerce & Conversion",
      desc: "Pour les marques qui veulent scaler.",
      detail: "Expérience d'achat fluide, optimisation du panier moyen, rapidité. Transformez vos visiteurs en clients fidèles.",
      price: "À partir de 1000€",
      tags: ["Shopify/WooCommerce", "CRO", "Paiement"]
    },
    {
      title: "Branding & Identité",
      desc: "Pour ceux qui veulent être inoubliables.",
      detail: "Logos, chartes graphiques, ton de marque, univers visuel complet. Créez une marque qui résonne.",
      price: "À partir de 400€",
      tags: ["Logo", "Charte", "Brand Book"]
    },
    {
      title: "SEO & Visibilité",
      desc: "Pour dominer votre marché.",
      detail: "Stratégie de contenu, référencement technique, acquisition qualifiée. Soyez visible là où vos clients cherchent.",
      price: "À partir de 150€/mois",
      tags: ["SEO", "Content", "Analytics"]
    }
  ]);

  expandedServiceIndex = signal<number | null>(null);

  packs = signal<Pack[]>([
    {
      name: "Essentiel",
      price: "900€",
      desc: "L'indispensable pour démarrer avec une image forte.",
      features: [
        "Identité Visuelle (Logo + Charte)",
        "Site Vitrine (5 pages)",
        "Optimisation Mobile",
        "Formation prise en main"
      ],
      cta: "Choisir l'Essentiel"
    },
    {
      name: "Performance",
      price: "1 400€",
      desc: "Pour les entreprises qui veulent accélérer leur croissance.",
      features: [
        "Tout du pack Essentiel",
        "Stratégie SEO Avancée",
        "Blog / Content Marketing",
        "Intégration CRM",
        "Lead Magnet Setup"
      ],
      cta: "Choisir la Performance",
      popular: true
    },
    {
      name: "E-Commerce Elite",
      price: "2 500€",
      desc: "Une boutique en ligne conçue pour la conversion massive.",
      features: [
        "Shopify ou WooCommerce",
        "Design UX/UI Sur-mesure",
        "Système de paiement optimisé",
        "Automatisations E-mail",
        "Dashboard Analytics"
      ],
      cta: "Lancer mon E-commerce"
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
        this.videoStarted = true;
      }).catch(() => {});
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
  
  navigateTo(view: 'main' | 'contact' | 'services' | 'portfolio'): void {
    this.activeView.set(view);
    this.videoStarted = false; // Reset video state to allow replay when returning to main view
    if (isPlatformBrowser(this.platformId)) {
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 0);
    }
    this.isMenuOpen.set(false);
  }
  
  toggleMenu(): void {
    // Use new sidebar component instead of menu signal
    this.sidebar?.toggleSidebar();
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

  toggleService(index: number): void {
    this.expandedServiceIndex.set(
      this.expandedServiceIndex() === index ? null : index
    );
  }

  callPhone(): void {
    window.location.href = 'tel:0782928620';
  }

  @HostListener('window:scroll')
  onScroll(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const header = document.querySelector('header');
    if (!header) return;

    const headerBottom = header.getBoundingClientRect().bottom;
    const elementBelow = document.elementFromPoint(window.innerWidth / 2, headerBottom + 1);

    if (!elementBelow) return;

    const bg = window.getComputedStyle(elementBelow).backgroundColor;
    const values = bg.match(/\d+/g);

    if (!values) return;

    const [r, g, b] = values.map(Number);
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    this.headerDark.set(luminance > 128);
  }
}