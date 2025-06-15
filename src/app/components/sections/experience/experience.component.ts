import { Component, OnInit, AfterViewInit, HostListener, ElementRef, ViewChildren, QueryList, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentService, Experience } from '../../../services/content.service';
import { ScrollAnimationDirective } from '../../../directives/scroll-animation.directive';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBriefcase, faCalendar, faChevronDown, faChevronUp, faCode, faToggleOn, faToggleOff, faHandPointer, faScroll, faLaptopCode, faNetworkWired, faDiagramProject, faTimes } from '@fortawesome/free-solid-svg-icons';

interface ExperienceWithState extends Experience {
  isExpanded: boolean;
  isFirst: boolean;
  isLast: boolean;
  hasParallel: boolean;
  parallelWith?: number[];
  inView: boolean;
  previewMode: boolean;
  scrollProgress: number;
}

interface TechAnimation {
  tech: string;
  snippet: string;
  color: string;
  backgroundPattern?: string;
  position?: 'left' | 'right' | 'top' | 'bottom';
}

// Add diagram visualization interfaces for part-time jobs
interface DiagramNode {
  id: string;
  label: string;
  type: 'main' | 'part-time' | 'skill';
  color?: string;
  size?: number;
  x?: number;
  y?: number;
}

interface DiagramConnection {
  source: string;
  target: string;
  strength?: number;
  color?: string;
}

@Component({
  selector: 'app-experience',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, ScrollAnimationDirective],
  templateUrl: './experience.component.html',
  styleUrl: './experience.component.css'
})
export class ExperienceComponent implements OnInit, AfterViewInit {
  experiences: ExperienceWithState[] = [];
  showPartTime: boolean = true; // Default to always showing part-time jobs
  activeExperienceIndex: number = -1;
  scrollDrivenMode: boolean = true; // Default to scroll-driven animations
  // Auto-mode detection variables
  private _userInteracted: boolean = false;
  private _lastInteractionTime: number = Date.now();
  private autoModeInterval: any = null;
  private inactivityTimeout: number = 10000; // 10 seconds of inactivity before auto mode
  private isMobileDevice: boolean = false;
  private isTabletDevice: boolean = false;
  private _autoCarouselActive: boolean = false; // Private backing field
  
  // Public getter for template access
  get autoCarouselActive(): boolean {
    return this._autoCarouselActive;
  }
  
  // Public setter for template access
  set autoCarouselActive(value: boolean) {
    this._autoCarouselActive = value;
  }
  
  // Getter for lastInteractionTime
  get lastInteractionTime(): number {
    return this._lastInteractionTime;
  }
  
  // Diagram visualization data
  diagramNodes: DiagramNode[] = [];
  diagramConnections: DiagramConnection[] = [];
  
  @ViewChildren('experienceCard') experienceCards!: QueryList<ElementRef>;

