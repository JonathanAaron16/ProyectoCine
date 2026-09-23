import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PeliculasForm } from './peliculas-form';

describe('PeliculasForm', () => {
  let component: PeliculasForm;
  let fixture: ComponentFixture<PeliculasForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PeliculasForm],
    }).compileComponents();

    fixture = TestBed.createComponent(PeliculasForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
