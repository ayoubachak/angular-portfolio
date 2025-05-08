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
      title: 'Machine Learning Certification',
      organization: 'Stanford University',
      period: '2022 - 2023',
      description: 'Completed a comprehensive certification program in machine learning, covering supervised and unsupervised learning algorithms, deep learning, and neural networks.',
      isVolunteering: false,
      logo: 'assets/images/stanford-logo.png'
    },
    {
      title: 'STEM Education Volunteer',
      organization: 'Local High School',
      period: '2021 - Present',
      description: 'Volunteer teaching computer science and programming to high school students, helping to inspire the next generation of technologists.',
      isVolunteering: true,
      logo: 'assets/images/volunteer-logo.png'
    },
    {
      title: 'Web Development Workshop Instructor',
      organization: 'Tech Bootcamp',
      period: '2020 - 2021',
      description: 'Conducted workshops on modern web development techniques using React and Angular for beginners transitioning into tech careers.',
      isVolunteering: false,
      logo: 'assets/images/workshop-logo.png'
    },
    {
      title: 'Community Code Mentor',
      organization: 'Code For Good',
      period: '2019 - Present',
      description: 'Provide mentoring and technical guidance to non-profit organizations for their technology needs and digital transformation.',
      isVolunteering: true,
      logo: 'assets/images/mentor-logo.png'
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
