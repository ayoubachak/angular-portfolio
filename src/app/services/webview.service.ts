import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

export interface WebviewState {
  url: string;
  safeUrl: SafeResourceUrl;
  isLoading: boolean;
  progress: number;
  isFullscreen: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class WebviewService {
  private defaultState: WebviewState = {
    url: '',
    safeUrl: '',
    isLoading: false,
    progress: 0,
    isFullscreen: false
  };

  private webviewStateSubject = new BehaviorSubject<WebviewState>(this.defaultState);
  public webviewState$: Observable<WebviewState> = this.webviewStateSubject.asObservable();

  constructor(private sanitizer: DomSanitizer) { }

  /**
   * Load a URL in the webview
   */
  loadUrl(url: string): void {
    // Reset progress and set loading state
    const safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    const currentState = this.webviewStateSubject.value;
    this.webviewStateSubject.next({
      url,
      safeUrl,
      isLoading: true,
      progress: 10, // Initial progress
      isFullscreen: currentState.isFullscreen // Preserve current fullscreen state
    });

    // Simulate loading progress
    this.simulateLoading();
  }

  /**
   * Load a URL directly in fullscreen mode
   */
  loadUrlFullscreen(url: string): void {
    // Reset progress and set loading state with fullscreen enabled
    const safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    const newState = {
      url,
      safeUrl,
      isLoading: true,
      progress: 10, // Initial progress
      isFullscreen: true
    };
    this.webviewStateSubject.next(newState);

    // Simulate loading progress
    this.simulateLoading();
  }

  /**
   * Reset the webview state
   */
  resetWebview(): void {
    this.webviewStateSubject.next(this.defaultState);
  }

  /**
   * Toggle fullscreen mode
   */
  toggleFullscreen(): void {
    const currentState = this.webviewStateSubject.value;
    this.webviewStateSubject.next({
      ...currentState,
      isFullscreen: !currentState.isFullscreen
    });
  }

  /**
   * Set fullscreen mode explicitly
   */
  setFullscreen(isFullscreen: boolean): void {
    const currentState = this.webviewStateSubject.value;
    this.webviewStateSubject.next({
      ...currentState,
      isFullscreen
    });
  }

  /**
   * Simulate loading progress
   */
  private simulateLoading(): void {
    const currentState = this.webviewStateSubject.value;
    
    // Define intervals for progressive loading
    const intervals = [
      { time: 200, progress: 30 },
      { time: 500, progress: 50 },
      { time: 1000, progress: 70 },
      { time: 2000, progress: 90 },
      { time: 3000, progress: 100 }
    ];
    
    // Schedule progress updates
    intervals.forEach(({ time, progress }) => {
      setTimeout(() => {
        const state = this.webviewStateSubject.value;
        
        if (state.url === currentState.url && state.isLoading) {
          const newState = {
            ...state,
            progress,
            isLoading: progress < 100
          };
          this.webviewStateSubject.next(newState);
        }
      }, time);
    });
  }

  /**
   * Extract URLs from text
   */
  extractUrls(text: string): string[] {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.match(urlRegex) || [];
  }
} 