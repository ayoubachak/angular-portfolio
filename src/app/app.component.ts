import { Component, HostListener, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';

type Page = 'home' | 'blog' | 'maths' | 'physics' | 'circuits' | 'ai' | 'robots' | 'missing';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  private readonly title = inject(Title);
  page: Page = 'home';
  readonly labels: Record<Page, string> = {
    home: 'First principles', blog: 'Blog', maths: 'Maths', physics: 'Physics',
    circuits: 'Circuits', ai: 'AI', robots: 'I kinda love robots.', missing: 'Nothing here.'
  };

  constructor() { this.readLocation(); }

  @HostListener('window:hashchange')
  onHashChange(): void {
    this.readLocation();
    window.scrollTo(0, 0);
  }

  private readLocation(): void {
    const route = window.location.hash.replace(/^#\/?/, '');
    this.page = !route || route === 'top' ? 'home'
      : Object.prototype.hasOwnProperty.call(this.labels, route) ? route as Page : 'missing';
    this.title.setTitle(this.page === 'home' ? 'First principles' : this.labels[this.page] + ' — First principles');
  }
}
