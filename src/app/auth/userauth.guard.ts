import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const userauthGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  if (localStorage.getItem('userLoginData')) {
    return true; 
  } else {
    router.navigate(['/user-auth']); 
    return false; 
  }
};
