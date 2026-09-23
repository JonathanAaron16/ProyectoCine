import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FuncionesForm } from './funciones-form';

describe('FuncionesForm', () => {
  let component: FuncionesForm;
  let fixture: ComponentFixture<FuncionesForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FuncionesForm],
    }).compileComponents();

    fixture = TestBed.createComponent(FuncionesForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
