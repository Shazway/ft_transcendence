import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PongDebugComponent } from './pong-debug.component';

describe('PongDebugComponent', () => {
  let component: PongDebugComponent;
  let fixture: ComponentFixture<PongDebugComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PongDebugComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PongDebugComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
