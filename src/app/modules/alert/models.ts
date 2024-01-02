export type EventInfo = Partial<{
  checked: boolean;
  seen: boolean;
  severity: Partial<{
    id: string;
    name: string;
  }>[];
  state: 'accepted' | 'rejected' | 'important' | 'none';
  location: Partial<{
    lat: string;
    lng: string;
  }>;
  imgUrl: string;
  camera: Partial<{
    id: string;
    name: string;
  }>;
  preset: Partial<{
    id: string;
    name: string;
  }>;
  rule: Partial<{
    id: string;
    name: string;
  }>;
  color: string;
  object: Partial<{
    id: string;
    icon: string;
    name: string;
  }>;
  datetime: string;
}>;