  // Tech animations
  techAnimations: Record<string, TechAnimation> = {
    'Flask': {
      tech: 'Flask',
      snippet: `from flask import Flask, jsonify
app = Flask(__name__)

@app.route('/api/data', methods=['GET'])
def get_data():
    return jsonify({
        "status": "success", 
        "data": {"message": "Hello from Flask!"}
    })

if __name__ == '__main__':
    app.run(debug=True)`,
      color: '#0d7963',
      backgroundPattern: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%230d7963\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
      position: 'left'
    },
    'React': {
      tech: 'React',
      snippet: `import React, { useState, useEffect } from 'react';

function App() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(data => setData(data));
  }, []);

  return (
    <div className="app">
      {data ? <p>{data.message}</p> : <p>Loading...</p>}
    </div>
  );
}`,
      color: '#61dafb',
      backgroundPattern: 'url("data:image/svg+xml,%3Csvg width=\'180\' height=\'180\' viewBox=\'0 0 180 180\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M81.28 88H68.413l19.298 19.298L81.28 88zm2.107 0h13.226L90 107.838 83.387 88zm15.334 0h12.866l-19.298 19.298L98.72 88zm-32.927-2.207L73.586 78h32.827l.5.5 7.294 7.293L115.414 87l-24.707 24.707-.707.707L64.586 87l1.207-1.207zm2.62.207L74 80.414 79.586 86H68.414zm16 0L90 80.414 95.586 86H84.414zm16 0L106 80.414 111.586 86h-11.172zm-8-6h11.173L98 85.586 92.414 80zM82 85.586L87.586 80H76.414L82 85.586zM17.414 0L.707 16.707 0 17.414V0h17.414zM4.28 0L0 12.838V0h4.28zm10.306 0L2.288 12.298 6.388 0h8.198zM180 17.414L162.586 0H180v17.414zM165.414 0l12.298 12.298L173.612 0h-8.198zM180 12.838L175.72 0H180v12.838zM0 163h16.413l.5.5 7.294 7.293L25.414 172l-8 8H0v-17zm0 10h6.613l-2.334 7H0v-7zm14.586 7l7-7H8.72l-2.333 7h8.2zM0 165.414L5.586 171H0v-5.586zM10.414 171L16 165.414 21.586 171H10.414zm-8-6h11.172L8 170.586 2.414 165zM180 163h-16.413l-7.794 7.793-1.207 1.207 8 8H180v-17zm-14.586 17l-7-7h12.865l2.333 7h-8.2zM180 173h-6.613l2.334 7H180v-7zm-21.586-2l5.586-5.586 5.586 5.586h-11.172zM180 165.414L174.414 171H180v-5.586zm-8 5.172l5.586-5.586h-11.172l5.586 5.586zM152.933 25.653l1.414 1.414-33.94 33.942-1.416-1.416 33.943-33.94zm1.414 127.28l-1.414 1.414-33.942-33.94 1.416-1.416 33.94 33.943zm-127.28 1.414l-1.414-1.414 33.94-33.942 1.416 1.416-33.943 33.94zm-1.414-127.28l1.414-1.414 33.942 33.94-1.416 1.416-33.94-33.943zM0 85c2.21 0 4 1.79 4 4s-1.79 4-4 4v-8zm180 0c-2.21 0-4 1.79-4 4s1.79 4 4 4v-8zM94 0c0 2.21-1.79 4-4 4s-4-1.79-4-4h8zm0 180c0-2.21-1.79-4-4-4s-4 1.79-4 4h8z\' fill=\'%2361dafb\' fill-opacity=\'0.1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
      position: 'right'
    },
    'FastAPI': {
      tech: 'FastAPI',
      snippet: `from fastapi import FastAPI, Depends
from pydantic import BaseModel

app = FastAPI()

class Item(BaseModel):
    name: str
    description: str

@app.post("/items/")
async def create_item(item: Item):
    return {"name": item.name, "description": item.description}`,
      color: '#009485',
      backgroundPattern: 'url("data:image/svg+xml,%3Csvg width=\'84\' height=\'48\' viewBox=\'0 0 84 48\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h12v6H0V0zm28 8h12v6H28V8zm14-8h12v6H42V0zm14 0h12v6H56V0zm0 8h12v6H56V8zM42 8h12v6H42V8zm0 16h12v6H42v-6zm14-8h12v6H56v-6zm14 0h12v6H70v-6zm0-16h12v6H70V0zM28 32h12v6H28v-6zM14 16h12v6H14v-6zM0 24h12v6H0v-6zm0 8h12v6H0v-6zm14 0h12v6H14v-6zm14 8h12v6H28v-6zm-14 0h12v6H14v-6zm28 0h12v6H42v-6zm14-8h12v6H56v-6zm0-8h12v6H56v-6zm14 8h12v6H70v-6zm0 8h12v6H70v-6zM14 24h12v6H14v-6zm14-8h12v6H28v-6zM14 8h12v6H14V8zM0 8h12v6H0V8z\' fill=\'%23009485\' fill-opacity=\'0.1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
      position: 'left'
    },
    'Docker': {
      tech: 'Docker',
      snippet: `FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["python", "app.py"]`,
      color: '#2496ed',
      backgroundPattern: 'url("data:image/svg+xml,%3Csvg width=\'48\' height=\'64\' viewBox=\'0 0 48 64\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M48 28v-4H0v4h48zM24 12v-4H0v4h24zM0 36v4h48v-4H0zm24 16v4h24v-4H24z\' fill=\'%232496ed\' fill-opacity=\'0.1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
      position: 'right'
    },
    'TypeScript': {
      tech: 'TypeScript',
      snippet: `interface User {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
}

class UserService {
  private users: User[] = [];

  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }

  async addUser(user: Omit<User, "id">): Promise<User> {
    const newUser = { ...user, id: Date.now() };
    this.users.push(newUser);
    return newUser;
  }
}`,
      color: '#3178c6',
      backgroundPattern: 'url("data:image/svg+xml,%3Csvg width=\'52\' height=\'26\' viewBox=\'0 0 52 26\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%233178c6\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M10 10c0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6h2c0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4v2c-3.314 0-6-2.686-6-6 0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6zm25.464-1.95l8.486 8.486-1.414 1.414-8.486-8.486 1.414-1.414z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
      position: 'left'
    },
    'Python': {
      tech: 'Python',
      snippet: `import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier

# Load and prepare data
df = pd.read_csv("data.csv")
X = df.drop("target", axis=1)
y = df["target"]

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# Train model
model = RandomForestClassifier(n_estimators=100)
model.fit(X_train, y_train)

# Evaluate
accuracy = model.score(X_test, y_test);
print(f"Accuracy: {accuracy:.2f}")`,
      color: '#3776ab',
      backgroundPattern: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%233776ab\' fill-opacity=\'0.1\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E")',
      position: 'right'
    }
  };
  
