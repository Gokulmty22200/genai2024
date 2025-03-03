import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialModule } from '../../material.module';
import { TicketService } from '../../services/ticket.service';
import { CI, IpTrafficData } from '../../interface/change-ticket.interface';
import { ServiceNowService } from 'src/app/services/service-now.service';

@Component({
  selector: 'app-impact-analysis',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './impact-analysis.component.html',
  styleUrl: './impact-analysis.component.scss'
})
export class ImpactAnalysisComponent {
  hierarchyData: any;
  trafficData: any[] = [];
  isLoading = false;
  
  constructor(private ticketService: TicketService, private serviceNow : ServiceNowService ) {
    this.getRelationshipData();
  }

  getRelationshipData(): void {
    this.serviceNow.getRelationshipData()
      .subscribe({
        next: (data: any) => {
          console.log(data.result);
          this.processRelationshipData(data.result);
          this.getIpData();
        },
        error: (error: any) => {
          console.error('Error fetching Relationship data:', error);
        }
      });
  }

  processRelationshipData(data: any): void {
    this.ticketService.processRelationship(data)
      .subscribe({
        next: (response: any) => {
          this.hierarchyData = response.data;
          console.log(this.hierarchyData);
        },
        error: (error: any) => {
          console.error('Error processing Relationship data:', error);
        }
      });
  }

  getIpData(): void {
    this.serviceNow.getIpData()
      .subscribe({
        next: (data: any) => {
          console.log(data.result);
          this.processIpData(this.getAffectedCI(data.result));
        },
        error: (error: any) => {
          console.error('Error fetching Ip data:', error);
        }
      });
  }

  getAffectedCI(data: CI[]): { 
    firewall: CI | null, selectedCI: CI | null } {
    const selectedCIName = "Application Server 01";
    
    // Find firewall and selected CI details
    const firewall = data.find(ci => ci.name.toLowerCase().includes('firewall'));
    const selectedCI = data.find(ci => ci.name === selectedCIName);
  
    return {
      firewall: firewall || null,
      selectedCI: selectedCI || null
    };
  }

  processIpData(data: { 
    firewall: CI | null, selectedCI: CI | null }): void {
    console.log('Sorted Ip',data);
     let sortedValue = [
      {
      "firewall": [{
          "operational_status": "1",
          "managed_by": "",
          "name": "Firewall",
          "serial_number": "",
          "owned_by": "",
          "ip_address": "10.0.60.1",
          "install_date": "2025-02-06 09:38:04",
          "model_id": "",
          "managed_by_group": ""
      }],
      "selectedCI": [{
          "operational_status": "1",
          "managed_by": "",
          "name": "Application Server 01",
          "serial_number": "APP-SERVER01-Icon-2025",
          "owned_by": "",
          "ip_address": "10.100.11.13",
          "install_date": "2025-02-06 09:11:40",
          "model_id": "",
          "managed_by_group": ""
      },
    ]
  }
  ];
  this.isLoading = true;
  this.ticketService.processIpData(sortedValue)
  .subscribe({
    next: (response: any) => {
      this.trafficData = response.data;
      console.log(response);
      this.isLoading = false;
    },
    error: (error: any) => {
      console.error('Error processing Ip data:', error);
      this.isLoading = false;
    }
  });
  }
}
