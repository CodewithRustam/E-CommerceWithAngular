import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from '../DataModels/Product';
import { OrderDataModel } from '../DataModels/OrderDataModel';


@Injectable({
  providedIn: 'root'
})
export class OrdersService {

  private orderDataSource = new BehaviorSubject<OrderDataModel>({
    isAddressSelected: false,
    isPaymentDone: false,
  });

  orderData$ = this.orderDataSource.asObservable();

  updateOrderData(data: { isAddressSelected: boolean, isPaymentDone: boolean}) {
    this.orderDataSource.next(data);
  }
}
