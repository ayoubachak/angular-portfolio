import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-scroll-to-top',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  template: `
    <button 
      *ngIf="isVisible"
      (click)="scrollToTop()" 
      class="fixed right-5 bottom-5 z-50 w-12 h-12 flex items-center justify-center bg-accent-color text-button-text rounded-full shadow-lg hover:bg-accent-color/90 transition-all duration-300 transform hover:-translate-y-1">
      <fa-icon [icon]="faArrowUp"></fa-icon>
    </button>
  `,
  styles: []
})
export class ScrollToTopComponent implements OnInit {
  faArrowUp = faArrowUp;
  isVisible = false;
  
  ngOnInit(): void {
    this.checkScrollPosition();
  }
  
  @HostListener('window:scroll', [])
  checkScrollPosition(): void {
    // Show button when page is scrolled down 500px
    this.isVisible = window.scrollY > 500;
  }
  
  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}