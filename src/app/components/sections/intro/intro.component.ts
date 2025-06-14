import { Component, OnInit, ViewChild, ElementRef, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentService, SocialLink } from '../../../services/content.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faGithub, faLinkedin, faTwitter } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faArrowDown, faGlobe } from '@fortawesome/free-solid-svg-icons';
import { ScrollAnimationDirective } from '../../../directives/scroll-animation.directive';
import { EasterEggHintComponent } from '../../../components/easter-eggs/easter-egg-hint.component';
import { GenZEasterEggTriggerDirective } from '../../../directives/gen-z-easter-egg-trigger.directive';
import { GenZEasterEggService } from '../../../services/gen-z-easter-egg.service';

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
  @ViewChild('attentionStrip') attentionStrip!: ElementRef;
  
  name: string = '';
  title: string = '';
  subtitle: string = '';
  email: string = '';
  socialLinks: SocialLink[] = [];
  
  // Click functionality for attention strip
  private isExpanded = false;
  private clickCount = 0;
  private clickTimeout: any = null;
  
  // Icons
  faGithub = faGithub;
  faLinkedin = faLinkedin;
  faTwitter = faTwitter;
  faEnvelope = faEnvelope;
  faArrowDown = faArrowDown;
  faGlobe = faGlobe;

  private genZService = inject(GenZEasterEggService);

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
      'Email': this.faEnvelope,
      'Website': this.faGlobe
    };
    
    return iconMap[platform] || this.faEnvelope;
  }

  // Click functionality for attention strip
  onStripClick(): void {
    console.log('Strip clicked, isExpanded:', this.isExpanded);
    
    if (!this.isExpanded) {
      // First click - expand the strip
      this.expandStrip();
    } else {
      // Second click - trigger GenZ mode
      this.triggerGenZMode();
    }
  }

  private expandStrip(): void {
    if (!this.attentionStrip) return;
    
    console.log('Expanding strip');
    this.isExpanded = true;
    const element = this.attentionStrip.nativeElement;
    element.classList.add('expanded');
    
    // Auto-collapse after 5 seconds if not clicked again
    setTimeout(() => {
      if (this.isExpanded && !this.genZService.isEmbedded()) {
        this.collapseStrip();
      }
    }, 5000);
  }

  private collapseStrip(): void {
    if (!this.attentionStrip) return;
    
    console.log('Collapsing strip');
    this.isExpanded = false;
    const element = this.attentionStrip.nativeElement;
    element.classList.remove('expanded');
  }

  private triggerGenZMode(): void {
    console.log('Triggering GenZ mode');
    
    // Trigger the GenZ phone mode in embedded mode (like easter egg)
    this.genZService.setGenZStatus(true);
    this.genZService.toggleEmbedded();
    
    // Hide the strip after triggering
    if (this.attentionStrip) {
      this.attentionStrip.nativeElement.classList.add('triggered');
    }
    
    // Reset state
    this.isExpanded = false;
  }
}
