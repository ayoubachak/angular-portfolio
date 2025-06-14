import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContentService, SocialLink } from '../../services/content.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faGithub, faLinkedin, faTwitter } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faArrowUp } from '@fortawesome/free-solid-svg-icons';
import emailjs from '@emailjs/browser';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, FormsModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent implements OnInit {
  name: string = '';
  email: string = '';
  location: string = '';
  socialLinks: SocialLink[] = [];
  currentYear: number = new Date().getFullYear();
  
  // Newsletter subscription
  subscriberEmail: string = '';
  isSubscribing: boolean = false;
  subscriptionMessage: string = '';
  subscriptionSuccess: boolean = false;

  // Icons
  faGithub = faGithub;
  faLinkedin = faLinkedin;
  faTwitter = faTwitter;
  faEnvelope = faEnvelope;
  faArrowUp = faArrowUp;

  // EmailJS configuration
  private readonly emailJSServiceID = 'service_g8qfrx6';
  private readonly emailJSTemplateID = 'template_h4y8kel'; // Use the same template as contact form
  private readonly emailJSUserID = 'h7cWAchZDqLkQWk1U';

  constructor(private contentService: ContentService) {}

  ngOnInit(): void {
    const content = this.contentService.getPortfolioContent();
    this.name = content.name;
    this.email = content.email;
    this.location = content.location;
    this.socialLinks = content.socialLinks;
  }

  getIcon(platform: string): any {
    switch (platform.toLowerCase()) {
      case 'github': return this.faGithub;
      case 'linkedin': return this.faLinkedin;
      case 'twitter': return this.faTwitter;
      default: return this.faEnvelope;
    }
  }

  async subscribeToNewsletter(): Promise<void> {
    if (!this.subscriberEmail || !this.isValidEmail(this.subscriberEmail)) {
      this.subscriptionMessage = 'Please enter a valid email address.';
      this.subscriptionSuccess = false;
      return;
    }

    this.isSubscribing = true;
    this.subscriptionMessage = '';

    try {
      // Use the same EmailJS approach as contact form
      const templateParams = {
        from_name: 'Newsletter Subscription',
        from_email: this.subscriberEmail,
        subject: 'New Newsletter Subscription',
        message: `New newsletter subscription from: ${this.subscriberEmail}\n\nSubscription Date: ${new Date().toLocaleDateString()}`
      };

      await emailjs.send(
        this.emailJSServiceID,
        this.emailJSTemplateID,
        templateParams,
        this.emailJSUserID
      );

      this.subscriptionMessage = 'Thank you for subscribing! You\'ll receive updates soon.';
      this.subscriptionSuccess = true;
      this.subscriberEmail = '';

    } catch (error) {
      console.error('Newsletter subscription failed:', error);
      this.subscriptionMessage = 'Subscription failed. Please try again later.';
      this.subscriptionSuccess = false;
    } finally {
      this.isSubscribing = false;
      
      // Clear message after 5 seconds
      setTimeout(() => {
        this.subscriptionMessage = '';
      }, 5000);
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
