import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentService, Project, Experience, Skill } from '../../services/content.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faFileAlt, faTimes, faDownload, faEye } from '@fortawesome/free-solid-svg-icons';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export type ResumeType = 'ai-engineering' | 'software-engineering';

@Component({
  selector: 'app-resume-compiler',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './resume-compiler.component.html',
  styleUrl: './resume-compiler.component.css'
})
export class ResumeCompilerComponent {
  @ViewChild('resumePreview', { static: false }) resumePreview!: ElementRef;

  // Icons
  faFileAlt = faFileAlt;
  faTimes = faTimes;
  faDownload = faDownload;
  faEye = faEye;

  // Modal state
  showModal = false;
  showPreview = false;
  
  // Resume data
  selectedResumeType: ResumeType | null = null;
  filteredProjects: Project[] = [];
  filteredExperience: Experience[] = [];
  relevantSkills: Skill[] = [];
  
  // Loading state
  isGeneratingPdf = false;
  
  constructor(private readonly contentService: ContentService) {}
  
  compileResume(): void {
    this.showModal = true;
  }

  selectResumeType(type: ResumeType): void {
    this.selectedResumeType = type;
    this.filterContent();
    this.showModal = false;
    this.showPreview = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  closePreview(): void {
    this.showPreview = false;
    this.selectedResumeType = null;
  }

  private filterContent(): void {
    const content = this.contentService.getPortfolioContent();
    
    if (this.selectedResumeType === 'ai-engineering') {
      // AI Engineering focus
      this.filteredProjects = this.contentService.getAiProjects().slice(0, 4);
      this.filteredExperience = content.experience.filter(exp => 
        exp.description.toLowerCase().includes('ai') ||
        exp.description.toLowerCase().includes('machine learning') ||
        exp.description.toLowerCase().includes('data science') ||
        exp.description.toLowerCase().includes('python') ||
        exp.description.toLowerCase().includes('tensorflow') ||
        exp.description.toLowerCase().includes('pytorch')
      );
      this.relevantSkills = content.skills.filter(skill => 
        skill.category === 'AI/ML' || 
        skill.category === 'Programming' ||
        skill.category === 'Data Science'
      );
    } else {
      // Software Engineering focus
      this.filteredProjects = this.contentService.getNonAiProjects().slice(0, 4);
      this.filteredExperience = content.experience.filter(exp => 
        exp.description.toLowerCase().includes('software') ||
        exp.description.toLowerCase().includes('development') ||
        exp.description.toLowerCase().includes('frontend') ||
        exp.description.toLowerCase().includes('backend') ||
        exp.description.toLowerCase().includes('full-stack')
      );
      this.relevantSkills = content.skills.filter(skill => 
        skill.category === 'Frontend' || 
        skill.category === 'Backend' ||
        skill.category === 'Programming' ||
        skill.category === 'Tools'
      );
    }

    // If no specific experience found, include all experience
    if (this.filteredExperience.length === 0) {
      this.filteredExperience = content.experience.slice(0, 3);
    }
  }

  async downloadPdf(): Promise<void> {
    if (!this.resumePreview) return;
    
    this.isGeneratingPdf = true;
    
    try {
      const element = this.resumePreview.nativeElement;
      
      // Configure html2canvas for better quality
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;
      
      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // Download the PDF
      const fileName = `${this.selectedResumeType}-resume.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      this.isGeneratingPdf = false;
    }
  }

  getPortfolioContent() {
    return this.contentService.getPortfolioContent();
  }
  getResumeTypeDisplayName(): string {
    if (this.selectedResumeType === 'ai-engineering') {
      return 'AI Engineering';
    }
    return 'Software Engineering';
  }

  getSkillsByCategory(): { name: string; skills: Skill[] }[] {
    const content = this.contentService.getPortfolioContent();
    
    // Filter skills based on resume type
    if (this.selectedResumeType === 'ai-engineering') {
      // Group AI-related skills by category
      const aiSkillCategories = content.skills
        .filter(skill => 
          skill.category === 'AI/ML' || 
          skill.category === 'Programming' || 
          skill.category === 'Data Science'
        )
        .reduce((acc, skill) => {
          if (!acc[skill.category]) {
            acc[skill.category] = [];
          }
          acc[skill.category].push(skill);
          return acc;
        }, {} as Record<string, Skill[]>);

      return Object.keys(aiSkillCategories).map(category => ({
        name: category,
        skills: aiSkillCategories[category]
      }));
    } else {
      // Group software engineering skills by category
      const softwareSkillCategories = content.skills
        .filter(skill => 
          skill.category === 'Frontend' || 
          skill.category === 'Backend' ||
          skill.category === 'Programming' ||
          skill.category === 'Tools'
        )
        .reduce((acc, skill) => {
          if (!acc[skill.category]) {
            acc[skill.category] = [];
          }
          acc[skill.category].push(skill);
          return acc;
        }, {} as Record<string, Skill[]>);

      return Object.keys(softwareSkillCategories).map(category => ({
        name: category,
        skills: softwareSkillCategories[category]
      }));
    }
  }
}