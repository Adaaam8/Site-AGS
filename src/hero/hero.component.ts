import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
  signal,
  Output,
  EventEmitter,
  HostListener,
  PLATFORM_ID,
  Inject,
  OnDestroy
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import * as THREE from 'three';

interface Particle3D {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
}

@Component({
  selector: 'app-hero',
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css',
  standalone: true,
  imports: [CommonModule]
})
export class HeroComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('typedHeading') typedHeading: ElementRef | null = null;
  @ViewChild('typingCursor') typingCursor: ElementRef | null = null;
  @ViewChild('particlesCanvas') canvasRef: ElementRef<HTMLCanvasElement> | null = null;

  @Output() contactClick = new EventEmitter<void>();
  @Output() portfolioClick = new EventEmitter<void>();

  private phrases = [
    'Nous créons des sites qui convertissent.',
    'Votre identité visuelle, réinventée.',
    'Visible sur Google. Partout.',
    'AGS Concept — L\'excellence digitale.'
  ];

  private phraseIndex = 0;
  private charIndex = 0;
  private isDeleting = false;
  private chars: HTMLElement[] = [];

  // Three.js properties
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private particles: Particle3D[] = [];
  private mouse = { x: 0, y: 0 };
  private W = 0;
  private H = 0;
  private animationFrameId: number | null = null;

  private ringX = 0;
  private ringY = 0;
  private dotX = 0;
  private dotY = 0;

  private cursorDot: HTMLElement | null = null;
  private cursorRing: HTMLElement | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initCursor();
      setTimeout(() => this.startTyping(), 600);
    }
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId) && this.canvasRef) {
      this.initThreeJS();
      this.animate();
      this.setupHoverListeners();
    }
  }

  private initCursor(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.cursorDot = document.getElementById('cursor-dot');
    this.cursorRing = document.getElementById('cursor-ring');

    document.addEventListener('mousemove', (e) => this.onMouseMove(e));
    this.animateRing();
  }

  private onMouseMove(e: MouseEvent): void {
    this.dotX = e.clientX;
    this.dotY = e.clientY;

    if (this.cursorDot) {
      this.cursorDot.style.left = this.dotX + 'px';
      this.cursorDot.style.top = this.dotY + 'px';
    }

    this.mouse.x = this.dotX;
    this.mouse.y = this.dotY;
  }

  private animateRing(): void {
    if (!this.cursorRing) return;

    this.ringX += (this.dotX - this.ringX) * 0.12;
    this.ringY += (this.dotY - this.ringY) * 0.12;
    this.cursorRing.style.left = this.ringX + 'px';
    this.cursorRing.style.top = this.ringY + 'px';

    this.animationFrameId = requestAnimationFrame(() => this.animateRing());
  }

  private initThreeJS(): void {
    if (!this.canvasRef) return;

    const canvas = this.canvasRef.nativeElement;
    this.W = window.innerWidth;
    this.H = window.innerHeight;

    // Scene
    this.scene = new THREE.Scene();

    // Camera
    this.camera = new THREE.PerspectiveCamera(75, this.W / this.H, 0.1, 1000);
    this.camera.position.z = 100;

    // Renderer with transparent background
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.renderer.setSize(this.W, this.H);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(0x000000, 0); // Transparent background

    // Create particles
    this.createParticles3D();

    // Handle resize
    window.addEventListener('resize', () => this.onWindowResize());
  }

  private createParticles3D(): void {
    if (!this.scene) return;

    const particleCount = 150;

    for (let i = 0; i < particleCount; i++) {
      const isOrange = Math.random() > 0.6;
      const color = isOrange ? 0xE06732 : 0xF7F4EF;
      const emissive = color;

      const geometry = new THREE.SphereGeometry(Math.random() * 0.8 + 0.4, 8, 8);
      const material = new THREE.MeshStandardMaterial({
        color: color,
        emissive: emissive,
        emissiveIntensity: 0.8,
        metalness: 0.3,
        roughness: 0.4
      });

      const mesh = new THREE.Mesh(geometry, material);

      // Random position in 3D space
      mesh.position.x = (Math.random() - 0.5) * 300;
      mesh.position.y = (Math.random() - 0.5) * 300;
      mesh.position.z = (Math.random() - 0.5) * 200;

      this.scene.add(mesh);

      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.3,
        (Math.random() - 0.5) * 0.3,
        (Math.random() - 0.5) * 0.3
      );

      this.particles.push({
        mesh: mesh,
        velocity: velocity,
        life: 0,
        maxLife: Math.random() * 300 + 200
      });
    }

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    // Add point light
    const pointLight = new THREE.PointLight(0xE06732, 1, 500);
    pointLight.position.set(50, 50, 50);
    this.scene.add(pointLight);
  }

  private animate(): void {
    this.animationFrameId = requestAnimationFrame(() => this.animate());

    if (!this.renderer || !this.scene || !this.camera) return;

    // Rotate camera slightly
    this.camera.position.x = Math.sin(Date.now() * 0.0001) * 30;
    this.camera.position.y = Math.cos(Date.now() * 0.00007) * 30;
    this.camera.lookAt(0, 0, 0);

    // Update particles
    this.particles.forEach((p) => {
      p.mesh.position.add(p.velocity);

      // Oscillate movement
      p.mesh.position.y += Math.sin(Date.now() * 0.001 + p.mesh.position.x) * 0.01;

      // Rotate particle
      p.mesh.rotation.x += 0.002;
      p.mesh.rotation.y += 0.003;

      // Wrap around
      if (Math.abs(p.mesh.position.x) > 150) p.velocity.x *= -1;
      if (Math.abs(p.mesh.position.y) > 150) p.velocity.y *= -1;
      if (Math.abs(p.mesh.position.z) > 100) p.velocity.z *= -1;
    });

    this.renderer.render(this.scene, this.camera);
  }

  private onWindowResize(): void {
    if (!this.camera || !this.renderer) return;

    this.W = window.innerWidth;
    this.H = window.innerHeight;

    this.camera.aspect = this.W / this.H;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.W, this.H);
  }

  private startTyping(): void {
    this.typeNext();
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
        setTimeout(() => {
          this.isDeleting = true;
          this.typeNext();
        }, 2800);
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

  private buildChars(text: string): void {
    if (!this.typedHeading) return;

    // Supprimer les anciens caractères
    this.chars.forEach((el) => el.remove());
    this.chars = [];
    this.charIndex = 0;

    const words = text.split(' ');

    words.forEach((word, wordIndex) => {
      // Créer un span pour le mot avec inline-block et white-space: nowrap
      const wordSpan = document.createElement('span');
      wordSpan.style.display = 'inline-block';
      wordSpan.style.whiteSpace = 'nowrap';

      // Créer un span pour chaque lettre du mot
      [...word].forEach((char) => {
        const charSpan = document.createElement('span');
        charSpan.classList.add('typed-char');
        charSpan.textContent = char;
        wordSpan.appendChild(charSpan);
        this.chars.push(charSpan);
      });

      // Ajouter le span du mot au heading
      this.typedHeading!.nativeElement.insertBefore(wordSpan, this.typingCursor?.nativeElement);

      // Ajouter un espace entre les mots (sauf après le dernier mot)
      if (wordIndex < words.length - 1) {
        const spaceSpan = document.createElement('span');
        spaceSpan.style.display = 'inline-block';
        spaceSpan.innerHTML = '&nbsp;';
        this.typedHeading!.nativeElement.insertBefore(spaceSpan, this.typingCursor?.nativeElement);
      }
    });
  }

  private setupHoverListeners(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const buttons = document.querySelectorAll('button, a');
    buttons.forEach((el) => {
      el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
    });
  }

  onContactClick(): void {
    this.contactClick.emit();
  }

  onPortfolioClick(): void {
    this.portfolioClick.emit();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.onWindowResize();
  }

  ngOnDestroy(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }

    // Cleanup Three.js resources
    if (this.scene) {
      this.scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material?.dispose();
          }
        }
      });
    }

    this.renderer?.dispose();
  }
}
