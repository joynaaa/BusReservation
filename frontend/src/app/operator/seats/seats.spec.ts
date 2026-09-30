import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SeatsComponent } from './seats';

describe('SeatsComponent', () => {
  let component: SeatsComponent;
  let fixture: ComponentFixture<SeatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeatsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SeatsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
