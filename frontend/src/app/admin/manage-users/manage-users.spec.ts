import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManageUsersComponent } from './manage-users';

describe('ManageUsers', () => {
  let component: ManageUsersComponent;
  let fixture: ComponentFixture<ManageUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageUsersComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ManageUsersComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
