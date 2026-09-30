import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OperatorsComponent } from './operators';

describe('Operators', () => {
  let component: OperatorsComponent;
  let fixture: ComponentFixture<OperatorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OperatorsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OperatorsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
