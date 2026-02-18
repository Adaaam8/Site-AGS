import { Component, ChangeDetectionStrategy, signal, computed, output, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

declare var libphonenumber: any;

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, CommonModule],
})
export class ContactComponent implements OnInit {
  backToHome = output<void>();

  // === URL du backend (à adapter en production) ===
  private readonly API_URL = '/api/contact';

  contactForm = this.fb.group({
    fullName: ['', Validators.required],
    company: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    postalCode: ['', Validators.required],
    country: ['France', Validators.required],
    projectType: [[] as string[], Validators.required],
    budget: [[] as string[], Validators.required],
    deadline: [[] as string[], Validators.required],
    existingAssets: [[] as string[]],
    description: [''],
    privacyPolicy: [false, Validators.requiredTrue]
  });

  submitted = signal(false);
  currentStep = signal(0);
  stepDirection = signal<'next' | 'prev'>('next');
  stepError = signal('');
  stepsCompleted = signal(false);
  isSending = signal(false);
  sendSuccess = signal(false);
  sendError = signal('');
  formCompleted = signal(false);
  formFading = signal(false);
  selectionChanged = signal(0);

  totalSteps = 4;

  canComplete = computed(() => {
    this.selectionChanged();
    const hasProject = (this.projectType?.value as string[])?.length > 0;
    const hasBudget = (this.budget?.value as string[])?.length > 0;
    const hasDeadline = (this.deadline?.value as string[])?.length > 0;
    return hasProject && hasBudget && hasDeadline;
  });

