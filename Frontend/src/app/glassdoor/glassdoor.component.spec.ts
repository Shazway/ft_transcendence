import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlassdoorComponent } from './glassdoor.component';

describe('GlassdoorComponent', () => {
  let component: GlassdoorComponent;
  let fixture: ComponentFixture<GlassdoorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GlassdoorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GlassdoorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
