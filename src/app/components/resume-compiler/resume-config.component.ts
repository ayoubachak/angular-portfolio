import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheck, faTimes, faPlus, faMinus, faUser, faCode, faGraduationCap, faBriefcase } from '@fortawesome/free-solid-svg-icons';
import { ContentService, Project, Experience, Skill } from '../../services/content.service';
import { ResumeConfigService, ResumeConfiguration } from '../../services/resume-config.service';

export type ResumeType = 'ai-engineering' | 'software-engineering';

@Component({
  selector: 'app-resume-config',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  template: `
    <div class="config-modal-overlay" (click)="onCancel()">
      <div class="config-modal" (click)="$event.stopPropagation()">
        <!-- Header -->
        <div class="config-header">
          <h2 class="config-title">
            <fa-icon [icon]="faUser" class="mr-2"></fa-icon>
            Configure {{ getResumeTypeDisplayName() }} Resume
          </h2>
          <button (click)="onCancel()" class="close-btn">
            <fa-icon [icon]="faTimes"></fa-icon>
          </button>
        </div>

        <!-- Content -->
        <div class="config-content">
          <!-- Professional Summary -->
          <div class="config-section">
            <h3 class="section-title">Professional Summary</h3>
            <textarea
              [(ngModel)]="config.customSummary"
              placeholder="Enter a custom professional summary or leave empty to use your about section"
              class="summary-textarea"
              rows="3">
            </textarea>
          </div>

          <!-- Experience Selection -->
          <div class="config-section">
            <div class="section-header">
              <h3 class="section-title">
                <fa-icon [icon]="faBriefcase" class="mr-2"></fa-icon>
                Professional Experience
              </h3>
              <div class="section-controls">
                <label class="max-items-label">
                  Max: 
                  <input 
                    type="number" 
                    [(ngModel)]="config.maxExperiences" 
                    min="1" 
                    max="5" 
                    class="max-items-input">
                </label>
              </div>
            </div>
            <div class="items-grid">
              <div 
                *ngFor="let exp of availableExperiences" 
                class="item-card"
                [class.selected]="isExperienceSelected(exp)"
                (click)="toggleExperience(exp)">
                <div class="item-checkbox">
                  <fa-icon 
                    [icon]="isExperienceSelected(exp) ? faCheck : faPlus"
                    [class.selected]="isExperienceSelected(exp)">
                  </fa-icon>
                </div>
                <div class="item-content">
                  <h4 class="item-title">{{ exp.role }}</h4>
                  <p class="item-subtitle">{{ exp.company }} • {{ exp.startDate }} - {{ exp.endDate }}</p>
                  <p class="item-description">{{ getExperienceDescription(exp) | slice:0:100 }}...</p>
                  <div class="item-tags" *ngIf="exp.skills">
                    <span *ngFor="let skill of exp.skills.slice(0, 3)" class="tag">{{ skill }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Projects Selection -->
          <div class="config-section">
            <div class="section-header">
              <h3 class="section-title">
                <fa-icon [icon]="faCode" class="mr-2"></fa-icon>
                Key Projects
              </h3>
              <div class="section-controls">
                <label class="max-items-label">
                  Max: 
                  <input 
                    type="number" 
                    [(ngModel)]="config.maxProjects" 
                    min="1" 
                    max="6" 
                    class="max-items-input">
                </label>
              </div>
            </div>
            <div class="items-grid">
              <div 
                *ngFor="let project of availableProjects" 
                class="item-card"
                [class.selected]="isProjectSelected(project)"
                (click)="toggleProject(project)">
                <div class="item-checkbox">
                  <fa-icon 
                    [icon]="isProjectSelected(project) ? faCheck : faPlus"
                    [class.selected]="isProjectSelected(project)">
                  </fa-icon>
                </div>
                <div class="item-content">
                  <h4 class="item-title">{{ project.title }}</h4>
                  <p class="item-description">{{ project.description | slice:0:100 }}...</p>
                  <div class="item-tags" *ngIf="project.tags">
                    <span *ngFor="let tag of project.tags.slice(0, 4)" class="tag">{{ tag }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Skills Selection -->
          <div class="config-section">
            <h3 class="section-title">
              <fa-icon [icon]="faCode" class="mr-2"></fa-icon>
              Technical Skills
            </h3>
            <div class="skills-categories">
              <div *ngFor="let category of skillCategories" class="skill-category">
                <h4 class="category-title">{{ category.name }}</h4>
                <div class="skills-grid">
                  <button
                    *ngFor="let skill of category.skills"
                    class="skill-chip"
                    [class.selected]="isSkillSelected(skill)"
                    (click)="toggleSkill(skill)">
                    {{ skill.name }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="config-footer">
          <button (click)="onCancel()" class="btn btn-secondary">
            <fa-icon [icon]="faTimes" class="mr-2"></fa-icon>
            Cancel
          </button>
          <button (click)="onApply()" class="btn btn-primary">
            <fa-icon [icon]="faCheck" class="mr-2"></fa-icon>
            Generate Resume
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./resume-config.component.css']
})
export class ResumeConfigComponent implements OnInit {
  @Input() resumeType: ResumeType = 'software-engineering';
  @Output() configApplied = new EventEmitter<ResumeConfiguration>();
  @Output() configCancelled = new EventEmitter<void>();

  // Icons
  faCheck = faCheck;
  faTimes = faTimes;
  faPlus = faPlus;
  faMinus = faMinus;
  faUser = faUser;
  faCode = faCode;
  faGraduationCap = faGraduationCap;
  faBriefcase = faBriefcase;

  config: ResumeConfiguration;
  availableExperiences: Experience[] = [];
  availableProjects: Project[] = [];
  skillCategories: { name: string; skills: Skill[] }[] = [];

  constructor(
    private readonly contentService: ContentService,
    private readonly resumeConfigService: ResumeConfigService
  ) {
    this.config = this.resumeConfigService.createDefaultConfiguration(this.resumeType);
  }

  ngOnInit(): void {
    this.loadContent();
    this.config = this.resumeConfigService.createDefaultConfiguration(this.resumeType);
  }
  private loadContent(): void {
    const content = this.contentService.getPortfolioContent();
    
    this.availableExperiences = content.experience;
    this.availableProjects = content.projects;
    
    // Group skills by category
    const skillsMap = content.skills.reduce((acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = [];
      }
      acc[skill.category].push(skill);
      return acc;
    }, {} as Record<string, Skill[]>);

    this.skillCategories = Object.keys(skillsMap).map(category => ({
      name: category,
      skills: skillsMap[category]
    }));
  }

  getResumeTypeDisplayName(): string {
    return this.resumeType === 'ai-engineering' ? 'AI Engineering' : 'Software Engineering';
  }

  // Experience methods
  isExperienceSelected(experience: Experience): boolean {
    return this.config.selectedExperiences.includes(experience.company);
  }

  toggleExperience(experience: Experience): void {
    const id = experience.company;
    const index = this.config.selectedExperiences.indexOf(id);
    
    if (index > -1) {
      this.config.selectedExperiences.splice(index, 1);
    } else if (this.config.selectedExperiences.length < this.config.maxExperiences) {
      this.config.selectedExperiences.push(id);
    }
  }

  // Project methods
  isProjectSelected(project: Project): boolean {
    return this.config.selectedProjects.includes(project.title);
  }

  toggleProject(project: Project): void {
    const id = project.title;
    const index = this.config.selectedProjects.indexOf(id);
    
    if (index > -1) {
      this.config.selectedProjects.splice(index, 1);
    } else if (this.config.selectedProjects.length < this.config.maxProjects) {
      this.config.selectedProjects.push(id);
    }
  }

  // Skill methods
  isSkillSelected(skill: Skill): boolean {
    return this.config.selectedSkills.includes(skill.name);
  }

  toggleSkill(skill: Skill): void {
    const id = skill.name;
    const index = this.config.selectedSkills.indexOf(id);
    
    if (index > -1) {
      this.config.selectedSkills.splice(index, 1);
    } else {
      this.config.selectedSkills.push(id);
    }
  }

  onApply(): void {
    this.config.type = this.resumeType;
    this.configApplied.emit(this.config);
  }

  onCancel(): void {
    this.configCancelled.emit();
  }

  // Get experience description for display (handles both bulletPoints and description)
  getExperienceDescription(experience: Experience): string {
    if (experience.bulletPoints && experience.bulletPoints.length > 0) {
      return experience.bulletPoints[0]; // Show first bullet point
    }
    return experience.description || '';
  }
}