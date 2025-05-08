import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentService, Education } from '../../../services/content.service';
import { ScrollAnimationDirective } from '../../../directives/scroll-animation.directive';

@Component({
  selector: 'app-education',
  standalone: true,
  imports: [CommonModule, ScrollAnimationDirective],
  templateUrl: './education.component.html',
  styleUrl: './education.component.css'
})
export class EducationComponent implements OnInit {
  education: Education[] = [];

  constructor(private contentService: ContentService) {}

  ngOnInit(): void {
    const portfolioContent = this.contentService.getPortfolioContent();
    this.education = portfolioContent.education;
  }
}
