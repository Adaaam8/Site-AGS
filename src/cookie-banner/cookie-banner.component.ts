import { Component, OnInit, signal, effect, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-cookie-banner',
  templateUrl: './cookie-banner.component.html',
  styleUrl: './cookie-banner.component.css',
  standalone: true,
  imports: [CommonModule],
})
export class CookieBannerComponent implements OnInit {
  isVisible = signal(false);
  showDetails = signal(false);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Vérifier si l'utilisateur a déjà accepté/refusé les cookies
      const cookieConsent = localStorage.getItem('cookieConsent');
      if (!cookieConsent) {
        // Afficher le bandeau après 800ms
        setTimeout(() => {
          this.isVisible.set(true);
        }, 800);
      }
    }
  }

  toggleDetails(): void {
    this.showDetails.update(value => !value);
  }

  acceptCookies(): void {
    localStorage.setItem('cookieConsent', 'accepted');
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    this.isVisible.set(false);
    // Ici, tu peux ajouter du code pour charger les scripts de tracking
  }

  rejectCookies(): void {
    localStorage.setItem('cookieConsent', 'rejected');
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    this.isVisible.set(false);
  }
}
