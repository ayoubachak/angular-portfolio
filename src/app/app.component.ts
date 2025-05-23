import { Component, ElementRef, ViewChild, HostListener, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { GenZEasterEggService } from './services/gen-z-easter-egg.service';

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
import { LightModeEasterEggComponent } from './components/easter-eggs/light-mode-easter-egg.component';
import { GenZPhoneComponent } from './components/easter-eggs/gen-z-phone.component';

@Component({
  selector: 'app-root',
  standalone: true,  imports: [
    CommonModule,
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
    WebviewPreviewComponent,
    LightModeEasterEggComponent,
    GenZPhoneComponent
  ],templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements AfterViewInit, OnInit, OnDestroy {
  title = 'portfolio';
  @ViewChild('customCursor', { static: true }) customCursor!: ElementRef<HTMLDivElement>;
  
  isGenZEmbedded = false;
  private genZSubscription!: Subscription;
  
  constructor(private readonly genZService: GenZEasterEggService) { }
  
  ngOnInit(): void {
    this.genZSubscription = this.genZService.state$.subscribe(state => {
      this.isGenZEmbedded = state.isEmbedded;
    });
  }
  
  ngOnDestroy(): void {
    if (this.genZSubscription) {
      this.genZSubscription.unsubscribe();
    }
  }

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
