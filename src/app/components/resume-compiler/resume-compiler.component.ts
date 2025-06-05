import { Component, ElementRef, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentService, Project, Experience, Skill } from '../../services/content.service';
import { ResumeConfigService, ResumeConfiguration } from '../../services/resume-config.service';
import { ResumeConfigComponent } from './resume-config.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faFileAlt, faTimes, faDownload, faEye, faCog } from '@fortawesome/free-solid-svg-icons';
import { faEnvelope, faMapMarkerAlt, faGlobe } from '@fortawesome/free-solid-svg-icons';
import { faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export type ResumeType = 'ai-engineering' | 'software-engineering';

@Component({
  selector: 'app-resume-compiler',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, ResumeConfigComponent],
  templateUrl: './resume-compiler.component.html',
  styleUrl: './resume-compiler.component.css'
})
export class ResumeCompilerComponent implements OnInit, OnDestroy {
  @ViewChild('resumePreview', { static: false }) resumePreview!: ElementRef;

  // Icons
  faFileAlt = faFileAlt;
  faTimes = faTimes;
  faDownload = faDownload;
  faEye = faEye;
  faCog = faCog;
  // Contact Icons
  faEnvelope = faEnvelope;
  faMapMarkerAlt = faMapMarkerAlt;
  faGithub = faGithub;
  faLinkedin = faLinkedin;
  faGlobe = faGlobe;

  // Modal state
  showModal = false;
  showPreview = false;
  showConfig = false;
  
  // Resume data
  selectedResumeType: ResumeType | null = null;
  currentConfig: ResumeConfiguration | null = null;
  filteredProjects: Project[] = [];
  filteredExperience: Experience[] = [];
  relevantSkills: Skill[] = [];
    // Loading state
  isGeneratingPdf = false;
    constructor(
    private readonly contentService: ContentService,
    private readonly resumeConfigService: ResumeConfigService
  ) {}
  ngOnInit(): void {
    // Component initialization complete
  }

  ngOnDestroy(): void {
    // Component cleanup if needed
  }

  compileResume(): void {
    this.showModal = true;
  }
  selectResumeType(type: ResumeType): void {
    this.selectedResumeType = type;
    
    // Automatically create optimal recruiter-friendly configuration
    const autoConfig = this.createRecruiterOptimizedConfig(type);
    
    this.currentConfig = autoConfig;
    this.resumeConfigService.setCurrentConfiguration(autoConfig);
    this.filterContentFromConfig();
    
    this.showModal = false;
    this.showPreview = true;
  }

  onConfigApplied(config: ResumeConfiguration): void {
    this.currentConfig = config;
    this.selectedResumeType = config.type;
    this.resumeConfigService.setCurrentConfiguration(config);
    this.filterContentFromConfig();
    this.showConfig = false;
    this.showPreview = true;
  }

  onConfigCancelled(): void {
    this.showConfig = false;
    this.selectedResumeType = null;
  }

  closeModal(): void {
    this.showModal = false;
  }

  closePreview(): void {
    this.showPreview = false;
    this.selectedResumeType = null;
    this.currentConfig = null;
  }

  private filterContentFromConfig(): void {
    if (!this.currentConfig) return;

    const filtered = this.resumeConfigService.getFilteredContent(this.currentConfig);
    this.filteredExperience = filtered.experiences;
    this.filteredProjects = filtered.projects;
    // For AI Engineering, prioritize ML/AI, Languages, and Databases
    if (this.currentConfig.type === 'ai-engineering') {
      const allSkills = this.contentService.getPortfolioContent().skills;
      this.relevantSkills = allSkills.filter(s => ['ML & AI', 'Languages', 'Databases'].includes(s.category));
    } else {
      this.relevantSkills = filtered.skills;
    }
  }  
  /** Map social link icon strings to FontAwesome icons */
  getSocialIcon(name: string) {
    switch (name.toLowerCase()) {
      case 'github': return this.faGithub;
      case 'linkedin': return this.faLinkedin;
      case 'globe': return this.faGlobe;
      default: return this.faGlobe;
    }
  }

