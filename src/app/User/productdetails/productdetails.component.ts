import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { UserService } from '../../services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from '../../DataModels/Product';
import { ToastrService } from 'ngx-toastr';
import { LoadingService } from '../../shared/loading.service';

@Component({
  selector: 'app-productdetails',
  templateUrl: './productdetails.component.html',
  styleUrls: ['./productdetails.component.css']
})
export class ProductdetailsComponent implements OnInit {
  product!: Product;
  products!: Product[];
  selectedImageIndex: number = 0;
  id: string = '';
  productQuantity: number = 1;
  isInCart: boolean = false;
  isUserLoggedIn!: boolean;


  constructor(private userService: UserService, private activeRoute: ActivatedRoute, private router: Router, private toastr: ToastrService, private loadingService: LoadingService) { }

  ngOnInit(): void {
    this.loadingService.show(); // Show spinner

    this.userService.isUserLoggedIn.subscribe((isLoggedin) => {
      this.isUserLoggedIn = isLoggedin;
    });

    const query = this.activeRoute.snapshot.paramMap.get('id');
    if (query) {
      this.userService.getProductById(query).subscribe(product => {
        setTimeout(() => {
          this.loadingService.hide(); // Hide spinner after a short delay
        }, 1000); 

        this.product = product;
        // Check if user is logged in and update cart status
        if (!this.isUserLoggedIn) {
          this.checkIfInCart(this.product.id);
        }

        // Fetch related products
        this.fetchRelatedProducts(this.product.category);

        // Simulate a short delay before hiding the spinner
        // 1000 ms = 1 second
      });

      this.userService.itemAlreadyInCart$.subscribe(isItemInCart => {
        this.isInCart = isItemInCart; // Update local state
      });
    }
    this.userService.productDetailsReload(query);
  }

  checkIfInCart(productId: string): void {
    // Check if the product is already in the cart
    const cartItems = JSON.parse(localStorage.getItem('localCart') || '[]');
    this.isInCart = cartItems.some((item: Product) => item.id === productId);
  }

  HandleQuantity(value: string): void {
    if (value === "increase" && this.productQuantity < 20) {
      this.productQuantity += 1;
    } else if (value === "decrease" && this.productQuantity > 1) {
      this.productQuantity -= 1;
    }
  }

  AddToCart(): void {
    if (this.product && !this.isInCart) {
      this.product.productQuantity = this.productQuantity;

      if (!localStorage.getItem('userLoginData')) {
        this.userService.LocalAddToCart(this.product, this.product.id);
        this.isInCart = true;
        this.toastr.success('Product has been added successfully in cart!');
      }
      else {
        this.userService.AddCartItemInDb(this.product, this.product.id)
          .subscribe({
            next: (result) => {
              this.isInCart = true;
              this.toastr.success('Product has been added successfully to the cart!');
            },
            error: (err) => {
              // Handle error case here if necessary
              console.error('Error adding item to cart', err);
            }
          });

        this.userService.itemAlreadyInCart$.subscribe((result) => {
          if (result) {
            this.toastr.warning('This product is already in cart!');
          }
        });
        this.userService.cartAddExceedMessage$.subscribe((result) => {
          if (result) {
            this.toastr.warning(result);
          }
        })
      }
    }
  }

  ViewDetailsRedirections(id:string) {
    this.router.navigate([`/productdetails/${id}`]);
  }

  GoToCart(): void {
    this.router.navigate(['/shopping-cart']);
  }

  fetchRelatedProducts(category: string): void {
    this.userService.RelatedProducts(category).subscribe(relatedProducts => {
      this.products = relatedProducts;
    });
  }

  selectImage(index: number): void {
    this.selectedImageIndex = index;
  }
}
