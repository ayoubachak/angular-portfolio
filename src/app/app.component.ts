import { Component, ElementRef, ViewChild, HostListener, AfterViewInit } from '@angular/core';

// Import all components
import { NavbarComponent } from './components/navbar/navbar.component';
import { IntroComponent } from './components/sections/intro/intro.component';
import { AboutComponent } from './components/sections/about/about.component';
import { EducationComponent } from './components/sections/education/education.component';
import { ExperienceComponent } from './components/sections/experience/experience.component';
import { GithubComponent } from './components/sections/github/github.component';
import { AiProjectsComponent } from './components/sections/ai-projects/ai-projects.component';
import { BrandsComponent } from './components/sections/brands/brands.component';
import { TrainingComponent } from './components/sections/training/training.component';
import { TestimonialsComponent } from './components/sections/testimonials/testimonials.component';
import { BlogComponent } from './components/sections/blog/blog.component';
import { ContactComponent } from './components/sections/contact/contact.component';
import { FooterComponent } from './components/footer/footer.component';
import { ResumeCompilerComponent } from './components/resume-compiler/resume-compiler.component';
import { WebviewPreviewComponent } from './components/webview-preview/webview-preview.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    NavbarComponent,
    IntroComponent,
    AboutComponent,
    EducationComponent,
    ExperienceComponent,
    GithubComponent,
    AiProjectsComponent,
    BrandsComponent,
    TrainingComponent,
    TestimonialsComponent,
    BlogComponent,
    ContactComponent,
    FooterComponent,
    ResumeCompilerComponent,
    WebviewPreviewComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  title = 'portfolio';
  @ViewChild('customCursor', { static: true }) customCursor!: ElementRef<HTMLDivElement>;

  ngAfterViewInit(): void {
    // Ensure custom cursor is visible
    this.customCursor.nativeElement.style.display = 'block';
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    const cursorEl = this.customCursor.nativeElement;
    cursorEl.style.left = `${event.clientX}px`;
    cursorEl.style.top = `${event.clientY}px`;
  }
}
