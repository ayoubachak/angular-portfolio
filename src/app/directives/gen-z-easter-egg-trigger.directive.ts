import { Directive, ElementRef, HostListener, inject } from '@angular/core';
import { GenZEasterEggService } from '../services/gen-z-easter-egg.service';

@Directive({
  selector: '[appGenZEasterEggTrigger]',
  standalone: true
})
export class GenZEasterEggTriggerDirective {
  private element = inject(ElementRef);
  private genZService = inject(GenZEasterEggService);
  
  private clickCount = 0;
  private lastClickTime = 0;
  private resetTimeout: any = null;
  private hasLoggedHint = false;
  
  // Hover pattern properties
  private hoverCount = 0;
  private lastHoverTime = 0;
  
  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    // Require specific click pattern (3 clicks within 2 seconds)
    const now = Date.now();
    
    // Reset click counter if it's been more than 2 seconds since last click
    if (now - this.lastClickTime > 2000) {
      this.clickCount = 0;
    }
    
    this.clickCount++;
    this.lastClickTime = now;
    
    // Clear any existing timeout
    if (this.resetTimeout) {
      clearTimeout(this.resetTimeout);
    }
    
    // Reset after 2 seconds
    this.resetTimeout = setTimeout(() => {
      this.clickCount = 0;
    }, 2000);
    
    // Activate after 3 clicks
    if (this.clickCount >= 3) {
      this.genZService.activateEasterEgg();
      this.clickCount = 0;
    }
  }
  
  @HostListener('mouseenter')
  onMouseEnter(): void {
    const now = Date.now();
    
    // Log a hint in the console for curious developers (only once)
    if (!this.hasLoggedHint) {
      console.log('%c🎮 Found something interesting? Try clicking 3 times quickly!', 
                 'background: linear-gradient(to right, #8844ff, #ff44dd); color: white; padding: 8px; border-radius: 4px; font-weight: bold;');
      this.hasLoggedHint = true;
    }
    
    // If we hover quickly in succession (within 1.5 seconds), but only if visible
    if (!this.isElementInViewport()) return;
    
    if (now - this.lastHoverTime < 1500) {
      this.hoverCount++;
    } else {
      this.hoverCount = 1;
    }
    
    this.lastHoverTime = now;
    
    // Require more hovers to prevent accidental triggers (increased from 5 to 8)
    if (this.hoverCount >= 8) {
      this.genZService.activateEasterEgg();
      this.hoverCount = 0;
    }
  }
  
  // Removed global keydown listener to prevent accidental triggers during scroll
  // Users can still activate via click pattern or hover pattern on specific elements
  
  private isElementInViewport(): boolean {
    const rect = this.element.nativeElement.getBoundingClientRect();
    
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }
}
