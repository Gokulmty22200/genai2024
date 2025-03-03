import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialModule } from '../../material.module';
import { TicketService } from '../../services/ticket.service';
import { CI, IpTrafficData } from '../../interface/change-ticket.interface';
import { ServiceNowService } from 'src/app/services/service-now.service';

interface FirewallCI {
  operational_status: string;
  managed_by: string;
  name: string;
  serial_number: string;
  owned_by: string;
  ip_address: string;
  install_date: string;
  model_id: string;
  managed_by_group: string;
}

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
  isLoading = true;
  
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
    const sortedValue = this.generateRandomCIData();
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

  private generateRandomCIData(): any[] {
    const firewallIPs = ['10.0.60.1', '10.0.70.1'];
    const ciIPs = ['10.100.11.11', '10.100.11.12', '10.100.11.13', '10.100.12.10'];
    
    // Randomly select number of firewalls (1 or 2)
    const numFirewalls = Math.floor(Math.random() * 2) + 1;
    // Randomly select number of CIs (1 to 4)
    const numCIs = Math.floor(Math.random() * 4) + 1;
    
    // Randomly select firewall IPs
    const selectedFirewallIPs = [...firewallIPs]
      .sort(() => 0.5 - Math.random())
      .slice(0, numFirewalls);
      
    // Randomly select CI IPs
    const selectedCIIPs = [...ciIPs]
      .sort(() => 0.5 - Math.random())
      .slice(0, numCIs);
  
    const firewalls: FirewallCI[] = selectedFirewallIPs.map(ip => ({
      operational_status: "1",
      managed_by: "",
      name: "Firewall",
      serial_number: "",
      owned_by: "",
      ip_address: ip,
      install_date: "2025-02-06 09:38:04",
      model_id: "",
      managed_by_group: ""
    }));
  
    const selectedCIs: FirewallCI[] = selectedCIIPs.map(ip => ({
      operational_status: "1",
      managed_by: "",
      name: `Application Server ${ip.split('.').pop()}`,
      serial_number: `APP-SERVER${ip.split('.').pop()}-Icon-2025`,
      owned_by: "",
      ip_address: ip,
      install_date: "2025-02-06 09:11:40",
      model_id: "",
      managed_by_group: ""
    }));
  
    return [{
      firewall: firewalls,
      selectedCI: selectedCIs
    }];
  }
}
