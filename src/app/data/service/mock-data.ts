import { Camera } from '../schema/boho-v2/camera';
import { Device } from '../schema/boho-v2/device';
import { Node } from '../schema/boho-v2/node';

export const nodes: Node[] = [
  {
    id: '1',
    name: 'Node 1',
  },
  {
    id: '2',
    name: 'Node 2',
  },
  {
    id: '3',
    name: 'Node 3',
  },
];

export const devices: Device[] = [
  {
    id: '1',
    node_id: '1',
    region: 'CỬA HÀNG THỰC PHẨM SẠCH MINI 3 SIÊU',
    location: {
      lat: '10.8040588',
      long: '106.7788734',
    },
  },
  {
    id: '2',
    node_id: '1',
    region: 'Siêu thị Bách hóa XANH 623H Đỗ Xuân Hợp',
    location: {
      lat: '10.8045462',
      long: '106.7788883',
    },
  },
  {
    id: '3',
    node_id: '1',
    region: 'HIAN COFFEE',
    location: {
      lat: '10.8073085',
      long: '106.777591',
    },
  },
  {
    id: '4',
    node_id: '2',
    region: 'Nhà thuốc Thành Đạt',
    location: {
      lat: '10.8172609',
      long: '106.7739123',
    },
  },
  {
    id: '5',
    node_id: '2',
    region: 'Phước Bình Post Office',
    location: {
      lat: '10.817138',
      long: '106.7726137',
    },
  },
  {
    id: '6',
    node_id: '2',
    region: 'Fresh Sushi',
    location: {
      lat: '10.8173288',
      long: '106.7726553',
    },
  },
  {
    id: '7',
    node_id: '3',
    region: "Ben's Hamburger",
    location: {
      lat: '10.8773026',
      long: '106.7770614',
    },
  },
  {
    id: '8',
    node_id: '3',
    region: 'Coffee Thiên Nhiên',
    location: {
      lat: '10.8787625',
      long: '106.7755483',
    },
  },
  {
    id: '9',
    node_id: '3',
    region: 'Quán Bạn Tôi',
    location: {
      lat: '10.8778008',
      long: '106.7755654',
    },
  },
];

export const camera: Camera[] = [
  {
    id: '1',
    name: 'Camera 1',
    type: 'Static',
    manufacture: 'Hanwha',
  },
  {
    id: '2',
    name: 'Camera 2',
    type: 'PTZ',
    manufacture: 'Flexwatch',
  },
  {
    id: '3',
    name: 'Camera 3',
    type: 'Static',
    manufacture: 'Hanwha',
  },
  {
    id: '4',
    name: 'Camera 4',
    type: 'PTZ',
    manufacture: 'Flexwatch',
  },
  {
    id: '5',
    name: 'Camera 5',
    type: 'Static',
    manufacture: 'Hanwha',
  },
  {
    id: '6',
    name: 'Camera 6',
    type: 'PTZ',
    manufacture: 'Sony',
  },
  {
    id: '7',
    name: 'Camera 7',
    type: 'Static',
    manufacture: 'Hanwha',
  },
  {
    id: '8',
    name: 'Camera 8',
    type: 'PTZ',
    manufacture: 'Sony',
  },
  {
    id: '9',
    name: 'Camera 0',
    type: 'PTZ',
    manufacture: 'Flexwatch',
  },
];
