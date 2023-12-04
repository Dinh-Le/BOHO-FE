import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

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
  _router = inject(Router);

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

  back() {
    this._router.navigateByUrl('/manage/vehicle-list');
  }
}
