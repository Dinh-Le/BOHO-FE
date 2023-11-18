import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SelectItemModel } from '@shared/models/select-item-model';
import { v4 } from 'uuid';

interface PtzTour {
  id: string;
  startTime: number;
  endTime: number;
  left: string;
  width: string;
  day: SelectItemModel;
  // type: string;
  // patrol: SelectItemModel;
  color: SelectItemModel;
  selected: boolean;
}

@Component({
  selector: 'app-tour-settings',
  templateUrl: 'tour-settings.component.html',
  styleUrls: ['tour-settings.component.scss', '../../shared/my-input.scss'],
})
export class TourSettingsComponent implements OnInit {
  patrols: SelectItemModel[] = Array(5)
    .fill(0)
    .map((_, index) => ({
      value: index,
      label: `Hành trình ${index}`,
    }));
  colors: SelectItemModel[] = [
    {
      value: 'green',
      label: 'Xanh lá',
    },
    {
      value: 'magenta',
      label: 'Cánh xen',
    },
    {
      value: 'cyan',
      label: 'Xanh lơ',
    },
    {
      value: 'purple',
      label: 'Tím',
    },
    {
      value: 'orange',
      label: 'Cam',
    },
  ];
  daysInWeek: SelectItemModel[] = [
    'T.Hai',
    'T.Ba',
    'T.Tư',
    'T.Năm',
    'T.Sáu',
    'T.Bảy',
    'C.Nhật',
  ].map((e, index) => ({
    value: index,
    label: e,
  }));
  hoursInDay: number[] = Array(24)
    .fill(0)
    .map((_, index) => index);
  data: PtzTour[][] = Array(this.daysInWeek.length)
    .fill(0)
    .map(() => []);
  form: FormGroup = new FormGroup({
    startTime: new FormControl(0),
    endTime: new FormControl(0),
    day: new FormControl(null, [Validators.required]),
    type: new FormControl('patrol'),
    patrol: new FormControl(null, [Validators.required]),
    color: new FormControl(null, [Validators.required]),
  });
  selectedTour: PtzTour | undefined;

  ngOnInit(): void {}

  submit() {
    const { startTime, endTime, color, day } = this.form.value;
    if (startTime < endTime) {
      const left = (startTime * 100) / 1440;
      const width = ((endTime - startTime) * 100) / 1440;
      const tour: PtzTour = {
        id: v4(),
        startTime,
        endTime,
        day,
        color,
        left: `${left}%`,
        width: `${width}%`,
        selected: true,
      };
      if (this.selectedTour) {
        this.selectedTour.selected = false;
      }
      this.selectedTour = tour;
      this.data[day.value].push(tour);
    } else {
      alert('Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc');
    }
  }

  canSubmit() {
    return this.form.valid;
  }

  selectTour(tour: PtzTour) {
    if (this.selectedTour) {
      this.selectedTour.selected = false;
    }

    this.selectedTour = tour;
    this.selectedTour.selected = true;
  }

  deleteSelectedTour() {
    const day = this.selectedTour?.day.value;
    this.data[day] = this.data[day].filter(
      (e) => e.id !== this.selectedTour?.id
    );
    this.selectedTour = undefined;
  }

  deleteAll() {
    this.selectedTour = undefined;
    this.data = this.data.map(() => []);
  }
}
