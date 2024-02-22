import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ExpandableTableRowItemModelBase } from '../expandable-table/expandable-table.component';
import { Device } from 'src/app/data/schema/boho-v2';
import { SelectItemModel } from '@shared/models/select-item-model';
import {
  CameraDriver_RTSP,
  CameraDriver_Onvif,
  CameraDriver_Milestone,
  DeviceStatus_Good,
  DeviceStatus_Disconnected,
  DeviceStatus_Failure,
} from 'src/app/data/constants';

export class RowItemModel extends ExpandableTableRowItemModelBase {
  id = '';
  status = DeviceStatus_Disconnected;
  form: FormGroup<any>;
  onvifProfiles: SelectItemModel[] = [];

  constructor(device: Device) {
    super();
    this.form = new FormGroup<any>({
      name: new FormControl<string>('', [Validators.required]),
      is_active: new FormControl<boolean>(true, [Validators.required]),
      type: new FormControl<string>('', [Validators.required]),
      driver: new FormControl<SelectItemModel | undefined>(
        device.camera?.driver
          ? ({
              label: device.camera?.driver,
              value: device.camera?.driver,
            } as SelectItemModel)
          : undefined,
        [Validators.required]
      ),
      group: new FormControl<SelectItemModel | undefined>(undefined, [
        Validators.required,
      ]),
    });
    this.update(device);
  }

  update(device: Device) {
    this.id = device.id;

    this.form.reset({
      name: device.name,
      is_active: device.is_active,
      type: device.camera?.type,
      driver: device.camera?.driver
        ? ({
            label: device.camera?.driver,
            value: device.camera?.driver,
          } as SelectItemModel)
        : undefined,
    });
    this.updateCameraForm(device);
  }

  get name() {
    return this.form.get('name')?.value;
  }

  get isActive() {
    return this.form.get('is_active')?.value;
  }

  get type() {
    return this.form.get('type')?.value;
  }

  get rtspUrl() {
    return this.form.get('camera')?.get('rtspUrl')?.value;
  }

  get canSubmit() {
    return !this.form.invalid;
  }

  get driver() {
    return this.form.get('driver')?.value?.value;
  }

  get ip() {
    return this.form.get('camera')?.get('ip')?.value;
  }

  get httpPort() {
    return this.form.get('camera')?.get('httpPort')?.value;
  }

  get userId() {
    return this.form.get('camera')?.get('userId')?.value;
  }

  get password() {
    return this.form.get('camera')?.get('password')?.value;
  }

  get onvifProfileName() {
    return this.form.get('camera')?.get('profile')?.value?.label;
  }

  get isRtsp() {
    return this.driver === CameraDriver_RTSP;
  }

  get isOnvif() {
    return this.driver === CameraDriver_Onvif;
  }

  get isMilestone() {
    return this.driver === CameraDriver_Milestone;
  }

  get isGood() {
    return this.status === DeviceStatus_Good;
  }

  get isDisconnected() {
    return this.status === DeviceStatus_Disconnected;
  }

  get isFailure() {
    return this.status === DeviceStatus_Failure;
  }

  get group() {
    return this.form.get('group')?.value;
  }

  updateCameraForm(device?: Device): void {
    switch (this.driver) {
      case CameraDriver_RTSP:
        this.form.setControl(
          'camera',
          new FormGroup<any>({
            rtspUrl: new FormControl(
              device?.camera.connection_metadata.rtsp?.rtsp_url,
              [Validators.required]
            ),
            userId: new FormControl(
              device?.camera.connection_metadata.rtsp?.user
            ),
            password: new FormControl(
              device?.camera.connection_metadata.rtsp?.password
            ),
          })
        );
        break;
      case CameraDriver_Onvif:
        const onvif = device?.camera.connection_metadata.onvif;
        this.form.setControl(
          'camera',
          new FormGroup<any>({
            ip: new FormControl<string>(onvif?.ip || '', [Validators.required]),
            httpPort: new FormControl<number>(onvif?.http_port || 80, [
              Validators.required,
            ]),
            userId: new FormControl<string>(onvif?.user || '', [
              Validators.required,
            ]),
            password: new FormControl<string>(onvif?.password || '', [
              Validators.required,
            ]),
            profile: new FormControl<SelectItemModel | null>(null, [
              Validators.required,
            ]),
            rtspUrl: new FormControl<string>(
              {
                value: onvif?.rtsp_url || '',
                disabled: true,
              },
              [Validators.required]
            ),
          })
        );
        this.form
          .get('camera')
          ?.get('profile')
          ?.valueChanges.subscribe((value: SelectItemModel) => {
            this.form.get('camera')?.get('rtspUrl')?.setValue(value.value);
          });
        break;
      case CameraDriver_Milestone:
        this.form.setControl(
          'camera',
          new FormGroup<any>({
            server: new FormControl(null, [Validators.required]),
            camera: new FormControl(null, [Validators.required]),
            rtspUrl: new FormControl(null, [Validators.required]),
          })
        );
        break;
      default:
        break;
    }
  }
}
