import { Component, Renderer2 } from '@angular/core';
import { SellerService } from '../services/seller.service';
import { Product } from '../DataModels/Product';
import { faTrashRestoreAlt, faRefresh, faAdd } from '@fortawesome/free-solid-svg-icons'
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { ModalComponent } from '../modal/modal.component';

@Component({
    selector: 'app-seller-product-list',
    templateUrl: './seller-product-list.component.html',
    styleUrl: './seller-product-list.component.css'
})
export class SellerProductListComponent {
  productList!: Product[];
  productMessage!: string;
  deleteIcon = faTrashRestoreAlt;
  modalRef?: BsModalRef;
  updateIcon = faRefresh;
  addIcon = faAdd;

  constructor(private sellerService: SellerService, private modalService: BsModalService, private renderer: Renderer2) { }

  ngOnInit(): void {
    this.ProductList();
  }

  deleteProduct(id: string): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.sellerService.DeleteProductById(id).subscribe((result) => {
        if (result) {
          this.productMessage = "Product successfully deleted";
          setTimeout(() => (this.productMessage = ''), 3000);
          this.ProductList();
        }
      });      
    }
  }
  ProductList(): void {
    this.sellerService.ProductList().subscribe(result => {
      if (result) {
        // Convert imageUrl to an array if it's a single string
        this.productList = result.map(product => ({
          ...product,
          imageUrl: Array.isArray(product.imageUrl) ? product.imageUrl : [product.imageUrl]
        }));
      }
    });
  }
  handleClick(event: Event) {
    const target = event.target as HTMLElement;
    if (target) {
      this.renderer.addClass(target, 'vibrate');
      setTimeout(() => {
        this.renderer.removeClass(target, 'vibrate');
      }, 500); // Duration of the vibration animation
    }
  }

  openModalForUpdateProduct(product: Product) {
    const initialState: ModalOptions = {
      initialState: {
        product: product
      }
    };
    this.modalRef = this.modalService.show(ModalComponent, initialState);

    // Subscribe to the event emitted by ModalComponent
    (this.modalRef.content as ModalComponent).updateSuccess.subscribe(() => {
      this.productMessage = "Product successfully updated";
      setTimeout(() => (this.productMessage = ''), 4000);
      this.ProductList();
    });
  }
  openModalForAddProduct(): void {
    this.modalRef = this.modalService.show(ModalComponent);

    (this.modalRef.content as ModalComponent).updateSuccess.subscribe(() => {
      this.productMessage = "Product successfully added";
      this.ProductList();
      setTimeout(() => (this.productMessage = ''), 4000);
    });
  }
}
