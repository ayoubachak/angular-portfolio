import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirebaseService, BlogPost } from '../../../services/firebase.service';
import { ScrollAnimationDirective } from '../../../directives/scroll-animation.directive';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCalendarAlt, faUser, faTags, faArrowRight } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, ScrollAnimationDirective, FontAwesomeModule],
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.css'
})
export class BlogComponent implements OnInit {
  blogPosts: BlogPost[] = [];
  isLoading: boolean = true;
  error: string | null = null;
  
  // Icons
  faCalendarAlt = faCalendarAlt;
  faUser = faUser;
  faTags = faTags;
  faArrowRight = faArrowRight;

  constructor(private firebaseService: FirebaseService) {}

  ngOnInit(): void {
    this.loadBlogPosts();
  }
  
  loadBlogPosts(): void {
    this.isLoading = true;
    
    this.firebaseService.getBlogPosts(3).subscribe({
      next: (posts) => {
        this.blogPosts = posts;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading blog posts:', err);
        this.error = 'Failed to load blog posts. Please try again later.';
        this.isLoading = false;
      }
    });
  }
  
  // Format date for display
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
