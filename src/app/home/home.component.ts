import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { NgbCarousel, NgbSlideEvent } from '@ng-bootstrap/ng-bootstrap';
import { Product } from '../DataModels/Product';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { LoadingService } from '../shared/loading.service';
import { delay, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  encapsulation: ViewEncapsulation.None 
})
export class HomeComponent {
  images = [
    "https://images-eu.ssl-images-amazon.com/images/G/31/Events/img24/Jupiter24/GW/J24_GW_PC_Hero_KSD_EN_V2_2x._CB563840302_.jpg",
    "https://images-eu.ssl-images-amazon.com/images/G/31/img23/Wireless/OnePlus/Jupiter24/DealReveal/11R/D161509508_IN_WLD_Jupiter24_KSD_OnePlus_11RLead-Up_KSD-Heros_PC_Hero_3000x1200_Lifestyle._CB564074625_.jpg",
    "https://images-eu.ssl-images-amazon.com/images/G/31/IMG20/Furniture/2024/September/Jupiter/KSD/PC_Hero-Festive-offers_3000x1200_Lifestyle._CB563862559_.jpg",
    "https://images-eu.ssl-images-amazon.com/images/G/31/img24/Beauty/GW/Jupiter/KSD/Bestselling_skincare._CB563868746_.jpg",
    "https://images-eu.ssl-images-amazon.com/images/G/31/img24/Consumables/Jupiter/GW/LeadUp/LUP_Rec_PC_Hero_3000x1200._CB563620804_.jpg",
    "https://m.media-amazon.com/images/I/B1lzqvWIirL._SX3000_.png"
  ];

  paused = false;
  unpauseOnArrow = false;
  pauseOnIndicator = false;
  pauseOnHover = true;
  pauseOnFocus = true;

  @ViewChild('carousel', { static: true }) carousel!: NgbCarousel;

  products!: Product[];
  cartAddMessage!: string;
  productQuantity: number = 1;

  constructor(private userService: UserService, private router: Router, private toastr: ToastrService, private loadingService: LoadingService) { }

  ngOnInit(): void {
    this.loadingService.show(); 

    this.userService.ProductList().pipe(
      delay(1000), 
      finalize(() => this.loadingService.hide()) 
    ).subscribe((productData) => {
      this.products = productData;
      console.log(this.products[0].price);
    });

    this.userService.userHomeReload();
  }

  showToast(productName: string): void {
    this.toastr.success(`Product has been added to your cart!`, 'Added to Cart');
  }

  onSlide(slideEvent: NgbSlideEvent) {
    // Handle slide events if needed
  }
}
