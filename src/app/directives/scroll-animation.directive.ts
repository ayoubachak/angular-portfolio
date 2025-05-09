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
        console.log("Animating element:", this.element, this.animationClass);
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
        console.log("Removing animation:", this.element, this.animationClass);
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