  // Icons
  faBriefcase = faBriefcase;
  faCalendar = faCalendar;
  faChevronDown = faChevronDown;
  faChevronUp = faChevronUp;
  faCode = faCode;
  faToggleOn = faToggleOn;
  faToggleOff = faToggleOff;
  faHand = faHandPointer;
  faScroll = faScroll;
  faLaptopCode = faLaptopCode;
  faNetworkWired = faNetworkWired;
  faDiagramProject = faDiagramProject;
  faTimes = faTimes; // close icon for modals

  // Certificate modal state
  showCertificateModal: boolean = false;
  modalCertificatePath: string = '';

  // Open certificate modal
  openCertificate(path: string): void {
    this.modalCertificatePath = path;
    this.showCertificateModal = true;
  }

  // Close certificate modal
  closeCertificateModal(): void {
    this.showCertificateModal = false;
    this.modalCertificatePath = '';
  }

  constructor(
    private contentService: ContentService,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    const portfolioContent = this.contentService.getPortfolioContent();
    // Initialize experiences by processing raw data from content service
    this.experiences = this.processExperiences(portfolioContent.experience);
    // Add part-time experiences
    this.addPartTimeExperiences();
  }

  ngAfterViewInit(): void {
    // Set up scroll observer for each experience card
    setTimeout(() => {
      this.setupScrollObservers();
      this.detectBestExperienceMode();
      this.setupAutoModeDetection();
      this.createPartTimeDiagramData();
    }, 500);
  }

