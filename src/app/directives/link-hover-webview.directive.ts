import { Directive, ElementRef, HostListener, Input, OnInit, Renderer2 } from '@angular/core';
import { WebviewService } from '../services/webview.service';

@Directive({
  selector: '[appLinkHoverWebview]',
  standalone: true
})
export class LinkHoverWebviewDirective implements OnInit {
  @Input() appLinkHoverWebview: string = ''; // Text to scan for links
  private hoveredUrl: string | null = null;
  private enterTimeout: any;
  private leaveTimeout: any;
  
  // Delay before showing/hiding webview (ms)
  private readonly HOVER_DELAY = 600;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private webviewService: WebviewService
  ) {}

  ngOnInit(): void {
    if (!this.appLinkHoverWebview) return;
    
    // Extract URLs
    const urls = this.webviewService.extractUrls(this.appLinkHoverWebview);
    
    // If there are URLs, add a special class to indicate hoverable content
    if (urls.length > 0) {
      this.renderer.addClass(this.el.nativeElement, 'has-hoverable-links');
    }
  }

  @HostListener('mouseenter')
  onMouseEnter(): void {
    if (!this.appLinkHoverWebview) return;
    
    // Extract URLs
    const urls = this.webviewService.extractUrls(this.appLinkHoverWebview);
    if (urls.length === 0) return;
    
    // Get the first URL
    const url = urls[0];
    this.hoveredUrl = url;
    
    // Clear any existing leave timeout
    if (this.leaveTimeout) {
      clearTimeout(this.leaveTimeout);
      this.leaveTimeout = null;
    }
    
    // Set a timeout to load the URL
    this.enterTimeout = setTimeout(() => {
      if (this.hoveredUrl === url) {
        this.webviewService.loadUrl(url);
      }
    }, this.HOVER_DELAY);
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    // Clear enter timeout if it exists
    if (this.enterTimeout) {
      clearTimeout(this.enterTimeout);
      this.enterTimeout = null;
    }
    
    // Set a timeout to reset the webview
    this.leaveTimeout = setTimeout(() => {
      if (!document.querySelector('.webview-modal:hover')) {
        this.webviewService.resetWebview();
      }
      this.hoveredUrl = null;
    }, this.HOVER_DELAY);
  }
} 