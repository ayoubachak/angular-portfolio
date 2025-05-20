import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentService, SocialLink } from '../../services/content.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faGithub, faLinkedin, faTwitter, faFacebook, faInstagram } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faLink } from '@fortawesome/free-solid-svg-icons';
import { ThemeToggleComponent } from './theme-toggle.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, ThemeToggleComponent],  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  name: string = '';
  avatar: string = '';
  socialLinks: SocialLink[] = [];
  email: string = '';
  isScrolled: boolean = false;
  mobileMenuOpen: boolean = false;
  activeSection: string = 'intro';
  sections: string[] = ['intro', 'about', 'education', 'github', 'blog', 'contact'];
  
  // Icons
  faGithub = faGithub;
  faLinkedin = faLinkedin;
  faTwitter = faTwitter;
  faFacebook = faFacebook;
  faInstagram = faInstagram;
  faEnvelope = faEnvelope;
  faLink = faLink;

  constructor(private readonly contentService: ContentService) {}

  ngOnInit(): void {
    const portfolioContent = this.contentService.getPortfolioContent();
    this.name = portfolioContent.name;
    
    // Force the avatar URL to use the direct path
    this.avatar = 'assets/images/avatar.jpg';
    
    this.socialLinks = portfolioContent.socialLinks;
    this.email = portfolioContent.email;
    
    console.log('Avatar URL set to:', this.avatar);
  }
  @HostListener('window:scroll', [])
  onWindowScroll() {
    // Show navbar profile after scrolling past intro
    const threshold = document.getElementById('intro')?.offsetHeight ?? 0;
    this.isScrolled = window.scrollY > threshold;
    
    // Update active section based on scroll position
    this.updateActiveSection();
  }
  
  /**
   * Determines which section is currently in view based on scroll position
   */
  updateActiveSection(): void {
    let currentSection = this.activeSection;
    
    // Check each section's position and determine which is most visible
    for (const section of this.sections) {
      const element = document.getElementById(section);
      if (element) {
        const rect = element.getBoundingClientRect();
        // If element is in viewport and at least 30% visible, consider it active
        if (rect.top < window.innerHeight * 0.5 && rect.bottom >= 0) {
          currentSection = section;
        }
      }
    }
    
    this.activeSection = currentSection;
  }
  
  /**
   * Checks if a specific section is active
   */
  isActive(section: string): boolean {
    return this.activeSection === section;
  }
  
    // Toggle mobile menu
  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  // Close mobile menu
  closeMobileMenu() {
    this.mobileMenuOpen = false;
  }
  
  // Handle image error
  handleImageError(event: any): void {
    console.error('Error loading avatar image:', event);
    // Fall back to a default image
    event.target.src = '/assets/images/avatar.jpg';
    
    // If that also fails, try with alternate paths
    event.target.onerror = () => {
      console.error('Placeholder also failed, trying alternate path');
      event.target.src = 'avatar.jpg';
      
      // Final fallback to an external placeholder if all else fails
      event.target.src = 'assets/images/placeholders/placeholder.jpg';
      event.target.onerror = null; // Prevent infinite loop
    };
  }

  // Helper method to get proper icon
  getIcon(platform: string): any {
    const iconMap: {[key: string]: any} = {
      'GitHub': this.faGithub,
      'LinkedIn': this.faLinkedin,
      'Twitter': this.faTwitter,
      'Facebook': this.faFacebook,
      'Instagram': this.faInstagram,
      'Gmail': this.faEnvelope,
      'Email': this.faEnvelope
    };
    
    return iconMap[platform] ?? this.faLink;
  }
}
