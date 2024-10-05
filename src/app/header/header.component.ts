import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { Product } from '../DataModels/Product';
import { ToastrService } from 'ngx-toastr';
import { LoadingService } from '../shared/loading.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  headerType: string = '';
  sellerName: string = '';
  cartErrorMessage: string = '';
  isLoggedIn: boolean = false;
  userName: string = '';
  showLogoutButton = false;
  filteredproducts: Product[] | undefined;
  searchedProducts: Product[] | undefined;
  cartCount: number = 0;


  @ViewChild('suggestedList') suggestedList: ElementRef | undefined;

  constructor(private router: Router, private userService: UserService, private toastr: ToastrService, private loadingService: LoadingService) { }

  ngOnInit(): void {
    this.userService.isUserLoggedIn.subscribe((status) => {
      this.isLoggedIn = status;
      if (this.isLoggedIn) {
        const userSignUpString = localStorage.getItem('userLoginData');
        const userData = userSignUpString && JSON.parse(userSignUpString);
        this.userName = `${userData.firstName}`;

        this.userService.getAllCartItemsForUser(userData.id);
        this.userService.dbCartItemData$.subscribe((result) => {
          this.cartCount = result.length;
        });
      }
      else if (!this.isLoggedIn) {
        const cartitems = localStorage.getItem('localCart');
        if (cartitems) {
          this.cartCount = JSON.parse(cartitems).length;
        }

        this.userService.cartItemData$.subscribe((result) => {
          this.cartCount = result.length;
        });
      }
    });

    // Handle URL changes to set the header type
    this.router.events.subscribe((result: any) => {
      if (result.url) {
        if (localStorage.getItem('sellerLoginData') && result.url.includes('seller')) {
          this.headerType = 'Seller';
          const sellerSignUpString = localStorage.getItem('sellerLoginData');
          if (sellerSignUpString) {
            try {
              const sellerSignUp = JSON.parse(sellerSignUpString);
              this.sellerName = `${sellerSignUp.firstName} ${sellerSignUp.lastName}`;
            } catch (error) {
              console.error('Error parsing JSON from localStorage:', error);
            }
          }
        }
        else if (localStorage.getItem('userLoginData') && (result.url === '/' || result.url.includes('product') || result.url.includes('shopping') || result.url.includes('checkout'))) {
          this.headerType = 'User';
        }
        else {
          this.headerType = 'default';
        }
      }
    });
    //this.userService.userHomeReload();

    // Subscribe to cart error messages
    this.userService.cartAddExceedMessage$.subscribe((result) => {
      if (result) {
        this.cartErrorMessage = result;
        if (this.cartErrorMessage !== '') {
          alert(this.cartErrorMessage);
        }
      }
    });

  }

  searchProduct(query: KeyboardEvent) {
    const element = query.target as HTMLInputElement;
    this.userService.FilteredProducts(element.value.toLowerCase()).subscribe(filtered => {
      this.filteredproducts = filtered;
      this.searchedProducts = this.filteredproducts;
    });
  }

  selectProduct(item: Product) {
    this.router.navigate([`/productdetails/${item.id}`]); 
    this.hideSearch(); 
  }

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    if (this.suggestedList) {
      const clickedInside = this.suggestedList.nativeElement.contains(event.target);
      if (!clickedInside) {
        this.hideSearch(); 
      }
    }
  }

  hideSearch() {
    this.filteredproducts = undefined;
  }

  onClickSearch(val: string) {
    if (this.searchedProducts && this.searchedProducts.length > 0) {
      this.router.navigate([`search-product/${val}`]);
    }
  }

  toggleLogoutButton() {
    this.showLogoutButton = !this.showLogoutButton;
  }

  Logout() {
    localStorage.removeItem('sellerLoginData');
    this.router.navigate(['seller-auth']);
  }
  UserLogout() {
    this.loadingService.show(); 
    localStorage.removeItem('userLoginData');
    this.userService.setLoggedIn(false);
    setTimeout(() => {
      this.loadingService.hide();
      this.router.navigate(['']);
      this.toastr.error("Logout successfully");
    }, 1000); 
    
  }
}
