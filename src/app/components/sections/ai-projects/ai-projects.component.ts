import { Component, OnInit, OnDestroy, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentService, Project } from '../../../services/content.service';
import { ScrollAnimationDirective } from '../../../directives/scroll-animation.directive';
import { LinkHoverWebviewDirective } from '../../../directives/link-hover-webview.directive';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faExternalLinkAlt, faCode, faTimesCircle, faMobile, faDesktop } from '@fortawesome/free-solid-svg-icons';
import { WebviewService } from '../../../services/webview.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

interface BackgroundElement {
  id: string;
  type: 'node' | 'connection' | 'keyword' | 'transformer' | 'attention' | 'matrix' | 'gradient';
  x: number;
  y: number;
  width?: number;
  height?: number;
  content?: string;
  originalX?: number;
  originalY?: number;
}

@Component({
  selector: 'app-ai-projects',
  standalone: true,
  imports: [
    CommonModule, 
    ScrollAnimationDirective, 
    LinkHoverWebviewDirective,
    FontAwesomeModule
  ],
  templateUrl: './ai-projects.component.html',
  styleUrl: './ai-projects.component.css'
})
export class AiProjectsComponent implements OnInit, OnDestroy {
  @ViewChild('neuralBackground', { static: false }) neuralBackground!: ElementRef;
  
  aiProjects: Project[] = [];
  backgroundElements: BackgroundElement[] = [];
  // Display control for initial and full list
  displayedAiProjects: Project[] = [];
  showDisplayMore: boolean = false;
  private initialDisplayCount = 4;
  
  // Icons
  faExternalLinkAlt = faExternalLinkAlt;
  faCode = faCode;
  faTimesCircle = faTimesCircle;
  faMobile = faMobile;
  faDesktop = faDesktop;

  // Modal state properties (similar to GitHub component)
  activeProject: Project | null = null;
  showIframe: boolean = false;
  safePreviewUrl: SafeResourceUrl | null = null;
  iframeLoading: boolean = true;
  isMobileView: boolean = false;

  @ViewChild('previewModal') previewModal!: ElementRef;

  // ML Keywords for floating background
  private mlKeywords = [
    'Neural Network', 'Deep Learning', 'Transformer', 'Attention', 'BERT', 'GPT',
    'CNN', 'RNN', 'LSTM', 'GAN', 'VAE', 'Autoencoder', 'Backpropagation',
    'Gradient Descent', 'Adam', 'ReLU', 'Softmax', 'Dropout', 'Batch Norm',
    'Cross Entropy', 'MSE', 'Overfitting', 'Regularization', 'L1', 'L2',
    'Feature Map', 'Pooling', 'Convolution', 'Embedding', 'Tokenization',
    'Fine-tuning', 'Transfer Learning', 'Multi-head', 'Self-attention',
    'Encoder', 'Decoder', 'Seq2Seq', 'BLEU', 'Perplexity', 'Sigmoid',
    'Tanh', 'Leaky ReLU', 'Xavier', 'He Init', 'Learning Rate', 'Momentum'
  ];

  private mouseX = 0;
  private mouseY = 0;
  private animationFrame: number | null = null;

  constructor(
    private contentService: ContentService,
    private webviewService: WebviewService,
    private elementRef: ElementRef,
    private domSanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.aiProjects = this.contentService.getAiProjects();
    setTimeout(() => {
      this.generateBackgroundElements();
      this.startMouseTracking();
    }, 100);
    // Set up initial slice and display control
    this.displayedAiProjects = this.aiProjects.slice(0, this.initialDisplayCount);
    this.showDisplayMore = this.aiProjects.length > this.initialDisplayCount;
  }

  ngOnDestroy(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    const rect = this.elementRef.nativeElement.getBoundingClientRect();
    this.mouseX = event.clientX - rect.left;
    this.mouseY = event.clientY - rect.top;
  }

