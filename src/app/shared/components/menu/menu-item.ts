export interface MenuItem {
  id?: string;
  label: string;
  level?: string;
  onclick?: (item: MenuItem) => void;
  path?: string;
  icon?: string;
  data?: any;
  children?: MenuItem[];
  isSelected?: boolean;
}
