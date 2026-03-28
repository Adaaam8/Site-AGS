import { Component, AfterViewInit, Output, EventEmitter, PLATFORM_ID, Inject, ViewEncapsulation, OnDestroy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrl: './services.component.css',
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule],
  standalone: true
})
export class ServicesComponent implements AfterViewInit, OnDestroy {
  @Output() navigateToContact = new EventEmitter<void>();

  private scrollHandler: (() => void) | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Scroll reveal
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.15 });

    document.querySelectorAll('.service-block').forEach(el => observer.observe(el));

    // Scroll spy for nav items
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('[id]');

    this.scrollHandler = () => {
      let current = '';
      sections.forEach(section => {
        const htmlElement = section as HTMLElement;
        if (window.scrollY >= htmlElement.offsetTop - 120) current = section.id;
      });
      navItems.forEach(item => {
        item.classList.remove('active');
        item.removeAttribute('aria-current');
        const href = item.getAttribute('href');
        if (href === '#' + current) {
          item.classList.add('active');
          item.setAttribute('aria-current', 'page');
        }
      });
    };
    window.addEventListener('scroll', this.scrollHandler);
  }

  ngOnDestroy(): void {
    if (this.scrollHandler) {
      window.removeEventListener('scroll', this.scrollHandler);
    }
  }

  navigateToContactClick(): void {
    this.navigateToContact.emit();
  }
}
