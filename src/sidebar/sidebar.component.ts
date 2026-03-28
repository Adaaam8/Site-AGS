import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  standalone: true
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Output() navigate = new EventEmitter<'main' | 'contact' | 'services' | 'portfolio'>();
  @Output() scrollRequest = new EventEmitter<string>();

  private sidebar: HTMLElement | null = null;
  private backdrop: HTMLElement | null = null;
  private closeBtn: HTMLElement | null = null;
  private links: NodeListOf<Element> | null = null;

  private backdropClickHandler: (() => void) | null = null;
  private closeBtnHandler: (() => void) | null = null;
  private keydownHandler: ((e: KeyboardEvent) => void) | null = null;
  private linkHandlers: Map<Element, (e: Event) => void> = new Map();

  ngOnInit(): void {
    this.initSidebar();
    this.attachEventListeners();
  }

  ngOnDestroy(): void {
    this.removeEventListeners();
  }

  private initSidebar(): void {
    this.sidebar = document.getElementById('sidebar');
    this.backdrop = document.getElementById('sidebarBackdrop');
    this.closeBtn = document.getElementById('sidebarClose');
    this.links = document.querySelectorAll('.sidebar-link');

    // Set first link as active
    if (this.links && this.links.length > 0) {
      (this.links[0] as HTMLElement).classList.add('active');
    }
  }

  private attachEventListeners(): void {
    // Backdrop click
    if (this.backdrop) {
      this.backdropClickHandler = () => this.closeSidebar();
      this.backdrop.addEventListener('click', this.backdropClickHandler);
    }

    // Close button click
    if (this.closeBtn) {
      this.closeBtnHandler = () => this.closeSidebar();
      this.closeBtn.addEventListener('click', this.closeBtnHandler);
    }

    // Link clicks
    if (this.links) {
      this.links.forEach((link) => {
        const handler = (e: Event) => {
          e.preventDefault();
          this.handleLinkClick(link as HTMLElement);
        };
        this.linkHandlers.set(link, handler);
        link.addEventListener('click', handler);
      });
    }

    // Keyboard escape
    this.keydownHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.closeSidebar();
      }
    };
    document.addEventListener('keydown', this.keydownHandler);
  }

  private removeEventListeners(): void {
    if (this.backdrop && this.backdropClickHandler) {
      this.backdrop.removeEventListener('click', this.backdropClickHandler);
    }
    if (this.closeBtn && this.closeBtnHandler) {
      this.closeBtn.removeEventListener('click', this.closeBtnHandler);
    }
    if (this.links) {
      this.links.forEach((link) => {
        const handler = this.linkHandlers.get(link);
        if (handler) {
          link.removeEventListener('click', handler);
          this.linkHandlers.delete(link);
        }
      });
    }
    if (this.keydownHandler) {
      document.removeEventListener('keydown', this.keydownHandler);
    }
  }

  private handleLinkClick(link: HTMLElement): void {
    // Remove active class from all links
    if (this.links) {
      this.links.forEach((l) => l.classList.remove('active'));
    }

    // Add active class to clicked link
    link.classList.add('active');

    // Get the data-page attribute
    const page = link.getAttribute('data-page');
    if (page === 'services' || page === 'contact' || page === 'portfolio' || page === 'home') {
      this.navigate.emit(page === 'home' ? 'main' : (page as 'contact' | 'services' | 'portfolio'));
    } else if (page === 'about') {
      this.navigate.emit('main');
      this.scrollRequest.emit('about');
    }

    // Close sidebar on mobile
    if (window.innerWidth < 768) {
      this.closeSidebar();
    }
  }

  public openSidebar(): void {
    if (this.sidebar) {
      this.sidebar.classList.add('active');
    }
    if (this.backdrop) {
      this.backdrop.classList.add('active');
    }
    document.body.style.overflow = 'hidden';
  }

  public closeSidebar(): void {
    if (this.sidebar) {
      this.sidebar.classList.remove('active');
    }
    if (this.backdrop) {
      this.backdrop.classList.remove('active');
    }
    document.body.style.overflow = '';
  }

  public toggleSidebar(): void {
    if (this.sidebar?.classList.contains('active')) {
      this.closeSidebar();
    } else {
      this.openSidebar();
    }
  }
}
