// filepath: c:\Users\etudiant-root\Work\angular-portfolio\portfolio\src\app\directives\scroll-animation.directive.ts
import { Directive, ElementRef, Input, OnInit, Renderer2, OnDestroy } from '@angular/core';

@Directive({
  selector: '[appScrollAnimation]',
  standalone: true
})
export class ScrollAnimationDirective implements OnInit, OnDestroy {
  @Input() animationClass: string = 'animate';
  @Input() offset: number = 100; // Distance from the bottom of the viewport
  @Input() reverse: boolean = true; // Whether the animation should reverse on scroll up
  @Input() scrollContainer: string = ''; // CSS selector for the scrollable container
  
  private element: HTMLElement;
  private isAnimated: boolean = false;
  private scrollElement: HTMLElement | Window = window;
  private scrollHandler: () => void;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {
    this.element = this.elementRef.nativeElement;
    this.scrollHandler = () => this.checkScroll();
  }

  ngOnInit(): void {
    // Add initial state class
    this.renderer.addClass(this.element, 'scroll-animation');
    
    // Set up scroll listener
    this.setupScrollListener();
  }

  ngOnDestroy(): void {
    // Clean up scroll event listener
    if (this.scrollElement === window) {
      window.removeEventListener('scroll', this.scrollHandler);
    } else {
      (this.scrollElement as HTMLElement).removeEventListener('scroll', this.scrollHandler);
    }
  }

  private setupScrollListener(): void {
    // If a container selector is provided, use that as the scroll element
    if (this.scrollContainer) {
      const containerElement = document.querySelector(this.scrollContainer);
      if (containerElement) {
        this.scrollElement = containerElement as HTMLElement;
        this.scrollElement.addEventListener('scroll', this.scrollHandler);
      }
    } else {
      // Otherwise use window as the scroll element
      window.addEventListener('scroll', this.scrollHandler);
    }
    
    // Trigger initial check (in case elements are already in view)
    setTimeout(() => this.checkScroll(), 100);
  }

  private checkScroll(): void {
    let scrollPosition, elementPosition;
    
    if (this.scrollElement === window) {
      // Global window scrolling
      scrollPosition = window.scrollY + window.innerHeight;
      elementPosition = this.element.getBoundingClientRect().top + window.scrollY;
    } else {
      // Container scrolling
      const container = this.scrollElement as HTMLElement;
      scrollPosition = container.scrollTop + container.clientHeight;
      
      // Get position of element relative to the container
      const containerRect = container.getBoundingClientRect();
      const elementRect = this.element.getBoundingClientRect();
      
      // Calculate the position of the element relative to the container
      elementPosition = elementRect.top - containerRect.top + container.scrollTop;
    }
    
    // Element is in view
    if (scrollPosition > elementPosition + this.offset) {
      if (!this.isAnimated) {
        // Add each class if multiple classes are specified
        this.animationClass.split(' ').forEach(cls => {
          this.renderer.addClass(this.element, cls);
        });
        // Also add 'show' to trigger CSS animation
        this.renderer.addClass(this.element, 'show');
        this.isAnimated = true;
      }
    } else if (this.reverse) {
      // Element is out of view and reverse is enabled
      if (this.isAnimated) {
        // Remove each class if multiple classes are specified
        this.animationClass.split(' ').forEach(cls => {
          this.renderer.removeClass(this.element, cls);
        });
        // Also remove 'show'
        this.renderer.removeClass(this.element, 'show');
        this.isAnimated = false;
      }
    }
  }
}
