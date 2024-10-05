import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { SellerAuthComponent } from './seller-auth/seller-auth.component';
import { sellerauthGuard } from './auth/sellerauth.guard';
import { SellerProductListComponent } from './seller-product-list/SellerProductListComponent';
import { SearchProductComponent } from './User/search-product/search-product.component';
import { ProductdetailsComponent } from './User/productdetails/productdetails.component';
import { UserAuthComponent } from './User/user-auth/user-auth.component';
import { userauthGuard } from './auth/userauth.guard';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { ShoppingCartComponent } from './User/shopping-cart/shopping-cart.component';
import { CheckoutComponent } from './Orders/checkout/checkout.component';
import { OrderSummaryComponent } from './Orders/order-summary/order-summary.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'seller-auth',
    component: SellerAuthComponent
  },
  {
    path: 'seller-product-list',
    component: SellerProductListComponent,
    canActivate: [sellerauthGuard]
  },
  {
    path: 'search-product/:query',
    component: SearchProductComponent
  },
  {
    path: 'productdetails/:id',
    component: ProductdetailsComponent
  },
  {
    path: 'user-auth',
    component: UserAuthComponent,
  },
  {
    path: 'shopping-cart',
    component: ShoppingCartComponent
  },
  {
    path: 'checkout',
    component: CheckoutComponent,
    canActivate: [userauthGuard]
  },
  {
    path: 'order-summary',
    component: OrderSummaryComponent,
    canActivate: [userauthGuard]
  },
  {
    path: '**',
    component: PageNotFoundComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
