import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentService, Experience } from '../../../services/content.service';
import { ScrollAnimationDirective } from '../../../directives/scroll-animation.directive';

interface TrainingItem {
  title: string;
  organization: string;
  period: string;
  description: string;
  isVolunteering: boolean;
  logo?: string;
  linkedinUrl?: string;
}

interface BackgroundElement {
  id: string;
  type: 'floating-book' | 'certificate-badge' | 'graduation-cap' | 'skill-node' | 'knowledge-connection' | 'learning-path' | 'training-keyword' | 'achievement-star';
  x: number;
  y: number;
  width?: number;
  height?: number;
  content?: string;
  delay?: number;
}

@Component({
  selector: 'app-training',
  standalone: true,
  imports: [CommonModule, ScrollAnimationDirective],
  templateUrl: './training.component.html',
  styleUrl: './training.component.css'
})
export class TrainingComponent implements OnInit, OnDestroy {
  trainings: TrainingItem[] = [
    {
      title: 'Vice President, Training Manager, Sponsoring Manager',
      organization: 'CIAM Casablanca',
      period: '09/21 - 06/23',
      description: 'Trained 200+ members in Python, AI, ML, DL, C, Web Dev, and Catia. Secured sponsorships from tech companies like Binance and IBM. Managed the club\'s committees and represented the club in the Moroccan National Programming Contest 2022.',
      isVolunteering: false,
      logo: 'assets/images/training/ciam.jpg',
      linkedinUrl: 'https://www.linkedin.com/company/ciam-casablanca/'
    },
    {
      title: 'Training Manager, Technical Consultant',
      organization: 'AEM Mechatronics',
      period: '09/21 - 06/23',
      description: 'Trained members in robotics (C/C++, Arduino, Python, Esp32/82, Raspberry Pi 4), IoT, and AI. Developed notable projects such as a Dijkstra visualizer, AR Snake Game, and Minecraft Modding. Led participation in competitions like Orange Digital Transformation AI Competition (1st Prize) and AMSA6 Hackathon (finalist).',
      isVolunteering: false,
      logo: 'assets/images/training/ammechatronics.jpg',
      linkedinUrl: 'https://www.linkedin.com/in/arts-et-m%C3%A9tiers-mechatronics-4825561ba'
    },
    {
      title: 'Ambassador for HCIA big data/AI certification',
      organization: 'Huawei',
      period: 'Jun 2022 - Aug 2022 · 3 mos',
      description: 'Served as an ambassador for Huawei\'s HCIA (Huawei Certified ICT Associate) big data and AI certification program. Promoted certification opportunities and provided guidance to students and professionals interested in advancing their skills in big data and artificial intelligence technologies.',
      isVolunteering: true,
      logo: 'assets/images/training/huawei.png',
      linkedinUrl: 'https://www.linkedin.com/company/huawei/'
    }
  ];
  
  // Filtered lists
  trainingItems: TrainingItem[] = [];
  volunteeringItems: TrainingItem[] = [];
  backgroundElements: BackgroundElement[] = [];
  
  activeTab: 'all' | 'training' | 'volunteering' = 'all';

  // Training-related keywords for floating animation
  private trainingKeywords = [
    'Learning', 'Growth', 'Skills', 'Knowledge', 'Training', 'Development',
    'Education', 'Mentoring', 'Teaching', 'Coaching', 'Certification',
    'Workshop', 'Seminar', 'Course', 'Program', 'Achievement', 'Progress',
    'Excellence', 'Mastery', 'Expertise', 'Innovation', 'Leadership',
    'Collaboration', 'Networking', 'Community', 'Volunteering'
  ];

  private animationFrame: number | null = null;