  // Setup intersection observers to track scroll position for each experience card
  setupScrollObservers(): void {
    if (typeof IntersectionObserver !== 'undefined') {
      // Simplified card view observer with fewer thresholds
      const cardObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            const index = parseInt(entry.target.getAttribute('data-index') || '-1');
            if (index >= 0) {
              this.experiences[index].inView = entry.isIntersecting;
              if (entry.isIntersecting) {
                this.activeExperienceIndex = index;
              }
            }
          });
        },
        { threshold: [0.3, 0.7] } // Reduced from 3 to 2 thresholds
      );
      
      // Simplified preview mode observer - only when scroll mode is enabled
      const previewObserver = new IntersectionObserver(
        (entries) => {
          if (!this.scrollDrivenMode) return; // Early exit if not in scroll mode
          
          entries.forEach(entry => {
            const index = parseInt(entry.target.getAttribute('data-preview-index') || '-1');
            if (index >= 0) {
              const bounds = entry.boundingClientRect;
              const windowHeight = window.innerHeight;
              const viewportCenter = windowHeight / 2;
              const elementCenter = bounds.top + (bounds.height / 2);
              
              // Simplified centeredness calculation
              const normalizedPosition = Math.abs(elementCenter - viewportCenter) / (windowHeight / 2);
              const centeredness = Math.max(0, 1 - normalizedPosition);
              
              // Direct update without smoothing to reduce calculations
              this.experiences[index].scrollProgress = centeredness;
              
              // Simple threshold check without hysteresis
              this.experiences[index].previewMode = centeredness > 0.6;
            }
          });
        },
        { 
          threshold: [0.4, 0.6, 0.8], // Reduced from 21 to 3 thresholds
          rootMargin: "-10% 0px -10% 0px"
        }
      );

      // Observe all experience cards
      this.experienceCards.forEach((card, index) => {
        const element = card.nativeElement;
        element.setAttribute('data-index', index.toString());
        element.setAttribute('data-preview-index', index.toString());
        cardObserver.observe(element);
        previewObserver.observe(element);
      });
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    // Only handle scroll events if scroll-driven mode is enabled
    if (!this.scrollDrivenMode) return;
    
    // Additional scroll handling if needed
  }
  // Toggle between scroll-driven mode and regular mode
  toggleScrollMode(): void {
    this.scrollDrivenMode = !this.scrollDrivenMode;
    this.resetExperienceStates();
  }
  
  // Explicitly set the scroll mode
  setScrollMode(isScrollMode: boolean): void {
    if (this.scrollDrivenMode !== isScrollMode) {
      this.scrollDrivenMode = isScrollMode;
      this.resetExperienceStates();
    }
  }
  
  // Reset all experience states when changing modes
  private resetExperienceStates(): void {
    this.experiences.forEach(exp => {
      exp.previewMode = false;
      exp.scrollProgress = 0;
    });
  }

  // Get animation for a specific technology
  getTechAnimation(tech: string): TechAnimation | undefined {
    return this.techAnimations[tech];
  }

  // Check if an experience uses a specific technology that we have animations for
  hasTechAnimation(experience: ExperienceWithState): boolean {
    if (!experience.skills) return false;
    return experience.skills.some(skill => this.techAnimations[skill]);
  }

  // Get all tech animations that apply to an experience
  getExperienceTechAnimations(experience: ExperienceWithState): TechAnimation[] {
    if (!experience.skills) return [];
    return experience.skills
      .filter(skill => this.techAnimations[skill])
      .map(skill => this.techAnimations[skill]);
  }  // Create class for tech animation based on position and preview mode
  getTechAnimationClass(animation: TechAnimation, experience: ExperienceWithState, index: number): string {
    // Find the index of this experience in the array
    const expIndex = this.experiences.findIndex(exp => exp === experience);
    const isEvenExperience = expIndex % 2 === 0; // True if card is on the right side of the timeline (or notionally right for preview)
    
    let position;
    
    if (experience.previewMode) {
      // In preview mode, create an alternating pattern based on experience index and animation index
      if (this.scrollDrivenMode) {
        // For scroll-driven mode, position doesn't matter as much (fullscreen background)
        // Keep original logic or simplify as position class here is less critical due to CSS full background
        position = isEvenExperience ? 'left' : 'right';
      } else {
        // For manual preview mode (card is centered)
        // Snippets on opposite sides of the centered card, then top/bottom.
        const firstSnippetSide = isEvenExperience ? 'left' : 'right'; // If card notionally on right, first snippet on left.

        if (index === 0) {
          position = firstSnippetSide;
        } else if (index === 1) {
          // Second snippet on the other side relative to the first
          position = (firstSnippetSide === 'left') ? 'right' : 'left';
        } else if (index % 2 === 0) { // For 3rd (index 2), 5th...
          position = 'top';
        } else { // For 4th (index 3), 6th...
          position = 'bottom';
        }
      }
    } else {
      // In regular mode (NOT experience.previewMode)
      // Snippets should be on the opposite side of the card's timeline position.
      // If card is on the right (isEvenExperience), snippets start on the 'left' and alternate.
      // If card is on the left (!isEvenExperience), snippets start on the 'right' and alternate.
      const firstSnippetSide = isEvenExperience ? 'left' : 'right';

      if (index % 2 === 0) { // 0th, 2nd, 4th... snippet
        position = firstSnippetSide;
      } else { // 1st, 3rd, 5th... snippet
        // Alternate from the first snippet's side
        position = (firstSnippetSide === 'left' ? 'right' : 'left');
      }
    }
    
    return `tech-animation tech-${this.slugify(animation.tech)} tech-${position}${
      experience.previewMode ? ' preview-mode' : ''
    }`;
  }

  // Set active experience for enhanced animations
  setActiveExperience(index: number): void {
    if (!this.scrollDrivenMode) {
      this.activeExperienceIndex = index;
    }
  }  // Calculate style for preview mode scaling based on scroll progress
  getPreviewModeStyle(experience: ExperienceWithState): any {
    if (!this.scrollDrivenMode) return {};
    
    // Simplified scaling with better performance
    let scale = 1;
    let opacity = experience.inView ? 1 : 0;
    let translateY = '0';
    let boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
    
    // If in preview mode, enhance the scale
    if (experience.previewMode) {
      scale = 1 + (experience.scrollProgress * 0.08); // Reduced scale effect
      
      // Enhanced shadow
      const shadowIntensity = Math.min(0.2, 0.1 + (experience.scrollProgress * 0.1));
      boxShadow = `0 ${8 + (experience.scrollProgress * 8)}px ${15 + (experience.scrollProgress * 10)}px rgba(0, 0, 0, ${shadowIntensity})`;
      
      // Slight floating effect
      translateY = `${-3 * experience.scrollProgress}px`;
    }
    
    return {
      transform: `scale(${scale}) translateY(${translateY})`,
      opacity: opacity,
      boxShadow: boxShadow,
      transitionDuration: experience.previewMode ? '0.6s' : '0.4s',
      transitionProperty: 'transform, opacity, box-shadow',
      transitionTimingFunction: 'ease-out'
    };
  }
  
  // Calculate background animation style - simplified
  getBackgroundStyle(experience: ExperienceWithState, animation: TechAnimation): any {
    // Removed complex background patterns for performance
    return {
      backgroundColor: `${animation.color}08`, // Very light version of the tech color
      transition: 'background-color 0.3s ease'
    };
  }

  // Format code for background display
  formatCodeForBackground(code: string): string {
    // Escape HTML entities
    const escaped = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
    
    // Repeat code to fill the background if needed
    // We'll wrap each block in a div for easier styling
    let repeatedCode = '';
    for (let i = 0; i < 3; i++) {
      repeatedCode += `<div class="code-block">${escaped}</div>`;
    }
    
    return repeatedCode;
  }

  // Utility to slugify tech names for CSS classes
  slugify(text: string): string {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }
  togglePartTime(): void {
    this.showPartTime = !this.showPartTime;
    
    // Find all part-time experiences and set their visibility
    this.experiences.forEach(exp => {
      if (exp.company === 'Alignerr' || exp.company === 'Micro1') {
        // Apply animation delay for smoother transitions
        setTimeout(() => {
          // Add or remove visible class through the Angular binding in template
        }, this.showPartTime ? 100 : 0);
      }
    });
  }

  // Helper method to convert month names to numbers (0-based)
  private getMonthNumber(monthName: string): number {
    const months: Record<string, number> = {
      'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
      'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    };
    return months[monthName] || 0; // Default to January if not found
  }

  private processExperiences(experiences: Experience[]): ExperienceWithState[] {
    const result: ExperienceWithState[] = [];
    
    if (experiences.length === 0) {
      console.log("No experiences found to process");
      return result;
    }
    
    // First pass: Add basic state to each experience
    experiences.forEach((exp, index) => {
      result.push({
        ...exp,
        isExpanded: false,
        isFirst: index === 0,
        isLast: index === experiences.length - 1,
        hasParallel: false,
        parallelWith: [],
        inView: false,
        previewMode: false,
        scrollProgress: 0
      });
    });
    
    // Second pass: Determine overlapping experiences
    for (let i = 0; i < result.length; i++) {
      const current = result[i];
      // Safe date parsing
      const currentStartParts = current.startDate.split(' ');
      const currentEndParts = current.endDate === 'Present' ? ['Present'] : current.endDate.split(' ');
      
      let currentStart: Date, currentEnd: Date;
      try {
        // Handle month name formats like "Oct 2024"
        if (currentStartParts.length > 1) {
          const monthA = currentStartParts[0];
          const yearA = parseInt(currentStartParts[1], 10);
          currentStart = new Date(yearA, this.getMonthNumber(monthA), 1);
        } else {
          currentStart = new Date(current.startDate);
        }
        
        currentEnd = current.endDate === 'Present' ? new Date() : 
                     (currentEndParts.length > 1 ? 
                      new Date(parseInt(currentEndParts[1], 10), this.getMonthNumber(currentEndParts[0]), 1) : 
                      new Date(current.endDate));
      } catch (e) {
        console.error("Error parsing dates for", current.company, e);
        currentStart = new Date(0); // Fallback to epoch time
        currentEnd = new Date();
      }
      
      for (let j = 0; j < result.length; j++) {
        if (i === j) continue;
        
        const other = result[j];
        // Safe date parsing for other experience
        const otherStartParts = other.startDate.split(' ');
        const otherEndParts = other.endDate === 'Present' ? ['Present'] : other.endDate.split(' ');
        
        let otherStart: Date, otherEnd: Date;
        try {
          // Handle month name formats like "Oct 2024"
          if (otherStartParts.length > 1) {
            const monthB = otherStartParts[0];
            const yearB = parseInt(otherStartParts[1], 10);
            otherStart = new Date(yearB, this.getMonthNumber(monthB), 1);
          } else {
            otherStart = new Date(other.startDate);
          }
          
          otherEnd = other.endDate === 'Present' ? new Date() : 
                     (otherEndParts.length > 1 ? 
                      new Date(parseInt(otherEndParts[1], 10), this.getMonthNumber(otherEndParts[0]), 1) : 
                      new Date(other.endDate));
        } catch (e) {
          console.error("Error parsing dates for", other.company, e);
          otherStart = new Date(0);
          otherEnd = new Date();
        }
        
        // Check if dates overlap
        if (
          (currentStart <= otherEnd && currentEnd >= otherStart) ||
          (otherStart <= currentEnd && otherEnd >= currentStart)
        ) {
          current.hasParallel = true;
          current.parallelWith = current.parallelWith || [];
          current.parallelWith.push(j);
        }
      }
    }
    
    return result;
  }

  private addPartTimeExperiences(): void {
    // Add the part-time experiences with updated data
    const alignerr: ExperienceWithState = {
      company: 'Alignerr',
      role: 'AI Trainer',
      startDate: 'Oct 2024',
      endDate: 'Present',
      bulletPoints: [
        'Contract Part-time, Remote position based in France. Specialized in training and aligning large language models (LLMs) for code generation tasks, improving model performance and accuracy in programming contexts',
        'Working with multilingual data to enhance language capabilities across Arabic, English, and French, focusing on alignment techniques to ensure high-quality code generation and cross-lingual understanding'
      ],
      logo: 'assets/images/companies/alignerr-logo.jpg',
      skills: ['LLM Training', 'Model Alignment', 'Code Generation', 'NLP', 'Multilingual Models'],
      isExpanded: false,
      isFirst: false,
      isLast: false,
      hasParallel: true,
      parallelWith: [this.experiences.length + 1],
      inView: false,
      previewMode: false,
      scrollProgress: 0
    };
      const micro1: ExperienceWithState = {
      company: 'Micro1',
      role: 'AI Researcher',
      startDate: 'Aug 2024',
      endDate: 'Present',
      bulletPoints: [
        'Part-time research position as a Python Certified Expert (as certified by Micro1) focused on fine-tuning and aligning language models to generate correct and advanced Python code',
        'Working on LLM alignment tasks to ensure high-quality code generation across various domains',
        'Developing optimization techniques for small language models in specific industry verticals, enabling efficient, specialized LLMs to run on edge devices while maintaining high accuracy for Python code generation tasks'
      ],
      logo: 'assets/images/companies/micro1-logo.jpg',
      certificate: 'assets/images/certifications/micro1.jpg',
      skills: ['NLP', 'LLMs', 'PyTorch', 'Model Optimization', 'Research'],
      isExpanded: false,
      isFirst: false,
      isLast: false,
      hasParallel: true,
      parallelWith: [this.experiences.length],
      inView: false,
      previewMode: false,
      scrollProgress: 0
    };
    
    // Only add these if they don't already exist
    if (!this.experiences.find(exp => exp.company === alignerr.company)) {
      this.experiences.push(alignerr);
    }
    
    if (!this.experiences.find(exp => exp.company === micro1.company)) {
      this.experiences.push(micro1);
    }
    
    // Update parallelWith arrays for existing experiences that overlap with the new ones
    for (let i = 0; i < this.experiences.length - 2; i++) {
      const exp = this.experiences[i];
      
      const expStartParts = exp.startDate.split(' ');
      const expEndParts = exp.endDate === 'Present' ? ['Present'] : exp.endDate.split(' ');
      
      let expStart: Date, expEnd: Date;
      try {
        if (expStartParts.length > 1) {
          const monthA = expStartParts[0];
          const yearA = parseInt(expStartParts[1], 10);
          expStart = new Date(yearA, this.getMonthNumber(monthA), 1);
        } else {
          expStart = new Date(exp.startDate);
        }
        
        expEnd = exp.endDate === 'Present' ? new Date() : 
                (expEndParts.length > 1 ? 
                 new Date(parseInt(expEndParts[1], 10), this.getMonthNumber(expEndParts[0]), 1) : 
                 new Date(exp.endDate));
      } catch (e) {
        console.error("Error parsing dates for", exp.company, e);
        expStart = new Date(0);
        expEnd = new Date();
      }
      
      // Parse dates for new experiences
      const alignerrStart = new Date(2024, this.getMonthNumber('Oct'), 1);
      const micro1Start = new Date(2024, this.getMonthNumber('Aug'), 1);
      const now = new Date();
      
      if (expStart <= now && expEnd >= alignerrStart) {
        exp.hasParallel = true;
        exp.parallelWith = exp.parallelWith || [];
        exp.parallelWith.push(this.experiences.length - 2);
      }
      
      if (expStart <= now && expEnd >= micro1Start) {
        exp.hasParallel = true;
        exp.parallelWith = exp.parallelWith || [];
        exp.parallelWith.push(this.experiences.length - 1);
      }
    }
  }

  // Toggle experience expansion (manual mode)
  toggleExpand(index: number): void {
    if (!this.scrollDrivenMode) {
      this.experiences[index].isExpanded = !this.experiences[index].isExpanded;
      // Add active experience animation when expanded
      if (this.experiences[index].isExpanded) {
        this.setActiveExperience(index);
      } else if (this.activeExperienceIndex === index) {
        this.activeExperienceIndex = -1;
      }
    }
  }

  // Manually toggle preview mode (for non-scroll mode)
  togglePreview(index: number): void {
    if (!this.scrollDrivenMode) {
      this.experiences[index].previewMode = !this.experiences[index].previewMode;
      this.experiences[index].scrollProgress = this.experiences[index].previewMode ? 0.5 : 0;
    }
  }

  onImageError(experience: ExperienceWithState): void {
    console.log(`Failed to load image for ${experience.company}`);
    experience.logo = undefined;
  }

  // New methods for automatic mode detection and part-time job diagram visualization

  // Detect the best experience mode based on device capabilities
  private detectBestExperienceMode(): void {
    // Detect if mobile
    this.isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Detect if tablet (larger touch device)
    this.isTabletDevice = /iPad|Android/.test(navigator.userAgent) && !/Mobile/.test(navigator.userAgent);
    
    // Check if touch-enabled
    const touchEnabled = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
      // Always use scroll mode on mobile/tablet (better performance and touch UX)
    if (this.isMobileDevice || this.isTabletDevice) {
      this.scrollDrivenMode = true;
    } else {
      // Always use click mode on desktop devices for better control
      this.scrollDrivenMode = false;
    }
    
    // Always show part-time experiences
    this.showPartTime = true;
  }
    // Set up auto mode detection and switching based on user interaction
  private setupAutoModeDetection(): void {
    // Disabled auto-carousel for performance
    // this.autoModeInterval = setInterval(() => this.checkForInactivity(), 2000);
  }
  
  // Monitor user interactions to determine when to enable auto mode
  @HostListener('window:mousemove')
  @HostListener('window:click')
  @HostListener('window:keydown')
  @HostListener('window:scroll')
  @HostListener('touchstart')
  @HostListener('touchmove')
  onUserInteraction(): void {
    // Simplified interaction tracking
    this._userInteracted = true;
    this._lastInteractionTime = Date.now();
  }
  
  // Check for user inactivity to start auto mode
  private checkForInactivity(): void {
    // Disabled for performance
  }
  
  // Start auto carousel mode for experiences
  private startAutoCarousel(): void {
    // Disabled for performance
  }
  
  // Stop auto carousel mode
  private stopAutoCarousel(): void {
    // Disabled for performance
  }

  // Create network diagram data for part-time job visualization
  private createPartTimeDiagramData(): void {
    this.diagramNodes = [];
    this.diagramConnections = [];
    
    // Add main nodes for part-time experiences
    const partTimeExperiences = this.experiences.filter(exp => 
      exp.company === 'Alignerr' || exp.company === 'Micro1'
    );
    
    partTimeExperiences.forEach((exp, index) => {
      // Add company node
      this.diagramNodes.push({
        id: `company-${exp.company}`,
        label: exp.company,
        type: 'part-time',
        color: index === 0 ? '#f59e0b' : '#10b981', // Different colors for each company
        size: 60
      });
      
      // Add skills as nodes
      if (exp.skills) {
        exp.skills.forEach(skill => {
          // Check if this skill node already exists
          if (!this.diagramNodes.find(node => node.id === `skill-${skill}`)) {
            this.diagramNodes.push({
              id: `skill-${skill}`,
              label: skill,
              type: 'skill',
              color: '#6366f1',
              size: 40
            });
          }
          
          // Connect company to skill
          this.diagramConnections.push({
            source: `company-${exp.company}`,
            target: `skill-${skill}`,
            strength: 2,
            color: index === 0 ? '#f59e0b80' : '#10b98180'
          });
        });
      }
    });
    
    // Connect common skills between companies
    const alignerrSkills = new Set(
      this.experiences.find(exp => exp.company === 'Alignerr')?.skills || []
    );
    
    const micro1Skills = new Set(
      this.experiences.find(exp => exp.company === 'Micro1')?.skills || []
    );
    
    // Find common skills
    const commonSkills = [...alignerrSkills].filter(skill => micro1Skills.has(skill));
    
    // Connect the two companies through common skills
    commonSkills.forEach(skill => {
      this.diagramConnections.push({
        source: `company-Alignerr`,
        target: `company-Micro1`,
        strength: 1,
        color: '#6366f180'
      });
    });
  }

  // Calculate positions for diagram visualization
  calculateDiagramPositions(): void {
    // Simple force-directed layout algorithm
    // Position nodes in a circular layout initially
    const centerX = 200;
    const centerY = 150;
    const radius = 100;
    
    this.diagramNodes.forEach((node, i) => {
      const angle = (2 * Math.PI * i) / this.diagramNodes.length;
      
      if (node.type === 'part-time') {
        // Place part-time jobs in the center
        node.x = centerX + Math.cos(angle) * (radius / 2);
        node.y = centerY + Math.sin(angle) * (radius / 2);
      } else {
        // Place skills around in a circle
        node.x = centerX + Math.cos(angle) * radius;
        node.y = centerY + Math.sin(angle) * radius;
      }
    });
  }

  // Format experience description to handle bullet points and line breaks
  formatDescription(experience: ExperienceWithState): string {
    // Use bulletPoints if available, otherwise fall back to description
    if (experience.bulletPoints && experience.bulletPoints.length > 0) {
      const formattedPoints = experience.bulletPoints.map(point => {
        const trimmed = point.trim();
        return `<div class="bullet-point"><span class="bullet-symbol">•</span> ${trimmed}</div>`;
      }).join('');
      
      return `<div class="bullet-list">${formattedPoints}</div>`;
    }
    
    // Fallback to old description format
    if (experience.description) {
      // Split by double line breaks to get bullet points
      const bulletPoints = experience.description.split('\n\n').filter(point => point.trim());
      
      // If we have multiple bullet points, format them as a list
      if (bulletPoints.length > 1) {
        const formattedPoints = bulletPoints.map(point => {
          const trimmed = point.trim();
          // Remove existing bullet symbol if present and add consistent formatting
          const cleanPoint = trimmed.startsWith('•') ? trimmed.substring(1).trim() : trimmed;
          return `<div class="bullet-point"><span class="bullet-symbol">•</span> ${cleanPoint}</div>`;
        }).join('');
        
        return `<div class="bullet-list">${formattedPoints}</div>`;
      }
      
      // Single paragraph - just replace line breaks with <br>
      return experience.description.replace(/\n/g, '<br>');
    }
    
    return '';
  }

  // Format truncated description for collapsed view
  formatTruncatedDescription(experience: ExperienceWithState): string {
    // Use bulletPoints if available
    if (experience.bulletPoints && experience.bulletPoints.length > 0) {
      // Show first bullet point
      const firstPoint = experience.bulletPoints[0].trim();
      return `<div class="bullet-point"><span class="bullet-symbol">•</span> ${firstPoint}</div>`;
    }
    
    // Fallback to old description format
    if (experience.description) {
      // For truncated view, show first bullet point or first 150 characters
      const bulletPoints = experience.description.split('\n\n').filter(point => point.trim());
      
      if (bulletPoints.length > 1) {
        // Show first bullet point
        const firstPoint = bulletPoints[0].trim();
        const cleanPoint = firstPoint.startsWith('•') ? firstPoint.substring(1).trim() : firstPoint;
        return `<div class="bullet-point"><span class="bullet-symbol">•</span> ${cleanPoint}</div>`;
      }
      
      // Single paragraph - truncate normally
      const truncated = experience.description.length > 150 ? experience.description.substring(0, 150) + '...' : experience.description;
      return truncated.replace(/\n/g, '<br>');
    }
    
    return '';
  }

  // Render the network diagram visualization for part-time experiences
  getDiagramSvg(): string {
    this.calculateDiagramPositions();
    
    let svg = `<svg width="400" height="300" viewBox="0 0 400 300">`;
    
    // Add connections first (so they're behind nodes)
    this.diagramConnections.forEach(conn => {
      const source = this.diagramNodes.find(n => n.id === conn.source);
      const target = this.diagramNodes.find(n => n.id === conn.target);
      
      if (source && target && source.x !== undefined && target.x !== undefined) {
        svg += `<line 
          x1="${source.x}" 
          y1="${source.y}" 
          x2="${target.x}" 
          y2="${target.y}" 
          stroke="${conn.color || '#6366f180'}" 
          stroke-width="${conn.strength || 1}"
          stroke-dasharray="${conn.source.includes('skill') ? '2,2' : ''}"
        />`;
      }
    });
    
    // Add nodes
    this.diagramNodes.forEach(node => {
      if (node.x === undefined) return;
      
      const size = node.size || 40;
      
      svg += `<g class="diagram-node" data-type="${node.type}">
        <circle 
          cx="${node.x}" 
          cy="${node.y}" 
          r="${size / 2}"
          fill="${node.color || '#6366f1'}"
          stroke="${node.type === 'part-time' ? 'white' : 'rgba(255,255,255,0.2)'}"
          stroke-width="${node.type === 'part-time' ? 2 : 1}"
          class="node-circle node-${node.type}"
        />
        <text 
          x="${node.x}" 
          y="${node.y}" 
          text-anchor="middle" 
          dominant-baseline="middle"
          fill="white"
          font-size="${node.type === 'part-time' ? 14 : 10}"
          font-weight="${node.type === 'part-time' ? 'bold' : 'normal'}"
        >${node.label}</text>
      </g>`;
    });
    
    svg += `</svg>`;
    return svg;
  }
}
