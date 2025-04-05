import { Injectable } from '@angular/core';
import { map, mergeMap, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { ChangeTicket } from '../interface/change-ticket.interface';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ServiceNowService {

  //For Production 
    private serviceNowUrl = 'https://dev221653.service-now.com/api/now';

    //For Local
    // private serviceNowUrl = '/api/now';
    
    queryParams?: string;
  constructor(private http: HttpClient) { }

  getChangeTicketData(): Observable<ChangeTicket[]> {
    // this.serviceNowUrl = '/api/now/table';
    this.queryParams = 'sysparm_query=numberINCHG0030008%2CCHG0030006%2CCHG0030005&sysparm_fields=reason%2Cparent%2Cwatch_list%2Cupon_reject%2Csys_updated_on%2Ctype%2Capproval_history%2Ctest_plan%2Cnumber%2Ccab_delegate%2Crequested_by_date%2Cstate%2Csys_created_by%2Cknowledge%2Corder%2Cphase%2Ccmdb_ci%2Cdelivery_plan%2Cimpact%2Ccontract%2Cactive%2Cwork_notes_list%2Cpriority%2Csys_domain_path%2Ccab_recommendation%2Cproduction_system%2Creview_date%2Crequested_by%2Cbusiness_duration%2Cgroup_list%2Cchange_plan%2Capproval_set%2Cimplementation_plan%2Cuniversal_request%2Cend_date%2Cshort_description%2Ccorrelation_display%2Cwork_start%2Cdelivery_task%2Coutside_maintenance_schedule%2Cadditional_assignee_list%2Cstd_change_producer_version%2Csys_class_name%2Cservice_offering%2Cclosed_by%2Cfollow_up%2Creview_status%2Creassignment_count%2Cstart_date%2Cassigned_to%2Csla_due%2Ccomments_and_work_notes%2Cescalation%2Cupon_approval%2Ccorrelation_id%2Cmade_sla%2Cbackout_plan%2Cconflict_status%2Ctask_effective_number%2Csys_updated_by%2Copened_by%2Cuser_input%2Csys_created_on%2Con_hold_task%2Csys_domain%2Croute_reason%2Cclosed_at%2Creview_comments%2Cbusiness_service%2Ctime_worked%2Cchg_model%2Cexpected_start%2Copened_at%2Cwork_end%2Cphase_state%2Cwork_notes%2Cclose_code%2Cassignment_group%2Cdescription%2Con_hold_reason%2Ccalendar_duration%2Cclose_notes%2Csys_id%2Ccontact_type%2Ccab_required%2Curgency%2Cscope%2Ccompany%2Cjustification%2Cactivity_due%2Ccomments%2Capproval%2Cdue_date%2Csys_mod_count%2Con_hold%2Csys_tags%2Ccab_date_time%2Cconflict_last_run%2Cunauthorized%2Crisk%2Clocation%2Ccategory%2Crisk_impact_analysis&sysparm_display_value=all';
    const url = `${this.serviceNowUrl}/table/change_request?${this.queryParams}`;
    const headers = new HttpHeaders()
      .set('Authorization', 'Basic ' + btoa('Virtusaicon:Virtusa25@'))
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json');

    return this.http.get<ChangeTicket[]>(url, { headers });
  }

  getRelationshipData(): Observable<any> {
    // this.serviceNowUrl = '/api/now/table/cmdb_rel_ci'
    this.queryParams = 'sysparm_query=sys_created_by%3Dadmin&sysparm_fields=parent%2Cconnection_strength%2Csys_mod_count%2Csys_updated_on%2Ctype%2Csys_tags%2Csys_id%2Csys_updated_by%2Cport%2Csys_created_on%2Cpercent_outage%2Csys_created_by%2Cchild&sysparm_display_value=all';
    const headers = new HttpHeaders()
    .set('Authorization', 'Basic ' + btoa('Virtusaicon:Virtusa25@'))
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json');

  const url = `${this.serviceNowUrl}/table/cmdb_rel_ci?${this.queryParams}`;

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
    this.queryParams = `sysparm_query=sys_created_by%3Dadmin%5Esys_created_onBETWEENjavascript%3Ags.dateGenerate('2025-02-05'%2C'00%3A00%3A00')%40javascript%3Ags.dateGenerate('2025-03-21'%2C'23%3A59%3A59')&sysparm_fields=attested_date%2Cskip_sync%2Coperational_status%2Cproduct_instance_id%2Csys_updated_on%2Cattestation_score%2Cdiscovery_source%2Cfirst_discovered%2Csys_updated_by%2Cdue_in%2Csys_created_on%2Csys_domain%2Cinstall_date%2Cinvoice_number%2Cgl_account%2Csys_created_by%2Cwarranty_expiration%2Casset_tag%2Cfqdn%2Cchange_control%2Cowned_by%2Cchecked_out%2Csys_domain_path%2Cbusiness_unit%2Cdelivery_date%2Cmaintenance_schedule%2Cinstall_status%2Ccost_center%2Cattested_by%2Csupported_by%2Cdns_domain%2Cname%2Cassigned%2Cpurchase_date%2Clife_cycle_stage%2Csubcategory%2Cshort_description%2Cassignment_group%2Cmanaged_by%2Cmanaged_by_group%2Clast_discovered%2Ccan_print%2Csys_class_name%2Cmanufacturer%2Csys_id%2Cpo_number%2Cchecked_in%2Csys_class_path%2Cvendor%2Clife_cycle_stage_status%2Cmac_address%2Ccompany%2Cmodel_number%2Cjustification%2Cdepartment%2Cassigned_to%2Cstart_date%2Ccost%2Ccomments%2Cattestation_status%2Csys_mod_count%2Cserial_number%2Cmonitor%2Cmodel_id%2Cip_address%2Cduplicate_of%2Csys_tags%2Ccost_cc%2Csupport_group%2Corder_date%2Cschedule%2Cenvironment%2Cdue%2Cattested%2Cunverified%2Ccorrelation_id%2Cattributes%2Clocation%2Casset%2Ccategory%2Cfault_count%2Clease_id`;
    const headers = new HttpHeaders()
    .set('Authorization', 'Basic ' + btoa('Virtusaicon:Virtusa25@'))
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json');

  const url = `${this.serviceNowUrl}/table/cmdb_ci?${this.queryParams}`;
  return this.http.get<any>(url, { headers });
  }

  getImpactedCIs(ticketId: string): Observable<any> {
    this.queryParams = `sysparm_fields=ci_item%2Ctask&task=${ticketId}&sysparm_display_value=all`;
    const headers = new HttpHeaders()
    .set('Authorization', 'Basic ' + btoa('Virtusaicon:Virtusa25@'))
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json');

  const url = `${this.serviceNowUrl}/table/task_ci?${this.queryParams}`;
  return this.http.get<any>(url, { headers });
  }

  getArchitectureDiagram(imageParams: string): Observable<Blob> {
    const headers = new HttpHeaders()
    .set('Authorization', 'Basic ' + btoa('Virtusaicon:Virtusa25@'))
    .set('Accept', '*/*')
    .set('Content-Type', '*/*');
  const url = `${this.serviceNowUrl}/attachment/${imageParams}/file`;
    return this.http.get(url, {
      headers,responseType: 'blob'
    });
  }
  
  getChangeScript(sriptParams: string): Observable<Blob> {
    const headers = new HttpHeaders()
    .set('Authorization', 'Basic ' + btoa('Virtusaicon:Virtusa25@'))
    .set('Accept', '*/*')
    .set('Content-Type', '*/*');
  const url = `${this.serviceNowUrl}/attachment/${sriptParams}/file`;
  return this.http.get(url, {
    headers,
    responseType: 'blob'
  });
  }
}