  countries = signal([
    { name: 'Afghanistan', code: 'AF' },
    { name: 'Afrique du Sud', code: 'ZA' },
    { name: 'Albanie', code: 'AL' },
    { name: 'Algérie', code: 'DZ' },
    { name: 'Allemagne', code: 'DE' },
    { name: 'Andorre', code: 'AD' },
    { name: 'Angola', code: 'AO' },
    { name: 'Antigua-et-Barbuda', code: 'AG' },
    { name: 'Arabie Saoudite', code: 'SA' },
    { name: 'Argentine', code: 'AR' },
    { name: 'Arménie', code: 'AM' },
    { name: 'Australie', code: 'AU' },
    { name: 'Autriche', code: 'AT' },
    { name: 'Azerbaïdjan', code: 'AZ' },
    { name: 'Bahamas', code: 'BS' },
    { name: 'Bahreïn', code: 'BH' },
    { name: 'Bangladesh', code: 'BD' },
    { name: 'Barbade', code: 'BB' },
    { name: 'Belgique', code: 'BE' },
    { name: 'Belize', code: 'BZ' },
    { name: 'Bénin', code: 'BJ' },
    { name: 'Bhoutan', code: 'BT' },
    { name: 'Biélorussie', code: 'BY' },
    { name: 'Birmanie', code: 'MM' },
    { name: 'Bolivie', code: 'BO' },
    { name: 'Bosnie-Herzégovine', code: 'BA' },
    { name: 'Botswana', code: 'BW' },
    { name: 'Brésil', code: 'BR' },
    { name: 'Brunei', code: 'BN' },
    { name: 'Bulgarie', code: 'BG' },
    { name: 'Burkina Faso', code: 'BF' },
    { name: 'Burundi', code: 'BI' },
    { name: 'Cambodge', code: 'KH' },
    { name: 'Cameroun', code: 'CM' },
    { name: 'Canada', code: 'CA' },
    { name: 'Cap-Vert', code: 'CV' },
    { name: 'Chili', code: 'CL' },
    { name: 'Chine', code: 'CN' },
    { name: 'Chypre', code: 'CY' },
    { name: 'Colombie', code: 'CO' },
    { name: 'Comores', code: 'KM' },
    { name: 'Congo-Brazzaville', code: 'CG' },
    { name: 'Congo-Kinshasa', code: 'CD' },
    { name: 'Corée du Nord', code: 'KP' },
    { name: 'Corée du Sud', code: 'KR' },
    { name: 'Costa Rica', code: 'CR' },
    { name: 'Côte d\'Ivoire', code: 'CI' },
    { name: 'Croatie', code: 'HR' },
    { name: 'Cuba', code: 'CU' },
    { name: 'Danemark', code: 'DK' },
    { name: 'Djibouti', code: 'DJ' },
    { name: 'Dominique', code: 'DM' },
    { name: 'Égypte', code: 'EG' },
    { name: 'Émirats arabes unis', code: 'AE' },
    { name: 'Équateur', code: 'EC' },
    { name: 'Érythrée', code: 'ER' },
    { name: 'Espagne', code: 'ES' },
    { name: 'Estonie', code: 'EE' },
    { name: 'Eswatini', code: 'SZ' },
    { name: 'États-Unis', code: 'US' },
    { name: 'Éthiopie', code: 'ET' },
    { name: 'Fidji', code: 'FJ' },
    { name: 'Finlande', code: 'FI' },
    { name: 'France', code: 'FR' },
    { name: 'Gabon', code: 'GA' },
    { name: 'Gambie', code: 'GM' },
    { name: 'Géorgie', code: 'GE' },
    { name: 'Ghana', code: 'GH' },
    { name: 'Grèce', code: 'GR' },
    { name: 'Grenade', code: 'GD' },
    { name: 'Guatemala', code: 'GT' },
    { name: 'Guinée', code: 'GN' },
    { name: 'Guinée équatoriale', code: 'GQ' },
    { name: 'Guinée-Bissau', code: 'GW' },
    { name: 'Guyana', code: 'GY' },
    { name: 'Haïti', code: 'HT' },
    { name: 'Honduras', code: 'HN' },
    { name: 'Hongrie', code: 'HU' },
    { name: 'Îles Cook', code: 'CK' },
    { name: 'Îles Marshall', code: 'MH' },
    { name: 'Îles Salomon', code: 'SB' },
    { name: 'Inde', code: 'IN' },
    { name: 'Indonésie', code: 'ID' },
    { name: 'Irak', code: 'IQ' },
    { name: 'Iran', code: 'IR' },
    { name: 'Irlande', code: 'IE' },
    { name: 'Islande', code: 'IS' },
    { name: 'Italie', code: 'IT' },
    { name: 'Jamaïque', code: 'JM' },
    { name: 'Japon', code: 'JP' },
    { name: 'Jordanie', code: 'JO' },
    { name: 'Kazakhstan', code: 'KZ' },
    { name: 'Kenya', code: 'KE' },
    { name: 'Kirghizistan', code: 'KG' },
    { name: 'Kiribati', code: 'KI' },
    { name: 'Koweït', code: 'KW' },
    { name: 'Laos', code: 'LA' },
    { name: 'Lesotho', code: 'LS' },
    { name: 'Lettonie', code: 'LV' },
    { name: 'Liban', code: 'LB' },
    { name: 'Liberia', code: 'LR' },
    { name: 'Libye', code: 'LY' },
    { name: 'Liechtenstein', code: 'LI' },
    { name: 'Lituanie', code: 'LT' },
    { name: 'Luxembourg', code: 'LU' },
    { name: 'Macédoine du Nord', code: 'MK' },
    { name: 'Madagascar', code: 'MG' },
    { name: 'Malaisie', code: 'MY' },
    { name: 'Malawi', code: 'MW' },
    { name: 'Maldives', code: 'MV' },
    { name: 'Mali', code: 'ML' },
    { name: 'Malte', code: 'MT' },
    { name: 'Maroc', code: 'MA' },
    { name: 'Maurice', code: 'MU' },
    { name: 'Mauritanie', code: 'MR' },
    { name: 'Mexique', code: 'MX' },
    { name: 'Micronésie', code: 'FM' },
    { name: 'Moldavie', code: 'MD' },
    { name: 'Monaco', code: 'MC' },
    { name: 'Mongolie', code: 'MN' },
    { name: 'Monténégro', code: 'ME' },
    { name: 'Mozambique', code: 'MZ' },
    { name: 'Namibie', code: 'NA' },
    { name: 'Nauru', code: 'NR' },
    { name: 'Népal', code: 'NP' },
    { name: 'Nicaragua', code: 'NI' },
    { name: 'Niger', code: 'NE' },
    { name: 'Nigeria', code: 'NG' },
    { name: 'Niue', code: 'NU' },
    { name: 'Norvège', code: 'NO' },
    { name: 'Nouvelle-Zélande', code: 'NZ' },
    { name: 'Oman', code: 'OM' },
    { name: 'Ouganda', code: 'UG' },
    { name: 'Ouzbékistan', code: 'UZ' },
    { name: 'Pakistan', code: 'PK' },
    { name: 'Palaos', code: 'PW' },
    { name: 'Palestine', code: 'PS' },
    { name: 'Panama', code: 'PA' },
    { name: 'Papouasie-Nouvelle-Guinée', code: 'PG' },
    { name: 'Paraguay', code: 'PY' },
    { name: 'Pays-Bas', code: 'NL' },
    { name: 'Pérou', code: 'PE' },
    { name: 'Philippines', code: 'PH' },
    { name: 'Pologne', code: 'PL' },
    { name: 'Portugal', code: 'PT' },
    { name: 'Qatar', code: 'QA' },
    { name: 'République centrafricaine', code: 'CF' },
    { name: 'République dominicaine', code: 'DO' },
    { name: 'République tchèque', code: 'CZ' },
    { name: 'Roumanie', code: 'RO' },
    { name: 'Royaume-Uni', code: 'GB' },
    { name: 'Russie', code: 'RU' },
    { name: 'Rwanda', code: 'RW' },
    { name: 'Saint-Christophe-et-Niévès', code: 'KN' },
    { name: 'Saint-Marin', code: 'SM' },
    { name: 'Saint-Vincent-et-les-Grenadines', code: 'VC' },
    { name: 'Sainte-Lucie', code: 'LC' },
    { name: 'Salvador', code: 'SV' },
    { name: 'Samoa', code: 'WS' },
    { name: 'Sao Tomé-et-Principe', code: 'ST' },
    { name: 'Sénégal', code: 'SN' },
    { name: 'Serbie', code: 'RS' },
    { name: 'Seychelles', code: 'SC' },
    { name: 'Sierra Leone', code: 'SL' },
    { name: 'Singapour', code: 'SG' },
    { name: 'Slovaquie', code: 'SK' },
    { name: 'Slovénie', code: 'SI' },
    { name: 'Somalie', code: 'SO' },
    { name: 'Soudan', code: 'SD' },
    { name: 'Soudan du Sud', code: 'SS' },
    { name: 'Sri Lanka', code: 'LK' },
    { name: 'Suède', code: 'SE' },
    { name: 'Suisse', code: 'CH' },
    { name: 'Suriname', code: 'SR' },
    { name: 'Syrie', code: 'SY' },
    { name: 'Tadjikistan', code: 'TJ' },
    { name: 'Tanzanie', code: 'TZ' },
    { name: 'Tchad', code: 'TD' },
    { name: 'Thaïlande', code: 'TH' },
    { name: 'Timor oriental', code: 'TL' },
    { name: 'Togo', code: 'TG' },
    { name: 'Tonga', code: 'TO' },
    { name: 'Trinité-et-Tobago', code: 'TT' },
    { name: 'Tunisie', code: 'TN' },
    { name: 'Turkménistan', code: 'TM' },
    { name: 'Turquie', code: 'TR' },
    { name: 'Tuvalu', code: 'TV' },
    { name: 'Ukraine', code: 'UA' },
    { name: 'Uruguay', code: 'UY' },
    { name: 'Vanuatu', code: 'VU' },
    { name: 'Vatican', code: 'VA' },
    { name: 'Venezuela', code: 'VE' },
    { name: 'Viêt Nam', code: 'VN' },
    { name: 'Yémen', code: 'YE' },
    { name: 'Zambie', code: 'ZM' },
    { name: 'Zimbabwe', code: 'ZW' },
  ].sort((a, b) => a.name.localeCompare(b.name)));

