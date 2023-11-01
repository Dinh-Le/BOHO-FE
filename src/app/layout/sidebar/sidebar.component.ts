import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  inject,
} from '@angular/core';
import { ToastService } from '@app/services/toast.service';
import { Store } from '@ngrx/store';
import { catchError, finalize } from 'rxjs';
import { Device } from 'src/app/data/schema/boho-v2/device';
import { CameraData } from 'src/app/data/service/camera.service';
import { DeviceData } from 'src/app/data/service/device.service';
import { NodeManagementService } from 'src/app/data/service/node.service';
import { SidebarActions } from 'src/app/state/sidebar.action';
import { SidebarState } from 'src/app/state/sidebar.state';

interface CameraChannel {
  id: string;
  name: string;
  selected?: boolean;
  cameraId: string;
  serverId: string;
}

interface Camera {
  id: string;
  serverId: string;
  name: string;
  device: Device;
  expanded?: boolean;
  channels: CameraChannel[];
  selected?: boolean;
  isLoaded?: boolean;
  isLoading?: boolean;
  isSelectable?: boolean;
  isExpandable?: boolean;
}

interface Server {
  id: string;
  name: string;
  expanded?: boolean;
  cameras: Camera[];
  selected?: boolean;
  isLoaded?: boolean;
  isLoading?: boolean;
  isSelectable?: boolean;
  isExpandable?: boolean;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
  private nodeService = inject(NodeManagementService);
  private deviceService = inject(DeviceData);
  private cameraService = inject(CameraData);
  private eRef = inject(ElementRef);
  private store = inject(Store<{ sidebar: SidebarState }>);
  private toastService = inject(ToastService);

  mode: string = 'by-node';
  servers: Server[] = [];
  autoHideEnabled: boolean = false;

  ngOnInit(): void {
    this.nodeService.findAll().subscribe((response) => {
      this.servers = response.data.map((node) => ({
        id: node.id,
        name: node.name,
        cameras: [],
        isExpandable: true,
        isSelectable: false,
      }));
    });
  }

  trackById(_: number, item: any) {
    return item.id;
  }

  toggleServer(server: Server) {
    if (!server.isLoaded) {
      this.loadServer(server);
    }

    server.expanded = !server.expanded;
  }

  toggleCamera(camera: Camera) {
    if (!camera.isLoaded) {
      this.loadCamera(camera);
    }

    camera.expanded = !camera.expanded;
  }

  onServerSelectionChanged(server: Server): void {
    server.cameras.forEach((camera) => {
      if (camera.selected != server.selected) {
        camera.selected = server.selected;
        this.onCameraSelectionChanged(camera);
      }
    });
  }

  onCameraSelectionChanged(camera: Camera, server?: Server): void {
    camera.channels.forEach((channel) => (channel.selected = camera.selected));

    if (!camera.selected && server) {
      server.selected = false;
    }

    if (camera.selected) {
      this.store.dispatch(SidebarActions.addDevice({ device: camera.device }));
    } else {
      this.store.dispatch(
        SidebarActions.removeDevice({ device: camera.device })
      );
    }
  }

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      if (this.autoHideEnabled) {
        this.store.dispatch(SidebarActions.hide());
      }
    }
  }

  private loadServer(server: Server): void {
    server.isLoading = true;
    server.isExpandable = false;
    server.isSelectable = false;
    this.deviceService
      .findAll(server.id)
      .pipe(
        catchError((_, response) => response),
        finalize(() => {
          server.isLoading = false;
          server.isLoaded = true;
        })
      )
      .subscribe((response) => {
        if (response.success) {
          server.cameras = response.data.map((device) => ({
            id: device.id,
            name: device.region,
            channels: [],
            device: device,
            serverId: server.id,
            isExpandable: true,
            isSelectable: false,
          }));
          server.isExpandable = true;
          server.isSelectable = true;
        } else {
          this.toastService.showError(response.message);
        }
      });
  }

  private loadCamera(camera: Camera): void {
    camera.isLoading = true;
    camera.isExpandable = false;
    camera.isSelectable = false;

    this.cameraService
      .findAll(camera.serverId, camera.id)
      .pipe(
        catchError((_, response) => response),
        finalize(() => {
          camera.isLoading = false;
          camera.isLoaded = true;
        })
      )
      .subscribe((response) => {
        if (response.success) {
          camera.channels = [
            {
              id: response.data.id,
              name: response.data.manufacture,
              cameraId: camera.id,
              serverId: camera.serverId,
            },
          ];
          camera.isExpandable = true;
          camera.isSelectable = true;
        } else {
          this.toastService.showError(response.message);
        }
      });
  }
}
