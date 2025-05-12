import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentService, SocialLink } from '../../../services/content.service';
import { ScrollAnimationDirective } from '../../../directives/scroll-animation.directive';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEnvelope, faMapMarkerAlt, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { faGithub, faLinkedin, faTwitter } from '@fortawesome/free-brands-svg-icons';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

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
  
  // Game state
  board!: string[][];
  currentPlayer: string = 'X';
  gameStatus: 'playing' | 'won' | 'draw' = 'playing';
  winner: string | null = null;
  playingWithBot: boolean = true;
  botThinking: boolean = false;
  
  // Icons
  faEnvelope = faEnvelope;
  faMapMarkerAlt = faMapMarkerAlt;
  faGithub = faGithub;
  faLinkedin = faLinkedin;
  faTwitter = faTwitter;
  faPaperPlane = faPaperPlane;

  constructor(private contentService: ContentService) {
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
    this.initGame();
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
  
  // Initialize tic-tac-toe board
  initGame(): void {
    this.board = Array(3).fill(null).map(() => Array(3).fill(''));
    this.currentPlayer = 'X';
    this.gameStatus = 'playing';
    this.winner = null;
  }

  // Handle cell clicks
  handleCellClick(row: number, col: number): void {
    // Prevent clicking while bot is thinking
    if (this.botThinking) return;
    
    if (this.gameStatus !== 'playing' || this.board[row][col]) return;
    
    // Human player move ('X')
    this.board[row][col] = this.currentPlayer;
    
    // Check if game ended after player move
    if (this.checkWin()) {
      this.gameStatus = 'won';
      this.winner = this.currentPlayer;
      return;
    } else if (this.checkDraw()) {
      this.gameStatus = 'draw';
      return;
    }
    
    // Switch players
    this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
    
    // Bot move
    if (this.playingWithBot && this.currentPlayer === 'O' && this.gameStatus === 'playing') {
      this.botThinking = true;
      // Add slight delay to make it feel more natural
      setTimeout(() => {
        this.makeBotMove();
        this.botThinking = false;
      }, 500);
    }
  }

  // Make AI bot move
  private makeBotMove(): void {
    // Check if game is still active
    if (this.gameStatus !== 'playing') return;
    
    // Define best move variables
    const move = this.findBestMove();
    
    // Make move
    if (move) {
      this.board[move.row][move.col] = 'O';
      
      // Check if game ended after bot move
      if (this.checkWin()) {
        this.gameStatus = 'won';
        this.winner = 'O';
        return;
      } else if (this.checkDraw()) {
        this.gameStatus = 'draw';
        return;
      }
      
      // Switch back to human player
      this.currentPlayer = 'X';
    }
  }
  
  // Toggle bot play on/off
  toggleBot(): void {
    this.playingWithBot = !this.playingWithBot;
    this.resetGame();
  }
  
  // Find best move for bot using minimax
  private findBestMove(): {row: number, col: number} | null {
    // First check if bot can win in one move
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (this.board[i][j] === '') {
          this.board[i][j] = 'O';
          const canWin = this.checkWin();
          this.board[i][j] = '';
          if (canWin) {
            return {row: i, col: j};
          }
        }
      }
    }
    
    // Then check if player can win in one move and block
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (this.board[i][j] === '') {
          this.board[i][j] = 'X';
          const needsBlock = this.checkWin();
          this.board[i][j] = '';
          if (needsBlock) {
            return {row: i, col: j};
          }
        }
      }
    }
    
    // Try to take center if available
    if (this.board[1][1] === '') {
      return {row: 1, col: 1};
    }
    
    // Try to take corners
    const corners = [
      {row: 0, col: 0},
      {row: 0, col: 2},
      {row: 2, col: 0},
      {row: 2, col: 2}
    ];
    
    const availableCorners = corners.filter(corner => 
      this.board[corner.row][corner.col] === '');
    
    if (availableCorners.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableCorners.length);
      return availableCorners[randomIndex];
    }
    
    // Take any available side
    const sides = [
      {row: 0, col: 1},
      {row: 1, col: 0},
      {row: 1, col: 2},
      {row: 2, col: 1}
    ];
    
    const availableSides = sides.filter(side => 
      this.board[side.row][side.col] === '');
    
    if (availableSides.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableSides.length);
      return availableSides[randomIndex];
    }
    
    return null;
  }
  
  // Reset the game
  resetGame(): void {
    this.initGame();
    // If bot starts first (when it's O's turn), make a move
    if (this.playingWithBot && this.currentPlayer === 'O') {
      this.makeBotMove();
    }
  }
  
  // Check for a win
  private checkWin(): boolean {
    const b = this.board;
    const lines = [
      [b[0][0],b[0][1],b[0][2]],
      [b[1][0],b[1][1],b[1][2]],
      [b[2][0],b[2][1],b[2][2]],
      [b[0][0],b[1][0],b[2][0]],
      [b[0][1],b[1][1],b[2][1]],
      [b[0][2],b[1][2],b[2][2]],
      [b[0][0],b[1][1],b[2][2]],
      [b[0][2],b[1][1],b[2][0]],
    ];
    return lines.some(line => line[0] && line.every(cell => cell === line[0]));
  }

  // Check for a draw
  checkDraw(): boolean {
    return this.board.flat().every(cell => cell);
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