  constructor(private fb: FormBuilder, private http: HttpClient) {}

  ngOnInit(): void {
    this.contactForm.get('country')?.valueChanges.subscribe(() => {
      this.formatPhoneNumber();
    });
  }

  formatPhoneNumber(): void {
    const phoneControl = this.contactForm.get('phone');
    const countryControl = this.contactForm.get('country');

    if (!phoneControl || !countryControl || !phoneControl.value || !countryControl.value) {
      return;
    }

    const countryName = countryControl.value;
    const countryData = this.countries().find(c => c.name === countryName);
    const countryCode = countryData ? countryData.code : undefined;

    if (!countryCode) {
      return;
    }

    try {
      const phoneNumber = libphonenumber.parsePhoneNumber(phoneControl.value, countryCode);
      if (phoneNumber && phoneNumber.isValid()) {
        const formattedNumber = phoneNumber.formatInternational();
        phoneControl.setValue(formattedNumber, { emitEvent: false });
      }
    } catch (error) {}
  }

  toggleOption(field: string, option: string): void {
    const control = this.contactForm.get(field);
    if (!control) return;
    const current = control.value as string[];
    if (current.includes(option)) {
      control.setValue(current.filter(item => item !== option));
    } else {
      control.setValue([...current, option]);
    }
    this.selectionChanged.update(v => v + 1);
  }

