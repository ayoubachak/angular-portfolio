import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentService, Testimonial } from '../../../services/content.service';
import { ScrollAnimationDirective } from '../../../directives/scroll-animation.directive';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { faQuoteLeft } from '@fortawesome/free-solid-svg-icons';

interface BackgroundElement {
  id: string;
  type: 'quote-bubble' | 'connection-line' | 'network-node' | 'floating-word' | 'floating-star' | 'recommendation-badge';
  x: number;
  y: number;
  width?: number;
  height?: number;
  content?: string;
  delay?: number;
}

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [CommonModule, ScrollAnimationDirective, FontAwesomeModule],
  templateUrl: './testimonials.component.html',
  styleUrl: './testimonials.component.css'
})
export class TestimonialsComponent implements OnInit, OnDestroy {
  testimonials: Testimonial[] = [];
  currentIndex: number = 0;
  backgroundElements: BackgroundElement[] = [];

  // Icons
  faQuoteLeft = faQuoteLeft;
  faLinkedin = faLinkedin;

  // Professional words for floating animation
  private professionalWords = [
    'Reliable', 'Dedicated', 'Innovative', 'Professional', 'Collaborative',
    'Excellence', 'Quality', 'Teamwork', 'Leadership', 'Creative',
    'Efficient', 'Motivated', 'Skilled', 'Experienced', 'Trustworthy',
    'Results-driven', 'Problem-solver', 'Detail-oriented', 'Passionate',
    'Committed', 'Analytical', 'Strategic', 'Proactive', 'Adaptable'
  ];

  private animationFrame: number | null = null;

  constructor(
    private contentService: ContentService,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.testimonials = this.contentService.getPortfolioContent().testimonials;
    
    setTimeout(() => {
      this.generateBackgroundElements();
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }

  private generateBackgroundElements(): void {
    const container = this.elementRef.nativeElement;
    const width = container.offsetWidth;
    const height = container.offsetHeight;

    // Generate quote bubbles
    for (let i = 0; i < 8; i++) {
      this.backgroundElements.push({
        id: `quote-bubble-${i}`,
        type: 'quote-bubble',
        x: Math.random() * (width - 60),
        y: Math.random() * (height - 60),
        delay: Math.random() * 8
      });
    }

    // Generate connection lines
    for (let i = 0; i < 12; i++) {
      const startX = Math.random() * width;
      const startY = Math.random() * height;
      const endX = Math.random() * width;
      const lineWidth = Math.abs(endX - startX);
      
      this.backgroundElements.push({
        id: `connection-line-${i}`,
        type: 'connection-line',
        x: Math.min(startX, endX),
        y: startY,
        width: lineWidth,
        delay: Math.random() * 6
      });
    }

    // Generate network nodes
    for (let i = 0; i < 15; i++) {
      this.backgroundElements.push({
        id: `network-node-${i}`,
        type: 'network-node',
        x: Math.random() * (width - 12),
        y: Math.random() * (height - 12),
        delay: Math.random() * 4
      });
    }

    // Generate floating words
    for (let i = 0; i < 6; i++) {
      this.backgroundElements.push({
        id: `floating-word-${i}`,
        type: 'floating-word',
        x: -100, // Start off-screen
        y: Math.random() * (height - 50),
        content: this.professionalWords[Math.floor(Math.random() * this.professionalWords.length)],
        delay: Math.random() * 12
      });
    }

    // Generate floating stars
    for (let i = 0; i < 10; i++) {
      this.backgroundElements.push({
        id: `floating-star-${i}`,
        type: 'floating-star',
        x: Math.random() * (width - 20),
        y: Math.random() * (height - 20),
        content: '★',
        delay: Math.random() * 3
      });
    }

    // Generate recommendation badges
    for (let i = 0; i < 6; i++) {
      this.backgroundElements.push({
        id: `recommendation-badge-${i}`,
        type: 'recommendation-badge',
        x: Math.random() * (width - 40),
        y: Math.random() * (height - 40),
        delay: Math.random() * 10
      });
    }
  }

  getElementStyle(element: BackgroundElement): any {
    const baseStyle: any = {
      left: `${element.x}px`,
      top: `${element.y}px`,
      animationDelay: `${element.delay || 0}s`
    };

    if (element.width) {
      baseStyle['width'] = `${element.width}px`;
    }
    if (element.height) {
      baseStyle['height'] = `${element.height}px`;
    }

    return baseStyle;
  }

  trackByElementId(index: number, element: BackgroundElement): string {
    return element.id;
  }

  next(): void {
    this.currentIndex = (this.currentIndex + 1) % this.testimonials.length;
  }
  
  previous(): void {
    this.currentIndex = (this.currentIndex - 1 + this.testimonials.length) % this.testimonials.length;
  }
  
  goToSlide(index: number): void {
    this.currentIndex = index;
  }
}
