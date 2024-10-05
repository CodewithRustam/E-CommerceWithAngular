import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const sellerauthGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  if (localStorage.getItem('sellerLoginData')) {
    return true;
  }
  else {
    router.navigate(['/seller-auth']); 
    return false;
  }
};
