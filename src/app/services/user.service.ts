import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, EMPTY, Observable, Subject, forkJoin, of } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Product } from '../DataModels/Product';
import { SignUp } from '../DataModels/SignUp';
import { SignIn } from '../DataModels/SignIn';
import { cartItems } from '../DataModels/CartItems';

const userLoginApiUrl = "http://localhost:3000/users";
const productApiUrl = "http://localhost:3000/products";
const cartItemsApiUrl = "http://localhost:3000/cartItems";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  isUserLoggedIn = new BehaviorSubject<boolean>(false);
  loginError$ = new Subject<boolean>();
  userId$ = new Subject<string>();
  cartAddExceedMessage$ = new Subject<string | undefined>();
  itemAlreadyInCart$ = new BehaviorSubject<boolean>(false); 
  dbCartItemData$ = new Subject<cartItems[]>();
  cartItemData$ = new EventEmitter<Product[]>();

  UserId!: string;

  constructor(private httpClient: HttpClient, private router: Router) { }

  userLogin(loginData: SignIn) {
    this.httpClient.get<SignUp[]>(`${userLoginApiUrl}?email=${loginData.email}&password=${loginData.password}`)
      .pipe(
        catchError(err => {
          this.loginError$.next(true);
          return [];
        })
      )
      .subscribe((result) => {
        if (result.length > 0) {
          const user = result[0];
          this.userId$.next(user.id);
          this.isUserLoggedIn.next(true);
          localStorage.setItem('userLoginData', JSON.stringify(user));
          this.syncLocalCartToDb(user.id); // Sync local cart to DB
          this.router.navigate(['']);
        } else {
          this.loginError$.next(true);
        }
      });
  }

  syncLocalCartToDb(userId: string) {
    const localCart: Product[] = JSON.parse(localStorage.getItem('localCart') || '[]');

    // Create an array of API call observables
    const addCartItemRequests = localCart.map(product => {
      const cartItem: cartItems = { ...product, userId };
      return this.httpClient.post<cartItems>(cartItemsApiUrl, cartItem).pipe(
        catchError(err => {
          console.error('Error adding item to DB:', err);
          return []; // Return an empty observable on error
        })
      );
    });

    // Execute all API calls and wait for all to complete
    forkJoin(addCartItemRequests).subscribe(
      results => {
        localStorage.removeItem('localCart');
        this.getAllCartItemsForUser(userId);
      }
    );
  }

  getAllCartItemsForUser(userId: string) {
    this.httpClient.get<cartItems[]>(`${cartItemsApiUrl}?userId=${userId}`)
      .subscribe(
        cartItems => {
          this.dbCartItemData$.next(cartItems);
        }
      );
  }

  userSignUp(formData: SignUp) {
    this.httpClient.post<SignUp>(userLoginApiUrl, formData, { observe: 'response' })
      .pipe(
        catchError(() => {
          alert("An error occurred, please try again later.");
          return [];
        })
      )
      .subscribe((result) => {
        if (result) {
          this.isUserLoggedIn.next(true);
          localStorage.setItem('userLoginData', JSON.stringify(result.body));
          this.router.navigate(['']);
        }
      });
  }

  ProductList(): Observable<Product[]> {
    return this.httpClient.get<Product[]>(productApiUrl);
  }

  AddCartItemInDb(product: Product, id: string): Observable<cartItems[]> {
    return this.httpClient.get<cartItems[]>(cartItemsApiUrl).pipe(
      switchMap((result) => {
        const userId = this.GetLoggedInUserId();

        const existingProductIndex = result?.findIndex(item => item.id === id && item.userId === userId) ?? -1;

        if (existingProductIndex !== -1) {
          this.itemAlreadyInCart$.next(true);
          return EMPTY; // Use EMPTY to signify no further emissions
        }

        if (result.length >= 15) {
          this.cartAddExceedMessage$.next('You can add up to 15 items only in the cart.');
          return EMPTY; // Use EMPTY to signify no further emissions
        }

        const cartItem: cartItems = { ...product, userId };

        return this.httpClient.post<cartItems>(cartItemsApiUrl, cartItem).pipe(
          switchMap(() =>
            this.httpClient.get<cartItems[]>(`${cartItemsApiUrl}?userId=${userId}`)
          ),
          tap((cartItems) => {
            // Emit the updated cart items to dbCartItemData$
            this.dbCartItemData$.next(cartItems);
          })
        );
      })
    );
  }


  removeItemFromCart(cartItemsData: Product[]) {
    localStorage.setItem('localCart', JSON.stringify(cartItemsData));
    this.cartItemData$.next(cartItemsData);
  }

  RemoveItemFromCartDB(itemId: string) {
    const userId = this.GetLoggedInUserId();

    if (!userId) {
      console.error('User is not logged in.');
      return; 
    }
    this.httpClient.delete(`${cartItemsApiUrl}/${itemId}`).subscribe(result => {
      if (result) {
        this.getAllCartItemsForUser(userId);
      }
    });
  }

  FilteredProducts(val: string): Observable<Product[]> {
    return this.httpClient.get<Product[]>(productApiUrl).pipe(
      map(products => products.filter(product => product.name.toLowerCase().includes(val.toLowerCase())))
    );
  }

  RelatedProducts(val: string): Observable<Product[]> {
    return this.httpClient.get<Product[]>(productApiUrl).pipe(
      map(products => products.filter(product => product.category.toLowerCase().includes(val.toLowerCase())))
    );
  }

  getProductById(id: string): Observable<Product> {
    return this.httpClient.get<Product>(`${productApiUrl}/${id}`).pipe(
      switchMap(product => {
        const userId = this.GetLoggedInUserId();
        return this.httpClient.get<cartItems[]>(cartItemsApiUrl).pipe(
          map(cartItems => {
            const itemAlreadyInCart = cartItems.some(item => item.id === id && item.userId === userId);
            this.itemAlreadyInCart$.next(itemAlreadyInCart);
            return product;
          })
        );
      })
    );
  }

  GetLoggedInUserId():string {
    const userSignUpString = localStorage.getItem('userLoginData');
    const userData = userSignUpString ? JSON.parse(userSignUpString) : null;

    if (userData?.id) {
      this.userId$.next(userData?.id);
      return userData?.id;
    }
    else {
      return '';
    }
  }

  setLoggedIn(value: boolean) {
    this.isUserLoggedIn.next(value);
    const cartData: Product[] = JSON.parse(localStorage.getItem('localCart') || '[]');
    this.cartItemData$.next(cartData);
  }

  userHomeReload() {
    if (localStorage.getItem('userLoginData')) {
      this.isUserLoggedIn.next(true);
      this.router.navigate(['']);
    }
  }

  productDetailsReload(id: any) {
    if (localStorage.getItem('userLoginData')) {
      this.isUserLoggedIn.next(true);
      this.router.navigate([`productdetails/${id}`]);
    }
  }

  shoppingCartReload() {
    if (localStorage.getItem('userLoginData')) {
      this.isUserLoggedIn.next(true);
      this.router.navigate([`shopping-cart`]);
    }
  }
  userSearchReload(query: string | null) {
    if (localStorage.getItem('userLoginData')) {
      this.isUserLoggedIn.next(true);
      this.router.navigate([`search-product/${query}`]);
    }
  }
  reloadCheckoutPage() {
    if (localStorage.getItem('userLoginData')) {
      this.isUserLoggedIn.next(true);
      this.router.navigate([`checkout`]);
    }
  }

  //Local Storage Logics
  getCartitemsFromLocalStorage(): Observable<Product[]> {
    const cartData: Product[] = JSON.parse(localStorage.getItem('localCart') || '[]');
    return of(cartData); 
  }

  LocalAddToCart(product: Product, id: string) {
    const cartData: Product[] = JSON.parse(localStorage.getItem('localCart') || '[]');

    const existingProductIndex = cartData.findIndex(item => item.id === id);

    if (existingProductIndex === -1) {
      if (cartData.length < 15) {
        cartData.push(product);
        localStorage.setItem('localCart', JSON.stringify(cartData));
      } else {
        this.cartAddExceedMessage$.next('You can add up to 15 items only in the cart.');
      }
    } else {
      this.itemAlreadyInCart$.next(true);
    }
    this.cartItemData$.next(cartData);
  }
}
