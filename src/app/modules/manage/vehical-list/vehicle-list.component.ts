import { Component, inject } from '@angular/core';
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { AddVehicleListComponent } from './add-vehicle-list/add-vehicle-list.component';
import { v4 } from 'uuid';

interface RowItemModel {
  id: string;
  name: string;
  type: string;
  vehicleCount: number;
}

@Component({
  selector: 'app-vehicle-list',
  templateUrl: 'vehicle-list.component.html',
  styleUrls: ['../shared/table.scss'],
})
export class VehicleListComponent {
  modelService: NgbModal = inject(NgbModal);

  title: string = 'Danh sách biển số xe';
  data: RowItemModel[] = [];

  trackById(_: any, item: RowItemModel) {
    return item.id;
  }

  add() {
    this.modelService
      .open(AddVehicleListComponent, {
        size: 'lg',
      })
      .closed.subscribe(({ data }) => {
        this.data.push(
          Object.assign(data, {
            id: v4(),
          })
        );
      });
  }

  remove(item: RowItemModel) {
    this.data = this.data.filter((e) => e.id !== item.id);
  }
}
