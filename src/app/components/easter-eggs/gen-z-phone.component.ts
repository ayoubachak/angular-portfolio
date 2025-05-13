import { Component, HostListener, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTimes, faMinusCircle, faArrowsUpDown, faCheck, faX } from '@fortawesome/free-solid-svg-icons';
import { GenZEasterEggService } from '../../services/gen-z-easter-egg.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { trigger, transition, style, animate, state } from '@angular/animations';

@Component({
  selector: 'app-gen-z-phone',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  template: `
    <div 
      *ngIf="isVisible" 
      class="phone-container"
      [class.minimized]="isMinimized"
      [class.full-screen]="isFullScreen"
      [style.top.px]="position.y"
      [style.left.px]="position.x"
      (mousedown)="startDrag($event)"
      [@phoneAnimation]="animationState">

      <!-- If user hasn't answered if they're Gen Z yet -->
      <div *ngIf="isGenZ === null" class="gen-z-question">
        <div class="question-container">
          <h2>Wait a sec...</h2>
          <p>Are you Gen Z?</p>
          <div class="btn-container">
            <button (click)="answerGenZQuestion(true)" class="yes-btn">
              <fa-icon [icon]="faCheck"></fa-icon> Yes
            </button>
            <button (click)="answerGenZQuestion(false)" class="no-btn">
              <fa-icon [icon]="faX"></fa-icon> No
            </button>
          </div>
        </div>
      </div>

      <!-- Phone content when user has answered -->
      <div *ngIf="isGenZ !== null" class="phone-content">
        <!-- Phone header with notch -->
        <div class="phone-header">
          <div class="phone-notch"></div>
        </div>

        <!-- Control buttons -->
        <div class="phone-controls">
          <button (click)="toggleMinimize($event)" class="control-btn minimize-btn">
            <fa-icon [icon]="faMinusCircle"></fa-icon>
          </button>
          <button (click)="toggleFullScreen($event)" class="control-btn fullscreen-btn">
            <fa-icon [icon]="faArrowsUpDown"></fa-icon>
          </button>
          <button (click)="closePhone($event)" class="control-btn close-btn">
            <fa-icon [icon]="faTimes"></fa-icon>
          </button>
        </div>

        <!-- Phone screen (Minecraft video) -->
        <div class="phone-screen">
          <iframe 
            *ngIf="isGenZ === true"
            [src]="videoUrl" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen>
          </iframe>
          
          <div *ngIf="isGenZ === false" class="non-gen-z-content">
            <p>No worries! Here's something else...</p>
            <iframe 
              [src]="alternativeVideoUrl" 
              frameborder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowfullscreen>
            </iframe>
          </div>
        </div>

        <!-- Phone home button / indicator -->
        <div class="phone-home-indicator"></div>
      </div>
    </div>
  `,
  styles: [`
    .phone-container {
      position: fixed;
      z-index: 999;
      width: 350px;
      height: 650px;
      background-color: #111;
      border-radius: 40px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
      overflow: hidden;
      transition: width 0.3s ease, height 0.3s ease, transform 0.3s ease;
      border: 10px solid #222;
      cursor: move;
      user-select: none;
      display: flex;
      flex-direction: column;
    }
    
    .phone-container.minimized {
      transform: scale(0.5);
      border-radius: 20px;
      right: 10px;
      bottom: 10px;
    }
    
    .phone-container.full-screen {
      width: 100%;
      height: 100%;
      top: 0 !important;
      left: 0 !important;
      border-radius: 0;
      border-width: 0;
    }
    
    .phone-header {
      height: 30px;
      position: relative;
      background-color: #000;
    }
    
    .phone-notch {
      position: absolute;
      width: 150px;
      height: 30px;
      background-color: #000;
      left: 50%;
      transform: translateX(-50%);
      border-bottom-left-radius: 15px;
      border-bottom-right-radius: 15px;
      z-index: 2;
    }
      .phone-controls {
      position: absolute;
      top: 10px;
      right: 10px;
      z-index: 3;
      display: flex;
      gap: 10px;
      background: rgba(0, 0, 0, 0.6);
      border-radius: 20px;
      padding: 5px 10px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
    }
    
    .control-btn {
      background: rgba(255, 255, 255, 0.15);
      color: #fff;
      border: none;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
    }
    
    .control-btn:hover {
      background: rgba(0, 0, 0, 0.8);
    }
    
    .close-btn:hover {
      background: rgba(255, 0, 0, 0.8);
    }
      .phone-screen {
      flex: 1;
      background-color: #000;
      overflow: hidden;
      position: relative;
      display: flex;
      flex-direction: column;
    }
    
    .phone-screen iframe {
      width: 100%;
      height: 100%;
      border: none;
      flex-grow: 1;
      object-fit: cover;
      aspect-ratio: 16 / 9;
      background-color: #000;
    }
    
    .phone-home-indicator {
      height: 5px;
      background-color: #333;
      margin: 10px auto;
      width: 40%;
      border-radius: 3px;
    }
    
    .gen-z-question {
      display: flex;
      flex: 1;
      align-items: center;
      justify-content: center;
      color: #fff;
      padding: 20px;
      background: linear-gradient(145deg, #8844ff, #ff44dd);
      height: 100%;
    }
    
    .question-container {
      text-align: center;
      background-color: rgba(0, 0, 0, 0.5);
      padding: 30px;
      border-radius: 20px;
      backdrop-filter: blur(10px);
    }
    
    .question-container h2 {
      font-size: 2rem;
      margin-bottom: 15px;
    }
    
    .question-container p {
      font-size: 1.5rem;
      margin-bottom: 20px;
    }
    
    .btn-container {
      display: flex;
      justify-content: center;
      gap: 20px;
    }
    
    .yes-btn, .no-btn {
      padding: 10px 20px;
      border: none;
      border-radius: 30px;
      font-size: 1.2rem;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .yes-btn {
      background-color: #00cc44;
      color: #fff;
    }
    
    .yes-btn:hover {
      background-color: #00aa44;
      transform: scale(1.05);
    }
    
    .no-btn {
      background-color: #f8f8f8;
      color: #333;
    }
    
    .no-btn:hover {
      background-color: #eaeaea;
      transform: scale(1.05);
    }

    .non-gen-z-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      padding: 20px;
      color: white;
      text-align: center;
    }
    
    .non-gen-z-content p {
      margin-bottom: 20px;
      font-size: 1.2rem;
    }
    
    .non-gen-z-content iframe {
      width: 100%;
      height: 80%;
    }
  `],
  animations: [
    trigger('phoneAnimation', [
      state('appear', style({
        transform: 'scale(1)',
        opacity: 1
      })),
      transition(':enter', [
        style({ 
          transform: 'scale(0.3)', 
          opacity: 0 
        }),
        animate('0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)')
      ]),
      transition(':leave', [
        animate('0.2s ease-out', style({ 
          transform: 'scale(0.3)', 
          opacity: 0 
        }))
      ])
    ])
  ]
})
export class GenZPhoneComponent implements OnInit, OnDestroy {
  // FontAwesome icons
  faTimes = faTimes;
  faMinusCircle = faMinusCircle;
  faArrowsUpDown = faArrowsUpDown;
  faCheck = faCheck;
  faX = faX;