  /**
   * Extract GitHub Pages URL from GitHub repository URL
   */
  private extractGitHubPagesUrl(repoUrl: string): string | null {
    try {
      // Parse GitHub repository URL
      // Expected format: https://github.com/username/repository-name.git
      const match = repoUrl.match(/https:\/\/github\.com\/([^\/]+)\/([^\/]+)(?:\.git)?/);
      
      if (match) {
        const username = match[1];
        const repoName = match[2].replace('.git', ''); // Remove .git if present
        
        // Construct GitHub Pages URL
        // Format: https://username.github.io/repository-name
        return `https://${username}.github.io/${repoName}`;
      }
      
      return null;
    } catch (error) {
      console.error('Error extracting GitHub Pages URL:', error);
      return null;
    }
  }

  /**
   * Get the GitHub Pages URL for a project
   */
  getGitHubPagesUrl(project: Project): string | null {
    if (!project.repoUrl) return null;
    return this.extractGitHubPagesUrl(project.repoUrl);
  }

  /**
   * Check if a project has a GitHub Pages URL
   */
  hasGitHubPages(project: Project): boolean {
    return this.getGitHubPagesUrl(project) !== null;
  }

  private generateBackgroundElements(): void {
    const container = this.elementRef.nativeElement;
    const width = container.offsetWidth;
    const height = container.offsetHeight;

    // Generate neural nodes
    for (let i = 0; i < 25; i++) {
      this.backgroundElements.push({
        id: `node-${i}`,
        type: 'node',
        x: Math.random() * width,
        y: Math.random() * height
      });
    }

    // Generate connections between nodes
    for (let i = 0; i < 15; i++) {
      const startX = Math.random() * width;
      const startY = Math.random() * height;
      const endX = Math.random() * width;
      const endY = Math.random() * height;
      const connectionWidth = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
      const angle = Math.atan2(endY - startY, endX - startX) * 180 / Math.PI;

      this.backgroundElements.push({
        id: `connection-${i}`,
        type: 'connection',
        x: startX,
        y: startY,
        width: connectionWidth,
        height: 1
      });
    }

    // Generate floating ML keywords
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * (width - 100);
      const y = Math.random() * (height - 50);
      this.backgroundElements.push({
        id: `keyword-${i}`,
        type: 'keyword',
        x,
        y,
        originalX: x,
        originalY: y,
        content: this.mlKeywords[Math.floor(Math.random() * this.mlKeywords.length)]
      });
    }

    // Generate transformer blocks
    for (let i = 0; i < 8; i++) {
      this.backgroundElements.push({
        id: `transformer-${i}`,
        type: 'transformer',
        x: Math.random() * (width - 60),
        y: Math.random() * (height - 20)
      });
    }

    // Generate attention heads
    for (let i = 0; i < 12; i++) {
      this.backgroundElements.push({
        id: `attention-${i}`,
        type: 'attention',
        x: Math.random() * (width - 16),
        y: Math.random() * (height - 16)
      });
    }

    // Generate matrix operations
    for (let i = 0; i < 6; i++) {
      this.backgroundElements.push({
        id: `matrix-${i}`,
        type: 'matrix',
        x: Math.random() * (width - 40),
        y: Math.random() * (height - 30)
      });
    }

