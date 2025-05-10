import { Component, OnInit, AfterViewInit, ElementRef, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentService, Education } from '../../../services/content.service';
import { ScrollAnimationDirective } from '../../../directives/scroll-animation.directive';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faGlobe, faFileAlt, faInfoCircle, faDownload, 
  faBook, faCode, faLaptopCode 
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-education',
  standalone: true,
  imports: [CommonModule, ScrollAnimationDirective, FontAwesomeModule],
  templateUrl: './education.component.html',
  styleUrl: './education.component.css'
})
export class EducationComponent implements OnInit, AfterViewInit {
  education: Education[] = [];
  selectedEducation: Education | null = null;
  showDetailsModal = false;
  
  // Icons
  faGlobe = faGlobe;
  faFileAlt = faFileAlt;
  faInfoCircle = faInfoCircle;
  faDownload = faDownload;
  faBook = faBook;
  faCode = faCode;
  faLaptopCode = faLaptopCode;

  constructor(
    private contentService: ContentService,
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    const portfolioContent = this.contentService.getPortfolioContent();
    this.education = portfolioContent.education;
  }
  
  ngAfterViewInit(): void {
    // Set up lazy loading for images
    this.setupLazyLoading();
  }
  
  /**
   * Set up lazy loading for images
   */
  setupLazyLoading(): void {
    const lazyImages = this.elementRef.nativeElement.querySelectorAll('img[data-src]');
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const dataSrc = img.getAttribute('data-src');
          if (dataSrc) {
            img.src = dataSrc;
          }
          // Fade-in effect on load
          img.onload = () => img.classList.add('loaded');
          // Fallback on error
          img.onerror = () => img.src = 'assets/images/placeholders/placeholder.jpg';
          obs.unobserve(img);
        }
      });
    }, { rootMargin: '0px 0px 200px 0px' });
    lazyImages.forEach((img: Element) => observer.observe(img));
  }
  
  // Open the details modal
  openDetails(education: Education): void {
    this.selectedEducation = education;
    this.showDetailsModal = true;
    
    // Prevent body scrolling when modal is open
    this.renderer.addClass(document.body, 'modal-open');
    this.renderer.setStyle(document.body, 'overflow', 'hidden');
  }
  
  // Close the details modal
  closeDetails(): void {
    this.showDetailsModal = false;
    
    // Re-enable body scrolling
    this.renderer.removeClass(document.body, 'modal-open');
    this.renderer.removeStyle(document.body, 'overflow');
    
    setTimeout(() => {
      this.selectedEducation = null;
    }, 300); // Delay clearing the data until after animation completes
  }
}
