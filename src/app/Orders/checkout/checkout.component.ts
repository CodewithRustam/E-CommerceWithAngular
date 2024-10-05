import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { LoadingService } from '../../shared/loading.service';
import { OrdersService } from '../../services/orders.service';
import { Router } from '@angular/router';
import { Product } from '../../DataModels/Product';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'] // corrected styleUrl to styleUrls
})
export class CheckoutComponent {

  addresses = [
    { id: 1, name: 'John Doe', street: '1234 Main St', apartment: 'Apt 101', city: 'New York', state: 'NY', zip: '10001', mobile: '123-456-7890' },
    { id: 2, name: 'Jane Smith', street: '5678 Elm St', apartment: 'Suite 5', city: 'Los Angeles', state: 'CA', zip: '90001', mobile: '987-654-3210' },
    // Add more addresses as needed
  ];

  showAddressForm = false;
  isAddressSelected = false;
  isPaymentDone = false; // New property to track payment status
  selectedTab: string = 'creditCard';
  UserId!: string;
  cartItemsData!: Product[];
  addressSelectionForm!: FormGroup;
  newAddressForm!: FormGroup;
  creditCardForm!: FormGroup;
  cashOnDeliveryForm!: FormGroup;

  constructor(private fb: FormBuilder, private userService: UserService,private orderService:OrdersService, private loadingService: LoadingService, private router:Router) { }

  ngOnInit(): void {
    this.loadingService.show();
    // Initialize the form groups
    this.addressSelectionForm = this.fb.group({
      selectedAddress: ['']
    });

    this.newAddressForm = this.fb.group({
      name: [''],
      mobile: [''],
      street: [''],
      apartment: [''],
      zip: [''],
      city: [''],
      state: ['']
    });

    this.creditCardForm = this.fb.group({
      cardName: ['', Validators.required],
      cardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]], // 16 digits
      expiryDate: ['', Validators.required],
      cvv: ['', [Validators.required, Validators.pattern(/^\d{3}$/)]] // 3 digits
    });

    this.cashOnDeliveryForm = this.fb.group({
      receiverName: ['', Validators.required],
      receiverMobile: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]] // 10 digits
    });

    this.UserId = this.userService.GetLoggedInUserId();
    if (this.UserId) {
      this.userService.getAllCartItemsForUser(this.UserId);
      this.userService.dbCartItemData$.subscribe(result => {
        this.cartItemsData = result;
        console.log(this.cartItemsData);
      });
    }

    setTimeout(() => {
      this.loadingService.hide();
    }, 1000);

    this.userService.reloadCheckoutPage();
  }

  toggleAddressForm() {
    this.showAddressForm = !this.showAddressForm;
  }

  onSelectAddress() {
    const selectedAddressId = this.addressSelectionForm.value.selectedAddress;
    if (selectedAddressId) {
      this.isAddressSelected = true;
      this.orderService.updateOrderData({ 
        isAddressSelected: this.isAddressSelected, 
        isPaymentDone: this.isPaymentDone
      });
      alert(`Address ${selectedAddressId} selected`);
    } else {
      alert('Please select an address');
    }
  }
  onSaveAddress() {
    const newAddress = this.newAddressForm.value;
    // Add the new address to the list or send it to the server
    console.log('New Address:', newAddress);
    this.addresses.push({ ...newAddress, id: this.addresses.length + 1 }); // For demo purposes
    this.newAddressForm.reset(); // Reset the form
    this.showAddressForm = false; // Hide the form
  }

  selectTab(tabName: string) {
    this.selectedTab = tabName; // Update the selected tab
  }

  onSubmitCardPayment() {
    if (this.creditCardForm.valid) {
      // After payment processing
      this.isPaymentDone = true;
      this.orderService.updateOrderData({ 
        isAddressSelected: this.isAddressSelected, 
        isPaymentDone: this.isPaymentDone
      });
      this.creditCardForm.reset();
    } else {
      alert('Please fill in all required fields correctly.');
    }
  }

  onPayPalPayment() {
    alert('Redirecting to PayPal...');
    // Implement PayPal payment logic or redirect
    this.isPaymentDone = true; // Mark payment as done
    this.orderService.updateOrderData({ 
      isAddressSelected: this.isAddressSelected, 
      isPaymentDone: this.isPaymentDone
    });

    this.router.navigate(['/order-summary']);
  }

  onSubmitCashPayment() {
    if (this.cashOnDeliveryForm.valid) {
      const orderData = this.cashOnDeliveryForm.value;
      console.log('Cash on Delivery Order:', orderData);
      alert('Order confirmed for Cash on Delivery.');
      this.isPaymentDone = true; // Mark payment as done
      this.cashOnDeliveryForm.reset();
      this.orderService.updateOrderData({ 
        isAddressSelected: this.isAddressSelected, 
        isPaymentDone: this.isPaymentDone
      });
    } else {
      alert('Please fill in all required fields correctly.');
    }
  }
  getSubtotal(item:any) {
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

    // Logic to confirm the order goes here
    alert('Order confirmed!');
    // You can add additional logic to send the order details to the server
  }
}
