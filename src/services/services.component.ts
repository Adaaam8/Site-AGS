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
  }

  navigateToContactClick(): void {
    this.navigateToContact.emit();
  }
}
