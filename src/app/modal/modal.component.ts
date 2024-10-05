import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Product } from '../DataModels/Product';
import { SellerService } from '../services/seller.service';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent implements OnInit {
  @Input() product?: Product; // Optional input to handle both add and update
  @Output() updateSuccess = new EventEmitter<void>();

  productForm!: FormGroup;
  isNewProduct: boolean = false; // Flag to determine if we are adding or updating

  constructor(public bsModalRef: BsModalRef, private fb: FormBuilder, private sellerService: SellerService) { }

  ngOnInit() {
    // Determine if we're creating a new product or updating an existing one
    this.isNewProduct = !this.product;
    const formControls: any = {
      name: [this.product?.name || '', Validators.required],
      category: [this.product?.category || ''],
      price: [this.product?.price || '', Validators.required],
      stockQuantity: [this.product?.stockQuantity || '', Validators.required],
      description: [this.product?.description || ''],
      imageUrl: this.createImageUrlArray(this.product?.imageUrl || [])
    };

    if (!this.isNewProduct) {
      formControls.id = [this.product?.id || ''];
    }

    this.productForm = this.fb.group(formControls);
  }
  private createImageUrlArray(imageUrls: string[]): FormArray {
    const formArray = this.fb.array([]);
    imageUrls.forEach(url => formArray.push(new FormControl(url)));
    return formArray;
  }
  closeModal() {
    this.bsModalRef.hide();
  }
  get imageUrl(): FormArray {
    return this.productForm.get('imageUrl') as FormArray;
  }

  addImageUrl(image: string) {
    this.imageUrl.push(new FormControl(image));
  }

  removeImageUrl(index: number) {
    this.imageUrl.removeAt(index);
  }


  onSubmit() {
    if (this.productForm.valid) {
      const productData: Product = this.productForm.value;
          productData.imageUrl = this.imageUrl.controls.map(control => control.value);

      if (this.isNewProduct) {
        // Add new product
        this.sellerService.AddProduct(productData);
            this.closeModal();
            this.updateSuccess.emit();
      } else {
        // Update existing product
        this.sellerService.UpdateProduct(productData).subscribe(result => {
          if (result) {
            this.closeModal();
            this.updateSuccess.emit();
          }
        });
      }
    }
  }
}
