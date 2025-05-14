import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface GenZEasterEggState {
  isActive: boolean;
  isGenZ: boolean | null; // null means not yet answered
  isMinimized: boolean;
  isEmbedded: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class GenZEasterEggService {  private defaultState: GenZEasterEggState = {
    isActive: false,
    isGenZ: null,
    isMinimized: false,
    isEmbedded: false
  };
  
  private stateSubject = new BehaviorSubject<GenZEasterEggState>(this.defaultState);
  public state$ = this.stateSubject.asObservable();
  
  constructor() {
    // Try to restore state from localStorage
    this.tryRestoreState();
  }
  
  private tryRestoreState(): void {
    const savedState = localStorage.getItem('genZEasterEgg');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        // Only restore the isGenZ setting, not the visibility
        this.stateSubject.next({
          ...this.defaultState,
          isGenZ: parsed.isGenZ
        });
      } catch (e) {
        console.error('Error restoring Gen Z Easter Egg state', e);
      }
    }
  }
  
  private saveState(): void {
    const currentState = this.stateSubject.value;
    localStorage.setItem('genZEasterEgg', JSON.stringify({
      isGenZ: currentState.isGenZ
    }));
  }
  
  activateEasterEgg(): void {
    const current = this.stateSubject.value;
    this.stateSubject.next({
      ...current,
      isActive: true
    });
  }
  
  setGenZStatus(isGenZ: boolean): void {
    const current = this.stateSubject.value;
    this.stateSubject.next({
      ...current,
      isGenZ
    });
    this.saveState();
  }
  
  toggleMinimize(): void {
    const current = this.stateSubject.value;
    this.stateSubject.next({
      ...current,
      isMinimized: !current.isMinimized
    });
  }
    closeEasterEgg(): void {
    const current = this.stateSubject.value;
    this.stateSubject.next({
      ...current,
      isActive: false,
      isMinimized: false,
      isEmbedded: false
    });
  }

  toggleEmbedded(): void {
    const current = this.stateSubject.value;
    this.stateSubject.next({
      ...current,
      isEmbedded: !current.isEmbedded,
      isMinimized: false,
      isActive: true // Ensure the phone is active when embedded
    });
  }

  isEmbedded(): boolean {
    return this.stateSubject.value.isEmbedded;
  }
}
