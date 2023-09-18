import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  inject,
} from '@angular/core';
import { ToastService } from '@app/services/toast.service';
import { Store } from '@ngrx/store';
import { catchError, finalize, tap } from 'rxjs';
import { CameraData } from 'src/app/data/service/camera.service';
import { DeviceData } from 'src/app/data/service/device.service';
import { NodeData } from 'src/app/data/service/node.service';
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
  private nodeService = inject(NodeData);
  private deviceService = inject(DeviceData);
  private cameraService = inject(CameraData);
  private eRef = inject(ElementRef);
  private store = inject(Store<{ sidebar: SidebarState }>);
  private toastService = inject(ToastService);

  mode: string = 'by-node';
  servers: Server[] = [];
  autoHideEnabled: boolean = false;

  ngOnInit(): void {
    this.nodeService.findAll().subscribe((reponse) => {
      this.servers = reponse.data.map((node) => ({
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

    server.expanded = !server.expanded;
  }

  toggleCamera(camera: Camera) {
    if (!camera.isLoaded) {
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

    camera.expanded = !camera.expanded;
  }

  onServerSelectionChanged(server: Server) {
    server.cameras.forEach((camera) => {
      camera.selected = server.selected;
      this.onCameraSelectionChanged(camera);
    });
  }

  onCameraSelectionChanged(camera: Camera, server?: Server) {
    camera.channels.forEach((channel) => (channel.selected = camera.selected));
    if (!camera.selected && server) {
      server.selected = false;
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
}
