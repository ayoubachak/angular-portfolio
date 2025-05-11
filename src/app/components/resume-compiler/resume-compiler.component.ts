import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentService } from '../../services/content.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faFileAlt } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-resume-compiler',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  template: `    <button 
      (click)="compileResume()" 
      class="fixed left-5 bottom-5 z-50 flex items-center space-x-2 px-4 py-3 bg-accent-color text-button-text rounded-lg shadow-lg hover:bg-accent-color/90 transition-all duration-300 transform hover:-translate-y-1">
      <fa-icon [icon]="faFileAlt"></fa-icon>
      <span>Compile Resume</span>
    </button>
  `,
  styles: []
})
export class ResumeCompilerComponent {
  faFileAlt = faFileAlt;
  
  constructor(private contentService: ContentService) {}
  
  compileResume(): void {
    const content = this.contentService.getPortfolioContent();
    
    // Here we would normally make a backend call to compile the LaTeX resume
    // For now, we'll just show an alert
    alert('Resume compilation feature will be implemented soon. This would gather information from all portfolio sections and create a beautifully formatted resume.');
    
    // In a real implementation, we would:
    // 1. Collect data from the portfolio
    // 2. Format it into a LaTeX template
    // 3. Compile it server-side
    // 4. Provide a download link for the PDF
    console.log('Portfolio data that would be compiled:', content);
  }
} 