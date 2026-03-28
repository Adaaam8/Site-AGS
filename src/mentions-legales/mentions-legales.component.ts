import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mentions-legales',
  templateUrl: './mentions-legales.component.html',
  styleUrl: './mentions-legales.component.css',
  standalone: true,
  imports: [CommonModule]
})
export class MentionsLegalesComponent {
  @Output() backToHome = new EventEmitter<void>();
  currentYear = new Date().getFullYear();

  goHome(): void {
    this.backToHome.emit();
  }
}
