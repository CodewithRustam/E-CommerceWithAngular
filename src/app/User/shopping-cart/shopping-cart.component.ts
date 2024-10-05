import { Component } from '@angular/core';
import { Product } from '../../DataModels/Product';
import { UserService } from '../../services/user.service';
import { ToastrService } from 'ngx-toastr';
import { LoadingService } from '../../shared/loading.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-shopping-cart',
  templateUrl: './shopping-cart.component.html',
  styleUrl: './shopping-cart.component.css'
})
export class ShoppingCartComponent {
  cartItemsData!: Product[];
  UserId!: string;
  isUserLoggedIn!: boolean;
  constructor(private userService: UserService, private toastr: ToastrService, private loadingService: LoadingService, private router: Router) { }


  ngOnInit() {
    this.loadingService.show(); 

    this.UserId = this.userService.GetLoggedInUserId();

    if (this.UserId) {
      this.userService.getAllCartItemsForUser(this.UserId);

      this.userService.dbCartItemData$.subscribe(result => {
        this.cartItemsData = result;
      });
    }
    else {
      this.userService.getCartitemsFromLocalStorage().subscribe(result => {
        this.cartItemsData = result;
      });
    }
    setTimeout(() => {
      this.loadingService.hide();
    }, 1000);

    this.userService.isUserLoggedIn.subscribe(result => {
      this.isUserLoggedIn = result;
    });

    this.userService.shoppingCartReload();
  }

  getTotalPrice(): number {
    return this.cartItemsData.reduce((total, item) => {
      return total + (item.price * item.productQuantity);
    }, 0);
  }
  getTotalItems(): number {
    return this.cartItemsData.reduce((total, item) => total + item.productQuantity, 0);
  }

  removeFromCart(product: Product) {
    const isDelete = confirm("Are you sure to delete?")
    if (isDelete) {
      this.loadingService.show(); 
      if (!this.isUserLoggedIn) {
        this.cartItemsData = this.cartItemsData.filter(item => item.id !== product.id);
        this.userService.removeItemFromCart(this.cartItemsData);
        setTimeout(() => {
          this.toastr.error('Product removed successfuly!');
          this.loadingService.hide();
        }, 1000);
      }
      else {
        this.userService.RemoveItemFromCartDB(product.id);
        setTimeout(() => {
          this.toastr.error('Product removed successfuly!');
          this.loadingService.hide();
        }, 1000);
      }
    }
  }

  onProceedToBuy() {
    if (this.isUserLoggedIn) {
      this.router.navigate(['/checkout']);
    } else {
      this.router.navigate(['/user-auth']);
    }
  }
}
