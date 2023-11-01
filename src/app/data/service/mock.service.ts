import { Observable, of } from 'rxjs';
import {
  GetCameraListResponse,
  GetCameraResponse,
  CreateOrUpdateCameraRequest,
} from '../schema/boho-v2/camera';
import { ResponseBase } from '../schema/boho-v2/response-base';
import { CameraData } from './camera.service';
import { camera, devices, nodes } from './mock-data';
import { Injectable } from '@angular/core';
import { DeviceData } from './device.service';
import {
  GetDeviceListResponse,
  GetDeviceResponse,
  CreateOrUpdateDeviceRequest,
} from '../schema/boho-v2/device';
import { NodeManagementService } from './node.service';
import {
  GetNodesResponse,
  NodeDetailedResponse,
  CreateNodeRequest,
  UpdateNodeRequest,
} from '../schema/boho-v2/node';

@Injectable()
export class MockCameraService extends CameraData {
  override findAll(
    nodeId: string,
    deviceId: string
  ): Observable<GetCameraListResponse> {
    const response: GetCameraListResponse = {
      success: true,
      message: '',
      data: camera.find((e) => e.id === deviceId)!,
    };
    return of(response);
  }
  override find(
    nodeId: string,
    deviceId: string,
    id: string
  ): Observable<GetCameraResponse> {
    throw new Error('Method not implemented.');
  }
  override create(
    nodeId: string,
    deviceId: string,
    request: CreateOrUpdateCameraRequest
  ): Observable<ResponseBase> {
    throw new Error('Method not implemented.');
  }
  override update(
    nodeId: string,
    deviceId: string,
    id: string,
    request: CreateOrUpdateCameraRequest
  ): Observable<ResponseBase> {
    throw new Error('Method not implemented.');
  }
  override delete(
    nodeId: string,
    deviceId: string,
    id: string
  ): Observable<ResponseBase> {
    throw new Error('Method not implemented.');
  }
}

@Injectable()
export class MockDeviceService extends DeviceData {
  override findAll(nodeId: string): Observable<GetDeviceListResponse> {
    const response: GetDeviceListResponse = {
      success: true,
      message: '',
      data: devices.filter((e) => e.node_id === nodeId),
    };
    return of(response);
  }
  override find(nodeId: string, id: string): Observable<GetDeviceResponse> {
    throw new Error('Method not implemented.');
  }
  override create(
    nodeId: string,
    request: CreateOrUpdateDeviceRequest
  ): Observable<ResponseBase> {
    throw new Error('Method not implemented.');
  }
  override update(
    nodeId: string,
    id: string,
    request: CreateOrUpdateDeviceRequest
  ): Observable<ResponseBase> {
    throw new Error('Method not implemented.');
  }
  override delete(nodeId: string, id: string): Observable<ResponseBase> {
    throw new Error('Method not implemented.');
  }
}

@Injectable()
export class MockNodeService extends NodeManagementService {
  override findAll(): Observable<GetNodesResponse> {
    const response: GetNodesResponse = {
      success: true,
      message: '',
      data: nodes,
    };
    return of(response);
  }
  override find(id: string): Observable<NodeDetailedResponse> {
    throw new Error('Method not implemented.');
  }
  override create(request: CreateNodeRequest): Observable<ResponseBase> {
    throw new Error('Method not implemented.');
  }
  override update(
    id: string,
    updateNodeRequest: UpdateNodeRequest
  ): Observable<ResponseBase> {
    throw new Error('Method not implemented.');
  }
  override delete(id: string): Observable<ResponseBase> {
    throw new Error('Method not implemented.');
  }
  override sync(id: string): Observable<ResponseBase> {
    throw new Error('Method not implemented.');
  }
}
