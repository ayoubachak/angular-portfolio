import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appScrollAnimation]',
  standalone: true
})
export class ScrollAnimationDirective implements OnInit {
  @Input() animationClass: string = 'animate';
  @Input() offset: number = 100; // Distance from the bottom of the viewport
  @Input() reverse: boolean = true; // Whether the animation should reverse on scroll up
  
  private element: HTMLElement;
  private isAnimated: boolean = false;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {
    this.element = this.elementRef.nativeElement;
  }

  ngOnInit(): void {
    // Add initial state class
    this.renderer.addClass(this.element, 'scroll-animation');
    
    // Set up scroll listener
    this.setupScrollListener();
  }

  private setupScrollListener(): void {
    window.addEventListener('scroll', () => this.checkScroll());
    // Trigger initial check (in case elements are already in view)
    setTimeout(() => this.checkScroll(), 100);
  }

  private checkScroll(): void {
    const scrollPosition = window.scrollY + window.innerHeight;
    const elementPosition = this.element.offsetTop;
    
    // Element is in view
    if (scrollPosition > elementPosition + this.offset) {
      if (!this.isAnimated) {
        this.renderer.addClass(this.element, this.animationClass);
        this.isAnimated = true;
      }
    } else if (this.reverse) {
      // Element is out of view and reverse is enabled
      if (this.isAnimated) {
        this.renderer.removeClass(this.element, this.animationClass);
        this.isAnimated = false;
      }
    }
  }
}
