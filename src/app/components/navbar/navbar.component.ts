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
  sections: string[] = [];
  showBlog: boolean = false;
  
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
    const content = this.contentService.getPortfolioContent();
    this.name = content.name;
    this.avatar = content.avatarUrl;
    this.socialLinks = content.socialLinks;
    this.email = content.email;
    this.showBlog = content.showBlog || false;
    
    // Build sections array dynamically
    this.sections = ['intro', 'about', 'education', 'experience', 'ai-projects', 'github', 'training', 'testimonials'];
    
    // Add blog section if enabled
    if (this.showBlog) {
      this.sections.splice(-1, 0, 'blog'); // Insert blog before the last section (testimonials)
    }
    
    // Add contact section at the end
    this.sections.push('contact');
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
    switch (platform.toLowerCase()) {
      case 'github': return this.faGithub;
      case 'linkedin': return this.faLinkedin;
      case 'twitter': return this.faTwitter;
      case 'facebook': return this.faFacebook;
      case 'instagram': return this.faInstagram;
      case 'email': return this.faEnvelope;
      default: return this.faLink;
    }
  }

  getSectionDisplayName(section: string): string {
    const displayNames: { [key: string]: string } = {
      'intro': 'Home',
      'about': 'About',
      'education': 'Education',
      'experience': 'Experience',
      'ai-projects': 'AI Projects',
      'github': 'Projects',
      'training': 'Training',
      'testimonials': 'Testimonials',
      'blog': 'Blog',
      'contact': 'Contact'
    };
    
    return displayNames[section] || section.charAt(0).toUpperCase() + section.slice(1);
  }
}
