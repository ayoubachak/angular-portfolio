import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  template: `
    <button (click)="toggleTheme()" class="p-2 rounded focus:outline-none">
      <fa-icon [icon]="isDark ? faSun : faMoon"></fa-icon>
    </button>
  `,
  // no external styles needed
})
export class ThemeToggleComponent implements OnInit {
  faSun = faSun;
  faMoon = faMoon;
  isDark = false;

  ngOnInit(): void {
    // Check for saved preference
    const saved = localStorage.getItem('theme');
    if (saved) {
      this.isDark = saved === 'dark';
    } else {
      // Default based on OS
      this.isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    this.applyTheme();
  }

  toggleTheme(): void {
    this.isDark = !this.isDark;
    localStorage.setItem('theme', this.isDark ? 'dark' : 'light');
    this.applyTheme();
  }

  private applyTheme(): void {
    document.documentElement.classList.toggle('dark', this.isDark);
  }
}
