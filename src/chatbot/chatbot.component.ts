import { Component, signal, computed, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirebaseService } from '../services/firebase.service';
import { HttpClient } from '@angular/common/http';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chatbot-widget">
      <!-- Floating Button -->
      <button
        *ngIf="!isOpen()"
        (click)="toggleChat()"
        class="chatbot-button"
        aria-label="Open chat">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </button>

      <!-- Chat Window -->
      <div *ngIf="isOpen()" class="chatbot-window">
        <!-- Header -->
        <div class="chatbot-header">
          <h3>AGS Concept</h3>
          <p>Comment puis-je vous aider ?</p>
          <button (click)="toggleChat()" class="close-btn">✕</button>
        </div>

        <!-- Messages Container -->
        <div class="chatbot-messages">
          <div
            *ngFor="let msg of messages()"
            [class]="'message ' + msg.sender"
            [@fadeUp]>
            <div class="message-content">{{ msg.text }}</div>
          </div>
          <div *ngIf="isLoading()" class="message bot typing">
            <div class="message-content">
              <span></span><span></span><span></span>
            </div>
          </div>
        </div>

        <!-- Input -->
        <div class="chatbot-input">
          <input
            [(ngModel)]="inputMessage"
            (keydown.enter)="sendMessage()"
            [disabled]="isLoading()"
            placeholder="Votre question..."
            class="input-field">
          <button
            (click)="sendMessage()"
            [disabled]="isLoading() || !inputMessage.trim()"
            class="send-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chatbot-widget {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      font-family: 'Syne', sans-serif;
      z-index: 40;
    }

    .chatbot-button {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background-color: #E06732;
      border: none;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(224, 103, 50, 0.4);
      transition: all 0.3s ease;
      padding: 0;
    }

    .chatbot-button:hover {
      background-color: #C85A28;
      transform: scale(1.1);
      box-shadow: 0 6px 16px rgba(224, 103, 50, 0.5);
    }

    .chatbot-button:active {
      transform: scale(0.95);
    }

    .chatbot-window {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 380px;
      max-height: 600px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 5px 40px rgba(0, 0, 0, 0.16);
      display: flex;
      flex-direction: column;
      animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .chatbot-header {
      background: linear-gradient(135deg, #0F1923 0%, #1a2332 100%);
      color: white;
      padding: 1rem;
      border-radius: 12px 12px 0 0;
      position: relative;
    }

    .chatbot-header h3 {
      margin: 0;
      font-size: 1rem;
      font-weight: 700;
      color: #E06732;
    }

    .chatbot-header p {
      margin: 0.25rem 0 0 0;
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.7);
    }

    .close-btn {
      position: absolute;
      top: 0.75rem;
      right: 0.75rem;
      background: none;
      border: none;
      color: white;
      font-size: 1.5rem;
      cursor: pointer;
      opacity: 0.6;
      transition: opacity 0.2s;
    }

    .close-btn:hover {
      opacity: 1;
    }

    .chatbot-messages {
      flex: 1;
      overflow-y: auto;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .message {
      display: flex;
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .message.user {
      justify-content: flex-end;
    }

    .message.bot {
      justify-content: flex-start;
    }

    .message-content {
      max-width: 70%;
      padding: 0.75rem 1rem;
      border-radius: 12px;
      word-wrap: break-word;
      line-height: 1.5;
      font-size: 0.875rem;
    }

    .message.user .message-content {
      background-color: #E06732;
      color: white;
      border-radius: 12px 4px 12px 12px;
    }

    .message.bot .message-content {
      background-color: #f0f0f0;
      color: #333;
      border-radius: 4px 12px 12px 12px;
    }

    .message.typing .message-content {
      display: flex;
      gap: 0.25rem;
      align-items: center;
      height: 1.5rem;
    }

    .message.typing span {
      width: 0.5rem;
      height: 0.5rem;
      border-radius: 50%;
      background-color: #999;
      animation: bounce 1.4s infinite;
    }

    .message.typing span:nth-child(2) {
      animation-delay: 0.2s;
    }

    .message.typing span:nth-child(3) {
      animation-delay: 0.4s;
    }

    @keyframes bounce {
      0%, 80%, 100% {
        transform: translateY(0);
      }
      40% {
        transform: translateY(-0.5rem);
      }
    }

    .chatbot-input {
      display: flex;
      gap: 0.5rem;
      padding: 1rem;
      border-top: 1px solid #e5e5e5;
      background: white;
      border-radius: 0 0 12px 12px;
    }

    .input-field {
      flex: 1;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 0.75rem;
      font-family: 'Syne', sans-serif;
      font-size: 0.875rem;
      transition: border-color 0.2s;
    }

    .input-field:focus {
      outline: none;
      border-color: #E06732;
      box-shadow: 0 0 0 2px rgba(224, 103, 50, 0.1);
    }

    .input-field:disabled {
      background-color: #f5f5f5;
      cursor: not-allowed;
    }

    .send-btn {
      width: 40px;
      height: 40px;
      border: none;
      background-color: #E06732;
      color: white;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .send-btn:hover:not(:disabled) {
      background-color: #C85A28;
      transform: translateY(-2px);
    }

    .send-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    @media (max-width: 480px) {
      .chatbot-widget {
        bottom: 1rem;
        right: 1rem;
      }

      .chatbot-window {
        width: calc(100vw - 2rem);
        max-width: 380px;
        max-height: 70vh;
      }

      .message-content {
        max-width: 85%;
      }
    }
  `]
})
export class ChatbotComponent {
  isOpen = signal(false);
  isLoading = signal(false);
  inputMessage = '';
  messages = signal<Message[]>([
    {
      id: '1',
      text: 'Bonjour ! Je suis l\'assistant AGS Concept. N\'hésitez pas à me poser vos questions.',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);

  private sessionId = this.generateSessionId();

  constructor(
    private http: HttpClient,
    private firebaseService: FirebaseService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  toggleChat() {
    this.isOpen.update(v => !v);
  }

  async sendMessage() {
    if (!this.inputMessage.trim() || this.isLoading()) return;

    const userMsg = this.inputMessage.trim();
    this.inputMessage = '';

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: userMsg,
      sender: 'user',
      timestamp: new Date()
    };
    this.messages.update(msgs => [...msgs, userMessage]);

    this.isLoading.set(true);

    try {
      const response = await this.http.post<{ response: string }>('/api/chat', {
        message: userMsg,
        sessionId: this.sessionId,
        conversationHistory: this.messages().slice(1) // Exclude initial bot message
      }).toPromise();

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: response?.response || 'Désolé, je n\'ai pas pu traiter votre demande.',
        sender: 'bot',
        timestamp: new Date()
      };
      this.messages.update(msgs => [...msgs, botMsg]);

      // Save to Firebase
      if (isPlatformBrowser(this.platformId)) {
        await this.firebaseService.saveMessage(this.sessionId, userMsg, botMsg.text, new Date());
      }
    } catch (error) {
      console.error('Erreur appel API:', error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Une erreur s\'est produite. Veuillez réessayer.',
        sender: 'bot',
        timestamp: new Date()
      };
      this.messages.update(msgs => [...msgs, errorMsg]);
    } finally {
      this.isLoading.set(false);
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}