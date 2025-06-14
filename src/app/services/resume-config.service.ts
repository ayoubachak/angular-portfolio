import { Injectable } from '@angular/core';
import { ContentService, Project, Experience, Skill, Education } from './content.service';

export interface ResumeConfiguration {
  type: 'ai-engineering' | 'software-engineering';
  selectedExperiences: string[]; // Array of experience IDs
  selectedProjects: string[]; // Array of project IDs
  selectedSkills: string[]; // Array of skill IDs
  selectedEducation: string[]; // Array of education IDs
  customSummary?: string;
  includeContact: boolean;
  includePersonalProjects: boolean;
  maxExperiences: number;
  maxProjects: number;
}

export interface FilteredContent {
  experiences: Experience[];
  projects: Project[];
  skills: Skill[];
  education: Education[];
}

@Injectable({
  providedIn: 'root'
})
export class ResumeConfigService {
  private currentConfiguration: ResumeConfiguration | null = null;

  constructor(private readonly contentService: ContentService) {}

  setCurrentConfiguration(config: ResumeConfiguration): void {
    this.currentConfiguration = config;
  }

  getCurrentConfiguration(): ResumeConfiguration | null {
    return this.currentConfiguration;
  }
  createDefaultConfiguration(type: 'ai-engineering' | 'software-engineering'): ResumeConfiguration {
    const content = this.contentService.getPortfolioContent();
    
    // Auto-select relevant content based on type
    const relevantExperiences = this.getRelevantExperiences(type);
    const relevantProjects = this.getRelevantProjects(type);
    const relevantSkills = this.getRelevantSkills(type);
    
    return {
      type,
      selectedExperiences: relevantExperiences.slice(0, 3).map(exp => exp.company),
      selectedProjects: relevantProjects.slice(0, 4).map(proj => proj.title),
      selectedSkills: relevantSkills.map(skill => skill.name),
      selectedEducation: content.education.map(edu => edu.degree),
      includeContact: true,
      includePersonalProjects: true,
      maxExperiences: 3,
      maxProjects: 4
    };
  }

  getFilteredContent(config: ResumeConfiguration): FilteredContent {
    const content = this.contentService.getPortfolioContent();
    
    return {
      experiences: content.experience.filter(exp => 
        config.selectedExperiences.includes(exp.company)
      ).slice(0, config.maxExperiences),
      projects: content.projects.filter(proj => 
        config.selectedProjects.includes(proj.title)
      ).slice(0, config.maxProjects),
      skills: content.skills.filter(skill => 
        config.selectedSkills.includes(skill.name)
      ),
      education: content.education.filter(edu => 
        config.selectedEducation.includes(edu.degree)
      )
    };
  }

  private getRelevantExperiences(type: 'ai-engineering' | 'software-engineering'): Experience[] {
    const content = this.contentService.getPortfolioContent();
    
    if (type === 'ai-engineering') {
      return content.experience.filter(exp => 
        exp.skills?.some(skill => 
          ['Python', 'Machine Learning', 'AI', 'Data Science', 'TensorFlow', 'PyTorch', 'Neural Networks']
          .some(aiTech => skill.toLowerCase().includes(aiTech.toLowerCase()))
        ) || 
        this.getExperienceContent(exp).toLowerCase().includes('ai') ||
        this.getExperienceContent(exp).toLowerCase().includes('machine learning') ||
        this.getExperienceContent(exp).toLowerCase().includes('data science')
      );
    } else {
      return content.experience.filter(exp => 
        exp.skills?.some(skill => 
          ['JavaScript', 'TypeScript', 'React', 'Angular', 'Vue', 'Node.js', 'Java', 'C#', 'Python']
          .some(softwareTech => skill.toLowerCase().includes(softwareTech.toLowerCase()))
        ) || 
        this.getExperienceContent(exp).toLowerCase().includes('software') ||
        this.getExperienceContent(exp).toLowerCase().includes('development') ||
        this.getExperienceContent(exp).toLowerCase().includes('programming')
      );
    }
  }

  // Helper method to get experience content (handles both bulletPoints and description)
  private getExperienceContent(experience: Experience): string {
    if (experience.bulletPoints && experience.bulletPoints.length > 0) {
      return experience.bulletPoints.join(' ');
    }
    return experience.description || '';
  }

  private getRelevantProjects(type: 'ai-engineering' | 'software-engineering'): Project[] {
    const content = this.contentService.getPortfolioContent();
    const allProjects = content.projects;
    
    if (type === 'ai-engineering') {
      return allProjects.filter(proj => 
        proj.tags?.some((tag: string) => 
          ['AI', 'ML', 'Machine Learning', 'Deep Learning', 'Neural Network', 'Data Science', 'Python', 'TensorFlow', 'PyTorch']
          .some((aiTag: string) => tag.toLowerCase().includes(aiTag.toLowerCase()))
        ) || proj.isAiProject
      );
    } else {
      return allProjects.filter(proj => 
        proj.tags?.some((tag: string) => 
          ['React', 'Angular', 'Vue', 'JavaScript', 'TypeScript', 'Node.js', 'Express', 'API', 'Web', 'Frontend', 'Backend']
          .some((softwareTag: string) => tag.toLowerCase().includes(softwareTag.toLowerCase()))
        ) && !proj.isAiProject
      );
    }
  }

  private getRelevantSkills(type: 'ai-engineering' | 'software-engineering'): Skill[] {
    const content = this.contentService.getPortfolioContent();
    
    if (type === 'ai-engineering') {
      return content.skills.filter(skill => 
        skill.category === 'AI/ML' || 
        skill.category === 'Data Science' ||
        skill.category === 'Programming' ||
        ['Python', 'R', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy']
        .some(aiSkill => skill.name.toLowerCase().includes(aiSkill.toLowerCase()))
      );
    } else {
      return content.skills.filter(skill => 
        skill.category === 'Frontend' || 
        skill.category === 'Backend' ||
        skill.category === 'Programming' ||
        skill.category === 'Tools' ||
        ['JavaScript', 'TypeScript', 'React', 'Angular', 'Vue', 'Node.js', 'Java', 'C#']
        .some(softwareSkill => skill.name.toLowerCase().includes(softwareSkill.toLowerCase()))
      );
    }
  }
}