import { Component, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-training',
  standalone: true,
  imports: [CommonModule, ScrollAnimationDirective],
  templateUrl: './training.component.html',
  styleUrl: './training.component.css'
})
export class TrainingComponent implements OnInit {
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
  
  activeTab: 'all' | 'training' | 'volunteering' = 'all';

  constructor(private contentService: ContentService) {}

  ngOnInit(): void {
    // Filter items by type
    this.trainingItems = this.trainings.filter(item => !item.isVolunteering);
    this.volunteeringItems = this.trainings.filter(item => item.isVolunteering);
    
    // Initial display is all items
    this.showAll();
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
