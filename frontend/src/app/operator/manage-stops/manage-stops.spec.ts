import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManageStopsComponent } from './manage-stops';

describe('ManageStopsComponent', () => {
  let component: ManageStopsComponent;
  let fixture: ComponentFixture<ManageStopsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageStopsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ManageStopsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
