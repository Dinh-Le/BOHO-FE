export interface Milestone {
  id: number;
  name: string;
  communication_port: number;
  login_info: {
    host: string;
    port: number;
    user: string;
    password: string;
  };
  authen_type: string;
  status?: string;
}
