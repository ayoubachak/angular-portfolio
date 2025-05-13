import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentService, SocialLink } from '../../../services/content.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faGithub, faLinkedin, faTwitter } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import { ScrollAnimationDirective } from '../../../directives/scroll-animation.directive';
import { EasterEggHintComponent } from '../../../components/easter-eggs/easter-egg-hint.component';
import { GenZEasterEggTriggerDirective } from '../../../directives/gen-z-easter-egg-trigger.directive';

@Component({
  selector: 'app-intro',
  standalone: true,
  imports: [
    CommonModule, 
    FontAwesomeModule, 
    ScrollAnimationDirective, 
    EasterEggHintComponent,
    GenZEasterEggTriggerDirective
  ],
  templateUrl: './intro.component.html',
  styleUrl: './intro.component.css'
})
export class IntroComponent implements OnInit {
  name: string = '';
  title: string = '';
  subtitle: string = '';
  email: string = '';
  socialLinks: SocialLink[] = [];
  
  // Icons
  faGithub = faGithub;
  faLinkedin = faLinkedin;
  faTwitter = faTwitter;
  faEnvelope = faEnvelope;
  faArrowDown = faArrowDown;

  constructor(private contentService: ContentService) {}

  ngOnInit(): void {
    const portfolioContent = this.contentService.getPortfolioContent();
    this.name = portfolioContent.name;
    this.title = portfolioContent.title;
    this.subtitle = portfolioContent.subtitle;
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
}
