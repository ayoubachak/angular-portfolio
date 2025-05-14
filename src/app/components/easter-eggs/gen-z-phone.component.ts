import { Component, HostListener, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTimes, faMinusCircle, faCheck, faX, faLock, faLockOpen, faExpand } from '@fortawesome/free-solid-svg-icons';
import { GenZEasterEggService } from '../../services/gen-z-easter-egg.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { trigger, transition, style, animate, state } from '@angular/animations';

@Component({
  selector: 'app-gen-z-phone',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  template: `    <div 
      *ngIf="isVisible" 
      class="phone-container"      [class.minimized]="isMinimized"
      [class.embedded]="isEmbedded"
      [class.locked]="isLocked"
      [style.top.px]="!isEmbedded ? position.y : 0"
      [style.left.px]="!isEmbedded ? position.x : 0"
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
        </div>        <!-- Control buttons -->
        <div class="phone-controls">          <button (click)="toggleLock($event)" class="control-btn lock-btn" title="{{isLocked ? 'Unlock' : 'Lock'}} position">
            <fa-icon [icon]="isLocked ? faLock : faLockOpen"></fa-icon>
          </button>
          <button (click)="toggleMinimize($event)" class="control-btn minimize-btn" title="Minimize">
            <fa-icon [icon]="faMinusCircle"></fa-icon>
          </button>
          <button (click)="toggleEmbedded($event)" class="control-btn embed-btn" title="{{isEmbedded ? 'Float' : 'Embed'}}">
            <fa-icon [icon]="faExpand"></fa-icon>
          </button>
          <button (click)="closePhone($event)" class="control-btn close-btn" title="Close">
            <fa-icon [icon]="faTimes"></fa-icon>
          </button>
        </div><!-- Phone screen (Minecraft video) -->        <div class="phone-screen">
          <div *ngIf="isGenZ === true" class="video-container">
            <div class="loading-animation" *ngIf="isLoading">
              <div class="loading-spinner"></div>
              <p>Loading epic parkour...</p>
            </div>
            <video 
              #videoPlayer
              class="minecraft-video" 
              [class.loaded]="!isLoading"              autoplay 
              loop 
              muted
              playsinline
              (loadeddata)="onVideoLoad()"
              (error)="onVideoError()">
              <source src="assets/videos/minecraft_phone.mp4" type="video/mp4">
              Your browser does not support the video tag.
            </video>
          </div>
          
          <div *ngIf="isGenZ === false" class="non-gen-z-content">
            <p>No worries! Here's something else...</p>
            <div class="loading-animation" *ngIf="isLoading">
              <div class="loading-spinner"></div>
              <p>Loading classic vibes...</p>
            </div>
            <video 
              #rickVideo
              class="rick-video" 
              [class.loaded]="!isLoading"              autoplay 
              loop 
              controls
              playsinline
              (loadeddata)="onVideoLoad()"
              (error)="onVideoError()">
              <source src="assets/videos/minecraft_phone.mp4" type="video/mp4">
              Your browser does not support the video tag.
            </video>
          </div>
        </div>

        <!-- Phone home button / indicator -->
        <div class="phone-home-indicator"></div>
      </div>
    </div>
  `,
  styles: [`    .phone-container {
      position: fixed;
      z-index: 1010; /* Higher than navbar's 1000 */
      width: 350px;
      height: 650px;
      background-color: #111;
      border-radius: 40px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
      overflow: hidden;
      transition: width 0.3s ease, height 0.3s ease, transform 0.3s ease, right 0.3s ease, bottom 0.3s ease;
      border: 10px solid #222;
      cursor: move;
      user-select: none;
      display: flex;
      flex-direction: column;
    }
    
    .phone-container.locked {
      cursor: default;
    }
    
    .phone-container.minimized {
      transform: scale(0.5);
      border-radius: 20px;
      right: 10px;
      bottom: 10px;
    }    .phone-container.embedded {
      position: fixed;
      top: 60px !important; /* Add space for the navbar */
      right: 0 !important;
      left: auto !important;
      height: calc(100vh - 60px); /* Subtract navbar height */
      width: 34%;
      border-radius: 0;
      border-left-width: 2px;
      border-right-width: 0;
      border-top-width: 0;
      border-bottom-width: 0;
      cursor: default;
      z-index: 990; /* Lower than navbar when embedded */
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
    }    .phone-screen {
      flex: 1;
      background-color: #000;
      overflow: hidden;
      position: relative;
      display: flex;
      flex-direction: column;
    }    .video-container {
      position: relative;
      width: 100%;
      height: 100%;
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;
      background-color: black;
    }
    
    /* Center video and maintain a good portion visible */
    .video-container iframe {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 160%;
      height: 160%;
      border: none;
      transform: translate(-50%, -50%);
      z-index: 1;
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
    }    .non-gen-z-content {
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
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }
    
    .minecraft-video, .rick-video {
      width: 100%;
      height: 100%;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      display: block;
      z-index: 2;
      position: relative;
      object-fit: cover;
    }
    
    .loaded {
      opacity: 1;
      transition: opacity 0.5s ease-in-out;
    }
    
    .loading-animation {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 1;
      background-color: rgba(0, 0, 0, 0.8);
    }
    
    .loading-spinner {
      width: 50px;
      height: 50px;
      border: 5px solid rgba(255, 255, 255, 0.2);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    .phone-container.embedded .phone-screen,
    .phone-container.embedded .video-container,
    .phone-container.embedded video {
      height: 100%;
      max-height: 100vh;
    }
    
    .lock-btn {
      color: #ffcc00;
    }
    
    .embed-btn {
      color: #33ccff;
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
export class GenZPhoneComponent implements OnInit, OnDestroy {  // FontAwesome icons
  faTimes = faTimes;
  faMinusCircle = faMinusCircle;
  faCheck = faCheck;
  faX = faX;
  faLock = faLock;
  faLockOpen = faLockOpen;
  faExpand = faExpand;  // Component state
  isVisible = false;
  isMinimized = false;
  isGenZ: boolean | null = null;
  isEmbedded = false;
  isLocked = false; // Whether phone is locked in place (not draggable)
  animationState = 'appear';
  
  // Dragging state
  private isDragging = false;
  private dragOffset = { x: 0, y: 0 };
  position = { x: 100, y: 100 }; // Default position  // Video URLs
  videoUrl!: SafeResourceUrl;
  alternativeVideoUrl!: SafeResourceUrl;
  isLoading = true; // Video loading state
  
  // Services
  private genZService = inject(GenZEasterEggService);
  private sanitizer = inject(DomSanitizer);  private subscription = new Subscription();
  
  constructor() {
    // Sanitize YouTube URLs to prevent XSS
    // Use privacy-enhanced mode (youtube-nocookie.com) to avoid CORS issues
    this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      'https://www.youtube-nocookie.com/embed/n_Dv4JMiwK8?autoplay=1&mute=0&controls=0&fs=0&modestbranding=1&rel=0&showinfo=0&loop=1&playlist=n_Dv4JMiwK8&disablekb=1&iv_load_policy=3&playsinline=1&enablejsapi=1'
    );
    // Use privacy-enhanced mode for this video too
    this.alternativeVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&mute=0&controls=1&fs=0&modestbranding=1&rel=0&showinfo=0'
    );
  }
    ngOnInit(): void {    this.subscription = this.genZService.state$.subscribe(state => {
      this.isVisible = state.isActive;
      this.isGenZ = state.isGenZ;
      this.isMinimized = state.isMinimized;
      this.isEmbedded = state.isEmbedded;
      
      // Position phone in center of screen when it first appears
      if (state.isActive && !this.isDragging && !state.isEmbedded) {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        this.position = {
          x: (screenWidth / 2) - 175, // Half the phone width
          y: (screenHeight / 2) - 325 // Half the phone height
        };
      }
      
      // Position phone on the right side when embedded
      if (state.isEmbedded) {
        const screenHeight = window.innerHeight;
        this.position = {
          x: window.innerWidth * 0.66, // Position at the 66% mark
          y: 0 // At the top
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
  
    startDrag(event: MouseEvent): void {
    // Don't allow dragging in embedded mode or when locked
    if (this.isEmbedded || this.isLocked) return;
    
    this.isDragging = true;
    this.dragOffset = {
      x: event.clientX - this.position.x,
      y: event.clientY - this.position.y
    };
    
    // Prevent text selection during drag
    event.preventDefault();
  }
  
  toggleLock(event: MouseEvent): void {
    event.stopPropagation();
    this.isLocked = !this.isLocked;
  }
  
  toggleEmbedded(event: MouseEvent): void {
    event.stopPropagation();
    this.genZService.toggleEmbedded();
  }
  
  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (this.isDragging && !this.isEmbedded) {
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
  
  @HostListener('document:mouseup')  onMouseUp(): void {
    this.isDragging = false;
  }
  
  onVideoLoad(): void {
    // Mark video as loaded after a short delay to ensure it's visible
    setTimeout(() => {
      this.isLoading = false;
    }, 500);
  }
  
  onVideoError(): void {
    console.error('Video failed to load');
    this.isLoading = false;
  }
}