  async downloadPdf(): Promise<void> {
    if (!this.resumePreview) return;
    
    this.isGeneratingPdf = true;
    
    try {
      const element = this.resumePreview.nativeElement;
      
      // Get current theme state
      const isDark = document.documentElement.classList.contains('dark');
      const rootStyles = getComputedStyle(document.documentElement);
      
      // Configure html2canvas with proper theme background
      const backgroundColor = isDark ? '#1e1e2a' : '#ffffff';
      
      // Configure html2canvas for better quality
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: backgroundColor,
        width: element.scrollWidth,
        height: element.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        removeContainer: false,
        imageTimeout: 15000,
        logging: false,
        ignoreElements: (element) => {
          // Ignore any overlay elements that might interfere
          return element.classList.contains('fixed') && !element.contains(this.resumePreview.nativeElement);
        }
      });
      
      const imgData = canvas.toDataURL('image/png', 1.0);
      
      // Create PDF with proper dimensions
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = 210; // A4 width in mm
      const pdfHeight = 297; // A4 height in mm
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      
      // Calculate margins and content area
      const topMargin = 0;
      const bottomMargin = 10; // Space for page numbers
      const contentHeight = pdfHeight - topMargin - bottomMargin;
      
      // Calculate how many pages we need
      const totalPages = Math.ceil(imgHeight / contentHeight);
      
      for (let page = 0; page < totalPages; page++) {
        if (page > 0) {
          pdf.addPage();
        }
        
        // Calculate the y offset for this page
        const yOffset = -(page * contentHeight);
        
        // Add the image portion for this page
        pdf.addImage(
          imgData, 
          'PNG', 
          0, 
          yOffset + topMargin, 
          imgWidth, 
          imgHeight,
          undefined,
          'FAST'
        );
        
        // Add page number and footer
        pdf.setFontSize(8);
        pdf.setTextColor(128, 128, 128);
        
        // Page number
        pdf.text(
          `${page + 1} / ${totalPages}`, 
          pdfWidth / 2, 
          pdfHeight - 5, 
          { align: 'center' }
        );
        
        // Add watermark/footer text
        pdf.text(
          `Generated by Portfolio Resume Compiler`, 
          10, 
          pdfHeight - 5
        );
      }
      
      // Add comprehensive metadata
      const portfolioContent = this.getPortfolioContent();
      pdf.setProperties({
        title: `${portfolioContent.name} - ${this.getResumeTypeDisplayName()} Resume`,
        subject: `Professional Resume - ${this.getResumeTypeDisplayName()}`,
        author: portfolioContent.name,
        keywords: `resume, ${this.selectedResumeType}, professional, ${this.getResumeTypeDisplayName().toLowerCase()}`,
        creator: 'Portfolio Resume Compiler'
      });
      
      // Generate filename with timestamp for uniqueness
      const timestamp = new Date().toISOString().slice(0, 10);
      const fileName = `${portfolioContent.name.replace(/\s+/g, '_')}_${this.selectedResumeType}_resume_${timestamp}.pdf`;
      
