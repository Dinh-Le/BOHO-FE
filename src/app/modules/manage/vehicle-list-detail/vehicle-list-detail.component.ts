import { Component } from '@angular/core';

interface RowItemModel {
  name: string;
  desc: string;
  expiresDate: Date;
}

@Component({
  selector: 'app-vehicle-list-detail',
  templateUrl: 'vehicle-list-detail.component.html',
  styleUrls: ['../shared/table.scss'],
})
export class VehicleListDetailComponent {
  title: string = 'Xe mất cắp';
  data: RowItemModel[] = [
    {
      name: '51A-38785',
      desc: 'Xe mất cắp',
      expiresDate: new Date(),
    },
    {
      name: '51A-38785',
      desc: 'Xe mất cắp',
      expiresDate: new Date(),
    },
    {
      name: '51A-38785',
      desc: 'Xe mất cắp',
      expiresDate: new Date(),
    },
  ];
}
