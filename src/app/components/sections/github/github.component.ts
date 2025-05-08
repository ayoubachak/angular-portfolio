import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GithubService, GitHubRepo } from '../../../services/github.service';
import { ScrollAnimationDirective } from '../../../directives/scroll-animation.directive';
import { LinkHoverWebviewDirective } from '../../../directives/link-hover-webview.directive';
import { WebviewPreviewComponent } from '../../webview-preview/webview-preview.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { faCode, faExternalLinkAlt, faCodeBranch, faStar, faEye, faCalendarAlt, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { WebviewService } from '../../../services/webview.service';

@Component({
  selector: 'app-github',
  standalone: true,
  imports: [
    CommonModule, 
    ScrollAnimationDirective,
    LinkHoverWebviewDirective,
    WebviewPreviewComponent,
    FontAwesomeModule
  ],
  templateUrl: './github.component.html',
  styleUrl: './github.component.css'
})
export class GithubComponent implements OnInit {
  repos: GitHubRepo[] = [];
  loading: boolean = true;
  error: string | null = null;
  activeRepo: GitHubRepo | null = null;
  showIframe: boolean = false;
  
  // Icons
  faGithub = faGithub;
  faExternalLinkAlt = faExternalLinkAlt;
  faCodeBranch = faCodeBranch;
  faStar = faStar;
  faEye = faEye;
  faCode = faCode;
  faCalendarAlt = faCalendarAlt;
  faTimesCircle = faTimesCircle;
  
  @ViewChild('previewModal') previewModal!: ElementRef;

  constructor(
    private githubService: GithubService,
    private webviewService: WebviewService
  ) {}

  ngOnInit(): void {
    this.loadRepositories();
  }

  loadRepositories(): void {
    this.loading = true;
    this.githubService.getRepositories(6).subscribe({
      next: (repos) => {
        this.repos = repos;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading repositories', err);
        this.error = 'Failed to load GitHub repositories. Please try again later.';
        this.loading = false;
      }
    });
  }

  openPreview(repo: GitHubRepo): void {
    this.activeRepo = repo;
    this.showIframe = true;
    
    // Add body class to prevent scrolling
    document.body.classList.add('overflow-hidden');
  }

  closePreview(): void {
    this.showIframe = false;
    this.activeRepo = null;
    
    // Remove body class to allow scrolling
    document.body.classList.remove('overflow-hidden');
  }

  getPreviewUrl(): string {
    return this.activeRepo?.demoUrl || this.activeRepo?.homepage || '';
  }

  hasPreviewUrl(repo: GitHubRepo): boolean {
    return !!(repo.demoUrl || repo.homepage);
  }

  /**
   * Check if description contains URLs
   */
  hasLinksInDescription(description: string): boolean {
    return this.webviewService.extractUrls(description).length > 0;
  }
}
