import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentService, SocialLink } from '../../../services/content.service';
import { ScrollAnimationDirective } from '../../../directives/scroll-animation.directive';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEnvelope, faMapMarkerAlt, faPaperPlane, faRobot, faBook, faChartLine } from '@fortawesome/free-solid-svg-icons';
import { faGithub, faLinkedin, faTwitter } from '@fortawesome/free-brands-svg-icons';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TicTacToeService } from '../../../services/tic-tac-toe.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ScrollAnimationDirective, FontAwesomeModule, ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent implements OnInit {
  // Contact details
  email: string = '';
  location: string = '';
  socialLinks: SocialLink[] = [];
  
  // Contact form
  contactForm: FormGroup;
  formSubmitted = false;
  formSuccess = false;
  formError = false;
  
  // Game related
  botThinking: boolean = false;
  showLearningStats: boolean = false;
  
  // Icons
  faEnvelope = faEnvelope;
  faMapMarkerAlt = faMapMarkerAlt;
  faGithub = faGithub;
  faLinkedin = faLinkedin;
  faTwitter = faTwitter;
  faPaperPlane = faPaperPlane;
  faRobot = faRobot;
  faBook = faBook;
  faChartLine = faChartLine;

  constructor(
    private readonly contentService: ContentService,
    public readonly gameService: TicTacToeService
  ) {
    this.contactForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.minLength(2)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      subject: new FormControl('', [Validators.required, Validators.minLength(5)]),
      message: new FormControl('', [Validators.required, Validators.minLength(10)])
    });
  }

  ngOnInit(): void {
    const portfolioContent = this.contentService.getPortfolioContent();
    this.email = portfolioContent.email;
    this.location = portfolioContent.location;
    this.socialLinks = portfolioContent.socialLinks;
  }
  
  onSubmit(): void {
    this.formSubmitted = true;
    
    if (this.contactForm.valid) {
      // In a real-world scenario, you would send this data to a backend service
      console.log('Form submitted:', this.contactForm.value);
      
      // Simulate successful submission
      this.formSuccess = true;
      this.formError = false;
      this.contactForm.reset();
      this.formSubmitted = false;
      
      // Reset success message after some time
      setTimeout(() => {
        this.formSuccess = false;
      }, 5000);
    }
  }
  
  // Handle cell clicks for the game
  handleCellClick(row: number, col: number): void {
    // Prevent clicking while bot is thinking
    if (this.botThinking) return;
    
    // Make player move
    const moveMade = this.gameService.makePlayerMove(row, col);
    
    // If move was successful and bot mode is on, make bot move
    if (moveMade && this.gameService.gameState.status === 'playing') {
      this.botThinking = true;
      
      // Add slight delay to make it feel more natural
      setTimeout(() => {
        this.gameService.makeBotMove();
        this.botThinking = false;
      }, 500);
    }
  }
  
  // Toggle bot learning on/off
  toggleLearning(): void {
    this.gameService.toggleLearning(!this.showLearningStats);
    this.showLearningStats = !this.showLearningStats;
    this.resetGame();
  }
  
  // Reset the game
  resetGame(): void {
    this.gameService.resetGame();
  }
  
  // Reset learning data
  resetLearning(): void {
    this.gameService.resetLearning();
  }
  
  // Helper method to get proper icon
  getIcon(platform: string): any {
    const iconMap: {[key: string]: any} = {
      'GitHub': this.faGithub,
      'LinkedIn': this.faLinkedin,
      'Twitter': this.faTwitter,
      'Email': this.faEnvelope
    };
    
    return iconMap[platform] ?? this.faEnvelope;
  }
}
