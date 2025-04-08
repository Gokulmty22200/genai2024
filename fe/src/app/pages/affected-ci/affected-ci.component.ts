import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { MaterialModule } from 'src/app/material.module';
import { ServiceNowService } from 'src/app/services/service-now.service';
import { TicketService } from 'src/app/services/ticket.service';

interface ImpactAnalysis {
  impactedCIs: string;
  directImpact: string[];
  partialImpact: string[];
  infrastructureComponents: string[];
  metadata: {
    totalImpactedComponents: number;
    directlyImpactedCount: number;
    partiallyImpactedCount: number;
    infrastructureComponentsCount: number;
  };
  severity: string;
  changeDetails: {
    changeId: string;
    description: string;
    category: string;
    implementationDate: string;
  };
}

@Component({
  selector: 'app-affected-ci',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './affected-ci.component.html',
  styleUrl: './affected-ci.component.scss'
})
export class AffectedCiComponent {
  @Input() impactData: any;

  loading = false;
  hasData = false;
  // impactData?: ImpactAnalysis;
  changeData: any;

  constructor(private ticketService: TicketService, private serviceNow : ServiceNowService, private route: ActivatedRoute ) {}
  
    
    ngOnInit(): void {
      this.route.queryParams.subscribe((params: any) => {
        if (params['data']) {
          this.changeData = JSON.parse(params['data']);
          console.log('Change Data:', this.changeData);
          switch(this.changeData.changeId) {
            case 'CHG0030005':
              this.impactData.directImpact = ['IDEAWORKS application'];
              this.impactData.partialImpact = [
                'Middleware Application 02',
                'Web Application 02',
                'Web Application 01',
                'Middleware Application 01'
              ];
              break;
              
            case 'CHG0030006':
              this.impactData.directImpact = ['IDEAWORKS application'];
              this.impactData.partialImpact = [`No Partially Affected CI's`];
              break;
              
            case 'CHG0030008':
              this.impactData.directImpact = [
                'IDEAWORKS application',
                'Cryst Application'
              ];
              this.impactData.partialImpact = [
                'Middleware Application 02',
                'Web Application 02',
                'Web Application 01',
                'Middleware Application 01'
              ];
              break;
          }
          console.log('IMP',this.impactData);
      }
      });
      // this.getRelationshipData();
    }
  
    getRelationshipData(): void {
    this.loading = true;
        this.serviceNow.getRelationshipData()
          .subscribe({
            next: (data: any) => {
              console.log(data.result);
              this.processImpactedCI(data.result);
            },
            error: (error: any) => {
              console.error('Error fetching Relationship data:', error);
            }
          });
      }

       processImpactedCI(data: any): void {
    this.loading = true;
    let impactData = this.changeData;
    impactData.relationships = data;
    
    this.ticketService.processImpactedCI(impactData)
      .subscribe({
        next: (response: any) => {
          if (response?.success && response?.data) {
            this.impactData = response.data;
            this.hasData = true;
          } else {
            this.hasData = false;
          }
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Error fetching Impacted Data:', error);
          this.hasData = false;
          this.loading = false;
        }
      });
  }

  getSeverityColor(severity: string): string {
    switch (severity?.toUpperCase()) {
      case 'HIGH': return 'red';
      case 'MEDIUM': return 'orange';
      case 'LOW': return 'green';
      default: return 'grey';
    }
  }
}
