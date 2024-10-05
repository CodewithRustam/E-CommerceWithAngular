import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { SignUp } from '../DataModels/SignUp';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { SignIn } from '../DataModels/SignIn';
import { Product } from '../DataModels/Product';

const loginapiUrl = "http://localhost:3000/seller";
const productapiUrl = "http://localhost:3000/products";
@Injectable({
  providedIn: 'root'
})
export class SellerService {

  isSellerLoggedIn = new BehaviorSubject<boolean>(false);
  isLoginError = new EventEmitter<boolean>(false);
  constructor(private httpClient: HttpClient, private router: Router) { }

  //Seller signup ApiCall and Navigation yo Seller Home Page.
  sellerSignUp(sellerData: SignUp) {
    this.httpClient.post(loginapiUrl, sellerData, { observe: 'response' }).subscribe((result) => {
      if (result) {
        this.isSellerLoggedIn.next(true);
        localStorage.setItem('sellerLoginData', JSON.stringify(result.body));
        this.router.navigate(['seller-home']);
      }
      else {
        alert("An error occured, Please try again later.");
      }
    })
  }
  SellerLogin(sellerLoginData: SignIn) {
    this.httpClient.get<SignUp[]>(`${loginapiUrl}?email=${sellerLoginData.email}&password=${sellerLoginData.password}`).subscribe((result) => {
      result.forEach(user => {
          this.isSellerLoggedIn.next(true);
          localStorage.setItem('sellerLoginData', JSON.stringify(user));
        this.router.navigate(['seller-product-list']);
      });
      if (!(result.length > 0)) {
        this.isLoginError.emit(true);
      }
    })
  }
  sellerReload() {
    if (localStorage.getItem('sellerLoginData')) {
      this.isSellerLoggedIn.next(true);
      this.router.navigate(['seller-product-list']);
    }
  }

  //Adding Product
  AddProduct(product: Product) {
    this.httpClient.post(productapiUrl, product, { observe: 'response' }).subscribe((result) => {
      if (result) {
        console.log("Product Added");
      }
      else {
        alert("An error occured, Please try again later.");
      }
    })
  }

  //Product List
  ProductList() {
    return this.httpClient.get<Product[]>(productapiUrl);
  }

  //Delete product by Id
  DeleteProductById(productid: string) {
    return this.httpClient.delete(`${productapiUrl}/${productid}`);
  }

  UpdateProduct(productData: Product) {
    return this.httpClient.put(`${productapiUrl}/${productData.id}`, productData);
  }
}
