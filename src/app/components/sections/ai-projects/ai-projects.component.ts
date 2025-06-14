import { Component, OnInit, OnDestroy, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentService, Project } from '../../../services/content.service';
import { ScrollAnimationDirective } from '../../../directives/scroll-animation.directive';
import { LinkHoverWebviewDirective } from '../../../directives/link-hover-webview.directive';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faExternalLinkAlt, faCode } from '@fortawesome/free-solid-svg-icons';
import { WebviewService } from '../../../services/webview.service';

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
  
  // Icons
  faExternalLinkAlt = faExternalLinkAlt;
  faCode = faCode;

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
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.aiProjects = this.contentService.getAiProjects();
    setTimeout(() => {
      this.generateBackgroundElements();
      this.startMouseTracking();
    }, 100);
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
}
