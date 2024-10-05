import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SellerService } from '../services/seller.service';
import { SignUp } from '../DataModels/SignUp';
import { SignIn } from '../DataModels/SignIn';
import { LoadingService } from '../shared/loading.service';

@Component({
  selector: 'app-seller-auth',
  templateUrl: './seller-auth.component.html',
  styleUrl: './seller-auth.component.css'
})
export class SellerAuthComponent {
  sellerSignUpForm!: FormGroup;
  loginForm!: FormGroup;
  isLogin: boolean = true;
  loginErrorMessage: string = '';
  constructor(private fb: FormBuilder, private sellerService: SellerService, private loadingService: LoadingService) { }

  ngOnInit(): void {
    this.loadingService.show(); 

    this.sellerSignUpForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });

    setTimeout(() => {
      this.loadingService.hide();
    }, 1000);

    this.sellerService.sellerReload();
  }
  toggleForm() {
    this.isLogin = !this.isLogin;
  }
  getSliderTabStyle() {
    return {
      'left': this.isLogin ? '0%' : '50%'
    };
  }
  onLoginSubmit() {
    if (this.loginForm.valid) {
      this.loginErrorMessage = "";
      const loginData: SignIn = this.loginForm.value;
      this.sellerService.SellerLogin(loginData);
      this.sellerService.isLoginError.subscribe((isError) => {
        if (isError) {
          this.loginErrorMessage = "Invalid Email or Password";
          this.loginForm.reset();
        }
      });
    }
  }

  onSignUpSubmit(): void {
    if (this.sellerSignUpForm.valid) {
      const formData: SignUp = this.sellerSignUpForm.value;
      this.sellerService.sellerSignUp(formData);
    }
    else {
      alert("Seller data is not valid");
      this.sellerSignUpForm.reset();
    }
  }
}
