import { Component } from '@angular/core';

interface CameraChannel {
  name: string;
  selected?: boolean;
}

interface Camera {
  name: string;
  expanded?: boolean;
  channels: CameraChannel[];
  selected?: boolean;
}

interface Server {
  name: string;
  expanded?: boolean;
  cameras: Camera[];
  selected?: boolean;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  mode: string = 'by-group';
  servers: Server[] = [
    {
      name: 'Node name A',
      expanded: true,
      cameras: [
        {
          name: 'Channel group 1',
          expanded: true,
          channels: [
            {
              name: 'Channel name 1',
            },
            {
              name: 'Channel name 2',
            },
          ],
        },
        {
          name: 'Channel group 2',
          channels: [
            {
              name: 'Channel name 1',
            },
            {
              name: 'Channel name 2',
            },
          ],
        },
        {
          name: 'Channel group 3',
          channels: [
            {
              name: 'Channel name 1',
            },
            {
              name: 'Channel name 2',
            },
          ],
        },
      ],
    },
    {
      name: 'Node name B',
      cameras: [
        {
          name: 'Channel group 1',
          channels: [
            {
              name: 'Channel name 1',
            },
            {
              name: 'Channel name 2',
            },
          ],
        },
        {
          name: 'Channel group 2',
          channels: [
            {
              name: 'Channel name 1',
            },
            {
              name: 'Channel name 2',
            },
          ],
        },
        {
          name: 'Channel group 3',
          channels: [
            {
              name: 'Channel name 1',
            },
            {
              name: 'Channel name 2',
            },
          ],
        },
      ],
    },
    {
      name: 'Node name C',
      cameras: [
        {
          name: 'Channel group 1',
          channels: [
            {
              name: 'Channel name 1',
            },
            {
              name: 'Channel name 2',
            },
          ],
        },
        {
          name: 'Channel group 2',
          channels: [
            {
              name: 'Channel name 1',
            },
            {
              name: 'Channel name 2',
            },
          ],
        },
        {
          name: 'Channel group 3',
          channels: [
            {
              name: 'Channel name 1',
            },
            {
              name: 'Channel name 2',
            },
          ],
        },
      ],
    },
  ];

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
}
