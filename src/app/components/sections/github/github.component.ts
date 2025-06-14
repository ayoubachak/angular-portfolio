import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GithubService, GitHubRepo } from '../../../services/github.service';
import { WebviewService } from '../../../services/webview.service';
import { ScrollAnimationDirective } from '../../../directives/scroll-animation.directive';
import { LinkHoverWebviewDirective } from '../../../directives/link-hover-webview.directive';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faExternalLinkAlt, 
  faCodeBranch, 
  faStar, 
  faEye, 
  faCode, 
  faCalendarAlt, 
  faTimesCircle,
  faMobile as fasMobile,
  faDesktop as fasDesktop,
  faAngleDown,
  faCheck,
  faGlobe
} from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-github',
  standalone: true,
  imports: [
    CommonModule, 
    ScrollAnimationDirective,
    LinkHoverWebviewDirective,
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
  safePreviewUrl: SafeResourceUrl | null = null;
  iframeLoading: boolean = true;
  isMobileView: boolean = false;
  
  // Icons
  faGithub = faGithub;
  faExternalLinkAlt = faExternalLinkAlt;
  faCodeBranch = faCodeBranch;
  faStar = faStar;
  faEye = faEye;
  faCode = faCode;
  faCalendarAlt = faCalendarAlt;
  faTimesCircle = faTimesCircle;
  faMobile = fasMobile;
  faDesktop = fasDesktop;
  faAngleDown = faAngleDown;
  faCheck = faCheck;
  faGlobe = faGlobe;
  
  @ViewChild('previewModal') previewModal!: ElementRef;

  // Add new properties to track pagination
  private currentPage: number = 1;
  private reposPerPage: number = 6;
  isLoadingMore: boolean = false;
  private maxRepos: number = 18; // Maximum number of repos to load
  allReposLoaded: boolean = false;
  expandedDescriptions: { [key: number]: boolean } = {}; // Track which descriptions are expanded

  constructor(
    private githubService: GithubService,
    private webviewService: WebviewService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadRepositories();
  }

  loadRepositories(loadMore: boolean = false): void {
    if (!loadMore) {
      this.loading = true;
      this.currentPage = 1;
      this.allReposLoaded = false;
    } else {
      this.isLoadingMore = true;
    }

    this.githubService.getRepositories(this.reposPerPage * this.currentPage).subscribe({
      next: (repos) => {
        // If loading more, only show new repos we haven't seen before
        if (loadMore) {
          const existingReposIds = new Set(this.repos.map(repo => repo.id));
          const newRepos = repos.filter(repo => !existingReposIds.has(repo.id));
          this.repos = [...this.repos, ...newRepos];
          this.isLoadingMore = false;
          
          // Check if we've loaded all available repos or reached max
          if (newRepos.length === 0 || this.repos.length >= this.maxRepos) {
            this.allReposLoaded = true;
          }
        } else {
          this.repos = repos;
          this.loading = false;
          
          // Check if initial load already has all repos
          if (repos.length < this.reposPerPage) {
            this.allReposLoaded = true;
          }
        }
      },
      error: (err) => {
        console.error('Error loading repositories', err);
        this.error = 'Failed to load GitHub repositories. Please try again later.';
        this.loading = false;
        this.isLoadingMore = false;
      }
    });
  }

  openPreview(repo: GitHubRepo): void {
    this.activeRepo = repo;
    this.iframeLoading = true;
    
    // Create a sanitized URL for the iframe
    const url = repo.demoUrl || '';
    if (url) {
      this.safePreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    } else {
      this.safePreviewUrl = null;
    }
    
    this.showIframe = true;
    
    // Add body class to prevent scrolling
    document.body.classList.add('overflow-hidden');
  }

  closePreview(): void {
    this.showIframe = false;
    this.activeRepo = null;
    this.safePreviewUrl = null;
    
    // Remove body class to allow scrolling
    document.body.classList.remove('overflow-hidden');
  }

  getPreviewUrl(): SafeResourceUrl | null {
    return this.safePreviewUrl;
  }

  hasPreviewUrl(repo: GitHubRepo): boolean {
    return !!repo.demoUrl;
  }

  /**
   * Check if description contains URLs
   */
  hasLinksInDescription(description: string): boolean {
    return this.webviewService.extractUrls(description).length > 0;
  }

  onIframeLoad(): void {
    this.iframeLoading = false;
  }

  /**
   * Toggle between mobile and desktop view
   */
  toggleMobileView(): void {
    this.isMobileView = !this.isMobileView;
  }

  // Add the loadMoreRepos method
  loadMoreRepos(): void {
    this.currentPage++;
    this.loadRepositories(true);
  }

  /**
   * Check if a description is long enough to need expansion
   */
  isDescriptionLong(description?: string): boolean {
    if (!description) return false;
    // Roughly estimate if text is longer than 3 lines (about 180 characters)
    return description.length > 180;
  }

  /**
   * Toggle the expanded state of a repository description
   */
  toggleDescription(repoId: number): void {
    this.expandedDescriptions[repoId] = !this.expandedDescriptions[repoId];
  }
}