  // Component state
  isVisible = false;
  isMinimized = false;
  isFullScreen = false;
  isGenZ: boolean | null = null;
  animationState = 'appear';
  
  // Dragging state
  private isDragging = false;
  private dragOffset = { x: 0, y: 0 };
  position = { x: 100, y: 100 }; // Default position

  // Video URLs
  videoUrl: SafeResourceUrl;
  alternativeVideoUrl: SafeResourceUrl;
  
  // Services
  private genZService = inject(GenZEasterEggService);
  private sanitizer = inject(DomSanitizer);
  private subscription = new Subscription();
  
  constructor() {    // Sanitize YouTube URLs to prevent XSS
    this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      'https://www.youtube.com/embed/n_Dv4JMiwK8?autoplay=1&mute=0&controls=1&fs=0&modestbranding=1&rel=0&showinfo=0'
    );
    this.alternativeVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=0&controls=1&fs=0&modestbranding=1&rel=0&showinfo=0'
    );
  }
  
  ngOnInit(): void {
    this.subscription = this.genZService.state$.subscribe(state => {
      this.isVisible = state.isActive;
      this.isGenZ = state.isGenZ;
      this.isMinimized = state.isMinimized;
      
      // Position phone in center of screen when it first appears
      if (state.isActive && !this.isDragging) {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        this.position = {
          x: (screenWidth / 2) - 175, // Half the phone width
          y: (screenHeight / 2) - 325 // Half the phone height
        };
      }
    });
  }
  
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
  
  answerGenZQuestion(isGenZ: boolean): void {
    this.genZService.setGenZStatus(isGenZ);
  }
  
  closePhone(event: MouseEvent): void {
    event.stopPropagation();
    this.genZService.closeEasterEgg();
  }
  
  toggleMinimize(event: MouseEvent): void {
    event.stopPropagation();
    this.genZService.toggleMinimize();
  }
  
  toggleFullScreen(event: MouseEvent): void {
    event.stopPropagation();
    this.isFullScreen = !this.isFullScreen;
  }
  
  startDrag(event: MouseEvent): void {
    // Don't allow dragging in fullscreen mode
    if (this.isFullScreen) return;
    
    this.isDragging = true;
    this.dragOffset = {
      x: event.clientX - this.position.x,
      y: event.clientY - this.position.y
    };
    
    // Prevent text selection during drag
    event.preventDefault();
  }
  
  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (this.isDragging && !this.isFullScreen) {
      this.position = {
        x: event.clientX - this.dragOffset.x,
        y: event.clientY - this.dragOffset.y
      };
      
      // Keep phone within viewport bounds
      const phoneWidth = 350;
      const phoneHeight = 650;
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      
      if (this.position.x < 0) this.position.x = 0;
      if (this.position.y < 0) this.position.y = 0;
      if (this.position.x + phoneWidth > screenWidth) {
        this.position.x = screenWidth - phoneWidth;
      }
      if (this.position.y + phoneHeight > screenHeight) {
        this.position.y = screenHeight - phoneHeight;
      }
    }
  }
  
  @HostListener('document:mouseup')
  onMouseUp(): void {
    this.isDragging = false;
  }
}
