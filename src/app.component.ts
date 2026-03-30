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
  
  navigateTo(view: 'main' | 'contact' | 'services' | 'portfolio' | 'mentions-legales' | 'politique-confidentialite', fromService?: string): void {
    this.activeView.set(view);
    this.videoStarted = false; // Reset video state to allow replay when returning to main view
    if (isPlatformBrowser(this.platformId)) {
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 0);
    }
    this.isMenuOpen.set(false);

    // Passer le service au contact component
    if (view === 'contact' && fromService) {
      sessionStorage.setItem('selectedService', fromService);
    }
  }
  
  toggleMenu(): void {
    // Use new sidebar component instead of menu signal
    this.sidebar?.toggleSidebar();
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