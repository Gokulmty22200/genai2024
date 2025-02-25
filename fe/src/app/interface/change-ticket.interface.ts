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