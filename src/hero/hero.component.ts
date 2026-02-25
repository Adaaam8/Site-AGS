import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
  Output,
  EventEmitter,
  HostListener,
  PLATFORM_ID,
  Inject,
  OnDestroy,
  ViewEncapsulation
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import * as THREE from 'three';

interface Particle3D {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
}

@Component({
  selector: 'app-hero',
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule]
})
export class HeroComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('typedHeading') typedHeading!: ElementRef<HTMLElement>;
  @ViewChild('particlesCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  @Output() contactClick  = new EventEmitter<void>();
  @Output() portfolioClick = new EventEmitter<void>();

  // ── Typing ──
  private phrases = [
    'Nous créons des sites qui convertissent.',
    'Votre identité visuelle, réinventée.',
    'Visible sur Google. Partout.',
    'AGS Concept — L\'excellence digitale.'
  ];
  private phraseIndex = 0;
  private charIndex   = 0;
  private isDeleting  = false;
  private chars: HTMLElement[] = [];
  private wordsContainer: HTMLElement | null = null;

  // ── Three.js ──
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private particles: Particle3D[] = [];

  // ── Cursor ──
  private cursorDot!: HTMLElement | null;
  private cursorRing!: HTMLElement | null;
  private ringX = 0; private ringY = 0;
  private dotX  = 0; private dotY  = 0;

  private rafId: number | null = null;
  private rafCursor: number | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initCursor();
      setTimeout(() => this.startTyping(), 600);
    }
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initThreeJS();
      this.animateThree();
      this.setupHoverListeners();
    }
  }

  // ════════════════════════════════
  // CURSOR
  // ════════════════════════════════
  private initCursor(): void {
    this.cursorDot  = document.getElementById('cursor-dot');
    this.cursorRing = document.getElementById('cursor-ring');
    document.addEventListener('mousemove', (e) => {
      this.dotX = e.clientX;
      this.dotY = e.clientY;
      if (this.cursorDot) {
        this.cursorDot.style.left = this.dotX + 'px';
        this.cursorDot.style.top  = this.dotY + 'px';
      }
    });
    this.animateCursorRing();
  }

  private animateCursorRing(): void {
    this.ringX += (this.dotX - this.ringX) * 0.12;
    this.ringY += (this.dotY - this.ringY) * 0.12;
    if (this.cursorRing) {
      this.cursorRing.style.left = this.ringX + 'px';
      this.cursorRing.style.top  = this.ringY + 'px';
    }
    this.rafCursor = requestAnimationFrame(() => this.animateCursorRing());
  }

  private setupHoverListeners(): void {
    document.querySelectorAll('button, a').forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
    });
  }

  // ════════════════════════════════
  // TYPING — VERSION CORRIGÉE
  // Le wordsContainer reçoit les chars
  // Le cursor reste à la fin, fixe
  // ════════════════════════════════
  private startTyping(): void {
    const heading = this.typedHeading?.nativeElement;
    if (!heading) return;
    // Récupère ou crée le conteneur de mots
    this.wordsContainer = heading.querySelector('.typed-words-container');
    this.typeNext();
  }

  private buildChars(text: string): void {
    if (!this.wordsContainer) return;
    this.chars.forEach(el => el.remove());
    this.chars = [];
    this.charIndex = 0;
    [...text].forEach((char) => {
      const span = document.createElement('span');
      span.classList.add('typed-char');
      if (char === ' ') {
        span.classList.add('space');
        span.textContent = '\u00A0';
      } else {
        span.textContent = char;
      }
      this.wordsContainer!.appendChild(span);
      this.chars.push(span);
    });
  }

  private typeNext(): void {
    const text = this.phrases[this.phraseIndex];
    if (!this.isDeleting) {
      if (this.charIndex === 0) this.buildChars(text);
      if (this.charIndex < this.chars.length) {
        this.chars[this.charIndex].classList.add('visible');
        this.charIndex++;
        setTimeout(() => this.typeNext(), 55 + Math.random() * 30);
      } else {
        setTimeout(() => { this.isDeleting = true; this.typeNext(); }, 2800);
      }
    } else {
      if (this.charIndex > 0) {
        this.charIndex--;
        this.chars[this.charIndex].classList.remove('visible');
        setTimeout(() => this.typeNext(), 30);
      } else {
        this.isDeleting = false;
        this.phraseIndex = (this.phraseIndex + 1) % this.phrases.length;
        setTimeout(() => this.typeNext(), 400);
      }
    }
  }

  // ════════════════════════════════
  // THREE.JS PARTICLES
  // ════════════════════════════════
  private initThreeJS(): void {
    const canvas = this.canvasRef.nativeElement;
    const W = window.innerWidth;
    const H = window.innerHeight;

    this.scene  = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, W / H, 0.1, 1000);
    this.camera.position.z = 100;

    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.renderer.setSize(W, H);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(0x000000, 0);

    this.createParticles();

    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambient);
    const point = new THREE.PointLight(0xE06732, 1, 500);
    point.position.set(50, 50, 50);
    this.scene.add(point);

    window.addEventListener('resize', () => this.onResize());
  }

  private createParticles(): void {
    for (let i = 0; i < 150; i++) {
      const isOrange = Math.random() > 0.6;
      const color    = isOrange ? 0xE06732 : 0xF7F4EF;
      const geo      = new THREE.SphereGeometry(Math.random() * 0.5 + 0.1, 8, 8);
      const mat      = new THREE.MeshStandardMaterial({
        color, emissive: color, emissiveIntensity: 0.8,
        metalness: 0.3, roughness: 0.4
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(
        (Math.random() - 0.5) * 300,
        (Math.random() - 0.5) * 300,
        (Math.random() - 0.5) * 200
      );
      this.scene.add(mesh);
      this.particles.push({
        mesh,
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.3,
          (Math.random() - 0.5) * 0.3,
          (Math.random() - 0.5) * 0.3
        )
      });
    }
  }

  private animateThree(): void {
    this.rafId = requestAnimationFrame(() => this.animateThree());
    const t = Date.now();

    this.camera.position.x = Math.sin(t * 0.0001) * 30;
    this.camera.position.y = Math.cos(t * 0.00007) * 30;
    this.camera.lookAt(0, 0, 0);

    this.particles.forEach(p => {
      p.mesh.position.add(p.velocity);
      p.mesh.position.y += Math.sin(t * 0.001 + p.mesh.position.x) * 0.01;
      p.mesh.rotation.x += 0.002;
      p.mesh.rotation.y += 0.003;
      if (Math.abs(p.mesh.position.x) > 150) p.velocity.x *= -1;
      if (Math.abs(p.mesh.position.y) > 150) p.velocity.y *= -1;
      if (Math.abs(p.mesh.position.z) > 100) p.velocity.z *= -1;
    });

    this.renderer.render(this.scene, this.camera);
  }

  onContactClick():  void { this.contactClick.emit(); }
  onPortfolioClick(): void { this.portfolioClick.emit(); }

  @HostListener('window:resize')
  onResize(): void {
    if (!this.camera || !this.renderer) return;
    const W = window.innerWidth, H = window.innerHeight;
    this.camera.aspect = W / H;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(W, H);
  }

  ngOnDestroy(): void {
    if (this.rafId)     cancelAnimationFrame(this.rafId);
    if (this.rafCursor) cancelAnimationFrame(this.rafCursor);
    this.scene?.traverse(obj => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry?.dispose();
        (obj.material as THREE.Material)?.dispose();
      }
    });
    this.renderer?.dispose();
  }
}