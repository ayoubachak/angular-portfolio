import { Component, OnInit, AfterViewInit, HostListener, ViewChild, ElementRef } from '@angular/core';
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
  @ViewChild('skillsContainer') skillsContainerRef!: ElementRef<HTMLElement>;
  
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
    { name: 'Arabic', level: 'Native', proficiency: 100, flagIcon: '🇲🇦' }
  ];
  
  // Globe interaction
  isGlobeSpinning: boolean = false;
  hoveredLanguage: string = '';
  
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
    
    // Ensure Web & DevOps category is in the list
    const webDevopsCategory = 'Web & DevOps';
    if (this.skillsByCategory[webDevopsCategory] && !this.filteredSkillsByCategory[webDevopsCategory]) {
      this.filteredSkillsByCategory[webDevopsCategory] = this.skillsByCategory[webDevopsCategory];
    }
  }
    ngAfterViewInit(): void {
    // Set initial active scroll category and force animations to be evaluated
    setTimeout(() => {
      this.checkActiveScrollCategory();
      
      // Manually trigger a scroll event to ensure animations are evaluated
      if (this.skillsContainerRef?.nativeElement) {
        const scrollEvent = new Event('scroll');
        this.skillsContainerRef.nativeElement.dispatchEvent(scrollEvent);
      }
    }, 500);
  }
    // This event is triggered from the template (scroll)="onSkillsScroll($event)"
  onSkillsScroll(event: Event): void {
    // Always check active scroll category when scrolling the skills container
    this.checkActiveScrollCategory();
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
    
    // Check each category element
    for (const category of this.skillCategories) {
      const categoryId = category.toLowerCase().replace(' & ', '-').replace(' ', '-');
      const element = document.getElementById(categoryId);
      if (!element) continue;
      
      // Get category element position relative to the container
      const containerRect = container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      const elementTop = elementRect.top - containerRect.top;
      const elementHeight = elementRect.height;
      
      // Category is considered active if it's in the middle section of the viewport
      if (elementTop <= containerHeight/2 && 
          elementTop + elementHeight > 0) {
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
      // After rendering all skills, make sure to check which ones are visible
      setTimeout(() => {
        this.checkActiveScrollCategory();
      }, 100);
    } else {
      this.filteredSkillsByCategory = {};
      this.filteredSkillsByCategory[category] = this.skillsByCategory[category];
      this.activeScrollCategory = category;
      
      // After rendering the specific category, scroll to top to ensure visibility
      setTimeout(() => {
        if (this.skillsContainerRef?.nativeElement) {
          this.skillsContainerRef.nativeElement.scrollTop = 0;
        }
      }, 100);
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
    // Create a dynamic gradient based on the skill level
    const gradientStop = Math.max(70, level - 10); // Ensures the gradient is visible even for high levels
    return `width: ${level}%; background-image: linear-gradient(to right, var(--accent-color), var(--accent-color) ${gradientStop}%, rgba(var(--accent-color-rgb), 0.85))`;
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
   * Toggle globe spinning animation
   */
  toggleGlobeSpin(isSpinning: boolean): void {
    this.isGlobeSpinning = isSpinning;
  }
  
  /**
   * Set the currently hovered language
   */
  setHoveredLanguage(language: string): void {
    this.hoveredLanguage = language;
  }
  
  /**
   * Get positioning style for language regions on the globe
   */
  getLanguageRegionStyle(language: Language): any {
    // Position languages in different regions of the globe
    switch(language.name) {
      case 'English':
        return {
          top: '30%',
          left: '70%',
          transform: 'translateZ(20px)'
        };
      case 'French':
        return {
          top: '40%',
          left: '45%',
          transform: 'translateZ(15px)'
        };
      case 'Arabic':
        return {
          top: '60%',
          left: '55%',
          transform: 'translateZ(18px)'
        };
      default:
        return {
          top: '50%',
          left: '50%'
        };
    }
  }

  /**
   * Scroll to a specific category within the skills container
   */
  scrollToCategory(category: string): void {
    const categoryId = category.toLowerCase().replace(' & ', '-').replace(' ', '-');
    const element = document.getElementById(categoryId);
    
    if (element && this.skillsContainerRef?.nativeElement) {
      const container = this.skillsContainerRef.nativeElement;
      
      // Get category element position relative to the container
      const containerRect = container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      const elementTop = element.offsetTop;
      
      // Smooth scroll to the element
      container.scrollTo({
        top: elementTop,
        behavior: 'smooth'
      });
      
      this.activeScrollCategory = category;
    }
  }
}
