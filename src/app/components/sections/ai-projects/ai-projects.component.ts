import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentService, Project } from '../../../services/content.service';
import { ScrollAnimationDirective } from '../../../directives/scroll-animation.directive';
import { LinkHoverWebviewDirective } from '../../../directives/link-hover-webview.directive';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faExternalLinkAlt, faCode } from '@fortawesome/free-solid-svg-icons';
import { WebviewService } from '../../../services/webview.service';

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
export class AiProjectsComponent implements OnInit {
  aiProjects: Project[] = [];
  
  // Icons
  faExternalLinkAlt = faExternalLinkAlt;
  faCode = faCode;

  constructor(
    private contentService: ContentService,
    private webviewService: WebviewService
  ) {}

  ngOnInit(): void {
    this.aiProjects = this.contentService.getAiProjects();
  }
  
  /**
   * Check if description contains URLs
   */
  hasLinksInDescription(description: string): boolean {
    return this.webviewService.extractUrls(description).length > 0;
  }
}
