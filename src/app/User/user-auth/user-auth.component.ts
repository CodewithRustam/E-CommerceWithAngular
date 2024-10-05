import { Component } from '@angular/core';
import { SignIn } from '../../DataModels/SignIn';
import { SignUp } from '../../DataModels/SignUp';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { ToastrService } from 'ngx-toastr';
import { LoadingService } from '../../shared/loading.service';

@Component({
  selector: 'app-user-auth',
  templateUrl: './user-auth.component.html',
  styleUrl: './user-auth.component.css'
})
export class UserAuthComponent {
  userSignUpForm!: FormGroup;
  loginForm!: FormGroup;
  isLogin: boolean = true;
  loginErrorMessage: string = '';
  constructor(private fb: FormBuilder, private userService: UserService, private toastr: ToastrService, private loadingService: LoadingService) { }

  ngOnInit(): void {
    this.loadingService.show(); 
    this.userSignUpForm = this.fb.group({
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
    this.userService.userHomeReload();
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
      this.userService.userLogin(loginData);
      this.userService.isUserLoggedIn.subscribe(result => {
        this.isLogin = result;
        
      });
      if (this.isLogin) {
        this.toastr.success("Logged in successfully!");
      }

      this.userService.loginError$.subscribe((isError) => {
        if (isError) {
          this.toastr.error("Invalid Email or Password");
          this.loginErrorMessage = "Invalid Email or Password";
          this.loginForm.reset();
        }
      });
    }
  }

  onSignUpSubmit(): void {
    if (this.userSignUpForm.valid) {
      const formData: SignUp = this.userSignUpForm.value;
      this.userService.userSignUp(formData);
    }
    else {
      alert("User data is not valid");
      this.userSignUpForm.reset();
    }
  }
}
