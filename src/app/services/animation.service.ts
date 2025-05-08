import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AnimationService {
  // Animation class mappings
  private animationClasses = {
    fadeIn: 'animate-fade-in',
    fadeInUp: 'animate-fade-in-up',
    fadeInDown: 'animate-fade-in-down',
    fadeInLeft: 'animate-fade-in-left',
    fadeInRight: 'animate-fade-in-right',
    scaleIn: 'animate-scale-in',
    slideInLeft: 'animate-slide-in-left',
    slideInRight: 'animate-slide-in-right',
    bounce: 'animate-bounce',
    rotateIn: 'animate-rotate-in'
  };

  constructor() { }

  /**
   * Get the CSS class for a specific animation
   */
  getAnimationClass(animationType: keyof typeof this.animationClasses): string {
    return this.animationClasses[animationType] || '';
  }

  /**
   * Gets staggered animation delay class
   * @param index Item index in a list
   * @param baseDelay Base delay in milliseconds
   */
  getStaggeredDelay(index: number, baseDelay: number = 100): string {
    const delay = index * baseDelay;
    return `animation-delay-${delay}`;
  }
}
