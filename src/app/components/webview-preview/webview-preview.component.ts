import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebviewService, WebviewState } from '../../services/webview.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faExpand, faCompress, faTimes, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-webview-preview',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './webview-preview.component.html',
  styleUrl: './webview-preview.component.css'
})
export class WebviewPreviewComponent implements OnInit {
  webviewState: WebviewState | null = null;
  
  // Icons
  faExpand = faExpand;
  faCompress = faCompress;
  faTimes = faTimes;
  faExternalLinkAlt = faExternalLinkAlt;

  constructor(private webviewService: WebviewService) {}

  ngOnInit(): void {
    this.webviewService.webviewState$.subscribe(state => {
      this.webviewState = state.url ? state : null;
    });
  }

  /**
   * Toggle fullscreen mode
   */
  toggleFullscreen(): void {
    this.webviewService.toggleFullscreen();
  }

  /**
   * Close the webview
   */
  closeWebview(): void {
    this.webviewService.resetWebview();
  }

  /**
   * Handle mouseenter event on the webview modal
   */
  onWebviewMouseEnter(): void {
    // No action needed, the directive will handle timing
  }

  /**
   * Handle mouseleave event on the webview modal
   */
  onWebviewMouseLeave(): void {
    // Only close if not in fullscreen mode
    if (this.webviewState && !this.webviewState.isFullscreen) {
      setTimeout(() => {
        this.webviewService.resetWebview();
      }, 300);
    }
  }

  /**
   * Listen for escape key to exit fullscreen
   */
  @HostListener('document:keydown.escape', ['$event'])
  handleEscapeKey(event: KeyboardEvent): void {
    if (this.webviewState?.isFullscreen) {
      this.webviewService.toggleFullscreen();
    }
  }

  /**
   * Open in new tab
   */
  openInNewTab(): void {
    if (this.webviewState?.url) {
      window.open(this.webviewState.url, '_blank');
    }
  }
} 