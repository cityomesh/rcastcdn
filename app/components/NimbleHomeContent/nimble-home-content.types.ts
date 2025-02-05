export interface Server {
  id: string;
  display_name: string;
}

export interface RouteServerAssignment {
  id?: string;
  priority: number;
  route_kind: string;
  from: string;
  to: string;
  servers: Server[];
}
