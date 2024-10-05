import { Component, ElementRef, ViewChild } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Product } from '../../DataModels/Product';
import { OrdersService } from '../../services/orders.service';

@Component({
  selector: 'app-order-summary',
  templateUrl: './order-summary.component.html',
  styleUrl: './order-summary.component.css'
})
export class OrderSummaryComponent {
  UserId: string | undefined;
  cartItemsData!: Product[];
  isAddressSelected = false;
  isPaymentDone = false;
  showModal = false; // New property to control modal visibility

  constructor(private userService: UserService, private orderService: OrdersService) { }

  ngOnInit() {
    this.UserId = this.userService.GetLoggedInUserId();
    console.log("Userid : " + this.UserId);
    if (this.UserId) {
      this.userService.getAllCartItemsForUser(this.UserId);
      this.userService.dbCartItemData$.subscribe(result => {
        this.cartItemsData = result;
        console.log(this.cartItemsData);
      });
    }

    // Subscribe to the order data
    this.orderService.orderData$.subscribe(orderData => {
      this.isAddressSelected = orderData.isAddressSelected;
      this.isPaymentDone = orderData.isPaymentDone;
    });
  }

  getSubtotal(item: any) {
    return this.cartItemsData.reduce((total, item) => total + (item.price * item.productQuantity), 0);
  }
  getTotalPrice(): number {
    return this.cartItemsData.reduce((total, item) => total + (item.price * item.productQuantity), 0);
  }

  confirmOrder() {
    if (!this.isAddressSelected) {
      alert('Please select an address before confirming the order.');
      return;
    }

    if (!this.isPaymentDone) {
      alert('Please complete your payment before confirming the order.');
      return;
    }
    if (this.isAddressSelected) {
      this.showModal = true; // Show modal
    }
  }
  closeModal() {
    this.showModal = false; // Hide modal
  }
}
