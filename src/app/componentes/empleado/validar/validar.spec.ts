import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Validar } from './validar';

describe('Validar', () => {
  let component: Validar;
  let fixture: ComponentFixture<Validar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Validar],
    }).compileComponents();

    fixture = TestBed.createComponent(Validar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
