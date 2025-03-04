import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { ChangeTicket } from '../interface/change-ticket.interface';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ServiceNowService {

    private serviceNowUrl = 'https://dev221653.service-now.com/api/now/table';
    // private serviceNowUrl = '/api/now/table';
    
    queryParams?: string;
  constructor(private http: HttpClient) { }

  getChangeTicketData(): Observable<ChangeTicket[]> {
    // this.serviceNowUrl = '/api/now/table';
    this.queryParams = 'sysparm_query=cmdb_ci%3Dadee2bad832312101767e270ceaad370%5EORcmdb_ci%3Dd69e2fad832312101767e270ceaad356%5EORcmdb_ci%3D0089abe9832312101767e270ceaad3cc&sysparm_fields=reason%2Cparent%2Cwatch_list%2Cupon_reject%2Csys_updated_on%2Ctype%2Capproval_history%2Ctest_plan%2Cnumber%2Ccab_delegate%2Crequested_by_date%2Cstate%2Csys_created_by%2Cknowledge%2Corder%2Cphase%2Ccmdb_ci%2Cdelivery_plan%2Cimpact%2Ccontract%2Cactive%2Cwork_notes_list%2Cpriority%2Csys_domain_path%2Ccab_recommendation%2Cproduction_system%2Creview_date%2Crequested_by%2Cbusiness_duration%2Cgroup_list%2Cchange_plan%2Capproval_set%2Cimplementation_plan%2Cuniversal_request%2Cend_date%2Cshort_description%2Ccorrelation_display%2Cwork_start%2Cdelivery_task%2Coutside_maintenance_schedule%2Cadditional_assignee_list%2Cstd_change_producer_version%2Csys_class_name%2Cservice_offering%2Cclosed_by%2Cfollow_up%2Creview_status%2Creassignment_count%2Cstart_date%2Cassigned_to%2Csla_&sysparm_display_value=all';
    const url = `${this.serviceNowUrl}/change_request?${this.queryParams}`;
    const headers = new HttpHeaders()
      .set('Authorization', 'Basic ' + btoa('Virtusaicon:Virtusa25@'))
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json');

    return this.http.get<ChangeTicket[]>(url, { headers });
  }

  getRelationshipData(): Observable<any> {
    // this.serviceNowUrl = '/api/now/table/cmdb_rel_ci'
    this.queryParams = 'sysparm_query=sys_created_by%3Dadmin&sysparm_fields=parent%2Ctype%2Cchild&sysparm_limit=30&sysparm_display_value=all';
    const headers = new HttpHeaders()
    .set('Authorization', 'Basic ' + btoa('Virtusaicon:Virtusa25@'))
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json');

  const url = `${this.serviceNowUrl}/cmdb_rel_ci?${this.queryParams}`;

  return this.http.get<any>(url, { headers }).pipe(
    map(response => ({
      result: response.result.map((item: any) => ({
        parent: {
          name: item.parent.display_value,
          value: item.parent.value
        },
        child: {
          name: item.child.display_value,
          value: item.child.value
        },
        type: {
          name: item.type.display_value,
          value: item.type.value
        }
      }))
    }))
  );
  }

  getIpData(): Observable<any> {
    // this.serviceNowUrl = '/api/now/table/cmdb_ci'
    this.queryParams = 'sysparm_query=nameINFirewall%2CApplication%20Server%2001%2CCUST-DB-01%2CGlobal%20App%20Server%2002%2CApplication%20Load%20balancer%2CWeb%20Application%2001%2CWeb%20Application%2002&sysparm_fields=name%2Cserial_number%2Cip_address%2Cinstall_date%2Cowned_by%2Cmodel_id%2Cmanaged_by_group%2Cmanaged_by%2Coperational_status';
    const headers = new HttpHeaders()
    .set('Authorization', 'Basic ' + btoa('Virtusaicon:Virtusa25@'))
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json');

  const url = `${this.serviceNowUrl}/cmdb_ci?${this.queryParams}`;
  return this.http.get<any>(url, { headers });
  }
}