  constructor(
    private contentService: ContentService,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    // Filter items by type
    this.trainingItems = this.trainings.filter(item => !item.isVolunteering);
    this.volunteeringItems = this.trainings.filter(item => item.isVolunteering);
    
    // Initial display is all items
    this.showAll();

    setTimeout(() => {
      this.generateBackgroundElements();
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }

  private generateBackgroundElements(): void {
    const container = this.elementRef.nativeElement;
    const width = container.offsetWidth;
    const height = container.offsetHeight;

    // Generate floating books
    for (let i = 0; i < 10; i++) {
      this.backgroundElements.push({
        id: `floating-book-${i}`,
        type: 'floating-book',
        x: Math.random() * (width - 40),
        y: Math.random() * (height - 50),
        delay: Math.random() * 10
      });
    }

    // Generate certificate badges
    for (let i = 0; i < 6; i++) {
      this.backgroundElements.push({
        id: `certificate-badge-${i}`,
        type: 'certificate-badge',
        x: Math.random() * (width - 50),
        y: Math.random() * (height - 50),
        delay: Math.random() * 8
      });
    }

    // Generate graduation caps
    for (let i = 0; i < 8; i++) {
      this.backgroundElements.push({
        id: `graduation-cap-${i}`,
        type: 'graduation-cap',
        x: Math.random() * (width - 35),
        y: Math.random() * (height - 35),
        delay: Math.random() * 12
      });
    }

    // Generate skill nodes
    for (let i = 0; i < 12; i++) {
      this.backgroundElements.push({
        id: `skill-node-${i}`,
        type: 'skill-node',
        x: Math.random() * (width - 25),
        y: Math.random() * (height - 25),
        delay: Math.random() * 5
      });
    }

    // Generate knowledge connections
    for (let i = 0; i < 8; i++) {
      const startX = Math.random() * width;
      const endX = Math.random() * width;
      const lineWidth = Math.abs(endX - startX);
      
      this.backgroundElements.push({
        id: `knowledge-connection-${i}`,
        type: 'knowledge-connection',
        x: Math.min(startX, endX),
        y: Math.random() * height,
        width: lineWidth,
        delay: Math.random() * 7
      });
    }

    // Generate learning paths
    for (let i = 0; i < 6; i++) {
      this.backgroundElements.push({
        id: `learning-path-${i}`,
        type: 'learning-path',
        x: Math.random() * (width - 3),
        y: Math.random() * (height - 80),
        delay: Math.random() * 6
      });
    }

    // Generate training keywords
    for (let i = 0; i < 8; i++) {
      this.backgroundElements.push({
        id: `training-keyword-${i}`,
        type: 'training-keyword',
        x: -100, // Start off-screen
        y: Math.random() * (height - 50),
        content: this.trainingKeywords[Math.floor(Math.random() * this.trainingKeywords.length)],
        delay: Math.random() * 15
      });
    }

    // Generate achievement stars
    for (let i = 0; i < 12; i++) {
      this.backgroundElements.push({
        id: `achievement-star-${i}`,
        type: 'achievement-star',
        x: Math.random() * (width - 20),
        y: Math.random() * (height - 20),
        content: '⭐',
        delay: Math.random() * 4
      });
    }
  }

  getElementStyle(element: BackgroundElement): any {
    const baseStyle: any = {
      left: `${element.x}px`,
      top: `${element.y}px`,
      animationDelay: `${element.delay || 0}s`
    };

    if (element.width) {
      baseStyle['width'] = `${element.width}px`;
    }
    if (element.height) {
      baseStyle['height'] = `${element.height}px`;
    }

    return baseStyle;
  }

  trackByElementId(index: number, element: BackgroundElement): string {
    return element.id;
  }

  showAll(): void {
    this.activeTab = 'all';
  }

  showTraining(): void {
    this.activeTab = 'training';
  }

  showVolunteering(): void {
    this.activeTab = 'volunteering';
  }

  getDisplayItems(): TrainingItem[] {
    switch(this.activeTab) {
      case 'training':
        return this.trainingItems;
      case 'volunteering':
        return this.volunteeringItems;
      default:
        return this.trainings;
    }
  }
}
