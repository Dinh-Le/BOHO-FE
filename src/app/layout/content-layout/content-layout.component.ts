import { Component, OnInit } from '@angular/core';
import { LoadingService } from '@app/services/loading.service';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { SidebarState } from 'src/app/state/sidebar.state';

@Component({
  selector: 'app-content-layout',
  templateUrl: './content-layout.component.html',
  styleUrls: ['./content-layout.component.scss'],
})
export class ContentLayoutComponent implements OnInit {
  sidebarVisible: boolean;
  sidebar$: Observable<SidebarState>;

  constructor(
    store: Store<{ sidebar: SidebarState }>,
    private loadingService: LoadingService
  ) {
    this.sidebar$ = store.select('sidebar');
    this.sidebarVisible = true;
  }

  get loading() {
    return this.loadingService.loading;
  }

  ngOnInit(): void {
    this.sidebar$.subscribe(
      (newState) => (this.sidebarVisible = newState.state)
    );
  }
}
