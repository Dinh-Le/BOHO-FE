import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { DeviceService } from 'src/app/data/service/device.service';
import { ToastService } from '@app/services/toast.service';
import { LocationPickerComponent } from './location-picker/location-picker.component';
import { Device } from 'src/app/data/schema/boho-v2/device';
import { LatLng } from 'src/app/data/schema/boho-v2/latlng';
import {
  Level3Menu,
  NavigationService,
  SideMenuItemType,
} from 'src/app/data/service/navigation.service';
import {
  CameraDriver_Onvif,
  CameraDriver_RTSP,
  HoChiMinhCoord,
} from 'src/app/data/constants';
import { Subscription, filter, finalize, of, switchMap, tap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-camera-info',
  templateUrl: 'camera-info.component.html',
  styleUrls: ['camera-info.component.scss', '../../shared/my-input.scss'],
  host: {
    class: 'flex-grow-1 d-flex flex-column my-bg-default px-5 pb-5 pt-1',
  },
})
export class CameraInfoComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  private _nodeId: string = '';
  private _deviceId: string = '';
  private _device!: Device;

  form = new FormGroup({
    name: new FormControl<string>('', [Validators.required]),
    address: new FormControl<string>('', [Validators.required]),
    location: new FormControl<LatLng>(HoChiMinhCoord, [Validators.required]),
    driverName: new FormControl<string>({ value: '', disabled: true }, [
      Validators.required,
    ]),
    typeName: new FormControl<string>({ value: '', disabled: true }, [
      Validators.required,
    ]),
    rtspUrl: new FormControl<string>({ value: '', disabled: true }, [
      Validators.required,
    ]),
  });
  isLoading: boolean = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private deviceService: DeviceService,
    private toastService: ToastService,
    private navigationService: NavigationService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.navigationService.level3 = Level3Menu.DEVICE_INFO;

    const activatedRouteSubscription = this.activatedRoute
      .parent!.params.pipe(filter(({ nodeId, cameraId }) => nodeId && cameraId))
      .subscribe(({ nodeId, cameraId: deviceId }) => {
        this.initialize({ nodeId, deviceId });
        this.loadData().subscribe({
          error: (err: HttpErrorResponse) =>
            this.toastService.showError(
              `Fetch data failed with error: ${
                err.error?.message ?? err.message
              }`
            ),
        });
      });

    this.subscriptions.push(activatedRouteSubscription);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  changeAddress() {
    const modal = this.modalService.open(LocationPickerComponent, {
      size: 'xl',
      centered: true,
    });
    const { lat, long } = this.form.get('location')!.value!;
    modal.componentInstance.latLng = {
      lat: parseFloat(lat),
      lng: parseFloat(long),
    };

    modal.result
      .then(({ lat, lng }) => {
        this.form.get('location')?.setValue({
          lat: lat.toString(),
          long: lng.toString(),
        });
      })
      .catch(() => {
        // dismiss, ignore
      });
  }

  cancel() {
    this.loadData().subscribe({
      error: (err: HttpErrorResponse) =>
        this.toastService.showError(
          `Fetch data failed with error: ${err.error?.message ?? err.message}`
        ),
    });
  }

  submit() {
    this.form.disable();

    this.deviceService
      .update(this._nodeId, this._deviceId, {
        name: this.form.get('name')!.value!,
        address: this.form.get('address')!.value!,
        location: this.form.get('location')!.value!,
        is_active: this._device.is_active,
        type: this._device.type,
        camera: {
          driver: this._device.camera.driver,
          type: this._device.camera.type,
          connection_metadata: this._device.camera.connection_metadata,
        },
      })
      .subscribe({
        error: (err: HttpErrorResponse) =>
          this.toastService.showError(err.error?.message ?? err.message),
        complete: () => {
          this.toastService.showSuccess('Update the camera successfully');
          this.navigationService.treeItemChange$.next({
            type: SideMenuItemType.DEVICE,
            action: 'update',
            data: {
              id: this._deviceId,
              name: this.form.get('name')?.value,
            },
          });
          this.form.enable();
        },
      });
  }

  private initialize({ nodeId, deviceId }: any) {
    this._nodeId = nodeId;
    this._deviceId = deviceId;
    this.form.reset();
  }

  private loadData() {
    return this.deviceService.find(this._nodeId, this._deviceId).pipe(
      tap(() => {
        this.form.disable();
      }),
      switchMap(({ data: device }) => {
        this._device = device;

        let rtspUrl = '';
        switch (this._device.camera.driver) {
          case CameraDriver_RTSP:
            rtspUrl =
              this._device.camera.connection_metadata.rtsp?.rtsp_url || '';
            break;
          case CameraDriver_Onvif:
            rtspUrl =
              this._device.camera.connection_metadata.onvif?.rtsp_url || '';
            break;
          default:
            break;
        }

        this.form.setValue({
          name: this._device.name,
          address: this._device.address ?? '',
          driverName: this._device.camera.driver,
          typeName: this._device.camera.type,
          rtspUrl,
          location: this._device.location,
        });

        return of(true);
      }),
      finalize(() => this.form.enable())
    );
  }
}
