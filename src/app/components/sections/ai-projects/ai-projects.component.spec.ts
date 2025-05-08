import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiProjectsComponent } from './ai-projects.component';

describe('AiProjectsComponent', () => {
  let component: AiProjectsComponent;
  let fixture: ComponentFixture<AiProjectsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiProjectsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AiProjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
