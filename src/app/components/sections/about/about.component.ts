import { Component, OnInit, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentService, Skill } from '../../../services/content.service';
import { ScrollAnimationDirective } from '../../../directives/scroll-animation.directive';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faPython, faJs, faJava, faPhp, faRProject, 
  faReact, faDocker, faAws, faGithub, faMicrosoft
} from '@fortawesome/free-brands-svg-icons';
import { 
  faCube, faCode, faDatabase, faBrain, faServer, faLaptopCode,
  faLanguage, faGlobe, faCheckCircle, faChevronRight
} from '@fortawesome/free-solid-svg-icons';

interface Language {
  name: string;
  level: string;
  proficiency: number;
  flagIcon?: string;
}

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, ScrollAnimationDirective, FontAwesomeModule],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent implements OnInit, AfterViewInit {
  about: string = '';
  skillsByCategory: Record<string, Skill[]> = {};
  skillCategories: string[] = [];
  filteredSkillsByCategory: Record<string, Skill[]> = {};
  activeCategory: string = 'All';
  activeScrollCategory: string = '';
  
  // Language proficiency
  languages: Language[] = [
    { name: 'English', level: 'Fluent', proficiency: 95, flagIcon: '🇬🇧' },
    { name: 'French', level: 'Fluent', proficiency: 90, flagIcon: '🇫🇷' },
    { name: 'Arabic', level: 'Native', proficiency: 100, flagIcon: '🇩🇿' }
  ];
  
  // Icons
  faCode = faCode;
  faDatabase = faDatabase;
  faBrain = faBrain;
  faServer = faServer;
  faLaptopCode = faLaptopCode;
  faCube = faCube;
  faLanguage = faLanguage;
  faGlobe = faGlobe;
  faCheckCircle = faCheckCircle;
  faChevronRight = faChevronRight;

  constructor(private contentService: ContentService) {}

  ngOnInit(): void {
    const portfolioContent = this.contentService.getPortfolioContent();
    this.about = portfolioContent.about;
    
    // Get skills grouped by category
    this.skillsByCategory = this.contentService.getSkillsByCategory();
    this.skillCategories = Object.keys(this.skillsByCategory);
    
    // Initialize with all skills
    this.showAllSkills();
  }
  
  ngAfterViewInit(): void {
    // Set initial active scroll category
    setTimeout(() => {
      this.checkActiveScrollCategory();
    }, 500);
  }
  
  @HostListener('scroll', ['$event'])
  onSkillsScroll(event: Event): void {
    if (this.activeCategory === 'All') {
      this.checkActiveScrollCategory();
    }
  }
  
  /**
   * Check which category is currently in view for scroll indicator
   */
  checkActiveScrollCategory(): void {
    const container = document.querySelector('.skills-container') as HTMLElement;
    if (!container) return;
    
    const containerTop = container.scrollTop;
    const containerHeight = container.clientHeight;
    let activeCategory = '';
    
    for (const category of this.skillCategories) {
      const categoryId = category.toLowerCase().replace(' & ', '-').replace(' ', '-');
      const element = document.getElementById(categoryId);
      if (!element) continue;
      
      const elementTop = element.offsetTop - container.offsetTop;
      const elementHeight = element.clientHeight;
      
      if (elementTop <= containerTop + containerHeight/2 && 
          elementTop + elementHeight > containerTop) {
        activeCategory = category;
        break;
      }
    }
    
    if (activeCategory) {
      this.activeScrollCategory = activeCategory;
    }
  }
  
  /**
   * Filter skills by category
   */
  filterByCategory(category: string): void {
    this.activeCategory = category;
    
    if (category === 'All') {
      this.showAllSkills();
    } else {
      this.filteredSkillsByCategory = {};
      this.filteredSkillsByCategory[category] = this.skillsByCategory[category];
    }
  }
  
  /**
   * Show all skills from all categories
   */
  showAllSkills(): void {
    this.activeCategory = 'All';
    this.filteredSkillsByCategory = { ...this.skillsByCategory };
  }
  
  /**
   * Get a CSS variable styling for skill progress bar
   */
  getSkillBarStyle(level: number): string {
    return `width: ${level}%`;
  }
  
  /**
   * Get appropriate icon for skill category
   */
  getCategoryIcon(category: string): any {
    const iconMap: { [key: string]: any } = {
      'Languages': faCode,
      'Databases': faDatabase,
      'ML & AI': faBrain,
      'Web & DevOps': faServer
    };
    
    return iconMap[category] || faLaptopCode;
  }
  
  /**
   * Get appropriate icon for skill
   */
  getSkillIcon(skillName: string): any {
    const nameLower = skillName.toLowerCase();
    
    if (nameLower.includes('python')) return faPython;
    if (nameLower.includes('javascript') || nameLower.includes('typescript')) return faJs;
    if (nameLower.includes('java')) return faJava;
    if (nameLower.includes('php')) return faPhp;
    if (nameLower.includes('r')) return faRProject;
    if (nameLower.includes('react')) return faReact;
    if (nameLower.includes('docker')) return faDocker;
    if (nameLower.includes('aws')) return faAws;
    if (nameLower.includes('git')) return faGithub;
    if (nameLower.includes('azure')) return faMicrosoft;
    
    return faCube; // Default icon
  }
  
  /**
   * Scroll to a specific category within the skills container
   */
  scrollToCategory(category: string): void {
    const categoryId = category.toLowerCase().replace(' & ', '-').replace(' ', '-');
    const element = document.getElementById(categoryId);
    
    if (element) {
      const container = document.querySelector('.skills-container') as HTMLElement;
      if (container) {
        container.scrollTo({
          top: element.offsetTop - container.offsetTop,
          behavior: 'smooth'
        });
        
        this.activeScrollCategory = category;
      }
    }
  }
}
