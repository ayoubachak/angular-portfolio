import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentService, Skill } from '../../../services/content.service';
import { ScrollAnimationDirective } from '../../../directives/scroll-animation.directive';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, ScrollAnimationDirective],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent implements OnInit {
  about: string = '';
  skillsByCategory: Record<string, Skill[]> = {};
  skillCategories: string[] = [];

  constructor(private contentService: ContentService) {}

  ngOnInit(): void {
    const portfolioContent = this.contentService.getPortfolioContent();
    this.about = portfolioContent.about;
    
    // Get skills grouped by category
    this.skillsByCategory = this.contentService.getSkillsByCategory();
    this.skillCategories = Object.keys(this.skillsByCategory);
  }
  
  /**
   * Get a CSS variable styling for skill progress bar
   */
  getSkillBarStyle(level: number): string {
    return `width: ${level}%`;
  }
}
