import { Component, OnInit, OnDestroy, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Project {
  title: string;
  category: string;
  image: string;
}

@Component({
  selector: 'app-portfolio-v2',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class PortfolioV2Component implements OnInit, OnDestroy {
  projects = signal<Project[]>([
    {
      title: "Agence Martin & Co.",
      category: "Site Vitrine",
      image: "assets/projects-real.png"
    },
    {
      title: "Boutique Lumière",
      category: "Site E-commerce",
      image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=900&q=80"
    },
    {
      title: "Lancement Produit NovaTech",
      category: "Landing Page",
      image: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=900&q=80"
    },
    {
      title: "Studio Novo — Identité Visuelle",
      category: "Identité & Image de Marque",
      image: "https://images.unsplash.com/photo-1634942537034-2531766767d1?w=900&q=80"
    },
    {
      title: "Cabinet Legrand",
      category: "Référencement SEO",
      image: "https://images.unsplash.com/photo-1432888622747-4eb9a8f5c01a?w=900&q=80"
    },
    {
      title: "Réseau Pixel Group",
      category: "Hébergement Web",
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=900&q=80"
    }
  ]);

  current = signal(0);
  isTransitioning = signal(false);
  private autoPlayInterval: any;

  get total(): number {
    return this.projects().length;
  }

  get currentProject(): Project {
    return this.projects()[this.current()];
  }

  get progressPercentage(): number {
    return Math.round(((this.current() + 1) / this.total) * 100);
  }

  get progressText(): string {
    return `${String(this.current() + 1).padStart(2, '0')} / ${String(this.total).padStart(2, '0')}`;
  }

  get bigNumber(): string {
    return String(this.current() + 1).padStart(2, '0');
  }

  ngOnInit(): void {
    // Auto-play
    this.autoPlayInterval = setInterval(() => {
      this.goTo((this.current() + 1) % this.total);
    }, 5000);
  }

  ngOnDestroy(): void {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
    }
  }

  goTo(index: number): void {
    if (index === this.current() || this.isTransitioning()) return;

    this.isTransitioning.set(true);
    setTimeout(() => {
      this.current.set(index);
      this.isTransitioning.set(false);
    }, 400);
  }

  next(): void {
    this.goTo((this.current() + 1) % this.total);
  }

  prev(): void {
    this.goTo((this.current() - 1 + this.total) % this.total);
  }

  isActive(index: number): boolean {
    return index === this.current();
  }

  onItemClick(index: number): void {
    this.goTo(index);
  }
}
