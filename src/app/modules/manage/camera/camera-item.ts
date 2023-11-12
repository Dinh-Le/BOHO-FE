export interface CameraItem {
  id: string;
  name: string;
  type: string;
  node: string;
  status: string;
  driverType?: string;
  rtspUrl: string;
  rtspUsername?: string;
  rtspPassword?: string;
  onvifIp?: string;
  onvifPort?: string;
  onvifRtspUrl?: string;
  onvifProfile?: string;
  onvifUsername?: string;
  onvifPassword?: string;
  milestoneIp?: string;
  milestonePort?: string;
  milestoneAuthType?: string;
  milestoneUsername?: string;
  milestonePassword?: string;
  milestoneCamera?: string;
  milestoneRtspUrl?: string;
  isExpanded?: boolean;
  isEditMode?: boolean;
  isNew?: boolean;
}

export const cameraListMockData: CameraItem[] = [
  {
    id: '1',
    name: 'Cổng chính',
    rtspUrl: 'rtsp://192.168.100.236/cam0_0',
    type: 'Cố định',
    node: 'Jetson AGX',
    status: 'Tốt',
  },
  {
    id: '2',
    name: 'Cổng nội bộ',
    rtspUrl: 'rtsp://192.168.100.237/cam0_0',
    type: 'PTZ',
    node: 'Jetson AGX',
    status: 'Có lỗi',
  },
  {
    id: '3',
    name: 'Cổng sau',
    rtspUrl: 'rtsp://192.168.100.238/cam0_0',
    type: 'PTZ',
    node: 'Jetson AGX',
    status: 'Tốt',
  },
  {
    id: '4',
    name: 'Nhà kho',
    rtspUrl: 'rtsp://192.168.100.239/cam0_0',
    type: 'PTZ',
    node: 'Jetson AGX',
    status: 'Mất kết nối',
  },
];
