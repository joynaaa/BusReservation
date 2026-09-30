import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BusesComponent } from './buses';

describe('BusesComponent', () => {
  let component: BusesComponent;
  let fixture: ComponentFixture<BusesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BusesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BusesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
