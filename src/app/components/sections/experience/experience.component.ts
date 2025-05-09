import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentService, Experience } from '../../../services/content.service';
import { ScrollAnimationDirective } from '../../../directives/scroll-animation.directive';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBriefcase, faCalendar, faChevronDown, faChevronUp, faCode } from '@fortawesome/free-solid-svg-icons';

interface ExperienceWithState extends Experience {
  isExpanded: boolean;
  isFirst: boolean;
  isLast: boolean;
  hasParallel: boolean;
  parallelWith?: number[];
}

interface TechAnimation {
  tech: string;
  snippet: string;
  color: string;
  position?: 'left' | 'right' | 'top' | 'bottom';
}

@Component({
  selector: 'app-experience',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, ScrollAnimationDirective],
  templateUrl: './experience.component.html',
  styleUrl: './experience.component.css'
})
export class ExperienceComponent implements OnInit {
  experiences: ExperienceWithState[] = [];
  showPartTime: boolean = false;
  activeExperienceIndex: number = -1;

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
      position: 'right'
    }
  };
  
  // Icons
  faBriefcase = faBriefcase;
  faCalendar = faCalendar;
  faChevronDown = faChevronDown;
  faChevronUp = faChevronUp;
  faCode = faCode;

  constructor(private contentService: ContentService) {}

  ngOnInit(): void {
    const portfolioContent = this.contentService.getPortfolioContent();
    // Initialize experiences by processing raw data from content service
    this.experiences = this.processExperiences(portfolioContent.experience);
    // Add part-time experiences
    this.addPartTimeExperiences();
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
  }

  // Create class for tech animation based on position
  getTechAnimationClass(animation: TechAnimation): string {
    return `tech-animation tech-${this.slugify(animation.tech)} tech-${animation.position || 'left'}`;
  }

  // Set active experience for enhanced animations
  setActiveExperience(index: number): void {
    this.activeExperienceIndex = index;
  }

  // Utility to slugify tech names for CSS classes
  slugify(text: string): string {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }

  togglePartTime(): void {
    this.showPartTime = !this.showPartTime;
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
        parallelWith: []
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
    // Add the part-time experiences
    const alignerr: ExperienceWithState = {
      company: 'Alignerr',
      role: 'AI Trainer',
      startDate: 'Oct 2024',
      endDate: 'Present',
      description: 'Contract Part-time, Remote position based in France. Specialized in training AI models for dental alignment and orthodontic purposes, improving detection accuracy of misalignments and required corrections.',
      logo: 'assets/images/companies/alignerr-logo.jpg',
      skills: ['AI Training', 'Data Labeling', 'Machine Learning', 'Python', 'TensorFlow'],
      isExpanded: false,
      isFirst: false,
      isLast: false,
      hasParallel: true,
      parallelWith: [this.experiences.length + 1]
    };
    
    const micro1: ExperienceWithState = {
      company: 'Micro1',
      role: 'AI Researcher',
      startDate: 'Aug 2024',
      endDate: 'Present',
      description: 'Part-time research position focused on developing cutting-edge small language models optimized for specific industry verticals. Working on model compression techniques and domain-specific fine-tuning approaches.',
      logo: 'assets/images/companies/micro1-logo.jpg',
      skills: ['NLP', 'LLMs', 'PyTorch', 'Model Optimization', 'Research'],
      isExpanded: false,
      isFirst: false,
      isLast: false,
      hasParallel: true,
      parallelWith: [this.experiences.length]
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

  // Toggle experience expansion
  toggleExpand(index: number): void {
    this.experiences[index].isExpanded = !this.experiences[index].isExpanded;
    // Add active experience animation when expanded
    if (this.experiences[index].isExpanded) {
      this.setActiveExperience(index);
    } else if (this.activeExperienceIndex === index) {
      this.activeExperienceIndex = -1;
    }
  }

  onImageError(experience: ExperienceWithState): void {
    console.log(`Failed to load image for ${experience.company}`);
    experience.logo = undefined;
  }
}
