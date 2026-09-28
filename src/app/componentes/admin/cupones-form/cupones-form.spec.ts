import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CuponesForm } from './cupones-form';

describe('CuponesForm', () => {
  let component: CuponesForm;
  let fixture: ComponentFixture<CuponesForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CuponesForm],
    }).compileComponents();

    fixture = TestBed.createComponent(CuponesForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
