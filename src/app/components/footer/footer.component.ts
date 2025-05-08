import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentService, SocialLink } from '../../services/content.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faGithub, faLinkedin, faTwitter } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faArrowUp } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent implements OnInit {
  name: string = '';
  email: string = '';
  socialLinks: SocialLink[] = [];
  currentYear: number = new Date().getFullYear();
  
  // Icons
  faGithub = faGithub;
  faLinkedin = faLinkedin;
  faTwitter = faTwitter;
  faEnvelope = faEnvelope;
  faArrowUp = faArrowUp;

  constructor(private contentService: ContentService) {}

  ngOnInit(): void {
    const portfolioContent = this.contentService.getPortfolioContent();
    this.name = portfolioContent.name;
    this.email = portfolioContent.email;
    this.socialLinks = portfolioContent.socialLinks;
  }
  
  // Helper method to get proper icon
  getIcon(platform: string): any {
    const iconMap: {[key: string]: any} = {
      'GitHub': this.faGithub,
      'LinkedIn': this.faLinkedin,
      'Twitter': this.faTwitter,
      'Email': this.faEnvelope
    };
    
    return iconMap[platform] || this.faEnvelope;
  }
  
  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}
