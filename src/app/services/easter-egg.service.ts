import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EasterEggService {
  // Track if light mode activation animation is playing
  private lightModeAnimationPlayingSubject = new BehaviorSubject<boolean>(false);
  lightModeAnimationPlaying$ = this.lightModeAnimationPlayingSubject.asObservable();
  
  // Store animation timer references
  private animationTimers: any[] = [];
  
  constructor() {}
  
  /**
   * Trigger the burning eyes fish animation when switching to light mode
   */
  triggerLightModeAnimation(): void {
    // Only play if not already playing
    if (this.lightModeAnimationPlayingSubject.value) {
      return;
    }
    
    // Set animation as playing
    this.lightModeAnimationPlayingSubject.next(true);
    
    // Auto-clear after animation duration
    const timer = setTimeout(() => {
      this.lightModeAnimationPlayingSubject.next(false);
    }, 3000); // Animation lasts for 3 seconds
    
    this.animationTimers.push(timer);
  }
  
  /**
   * Cancel all active animations
   */
  clearAnimations(): void {
    this.animationTimers.forEach(timer => clearTimeout(timer));
    this.animationTimers = [];
    this.lightModeAnimationPlayingSubject.next(false);
  }
}
