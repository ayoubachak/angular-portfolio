import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentService, Project } from '../../../services/content.service';
import { ScrollAnimationDirective } from '../../../directives/scroll-animation.directive';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faExternalLinkAlt, faCode } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-ai-projects',
  standalone: true,
  imports: [CommonModule, ScrollAnimationDirective, FontAwesomeModule],
  templateUrl: './ai-projects.component.html',
  styleUrl: './ai-projects.component.css'
})
export class AiProjectsComponent implements OnInit {
  aiProjects: Project[] = [];
  
  // Icons
  faExternalLinkAlt = faExternalLinkAlt;
  faCode = faCode;

  constructor(private contentService: ContentService) {}

  ngOnInit(): void {
    this.aiProjects = this.contentService.getAiProjects();
  }
}
