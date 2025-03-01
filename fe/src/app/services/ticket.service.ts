import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { ChangeTicket } from '../interface/change-ticket.interface';
import { CI } from '../interface/change-ticket.interface';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private apiUrl = environment.apiUrl;
  private serviceNowUrl = environment.serviceNowUrl;
  // private apiUrl = 'https://dev221653.service-now.com/api/now/table/change_request';
  // private serviceNowUrl = '/api/now/table';
  private queryParams = 'sysparm_query=short_descriptionLIKEicon&sysparm_fields=cmdb_ci%2Cnumber%2Cstate%2Crisk_impact_analysis%2Ccategory%2Clocation%2Crisk%2Cunauthorized%2Cconflict_last_run%2Ccab_date_time%2Csys_tags%2Con_hold%2Csys_mod_count%2Cdue_date%2Capproval%2Ccomments%2Cactivity_due%2Cjustification%2Ccompany%2Cscope%2Curgency%2Ccab_required%2Ccontact_type%2Csys_id%2Cclose_notes%2Ccalendar_duration%2Con_hold_reason%2Cdescription%2Cassignment_group%2Cclose_code%2Cwork_notes%2Cphase_state%2Cwork_end%2Copened_at%2Cexpected_start%2Cchg_model%2Ctime_worked%2Cbusiness_service%2Creview_comments%2Cclosed_at%2Croute_reason%2Csys_domain%2Con_hold_task%2Csys_created_on%2Cuser_input%2Copened_by%2Csys_updated_by%2Ctask_effective_number%2Cconflict_status%2Cbackout_plan%2Cmade_sla%2Ccorrelation_id%2Cupon_approval%2Cescalation%2Ccomments_and_work_notes%2Csla_due%2Cassigned_to%2Cstart_date%2Creassignment_count%2Creview_status%2Cfollow_up%2Cclosed_by%2Cservice_offering%2Csys_class_name%2Cstd_change_producer_version%2Cadditional_assignee_list%2Coutside_maintenance_schedule%2Cdelivery_task%2Cwork_start%2Ccorrelation_display%2Cshort_description%2Cend_date%2Cuniversal_request%2Cimplementation_plan%2Capproval_set%2Cchange_plan%2Cgroup_list%2Cbusiness_duration%2Crequested_by%2Creview_date%2Cproduction_system%2Ccab_recommendation%2Csys_domain_path%2Cpriority%2Cwork_notes_list%2Cactive%2Ccontract%2Cimpact%2Cdelivery_plan%2Cphase%2Corder%2Cknowledge%2Csys_created_by%2Crequested_by_date%2Ccab_delegate%2Ctest_plan%2Capproval_history%2Ctype%2Csys_updated_on%2Cupon_reject%2Cwatch_list%2Cparent%2Creason&sysparm_limit=10&sysparm_display_value=all';

  constructor(private http: HttpClient) { }

  getChangeTicketData(): Observable<ChangeTicket[]> {
    this.serviceNowUrl = '/api/now/table';
    this.queryParams = 'sysparm_query=short_descriptionLIKEicon&sysparm_fields=cmdb_ci%2Cnumber%2Cstate%2Crisk_impact_analysis%2Ccategory%2Clocation%2Crisk%2Cunauthorized%2Cconflict_last_run%2Ccab_date_time%2Csys_tags%2Con_hold%2Csys_mod_count%2Cdue_date%2Capproval%2Ccomments%2Cactivity_due%2Cjustification%2Ccompany%2Cscope%2Curgency%2Ccab_required%2Ccontact_type%2Csys_id%2Cclose_notes%2Ccalendar_duration%2Con_hold_reason%2Cdescription%2Cassignment_group%2Cclose_code%2Cwork_notes%2Cphase_state%2Cwork_end%2Copened_at%2Cexpected_start%2Cchg_model%2Ctime_worked%2Cbusiness_service%2Creview_comments%2Cclosed_at%2Croute_reason%2Csys_domain%2Con_hold_task%2Csys_created_on%2Cuser_input%2Copened_by%2Csys_updated_by%2Ctask_effective_number%2Cconflict_status%2Cbackout_plan%2Cmade_sla%2Ccorrelation_id%2Cupon_approval%2Cescalation%2Ccomments_and_work_notes%2Csla_due%2Cassigned_to%2Cstart_date%2Creassignment_count%2Creview_status%2Cfollow_up%2Cclosed_by%2Cservice_offering%2Csys_class_name%2Cstd_change_producer_version%2Cadditional_assignee_list%2Coutside_maintenance_schedule%2Cdelivery_task%2Cwork_start%2Ccorrelation_display%2Cshort_description%2Cend_date%2Cuniversal_request%2Cimplementation_plan%2Capproval_set%2Cchange_plan%2Cgroup_list%2Cbusiness_duration%2Crequested_by%2Creview_date%2Cproduction_system%2Ccab_recommendation%2Csys_domain_path%2Cpriority%2Cwork_notes_list%2Cactive%2Ccontract%2Cimpact%2Cdelivery_plan%2Cphase%2Corder%2Cknowledge%2Csys_created_by%2Crequested_by_date%2Ccab_delegate%2Ctest_plan%2Capproval_history%2Ctype%2Csys_updated_on%2Cupon_reject%2Cwatch_list%2Cparent%2Creason&sysparm_limit=10&sysparm_display_value=all';
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
    this.serviceNowUrl = '/api/now/table/cmdb_ci'
    this.queryParams = 'sysparm_query=nameINFirewall%2CApplication%20Server%2001%2CCUST-DB-01%2CGlobal%20App%20Server%2002%2CApplication%20Load%20balancer%2CWeb%20Application%2001%2CWeb%20Application%2002&sysparm_fields=name%2Cserial_number%2Cip_address%2Cinstall_date%2Cowned_by%2Cmodel_id%2Cmanaged_by_group%2Cmanaged_by%2Coperational_status';
    const headers = new HttpHeaders()
    .set('Authorization', 'Basic ' + btoa('Virtusaicon:Virtusa25@'))
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json');

  const url = `${this.serviceNowUrl}?${this.queryParams}`;
  return this.http.get<any>(url, { headers });
  }

  processRelationship(relationData: any): Observable<any> {
    const headers = new HttpHeaders()
    .set('Content-Type', 'application/json');

  return this.http.post(`${this.apiUrl}/ci/processCIData`, relationData, { headers });
  }

  processIpData(selectedIp: any): Observable<any> {
    const headers = new HttpHeaders()
    .set('Content-Type', 'application/json');

  return this.http.post(`${this.apiUrl}/ci/processIpData`, selectedIp, { headers });
  }

  getAppInfo(): string {
    if (!environment.production && environment.enableDebug) {
      console.log(`Running ${environment.appName} version ${environment.version}`);
    }
    return environment.appName;
  }
}