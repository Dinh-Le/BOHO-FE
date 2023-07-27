import { Component } from '@angular/core';

interface CameraChannel {
  name: string;
}

interface Camera {
  name: string;
  expanded?: boolean;
  channels: CameraChannel[];
}

interface Server {
  name: string;
  expanded?: boolean;
  cameras: Camera[];
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
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
}
