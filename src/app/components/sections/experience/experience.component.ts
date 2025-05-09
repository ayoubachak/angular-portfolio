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
    
    // Sort experiences by startDate in descending order (most recent first)
    const sortedExperiences = [...portfolioContent.experience].sort((a, b) => {
      try {
        const aStartParts = a.startDate.split(' ');
        const bStartParts = b.startDate.split(' ');
        
        let dateA: Date, dateB: Date;
        
        // Handle month name formats like "Oct 2024"
        if (aStartParts.length > 1) {
          dateA = new Date(`${aStartParts[0]} 1, ${aStartParts[1]}`);
        } else {
          dateA = new Date(a.startDate);
        }
        
        if (bStartParts.length > 1) {
          dateB = new Date(`${bStartParts[0]} 1, ${bStartParts[1]}`);
        } else {
          dateB = new Date(b.startDate);
        }
        
        return dateB.getTime() - dateA.getTime();
      } catch (e) {
        console.error("Error sorting dates", e);
        return 0; // Keep original order if there's an error
      }
    });

    // Process experiences to determine overlaps
    this.experiences = this.processExperiences(sortedExperiences);
    
    // Add the part-time experiences from user input
    this.addPartTimeExperiences();
    
    // Log for debugging
    console.log("Processed experiences:", this.experiences);
  }

  private processExperiences(experiences: Experience[]): ExperienceWithState[] {
    const result: ExperienceWithState[] = [];
    
    if (experiences.length === 0) return result;
    
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
          currentStart = new Date(`${currentStartParts[0]} 1, ${currentStartParts[1]}`);
        } else {
          currentStart = new Date(current.startDate);
        }
        
        currentEnd = current.endDate === 'Present' ? new Date() : 
                     (currentEndParts.length > 1 ? 
                      new Date(`${currentEndParts[0]} 1, ${currentEndParts[1]}`) : 
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
            otherStart = new Date(`${otherStartParts[0]} 1, ${otherStartParts[1]}`);
          } else {
            otherStart = new Date(other.startDate);
          }
          
          otherEnd = other.endDate === 'Present' ? new Date() : 
                     (otherEndParts.length > 1 ? 
                      new Date(`${otherEndParts[0]} 1, ${otherEndParts[1]}`) : 
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
      logo: 'assets/images/alignerr-logo.png',
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
      logo: 'assets/images/micro1-logo.png',
      skills: ['AI Training', 'Data Labeling', 'Machine Learning'],
      isExpanded: false,
      isFirst: false,
      isLast: false,
      hasParallel: true,
      parallelWith: [this.experiences.length]
    };
    
    this.experiences.push(alignerr);
    this.experiences.push(micro1);
    
    // Update parallelWith arrays for existing experiences that overlap with the new ones
    for (let i = 0; i < this.experiences.length - 2; i++) {
      const exp = this.experiences[i];
      
      const expStartParts = exp.startDate.split(' ');
      const expEndParts = exp.endDate === 'Present' ? ['Present'] : exp.endDate.split(' ');
      
      let expStart: Date, expEnd: Date;
      try {
        if (expStartParts.length > 1) {
          expStart = new Date(`${expStartParts[0]} 1, ${expStartParts[1]}`);
        } else {
          expStart = new Date(exp.startDate);
        }
        
        expEnd = exp.endDate === 'Present' ? new Date() : 
                (expEndParts.length > 1 ? 
                 new Date(`${expEndParts[0]} 1, ${expEndParts[1]}`) : 
                 new Date(exp.endDate));
      } catch (e) {
        console.error("Error parsing dates for", exp.company, e);
        expStart = new Date(0);
        expEnd = new Date();
      }
      
      // Parse dates for new experiences
      const alignerrStart = new Date('Oct 1, 2024');
      const micro1Start = new Date('Aug 1, 2024');
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
}