  isSelected(field: string, option: string): boolean {
    const control = this.contactForm.get(field);
    return control ? (control.value as string[]).includes(option) : false;
  }

  nextStep(): void {
    this.stepError.set('');
    const step = this.currentStep();

    if (step === 0 && (this.projectType?.value as string[]).length === 0) {
      this.stepError.set('Veuillez sélectionner au moins un type de projet.');
      return;
    }
    if (step === 1 && (this.budget?.value as string[]).length === 0) {
      this.stepError.set('Veuillez sélectionner au moins un budget.');
      return;
    }
    if (step === 2 && (this.deadline?.value as string[]).length === 0) {
      this.stepError.set('Veuillez sélectionner au moins un délai.');
      return;
    }

    if (step < this.totalSteps - 1) {
      this.stepDirection.set('next');
      this.currentStep.set(step + 1);
    }
  }

  prevStep(): void {
    this.stepError.set('');
    if (this.currentStep() > 0) {
      this.stepDirection.set('prev');
      this.currentStep.set(this.currentStep() - 1);
    }
  }

  completeSteps(): void {
    this.stepError.set('');
    if ((this.projectType?.value as string[]).length === 0) {
      this.stepError.set('Veuillez revenir à l\'étape 1 et sélectionner un type de projet.');
      return;
    }
    if ((this.budget?.value as string[]).length === 0) {
      this.stepError.set('Veuillez revenir à l\'étape 2 et sélectionner un budget.');
      return;
    }
    if ((this.deadline?.value as string[]).length === 0) {
      this.stepError.set('Veuillez revenir à l\'étape 3 et sélectionner un délai.');
      return;
    }
    this.stepsCompleted.set(true);

    // Animation : fade out du formulaire, puis message de succès
    this.formFading.set(true);
    setTimeout(() => {
      this.formCompleted.set(true);
    }, 600);
  }

  submitForm(): void {
    this.submitted.set(true);
    this.sendError.set('');
    this.sendSuccess.set(false);

    if (!this.contactForm.valid) {
      console.log('Form is invalid');
      return;
    }

    if (!this.stepsCompleted()) {
      this.sendError.set('Veuillez compléter le questionnaire projet avant d\'envoyer.');
      return;
    }

    this.isSending.set(true);

    const payload = {
      fullName: this.contactForm.value.fullName,
      company: this.contactForm.value.company,
      email: this.contactForm.value.email,
      phone: this.contactForm.value.phone,
      postalCode: this.contactForm.value.postalCode,
      country: this.contactForm.value.country,
      projectType: this.contactForm.value.projectType,
      budget: this.contactForm.value.budget,
      deadline: this.contactForm.value.deadline,
      existingAssets: this.contactForm.value.existingAssets,
      description: this.contactForm.value.description || '',
    };

    this.http.post<{ success: boolean; message: string }>(this.API_URL, payload).subscribe({
      next: (response) => {
        this.isSending.set(false);
        this.sendSuccess.set(true);
        this.contactForm.reset({
          phone: '',
          privacyPolicy: false,
          country: 'France',
          existingAssets: [],
          projectType: [],
          budget: [],
          deadline: [],
        });
        this.submitted.set(false);
        this.currentStep.set(0);
        this.stepsCompleted.set(false);
      },
      error: (error) => {
        this.isSending.set(false);
        const message = error.error?.error || 'Une erreur est survenue. Veuillez réessayer ou nous contacter directement par email.';
        this.sendError.set(message);
        console.error('API error:', error);
      },
    });
  }

  goBack(): void {
    this.backToHome.emit();
  }

  get fullName() { return this.contactForm.get('fullName'); }
  get company() { return this.contactForm.get('company'); }
  get email() { return this.contactForm.get('email'); }
  get phone() { return this.contactForm.get('phone'); }
  get postalCode() { return this.contactForm.get('postalCode'); }
  get country() { return this.contactForm.get('country'); }
  get projectType() { return this.contactForm.get('projectType'); }
  get budget() { return this.contactForm.get('budget'); }
  get deadline() { return this.contactForm.get('deadline'); }
  get description() { return this.contactForm.get('description'); }
  get privacyPolicy() { return this.contactForm.get('privacyPolicy'); }
}