      // Download the PDF
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      
      // Show user-friendly error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Error generating PDF: ${errorMessage}. Please try again or contact support if the issue persists.`);
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
  }  getSkillsByCategory(): { name: string; skills: Skill[] }[] {
    // For AI Engineering resumes, show all ML, Language & Database skills
    const skills = this.currentConfig?.type === 'ai-engineering'
      ? this.contentService.getPortfolioContent().skills.filter(s => ['ML & AI', 'Languages', 'Databases'].includes(s.category))
      : this.relevantSkills;
    const grouped = skills.reduce((acc, skill) => {
      acc[skill.category] = acc[skill.category] || [];
      acc[skill.category].push(skill);
      return acc;
    }, {} as Record<string, Skill[]>);
    return Object.entries(grouped).map(([name, skills]) => ({ name, skills }));
  }

  getProfessionalSummary(): string {
    if (this.currentConfig?.customSummary) {
      return this.currentConfig.customSummary;
    }
    return this.getPortfolioContent().about;
  }
  private createRecruiterOptimizedConfig(type: ResumeType): ResumeConfiguration {
    const content = this.contentService.getPortfolioContent();
    
    // For recruiters, automatically select the most relevant and recent content
    const sortedExperiences = [...content.experience].sort((a, b) => 
      new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );
    
    const sortedProjects = [...content.projects];
    
    if (type === 'ai-engineering') {      return {
        type: 'ai-engineering',
        selectedExperiences: sortedExperiences
          .filter(exp => 
            exp.skills?.some((tech: string) => 
              tech.toLowerCase().includes('python') ||
              tech.toLowerCase().includes('ai') ||
              tech.toLowerCase().includes('ml') ||
              tech.toLowerCase().includes('machine learning') ||
              tech.toLowerCase().includes('tensorflow') ||
              tech.toLowerCase().includes('pytorch') ||
              tech.toLowerCase().includes('data') ||
              tech.toLowerCase().includes('neural')
            ) || 
            exp.description.toLowerCase().includes('ai') ||
            exp.description.toLowerCase().includes('machine learning') ||
            exp.description.toLowerCase().includes('data')
          )
          .slice(0, 4)
          .map(exp => exp.company),
        selectedProjects: sortedProjects
          .filter(project => 
            project.isAiProject ||
            project.tags.some((tech: string) => 
              tech.toLowerCase().includes('python') ||
              tech.toLowerCase().includes('ai') ||
              tech.toLowerCase().includes('ml') ||
              tech.toLowerCase().includes('machine learning') ||
              tech.toLowerCase().includes('tensorflow') ||
              tech.toLowerCase().includes('pytorch') ||
              tech.toLowerCase().includes('data') ||
              tech.toLowerCase().includes('neural')
            )
          )
          .slice(0, 5)
          .map(project => project.title),
        selectedSkills: content.skills
          .filter(skill => 
            skill.category === 'AI/ML' || 
            skill.category === 'Programming' || 
            skill.category === 'Data Science' ||
            skill.category === 'Tools'
          )
          .map(skill => skill.name),
        selectedEducation: content.education.map(edu => edu.degree),
        includeContact: true,
        includePersonalProjects: true,
        maxExperiences: 4,
        maxProjects: 5,
        customSummary: '' // Use default about section
      };    } else {
      return {
        type: 'software-engineering',
        selectedExperiences: sortedExperiences
          .filter(exp => 
            exp.skills?.some((tech: string) => 
              tech.toLowerCase().includes('javascript') ||
              tech.toLowerCase().includes('typescript') ||
              tech.toLowerCase().includes('react') ||
              tech.toLowerCase().includes('angular') ||
              tech.toLowerCase().includes('node') ||
              tech.toLowerCase().includes('java') ||
              tech.toLowerCase().includes('spring') ||
              tech.toLowerCase().includes('web') ||
              tech.toLowerCase().includes('api')
            ) ||
            exp.description.toLowerCase().includes('web') ||
            exp.description.toLowerCase().includes('software') ||
            exp.description.toLowerCase().includes('development')
          )
          .slice(0, 4)
          .map(exp => exp.company),
        selectedProjects: sortedProjects
          .filter(project => 
            !project.isAiProject &&
            project.tags.some((tech: string) => 
              tech.toLowerCase().includes('javascript') ||
              tech.toLowerCase().includes('typescript') ||
              tech.toLowerCase().includes('react') ||
              tech.toLowerCase().includes('angular') ||
              tech.toLowerCase().includes('node') ||
              tech.toLowerCase().includes('java') ||
              tech.toLowerCase().includes('spring') ||
              tech.toLowerCase().includes('web') ||
              tech.toLowerCase().includes('api')
            )
          )
          .slice(0, 5)
          .map(project => project.title),
        selectedSkills: content.skills
          .filter(skill => 
            skill.category === 'Frontend' || 
            skill.category === 'Backend' ||
            skill.category === 'Programming' ||
            skill.category === 'Tools'
          )
          .map(skill => skill.name),
        selectedEducation: content.education.map(edu => edu.degree),
        includeContact: true,
        includePersonalProjects: true,
        maxExperiences: 4,
        maxProjects: 5,
        customSummary: '' // Use default about section
      };
    }
  }
}