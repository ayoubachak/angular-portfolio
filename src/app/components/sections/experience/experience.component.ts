import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentService, Experience } from '../../../services/content.service';
import { ScrollAnimationDirective } from '../../../directives/scroll-animation.directive';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBriefcase, faCalendar, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

interface ExperienceWithState extends Experience {
  isExpanded: boolean;
  isFirst: boolean;
  isLast: boolean;
  hasParallel: boolean;
  parallelWith?: number[];
}

@Component({
  selector: 'app-experience',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, ScrollAnimationDirective],
  templateUrl: './experience.component.html',
  styleUrl: './experience.component.css'
})
export class ExperienceComponent implements OnInit {
  experiences: ExperienceWithState[] = [];
  
  // Icons
  faBriefcase = faBriefcase;
  faCalendar = faCalendar;
  faChevronDown = faChevronDown;
  faChevronUp = faChevronUp;

  constructor(private contentService: ContentService) {}

  ngOnInit(): void {
    const portfolioContent = this.contentService.getPortfolioContent();
    // Initialize experiences by processing raw data from content service
    this.experiences = this.processExperiences(portfolioContent.experience);
  }

  // Helper method to convert month names to numbers (0-based)
  private getMonthNumber(monthName: string): number {
    const months: Record<string, number> = {
      'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
      'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    };
    return months[monthName] || 0; // Default to January if not found
  }

  private processExperiences(experiences: Experience[]): ExperienceWithState[] {
    const result: ExperienceWithState[] = [];
    
    if (experiences.length === 0) {
      console.log("No experiences found to process");
      return result;
    }
    
    // First pass: Add basic state to each experience
    experiences.forEach((exp, index) => {
      result.push({
        ...exp,
        isExpanded: false,
        isFirst: index === 0,
        isLast: index === experiences.length - 1,
        hasParallel: false,
        parallelWith: []
      });
    });
    
    // Second pass: Determine overlapping experiences
    for (let i = 0; i < result.length; i++) {
      const current = result[i];
      // Safe date parsing
      const currentStartParts = current.startDate.split(' ');
      const currentEndParts = current.endDate === 'Present' ? ['Present'] : current.endDate.split(' ');
      
      let currentStart: Date, currentEnd: Date;
      try {
        // Handle month name formats like "Oct 2024"
        if (currentStartParts.length > 1) {
          const monthA = currentStartParts[0];
          const yearA = parseInt(currentStartParts[1], 10);
          currentStart = new Date(yearA, this.getMonthNumber(monthA), 1);
        } else {
          currentStart = new Date(current.startDate);
        }
        
        currentEnd = current.endDate === 'Present' ? new Date() : 
                     (currentEndParts.length > 1 ? 
                      new Date(parseInt(currentEndParts[1], 10), this.getMonthNumber(currentEndParts[0]), 1) : 
                      new Date(current.endDate));
      } catch (e) {
        console.error("Error parsing dates for", current.company, e);
        currentStart = new Date(0); // Fallback to epoch time
        currentEnd = new Date();
      }
      
      for (let j = 0; j < result.length; j++) {
        if (i === j) continue;
        
        const other = result[j];
        // Safe date parsing for other experience
        const otherStartParts = other.startDate.split(' ');
        const otherEndParts = other.endDate === 'Present' ? ['Present'] : other.endDate.split(' ');
        
        let otherStart: Date, otherEnd: Date;
        try {
          // Handle month name formats like "Oct 2024"
          if (otherStartParts.length > 1) {
            const monthB = otherStartParts[0];
            const yearB = parseInt(otherStartParts[1], 10);
            otherStart = new Date(yearB, this.getMonthNumber(monthB), 1);
          } else {
            otherStart = new Date(other.startDate);
          }
          
          otherEnd = other.endDate === 'Present' ? new Date() : 
                     (otherEndParts.length > 1 ? 
                      new Date(parseInt(otherEndParts[1], 10), this.getMonthNumber(otherEndParts[0]), 1) : 
                      new Date(other.endDate));
        } catch (e) {
          console.error("Error parsing dates for", other.company, e);
          otherStart = new Date(0);
          otherEnd = new Date();
        }
        
        // Check if dates overlap
        if (
          (currentStart <= otherEnd && currentEnd >= otherStart) ||
          (otherStart <= currentEnd && otherEnd >= currentStart)
        ) {
          current.hasParallel = true;
          current.parallelWith = current.parallelWith || [];
          current.parallelWith.push(j);
        }
      }
    }
    
    return result;
  }

  private addPartTimeExperiences(): void {
    // Add the part-time experiences
    const alignerr: ExperienceWithState = {
      company: 'Alignerr',
      role: 'AI Trainer',
      startDate: 'Oct 2024',
      endDate: 'Present',
      description: 'Contract Part-time, Remote position based in France.',
      logo: 'assets/images/companies/alignerr-logo.jpg', // No logo file available
      skills: ['AI Training', 'Data Labeling', 'Machine Learning'],
      isExpanded: false,
      isFirst: false,
      isLast: false,
      hasParallel: true,
      parallelWith: [this.experiences.length + 1]
    };
    
    const micro1: ExperienceWithState = {
      company: 'micro1',
      role: 'AI Trainer',
      startDate: 'Aug 2024',
      endDate: 'Present',
      description: 'Contract Part-time, Remote position based in France.',
      logo: 'assets/images/companies/micro1-logo.jpg', // No logo file available
      skills: ['AI Training', 'Data Labeling', 'Machine Learning'],
      isExpanded: false,
      isFirst: false,
      isLast: false,
      hasParallel: true,
      parallelWith: [this.experiences.length]
    };
    
    this.experiences.push(alignerr);
    this.experiences.push(micro1);
    
    console.log("Added part-time experiences:", this.experiences);
    
    // Update parallelWith arrays for existing experiences that overlap with the new ones
    for (let i = 0; i < this.experiences.length - 2; i++) {
      const exp = this.experiences[i];
      
      const expStartParts = exp.startDate.split(' ');
      const expEndParts = exp.endDate === 'Present' ? ['Present'] : exp.endDate.split(' ');
      
      let expStart: Date, expEnd: Date;
      try {
        if (expStartParts.length > 1) {
          const monthA = expStartParts[0];
          const yearA = parseInt(expStartParts[1], 10);
          expStart = new Date(yearA, this.getMonthNumber(monthA), 1);
        } else {
          expStart = new Date(exp.startDate);
        }
        
        expEnd = exp.endDate === 'Present' ? new Date() : 
                (expEndParts.length > 1 ? 
                 new Date(parseInt(expEndParts[1], 10), this.getMonthNumber(expEndParts[0]), 1) : 
                 new Date(exp.endDate));
      } catch (e) {
        console.error("Error parsing dates for", exp.company, e);
        expStart = new Date(0);
        expEnd = new Date();
      }
      
      // Parse dates for new experiences
      const alignerrStart = new Date(2024, this.getMonthNumber('Oct'), 1);
      const micro1Start = new Date(2024, this.getMonthNumber('Aug'), 1);
      const now = new Date();
      
      if (expStart <= now && expEnd >= alignerrStart) {
        exp.hasParallel = true;
        exp.parallelWith = exp.parallelWith || [];
        exp.parallelWith.push(this.experiences.length - 2);
      }
      
      if (expStart <= now && expEnd >= micro1Start) {
        exp.hasParallel = true;
        exp.parallelWith = exp.parallelWith || [];
        exp.parallelWith.push(this.experiences.length - 1);
      }
    }
  }

  toggleExpand(index: number): void {
    this.experiences[index].isExpanded = !this.experiences[index].isExpanded;
  }

  onImageError(experience: ExperienceWithState): void {
    console.log(`Failed to load image for ${experience.company}`);
    experience.logo = undefined;
  }
}
