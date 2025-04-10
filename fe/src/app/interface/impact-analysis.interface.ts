export interface Node {
  id: string;
  componentName: string;
  children: string[];
  parents: string[];
}

export interface HierarchyResponse {
  success: boolean;
  message: string;
  data: {
    hierarchy: Node[];
    metadata: {
      totalComponents: number;
      rootNodes: number;
      leafNodes: number;
    };
  };
}

export interface TrafficData {
  teams: TeamData[];
  metadata: {
    totalTeams: number;
    impactSummary: {
      affected: number;
      direct: number;
      partial: number;
    };
    severity: string;
  };
  affectedCIs: [{
    name: string;
    category: string;
    subcategory: string;
  }];
}

export interface TeamData {
  team: string;
  records: {
    deviceVendor: string[];
    destination: string;
    ports: PortData[];
    ciName: string;
    impactType: string;
  }[];
}

export interface PortData {
  id: string;
  eventId: string;
}

export interface PortProtocolGroup {
  protocol: string;
  ports: {
    id: string;
    eventId: string;
  }[];
}

export interface changeData {
  changeId: string;
  impactedCIs?: any;
  category: string;
  description: string;
  implementationDate: string;
}

export interface ImageUrls {
  [key: string]: string;
}