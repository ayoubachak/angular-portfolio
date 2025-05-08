import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentService, Testimonial } from '../../../services/content.service';
import { ScrollAnimationDirective } from '../../../directives/scroll-animation.directive';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { faQuoteLeft } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [CommonModule, ScrollAnimationDirective, FontAwesomeModule],
  templateUrl: './testimonials.component.html',
  styleUrl: './testimonials.component.css'
})
export class TestimonialsComponent implements OnInit {
  testimonials: Testimonial[] = [];
  currentIndex: number = 0;
  
  // Icons
  faQuoteLeft = faQuoteLeft;
  faLinkedin = faLinkedin;

  constructor(private contentService: ContentService) {}

  ngOnInit(): void {
    const portfolioContent = this.contentService.getPortfolioContent();
    this.testimonials = portfolioContent.testimonials;
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
