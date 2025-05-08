import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentService, SocialLink } from '../../services/content.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faGithub, faLinkedin, faTwitter, faFacebook, faInstagram } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faLink } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  name: string = '';
  avatar: string = '';
  socialLinks: SocialLink[] = [];
  email: string = '';
  isScrolled: boolean = false;
  
  // Icons
  faGithub = faGithub;
  faLinkedin = faLinkedin;
  faTwitter = faTwitter;
  faFacebook = faFacebook;
  faInstagram = faInstagram;
  faEnvelope = faEnvelope;
  faLink = faLink;

  constructor(private contentService: ContentService) {}

  ngOnInit(): void {
    const portfolioContent = this.contentService.getPortfolioContent();
    this.name = portfolioContent.name;
    this.avatar = portfolioContent.avatarUrl;
    this.socialLinks = portfolioContent.socialLinks;
    this.email = portfolioContent.email;
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    // Add shadow and background when scrolled
    this.isScrolled = window.scrollY > 20;
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
    
    return iconMap[platform] || this.faLink;
  }
}
