import { Component, ChangeDetectionStrategy, signal, computed, output, OnInit, OnDestroy, NgZone, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';

declare var libphonenumber: any;

interface AnimatedParticle {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  alpha: number;
  isOrange: boolean;
}

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
})
export class ContactComponent implements OnInit, OnDestroy {
  backToHome = output<void>();

  @ViewChild('bgCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  // === URL du backend ===
  private readonly API_URL = '/api/contact';

  // === Form Group ===
  contactForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    company: [''],
    projectType: [[] as string[], Validators.required],
    situation: [[] as string[], Validators.required],
    budget: [[] as string[], Validators.required],
    deadline: [[] as string[], Validators.required],
    message: [''],
    privacy: [false, Validators.requiredTrue]
  });

  // === Signals ===
  submitted = signal(false);
  step = signal(0);
  stepperDone = signal(false);
  stepError = signal('');
  isSending = signal(false);
  sendSuccess = signal(false);
  sendError = signal('');

  // === Canvas animation ===
  private animationFrameId: number | null = null;
  private particles: AnimatedParticle[] = [];
  private canvasW = 0;
  private canvasH = 0;
  private t = 0;
  private mouse = { x: -999, y: -999 };

  totalSteps = 4;
  encouragements = ['', '✨ Bonne sélection !', '👌 On prend note !', '🎯 Dernière étape !'];

  countries = signal([
    { name: 'France', code: 'FR' },
    { name: 'Belgique', code: 'BE' },
    { name: 'Suisse', code: 'CH' },
    { name: 'Canada', code: 'CA' },
    { name: 'Autre', code: 'OTHER' },
  ]);

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.initCanvas();
    this.setupMouseListener();
  }

  ngOnDestroy(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  // === Canvas Animation ===
  private initCanvas(): void {
    this.ngZone.runOutsideAngular(() => {
      const canvas = this.canvasRef?.nativeElement;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const resize = () => {
        this.canvasW = canvas.width = window.innerWidth;
        this.canvasH = canvas.height = window.innerHeight;
        this.createParticles();
      };

      const createParticles = () => {
        this.particles = [];
        const count = Math.floor((this.canvasW * this.canvasH) / 22000);
        for (let i = 0; i < count; i++) {
          this.particles.push({
            x: Math.random() * this.canvasW,
            y: Math.random() * this.canvasH,
            r: Math.random() * 2 + 0.5,
            vx: (Math.random() - 0.5) * 0.18,
            vy: (Math.random() - 0.5) * 0.18,
            alpha: Math.random() * 0.25 + 0.05,
            isOrange: Math.random() > 0.8
          });
        }
      };

      const draw = () => {
        this.t += 0.005;
        ctx.clearRect(0, 0, this.canvasW, this.canvasH);

        // Light bg
        ctx.fillStyle = '#f7f8fc';
        ctx.fillRect(0, 0, this.canvasW, this.canvasH);

        // Soft orange orb
        const ox = this.canvasW * 0.85 + Math.sin(this.t * 0.7) * 30;
        const oy = this.canvasH * 0.1 + Math.cos(this.t * 0.5) * 20;
        const og = ctx.createRadialGradient(ox, oy, 0, ox, oy, this.canvasW * 0.28);
        og.addColorStop(0, 'rgba(224,103,50,0.08)');
        og.addColorStop(1, 'transparent');
        ctx.fillStyle = og;
        ctx.fillRect(0, 0, this.canvasW, this.canvasH);

        // Soft navy orb
        const nx = this.canvasW * 0.08 + Math.cos(this.t * 0.6) * 25;
        const ny = this.canvasH * 0.82 + Math.sin(this.t * 0.4) * 20;
        const ng = ctx.createRadialGradient(nx, ny, 0, nx, ny, this.canvasW * 0.22);
        ng.addColorStop(0, 'rgba(15,23,42,0.05)');
        ng.addColorStop(1, 'transparent');
        ctx.fillStyle = ng;
        ctx.fillRect(0, 0, this.canvasW, this.canvasH);

        // Mouse glow
        if (this.mouse.x > 0) {
          const mg = ctx.createRadialGradient(this.mouse.x, this.mouse.y, 0, this.mouse.x, this.mouse.y, 180);
          mg.addColorStop(0, 'rgba(224,103,50,0.05)');
          mg.addColorStop(1, 'transparent');
          ctx.fillStyle = mg;
          ctx.fillRect(0, 0, this.canvasW, this.canvasH);
        }

        // Particles
        this.particles.forEach((p, i) => {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0) p.x = this.canvasW;
          if (p.x > this.canvasW) p.x = 0;
          if (p.y < 0) p.y = this.canvasH;
          if (p.y > this.canvasH) p.y = 0;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = p.isOrange
            ? `rgba(224,103,50,${p.alpha})`
            : `rgba(100,116,139,${p.alpha})`;
          ctx.fill();

          for (let j = i + 1; j < this.particles.length; j++) {
            const q = this.particles[j];
            const dx = p.x - q.x, dy = p.y - q.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 90) {
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(q.x, q.y);
              ctx.strokeStyle = `rgba(100,116,139,${0.06 * (1 - dist / 90)})`;
              ctx.lineWidth = 0.6;
              ctx.stroke();
            }
          }
        });

        this.animationFrameId = requestAnimationFrame(draw);
      };

      window.addEventListener('resize', resize);
      resize();
      draw();
    });
  }

  private setupMouseListener(): void {
    this.ngZone.runOutsideAngular(() => {
      window.addEventListener('mousemove', (e) => {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
      });
    });
  }

  private createParticles(): void {
    this.particles = [];
    const count = Math.floor((this.canvasW * this.canvasH) / 22000);
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.canvasW,
        y: Math.random() * this.canvasH,
        r: Math.random() * 2 + 0.5,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        alpha: Math.random() * 0.25 + 0.05,
        isOrange: Math.random() > 0.8
      });
    }
  }

  // === Form Methods ===
  markFilled(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.value.trim()) {
      input.classList.add('filled');
    } else {
      input.classList.remove('filled');
    }
  }

  toggle(field: string, value: string, element: HTMLElement): void {
    element.classList.toggle('selected');
    const arr = this.contactForm.get(field)?.value as string[];
    const idx = arr.indexOf(value);
    if (idx > -1) {
      arr.splice(idx, 1);
    } else {
      arr.push(value);
    }
    this.contactForm.get(field)?.setValue([...arr]);
  }

  pickPill(field: string, value: string, element: HTMLElement): void {
    document.querySelectorAll(`[data-f="${field}"]`).forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
    this.contactForm.get(field)?.setValue([value]);
  }

  updateStepper(): void {
    const s = this.step();
    this.contactForm.get('projectType')?.updateValueAndValidity();
    this.contactForm.get('budget')?.updateValueAndValidity();
    this.contactForm.get('deadline')?.updateValueAndValidity();
  }

  validateStep(s: number): boolean {
    this.stepError.set('');
    const fields = ['projectType', 'situation', 'budget', 'deadline'];
    if ((this.contactForm.get(fields[s])?.value as string[]).length === 0) {
      this.stepError.set('Veuillez sélectionner une option.');
      return false;
    }
    return true;
  }

  nextStep(): void {
    if (!this.validateStep(this.step())) return;
    if (this.step() < this.totalSteps - 1) {
      this.step.set(this.step() + 1);
      this.updateStepper();
    } else {
      this.completeStepper();
    }
  }

  prevStep(): void {
    if (this.step() > 0) {
      this.step.set(this.step() - 1);
      this.updateStepper();
    }
  }

  completeStepper(): void {
    this.stepperDone.set(true);
  }

  resetStepper(): void {
    this.stepperDone.set(false);
    this.step.set(0);
  }

  submitForm(): void {
    this.submitted.set(true);
    this.sendError.set('');
    this.sendSuccess.set(false);

    if (!this.contactForm.valid) {
      return;
    }

    if (!this.stepperDone()) {
      this.sendError.set('Veuillez compléter le questionnaire projet avant d\'envoyer.');
      return;
    }

    this.isSending.set(true);

    const payload = {
      firstName: this.contactForm.value.firstName,
      lastName: this.contactForm.value.lastName,
      email: this.contactForm.value.email,
      phone: this.contactForm.value.phone,
      company: this.contactForm.value.company,
      projectType: this.contactForm.value.projectType,
      situation: this.contactForm.value.situation,
      budget: this.contactForm.value.budget,
      deadline: this.contactForm.value.deadline,
      message: this.contactForm.value.message || '',
    };

    this.http.post<{ success: boolean; message: string }>(this.API_URL, payload).subscribe({
      next: () => {
        this.isSending.set(false);
        this.sendSuccess.set(true);
        this.contactForm.reset({
          privacy: false,
          projectType: [],
          situation: [],
          budget: [],
          deadline: [],
        });
        this.submitted.set(false);
        this.step.set(0);
        this.stepperDone.set(false);
      },
      error: (error) => {
        this.isSending.set(false);
        const message = error.error?.error || 'Une erreur est survenue. Veuillez réessayer.';
        this.sendError.set(message);
      },
    });
  }

  closeModal(): void {
    this.sendSuccess.set(false);
    this.submitted.set(false);
    this.step.set(0);
    this.stepperDone.set(false);
    this.contactForm.reset({
      privacy: false,
      projectType: [],
      situation: [],
      budget: [],
      deadline: [],
    });
    this.backToHome.emit();
  }

  goHome(): void {
    this.backToHome.emit();
  }

  // === Getters ===
  get firstName() { return this.contactForm.get('firstName'); }
  get lastName() { return this.contactForm.get('lastName'); }
  get email() { return this.contactForm.get('email'); }
  get phone() { return this.contactForm.get('phone'); }
  get company() { return this.contactForm.get('company'); }
  get projectType() { return this.contactForm.get('projectType'); }
  get situation() { return this.contactForm.get('situation'); }
  get budget() { return this.contactForm.get('budget'); }
  get deadline() { return this.contactForm.get('deadline'); }
  get message() { return this.contactForm.get('message'); }
  get privacy() { return this.contactForm.get('privacy'); }
}
