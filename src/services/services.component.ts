import { Component, AfterViewInit, Output, EventEmitter, PLATFORM_ID, Inject, ViewEncapsulation } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrl: './services.component.css',
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule],
  standalone: true
})
export class ServicesComponent implements AfterViewInit {
  @Output() navigateToContact = new EventEmitter<void>();

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

    window.addEventListener('scroll', () => {
      let current = '';
      sections.forEach(section => {
        const htmlElement = section as HTMLElement;
        if (window.scrollY >= htmlElement.offsetTop - 120) current = section.id;
      });
      navItems.forEach(item => {
        item.classList.remove('active');
        const href = item.getAttribute('href');
        if (href === '#' + current) item.classList.add('active');
      });
    });
  }

  navigateToContactClick(): void {
    this.navigateToContact.emit();
  }
}
