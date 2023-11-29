import { ViewMode } from '../components/tree-view/view-mode.enum';
import { TreeViewItemModel } from '../components/tree-view/tree-view-item.model';
import {
  Device,
  Group,
  NodeOperator,
  Node,
  GroupManagement,
} from 'src/app/data/schema/boho-v2';

export class DeviceTreeBuilder {
  private readonly NodeOperatorIcon = 'bi bi-folder-fill';
  private readonly NodeIcon = 'bi bi-projector-fill';
  private readonly DeviceIcon = 'bi bi-camera-video-fill';
  private _viewMode = ViewMode.None;

  static readonly NodeOperatorIDPrefix = 'node-operator-';
  static readonly NodeIDPrefix = 'node-';
  static readonly DeviceIDPrefix = 'device-';

  private _nodeOperators: NodeOperator[] = [];
  private _nodes: Node[] = [];
  private _devices: Device[] = [];
  private _groups: Group[] = [];
  private _groupManagements: GroupManagement[] = [];

  setViewMode(viewMode: ViewMode): DeviceTreeBuilder {
    this._viewMode = viewMode;
    return this;
  }

  setNodeOperators(nodeOperators: NodeOperator[]): DeviceTreeBuilder {
    this._nodeOperators = nodeOperators;
    return this;
  }

  setNodes(nodes: Node[]): DeviceTreeBuilder {
    this._nodes = nodes;
    return this;
  }

  setGroups(groups: Group[]): DeviceTreeBuilder {
    this._groups = groups;
    return this;
  }

  setGroupManagements(groupManagements: GroupManagement[]): DeviceTreeBuilder {
    this._groupManagements = groupManagements;
    return this;
  }

  setDevices(devices: Device[]): DeviceTreeBuilder {
    this._devices = devices;
    return this;
  }

  build(): TreeViewItemModel {
    const root = new TreeViewItemModel(
      'user-0',
      'Admin',
      this.NodeOperatorIcon
    );

    if (this._viewMode === ViewMode.Logical) {
      for (const nodeOperator of this._nodeOperators) {
        const item = new TreeViewItemModel(
          DeviceTreeBuilder.NodeOperatorIDPrefix + nodeOperator.id,
          nodeOperator.name,
          this.NodeOperatorIcon
        );
        item.data = nodeOperator;
        root.add(item);
      }

      for (const node of this._nodes) {
        const nodeOperatorItem = root.find(
          DeviceTreeBuilder.NodeOperatorIDPrefix + node.node_operator_id
        );
        if (!nodeOperatorItem) {
          continue;
        }

        const nodeItem = new TreeViewItemModel(
          DeviceTreeBuilder.NodeIDPrefix + node.id,
          node.name,
          this.NodeIcon
        );
        nodeItem.data = node;
        nodeOperatorItem.add(nodeItem);
      }

      for (const device of this._devices) {
        const nodeItem = root.find(
          DeviceTreeBuilder.NodeIDPrefix + device.node_id
        );
        if (!nodeItem) {
          continue;
        }

        const deviceItem = new TreeViewItemModel(
          DeviceTreeBuilder.DeviceIDPrefix + device.id,
          device.name,
          this.DeviceIcon
        );
        deviceItem.data = device;
        nodeItem.add(deviceItem);
      }
    } else {
      for (const group of this._groups) {
        const item = new TreeViewItemModel(
          group.id,
          group.name,
          this.NodeOperatorIcon
        );
        item.data = group;
        root.add(item);
      }

      for (const device of this._devices) {
        const groupId = this._groupManagements.find(
          (e) => e.device_id === device.id
        )?.group_id;
        if (!groupId) {
          continue;
        }

        const groupItem = root.find(groupId);
        if (!groupItem) {
          continue;
        }

        const item = new TreeViewItemModel(
          device.id,
          device.name,
          this.DeviceIcon
        );
        item.data = device;
        groupItem.add(item);
      }
    }

    root.expandAll();

    return root;
  }
}
