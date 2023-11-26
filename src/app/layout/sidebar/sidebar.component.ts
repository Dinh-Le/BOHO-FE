import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { ToastService } from '@app/services/toast.service';
import { Store, select } from '@ngrx/store';
import {
  catchError,
  finalize,
  mergeAll,
  mergeMap,
  of,
  switchMap,
  take,
  zip,
} from 'rxjs';
import { Device, DeviceMetadata } from 'src/app/data/schema/boho-v2/device';
import { Node } from 'src/app/data/schema/boho-v2/node';
import { NodeOperator } from 'src/app/data/schema/boho-v2/node-operator';
import { DeviceService } from 'src/app/data/service/device.service';
import { NodeOperatorService } from 'src/app/data/service/node-operator.service';
import { NodeService } from 'src/app/data/service/node.service';
import { UserService } from 'src/app/data/service/user.service';
import { SidebarActions } from 'src/app/state/sidebar.action';
import { SidebarState } from 'src/app/state/sidebar.state';
import { MenuItem } from '../menu/menu-item';
import { MenuComponent } from '../menu/menu.component';
import { JWTTokenService } from '@app/services/jwt-token.service';

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
  private nodeOperatorService = inject(NodeOperatorService);
  private nodeService = inject(NodeService);
  private deviceService = inject(DeviceService);
  private eRef = inject(ElementRef);
  private store: Store<{ sidebar: SidebarState }> = inject(
    Store<{ sidebar: SidebarState }>
  );
  private toastService = inject(ToastService);

  @ViewChild('menu') menu!: ElementRef;

  mode: string = 'by-node';
  servers: Server[] = [];
  autoHideEnabled: boolean = false;
  userId = '0';
  nodes: Node[] = [];
  devices: Device[] = [];
  nodeOperators: NodeOperator[] = [];
  menuItems: MenuItem[] = [
    {
      id: this.userId,
      label: 'Admin',
      level: 'user',
      onclick: this.onMenuItemClick.bind(this),
      icon: 'bi bi-user',
      children: [],
    },
  ];
  selectedMenuItem: MenuItem | undefined;

  ngOnInit(): void {
    this.nodeOperatorService
      .findAll()
      .pipe(
        switchMap((response) => {
          if (!response.success) {
            throw Error('Fetch node operator data failed');
          }

          this.nodeOperators = response.data;
          return this.nodeService.findAll(this.userId);
        })
      )
      .pipe(
        mergeMap((response) => {
          if (!response.success) {
            throw Error('Fetch node data failed');
          }

          this.nodes = response.data;
          return zip(
            this.nodes.map((node) =>
              this.deviceService.findAll(node.id)
            )
          );
        }),
        mergeAll(),
        catchError((error) => {
          console.error('Error: ', error);
          this.toastService.showError(error);
          return of(null);
        }),
        finalize(() => {
          console.log('Node operator:', this.nodeOperators);
          console.log('Node', this.nodes);
          console.log('Device', this.devices);
          for (const nodeOperator of this.nodeOperators) {
            const nodeOperatorMenuItem: MenuItem = {
              id: nodeOperator.id,
              label: nodeOperator.name,
              level: 'node_operator',
              onclick: this.onMenuItemClick.bind(this),
              icon: 'bi bi-folder-fill',
              children: [],
            };

            for (const node of this.nodes) {
              if (node.node_operator_id !== nodeOperator.id) {
                continue;
              }

              const nodeMenuItem: MenuItem = {
                id: node.id,
                label: node.name,
                level: 'node',
                onclick: this.onMenuItemClick.bind(this),
                icon: 'bi bi-projector-fill',
                children: this.devices
                  .filter((device) => device.node_id === node.id)
                  .map((device) => ({
                    id: device.id,
                    label: device.name,
                    level: 'device',
                    onclick: this.onMenuItemClick.bind(this),
                    icon: 'bi bi-camera-video-fill',
                  })),
              };

              nodeOperatorMenuItem.children?.push(nodeMenuItem);
            }

            this.menuItems[0].children?.push(nodeOperatorMenuItem);
          }
        })
      )
      .subscribe((response) => {
        if (!response?.success) {
          return;
        }

        this.devices.push(...response.data);
      });
  }

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      if (this.autoHideEnabled) {
        this.store.dispatch(SidebarActions.hide());
      }
    }
  }

  onMenuItemClick(item: MenuItem) {
    console.log('Select: ', item.label);
    this.selectedMenuItem = item;
    this.store.dispatch(SidebarActions.selectMenuItem({ item: item }));
  }
}
