import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EasterEggService } from '../../services/easter-egg.service';
import { Subscription } from 'rxjs';
import { trigger, transition, style, animate, keyframes } from '@angular/animations';

@Component({
  selector: 'app-light-mode-easter-egg',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isAnimating" class="easter-egg-container">
      <img 
        src="assets/images/extras/fish-eyes-burning.png" 
        alt="My eyes!" 
        class="burning-eyes-image"
        [@fishAnimation]="animationState"
      >
      <div class="easter-egg-text" [@textAnimation]="animationState">MY EYES!!</div>
    </div>
  `,
  styles: [`
    .easter-egg-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      pointer-events: none;
      z-index: 9999;
    }
    
    .burning-eyes-image {
      max-width: 300px;
      filter: drop-shadow(0 0 20px #ff6b00);
    }
    
    .easter-egg-text {
      font-size: 3rem;
      font-weight: bold;
      color: #ff3d00;
      text-shadow: 0 0 10px #ff8a00, 0 0 20px #ff8a00;
      margin-top: 1rem;
      font-family: "Comic Sans MS", cursive, sans-serif;
    }
    
    @media (max-width: 768px) {
      .burning-eyes-image {
        max-width: 200px;
      }
      
      .easter-egg-text {
        font-size: 2rem;
      }
    }
  `],
  animations: [
    trigger('fishAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.2) rotate(-20deg)' }),
        animate('0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)', 
          style({ opacity: 1, transform: 'scale(1) rotate(0)' })
        ),
        animate('2s ease-in-out', keyframes([
          style({ transform: 'scale(1) rotate(0)', offset: 0 }),
          style({ transform: 'scale(1.1) rotate(5deg)', offset: 0.2 }),
          style({ transform: 'scale(0.95) rotate(-3deg)', offset: 0.4 }),
          style({ transform: 'scale(1.05) rotate(2deg)', offset: 0.6 }),
          style({ transform: 'scale(1) rotate(0)', offset: 0.8 }),
          style({ transform: 'scale(1.5) rotate(0)', opacity: 0, offset: 1 })
        ]))
      ])
    ]),
    trigger('textAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.3s 0.2s ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
        animate('2s 0.5s ease-in-out', keyframes([
          style({ transform: 'scale(1)', offset: 0 }),
          style({ transform: 'scale(1.2)', offset: 0.25 }),
          style({ transform: 'scale(1)', offset: 0.5 }),
          style({ transform: 'scale(1.1)', offset: 0.75 }),
          style({ transform: 'scale(1.5)', opacity: 0, offset: 1 })
        ]))
      ])
    ])
  ]
})
export class LightModeEasterEggComponent implements OnInit, OnDestroy {
  isAnimating = false;
  animationState = 'active';
  private subscription: Subscription = new Subscription();
  
  private easterEggService = inject(EasterEggService);
    ngOnInit(): void {
    this.subscription = this.easterEggService.lightModeAnimationPlaying$.subscribe(
      (isPlaying: boolean) => {
        this.isAnimating = isPlaying;
      }
    );
  }
  
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
