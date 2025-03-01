export interface ChangeTicket {
    number: string;
    sys_created_on: Date;
    short_description: string;
    cmdb_ci: string;
    start_date?: Date;
    category: string;
    implementer?: string;
    risk_impact_analysis: string;
  }

 export interface CI {
    name: string;
    ip_address: string;
    operational_status: string;
    serial_number: string;
    install_date: string;
  }

  export interface IpTrafficData {
    deviceVendor: string;
    source: string;
    destination: string;
    port: string;
    eventId: string;
  }