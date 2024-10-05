import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { HomeComponent } from './home/home.component';
import { SellerAuthComponent } from './seller-auth/seller-auth.component';
import {FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SellerProductListComponent } from './seller-product-list/SellerProductListComponent';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ModalComponent } from './modal/modal.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SearchProductComponent } from './User/search-product/search-product.component';
import { ProductdetailsComponent } from './User/productdetails/productdetails.component';
import { FooterComponent } from './footer/footer.component';
import { UserAuthComponent } from './User/user-auth/user-auth.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { ShoppingCartComponent } from './User/shopping-cart/shopping-cart.component';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SpinnerComponent } from './shared/spinner/spinner.component';
import { CheckoutComponent } from './Orders/checkout/checkout.component';
import { OrderSummaryComponent } from './Orders/order-summary/order-summary.component';


@NgModule({ declarations: [
        AppComponent,
        HeaderComponent,
        HomeComponent,
        SellerAuthComponent,
        SellerProductListComponent,
        ModalComponent,
        SearchProductComponent,
        ProductdetailsComponent,
        FooterComponent,
        UserAuthComponent,
        PageNotFoundComponent,
        ShoppingCartComponent,
        SpinnerComponent,
        CheckoutComponent,
        OrderSummaryComponent
    ],
    bootstrap: [AppComponent], imports: [BrowserModule,
        BrowserAnimationsModule,
        ToastrModule.forRoot({
            positionClass: 'toast-bottom-right',
            preventDuplicates: true, // Prevent duplicate toasts
            timeOut: 3000 // Duration in milliseconds
        }),
        AppRoutingModule,
        ReactiveFormsModule,
        FontAwesomeModule,
        ModalModule.forRoot(),
        NgbModule,
        FormsModule], providers: [provideHttpClient(withInterceptorsFromDi())] })
export class AppModule { }