    // Generate gradient flows
    for (let i = 0; i < 10; i++) {
      this.backgroundElements.push({
        id: `gradient-${i}`,
        type: 'gradient',
        x: Math.random() * (width - 2),
        y: Math.random() * (height - 80)
      });
    }
  }

  private startMouseTracking(): void {
    const updatePositions = () => {
      this.backgroundElements.forEach(element => {
        if (element.type === 'keyword' && element.originalX !== undefined && element.originalY !== undefined) {
          const dx = this.mouseX - element.x;
          const dy = this.mouseY - element.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const repelDistance = 100;

          if (distance < repelDistance && distance > 0) {
            const force = (repelDistance - distance) / repelDistance;
            const repelX = element.x - (dx / distance) * force * 30;
            const repelY = element.y - (dy / distance) * force * 30;
            
            element.x = repelX;
            element.y = repelY;
          } else {
            // Gradually return to original position
            const returnForce = 0.05;
            element.x += (element.originalX - element.x) * returnForce;
            element.y += (element.originalY - element.y) * returnForce;
          }
        }
      });

      this.animationFrame = requestAnimationFrame(updatePositions);
    };

    updatePositions();
  }

  getElementStyle(element: BackgroundElement): any {
    const baseStyle: any = {
      left: `${element.x}px`,
      top: `${element.y}px`
    };

    if (element.width) {
      baseStyle['width'] = `${element.width}px`;
    }
    if (element.height) {
      baseStyle['height'] = `${element.height}px`;
    }

    return baseStyle;
  }

  getConnectionStyle(element: BackgroundElement): any {
    return {
      ...this.getElementStyle(element),
      width: `${element.width}px`,
      height: '1px'
    };
  }

  trackByElementId(index: number, element: BackgroundElement): string {
    return element.id;
  }

  /**
   * Check if description contains URLs
   */
  hasLinksInDescription(description: string): boolean {
    return this.webviewService.extractUrls(description).length > 0;
  }

  /**
   * Display all AI projects when user clicks "Display More"
   */
  displayMore(): void {
    this.displayedAiProjects = this.aiProjects;
    this.showDisplayMore = false;
  }

  /**
   * Handle hover on project image to load preview of GitHub Pages
   */
  onImageHover(project: Project): void {
    const githubPagesUrl = this.getGitHubPagesUrl(project);
    if (githubPagesUrl) {
      this.webviewService.loadUrl(githubPagesUrl);
    } else if (project.repoUrl) {
      // Fallback to repository URL if no GitHub Pages
      this.webviewService.loadUrl(project.repoUrl);
    }
  }

  /**
   * Handle mouse leave on project image to reset preview
   */
  onImageLeave(): void {
    this.webviewService.resetWebview();
  }

  /**
   * Open project preview in fullscreen modal (GitHub component approach)
   */
  openPreview(project: Project): void {
    console.log('=== openPreview called (GitHub approach) ===');
    console.log('Project:', project.title);
    
    this.activeProject = project;
    this.iframeLoading = true;
    
    const githubPagesUrl = this.getGitHubPagesUrl(project);
    const urlToLoad = githubPagesUrl || project.repoUrl;
    
    console.log('GitHub Pages URL:', githubPagesUrl);
    console.log('Final URL to load:', urlToLoad);
    
    // Create a sanitized URL for the iframe
    if (urlToLoad) {
      this.safePreviewUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(urlToLoad);
    } else {
      this.safePreviewUrl = null;
    }
    
    this.showIframe = true;
    
    // Add body class to prevent scrolling
    document.body.classList.add('overflow-hidden');
  }

  /**
   * Close the preview modal
   */
  closePreview(): void {
    this.showIframe = false;
    this.activeProject = null;
    this.safePreviewUrl = null;
    
    // Remove body class to allow scrolling
    document.body.classList.remove('overflow-hidden');
  }

  /**
   * Get the preview URL
   */
  getPreviewUrl(): SafeResourceUrl | null {
    return this.safePreviewUrl;
  }

  /**
   * Handle iframe load event
   */
  onIframeLoad(): void {
    this.iframeLoading = false;
  }

  /**
   * Toggle between mobile and desktop view
   */
  toggleMobileView(): void {
    this.isMobileView = !this.isMobileView;
  }

  /**
   * Handle hover on source code link to show GitHub Pages preview
   */
  onSourceHover(project: Project): void {
    const githubPagesUrl = this.getGitHubPagesUrl(project);
    if (githubPagesUrl) {
      this.webviewService.loadUrl(githubPagesUrl);
    }
  }

  /**
   * Handle mouse leave on source code link
   */
  onSourceLeave(): void {
    this.webviewService.resetWebview();
  }

  /**
   * Open source code repository in new tab
   */
  openSourceCode(project: Project): void {
    if (project.repoUrl) {
      window.open(project.repoUrl, '_blank', 'noopener,noreferrer');
    }
  }
}
