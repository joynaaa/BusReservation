import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OperatorRegisterComponent } from './register';

describe('OperatorRegisterComponent', () => {
  let component: OperatorRegisterComponent;
  let fixture: ComponentFixture<OperatorRegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OperatorRegisterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OperatorRegisterComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
