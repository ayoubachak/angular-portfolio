import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GenZEasterEggTriggerDirective } from '../../directives/gen-z-easter-egg-trigger.directive';

@Component({
  selector: 'app-easter-egg-hint',
  standalone: true,
  imports: [CommonModule, GenZEasterEggTriggerDirective],
  template: `
    <div 
      appGenZEasterEggTrigger
      class="easter-egg-hint" 
      title="Hey there... curious about something?">
      <div class="pixel-art-controller">
        <div class="controller-body">
          <div class="controller-left"></div>
          <div class="controller-right"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`    .easter-egg-hint {
      position: absolute;
      top: 20px;
      left: 20px;
      width: 30px;
      height: 30px;
      opacity: 0.15;
      cursor: default;
      transition: all 0.3s ease;
      z-index: 5;
      overflow: hidden;
      filter: drop-shadow(0 0 3px var(--accent-color));
    }
    
    .easter-egg-hint:hover {
      opacity: 0.7;
      transform: rotate(5deg) scale(1.2);
      filter: drop-shadow(0 0 8px var(--accent-color));
    }
    
    /* Pixel art game controller */
    .pixel-art-controller {
      width: 100%;
      height: 100%;
      position: relative;
    }
    
    .controller-body {
      width: 16px;
      height: 10px;
      background: currentColor;
      border-radius: 2px;
      position: relative;
    }
    
    .controller-left, .controller-right {
      width: 6px;
      height: 6px;
      background: currentColor;
      border-radius: 50%;
      position: absolute;
      top: 2px;
    }
    
    .controller-left {
      left: -2px;
    }
    
    .controller-right {
      right: -2px;
    }
    
    /* Easter egg hint appears in console */
    .easter-egg-hint:hover::after {
      content: '';
      position: absolute;
      inset: 0;
      background: radial-gradient(circle, rgba(var(--accent-color-rgb), 0.3) 0%, transparent 70%);
      animation: ripple 1s ease-out;
    }
    
    @keyframes ripple {
      0% { transform: scale(0.8); opacity: 1; }
      100% { transform: scale(2); opacity: 0; }
    }
  `]
})
export class EasterEggHintComponent {
  // Log a hint in the console on init
  ngOnInit() {
    console.log(
      '%cHidden Easter Eggs: Look for 🎮 elements in the page!',
      'color: #FF44DD; font-size: 12px; font-weight: bold;'
    );
  }
}
