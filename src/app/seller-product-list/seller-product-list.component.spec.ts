import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SellerProductListComponent } from './SellerProductListComponent';

describe('SellerProductListComponent', () => {
  let component: SellerProductListComponent;
  let fixture: ComponentFixture<SellerProductListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SellerProductListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SellerProductListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
