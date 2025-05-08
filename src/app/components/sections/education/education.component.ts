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
    const lazyImages = this.elementRef.nativeElement.querySelectorAll('img[loading="lazy"]');
    
    // Create intersection observer
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          
          // Once the image is loaded, add the 'loaded' class for fade-in effect
          img.onload = () => {
            img.classList.add('loaded');
          };
          
          // Stop observing once loaded
          observer.unobserve(img);
        }
      });
    });
    
    // Observe all lazy images
    lazyImages.forEach((img: Element) => {
      imageObserver.observe(img);
    });
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
