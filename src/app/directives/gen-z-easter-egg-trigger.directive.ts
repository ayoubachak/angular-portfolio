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
  
  // Also trigger with a specific hover pattern
  private hoverCount = 0;
  private lastHoverTime = 0;
    @HostListener('mouseenter')
  onMouseEnter(): void {
    const now = Date.now();
    
    // Log a hint in the console for curious developers
    if (!this.hasLoggedHint) {
      console.log('%c🎮 Found something interesting? Try the Konami code or click 3 times quickly!', 
                 'background: linear-gradient(to right, #8844ff, #ff44dd); color: white; padding: 8px; border-radius: 4px; font-weight: bold;');
      this.hasLoggedHint = true;
    }
    
    // If we hover quickly in succession (within 1.5 seconds)
    if (now - this.lastHoverTime < 1500) {
      this.hoverCount++;
    } else {
      this.hoverCount = 1;
    }
    
    this.lastHoverTime = now;
    
    // 5 quick hovers in succession will trigger the Easter egg
    if (this.hoverCount >= 5) {
      this.genZService.activateEasterEgg();
      this.hoverCount = 0;
    }
  }
    // Konami code implementation
  private konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  private konamiIndex = 0;
  
  // Secret word implementation
  private secretWord = 'minecraft';
  private typedKeys: string[] = [];
    @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    // Only check for keystrokes if in the viewport section
    if (!this.isElementInViewport()) {
      return;
    }
    
    // Check for Konami code
    if (event.key === this.konamiCode[this.konamiIndex]) {
      this.konamiIndex++;
      
      // If the complete Konami code was entered
      if (this.konamiIndex === this.konamiCode.length) {
        console.log('%c🎮 KONAMI CODE ACTIVATED!', 'color: #ff44dd; font-size: 20px; font-weight: bold;');
        this.genZService.activateEasterEgg();
        this.konamiIndex = 0;
      }
    } else {
      // Reset Konami code on incorrect key
      this.konamiIndex = 0;
    }
    
    // Check for secret word typing (only letters and numbers)
    if (event.key.length === 1 && /[a-zA-Z0-9]/.test(event.key)) {
      // Add the key to our tracked keys
      this.typedKeys.push(event.key.toLowerCase());
      
      // Keep only the last N keys where N is the length of our secret word
      if (this.typedKeys.length > this.secretWord.length) {
        this.typedKeys.shift();
      }
      
      // Check if the typed keys match our secret word
      const typedString = this.typedKeys.join('');
      if (typedString === this.secretWord) {
        console.log('%c🎮 SECRET WORD DISCOVERED!', 'color: #8844ff; font-size: 20px; font-weight: bold;');
        this.genZService.activateEasterEgg();
        this.typedKeys = [];
      }
    }
  }
  
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
