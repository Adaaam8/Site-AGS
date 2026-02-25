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
  Inject
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
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
export class HeroComponent implements OnInit, AfterViewInit {
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

  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private particles: Particle[] = [];
  private mouse = { x: 0, y: 0 };
  private W = 0;
  private H = 0;
  private animationFrameId: number | null = null;
  private particleAnimationId: number | null = null;

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
      this.initCanvas();
      this.initParticles();
      this.animateParticles();
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

  private initCanvas(): void {
    if (!this.canvasRef) return;

    this.canvas = this.canvasRef.nativeElement;
    this.ctx = this.canvas.getContext('2d');

    this.W = this.canvas.width = window.innerWidth;
    this.H = this.canvas.height = window.innerHeight;

    this.mouse = { x: this.W / 2, y: this.H / 2 };
  }

  private initParticles(): void {
    this.particles = [];
    for (let i = 0; i < 120; i++) {
      this.particles.push(this.createParticle(true));
    }
  }

  private createParticle(random: boolean = false): Particle {
    return {
      x: random ? Math.random() * this.W : Math.random() * this.W,
      y: random ? Math.random() * this.H : this.H + 10,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -(Math.random() * 0.4 + 0.1),
      size: Math.random() * 1.5 + 0.3,
      alpha: Math.random() * 0.5 + 0.1,
      color: Math.random() > 0.7 ? '#E06732' : '#F7F4EF',
      life: 0,
      maxLife: Math.random() * 300 + 200
    };
  }

  private animateParticles(): void {
    if (!this.ctx || !this.canvas) return;

    this.ctx.clearRect(0, 0, this.W, this.H);
    this.drawConnections();

    this.particles.forEach((p) => {
      this.updateParticle(p);
      this.drawParticle(p);
    });

    this.particleAnimationId = requestAnimationFrame(() => this.animateParticles());
  }

  private updateParticle(p: Particle): void {
    const dx = this.mouse.x - p.x;
    const dy = this.mouse.y - p.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 300) {
      p.vx += (dx / dist) * 0.025;
      p.vy += (dy / dist) * 0.025;
    }

    p.x += p.vx;
    p.y += p.vy;
    p.life++;

    const progress = p.life / p.maxLife;
    if (progress < 0.1) p.alpha = progress * 5 * 0.6;
    else if (progress > 0.8) p.alpha = (1 - progress) * 5 * 0.6;

    if (p.life > p.maxLife || p.y < -10) {
      const newP = this.createParticle(false);
      p.x = newP.x;
      p.y = newP.y;
      p.vx = newP.vx;
      p.vy = newP.vy;
      p.size = newP.size;
      p.alpha = newP.alpha;
      p.color = newP.color;
      p.life = newP.life;
      p.maxLife = newP.maxLife;
    }
  }

  private drawParticle(p: Particle): void {
    if (!this.ctx) return;

    this.ctx.save();
    this.ctx.globalAlpha = p.alpha;
    this.ctx.fillStyle = p.color;
    this.ctx.shadowColor = p.color;
    this.ctx.shadowBlur = p.color === '#E06732' ? 6 : 2;
    this.ctx.beginPath();
    this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }

  private drawConnections(): void {
    if (!this.ctx) return;

    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 80) {
          this.ctx.save();
          this.ctx.globalAlpha = (1 - dist / 80) * 0.08;
          this.ctx.strokeStyle = '#E06732';
          this.ctx.lineWidth = 0.5;
          this.ctx.beginPath();
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
          this.ctx.stroke();
          this.ctx.restore();
        }
      }
    }
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

    [...text].forEach((char, i) => {
      const span = document.createElement('span');
      span.classList.add('typed-char');
      if (char === ' ') span.classList.add('space');

      span.textContent = char === ' ' ? '\u00A0' : char;
      this.typedHeading!.nativeElement.insertBefore(span, this.typingCursor?.nativeElement);
      this.chars.push(span);
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
    if (this.canvasRef) {
      this.W = this.canvasRef.nativeElement.width = window.innerWidth;
      this.H = this.canvasRef.nativeElement.height = window.innerHeight;
      this.initParticles();
    }
  }

  ngOnDestroy(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.particleAnimationId !== null) {
      cancelAnimationFrame(this.particleAnimationId);
    }
  }
}
