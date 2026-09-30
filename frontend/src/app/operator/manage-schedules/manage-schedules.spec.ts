import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManageSchedulesComponent } from './manage-schedules';

describe('ManageSchedulesComponent', () => {
  let component: ManageSchedulesComponent;
  let fixture: ComponentFixture<ManageSchedulesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageSchedulesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ManageSchedulesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
