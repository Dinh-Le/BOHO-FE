import { Component } from '@angular/core';
import { LoadingService } from '@app/loading.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent {

  constructor(
    private loadingService: LoadingService
  ) {}

  search() {
    this.loadingService.loading = true;
    setTimeout(() => this.loadingService.loading = false, 3000);
  }
}
