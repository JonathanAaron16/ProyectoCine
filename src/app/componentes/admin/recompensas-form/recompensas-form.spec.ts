import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecompensasForm } from './recompensas-form';

describe('RecompensasForm', () => {
  let component: RecompensasForm;
  let fixture: ComponentFixture<RecompensasForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecompensasForm],
    }).compileComponents();

    fixture = TestBed.createComponent(RecompensasForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
