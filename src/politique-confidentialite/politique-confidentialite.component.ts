import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-politique-confidentialite',
  templateUrl: './politique-confidentialite.component.html',
  styleUrl: './politique-confidentialite.component.css',
  standalone: true,
  imports: [CommonModule]
})
export class PolitiqueConfidentialiteComponent {
  @Output() backToHome = new EventEmitter<void>();
  currentYear = new Date().getFullYear();

  goHome(): void {
    this.backToHome.emit();
  }
}
