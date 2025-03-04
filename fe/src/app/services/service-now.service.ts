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
    this.queryParams = 'sysparm_query=cmdb_ci%3Dadee2bad832312101767e270ceaad370%5EORcmdb_ci%3Dd69e2fad832312101767e270ceaad356%5EORcmdb_ci%3D0089abe9832312101767e270ceaad3cc&sysparm_fields=cmdb_ci%2Cnumber%2Cstate%2Cshort_description%2Cdescription%2Cdue_date%2Clocation%2Crisk%2Crisk_impact_analysis%2Ccomments%2Cactivity_due%2Csys_id%2Cclose_notes%2Con_hold_reason%2Cassignment_group%2Cwork_end%2Copened_at%2Cexpected_start%2Ctime_worked%2Creview_comments%2Cactive%2Cimpact&sysparm_limit=10&sysparm_display_value=all';
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
