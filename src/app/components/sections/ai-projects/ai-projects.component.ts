import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentService, Project } from '../../../services/content.service';
import { ScrollAnimationDirective } from '../../../directives/scroll-animation.directive';
import { LinkHoverWebviewDirective } from '../../../directives/link-hover-webview.directive';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faExternalLinkAlt, faCode } from '@fortawesome/free-solid-svg-icons';
import { WebviewService } from '../../../services/webview.service';
import { WebviewPreviewComponent } from '../../webview-preview/webview-preview.component';

@Component({
  selector: 'app-ai-projects',
  standalone: true,
  imports: [
    CommonModule, 
    ScrollAnimationDirective, 
    LinkHoverWebviewDirective,
    FontAwesomeModule,
    WebviewPreviewComponent
  ],
  templateUrl: './ai-projects.component.html',
  styleUrl: './ai-projects.component.css'
})
export class AiProjectsComponent implements OnInit {
  aiProjects: Project[] = [];
  // Display control for initial and full list
  displayedAiProjects: Project[] = [];
  showDisplayMore: boolean = false;
  private initialDisplayCount = 4;
  
  // Icons
  faExternalLinkAlt = faExternalLinkAlt;
  faCode = faCode;

  constructor(
    private contentService: ContentService,
    private webviewService: WebviewService
  ) {}

  ngOnInit(): void {
    this.aiProjects = this.contentService.getAiProjects();
    // Set up initial slice and display control
    this.displayedAiProjects = this.aiProjects.slice(0, this.initialDisplayCount);
    this.showDisplayMore = this.aiProjects.length > this.initialDisplayCount;
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
   * Handle hover on project image to load preview
   */
  onImageHover(url: string): void {
    this.webviewService.loadUrl(url);
  }

  /**
   * Handle mouse leave on project image to reset preview
   */
  onImageLeave(): void {
    this.webviewService.resetWebview();
  }

  /**
   * Open repository preview in fullscreen modal
   */
  openPreview(url: string): void {
    this.webviewService.loadUrl(url);
    this.webviewService.toggleFullscreen();
  }
}
