import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ErroresCampo } from './errores-campo';

describe('ErroresCampo', () => {
  let component: ErroresCampo;
  let fixture: ComponentFixture<ErroresCampo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErroresCampo],
    }).compileComponents();

    fixture = TestBed.createComponent(ErroresCampo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
