import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManageFaresComponent } from './manage-fares';

describe('ManageFares', () => {
  let component: ManageFaresComponent;
  let fixture: ComponentFixture<ManageFaresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageFaresComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ManageFaresComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
