import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManageCitiesComponent  } from './manage-cities';

describe('ManageCities', () => {
  let component: ManageCitiesComponent;
  let fixture: ComponentFixture<ManageCitiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageCitiesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ManageCitiesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
