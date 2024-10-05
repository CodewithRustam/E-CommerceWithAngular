import { Component } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Product } from '../../DataModels/Product';
import { ActivatedRoute } from '@angular/router';
import { LoadingService } from '../../shared/loading.service';

@Component({
  selector: 'app-search-product',
  templateUrl: './search-product.component.html',
  styleUrl: './search-product.component.css'
})
export class SearchProductComponent {
  filteredproducts!: Product[];
  cartAddMessage: string | undefined;

  constructor(private userService: UserService, private activeRoute: ActivatedRoute, private loadingService: LoadingService) { }

  ngOnInit(): void {
    this.loadingService.show(); 

    const query = this.activeRoute.snapshot.paramMap.get('query');
    query && this.userService.FilteredProducts(query).subscribe(filtered => {
       this.filteredproducts = filtered;
    });

    setTimeout(() => {
      this.loadingService.hide();
    }, 1000); 
    this.userService.userSearchReload(query);
  }
}
