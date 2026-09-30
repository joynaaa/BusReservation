import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouteStopsComponent } from './route-stops';

describe('RouteStopsComponent', () => {
  let component: RouteStopsComponent;
  let fixture: ComponentFixture<RouteStopsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouteStopsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RouteStopsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
