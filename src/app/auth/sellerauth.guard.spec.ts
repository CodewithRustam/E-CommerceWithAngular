import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { sellerauthGuard } from './sellerauth.guard';

describe('sellerauthGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => sellerauthGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
