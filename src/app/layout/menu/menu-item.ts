export interface MenuItem {
  id: string;
  label: string;
  onclick: (item: MenuItem) => void;
  icon?: string;
  data?: any;
  children?: MenuItem[];
}
