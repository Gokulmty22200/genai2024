import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialModule } from '../../material.module';
import { TicketService } from '../../services/ticket.service';
import { CI } from '../../interface/change-ticket.interface';
import { ServiceNowService } from 'src/app/services/service-now.service';
import { ActivatedRoute } from '@angular/router';
import { ParentChildComponent } from "../parent-child/parent-child.component";
import { AffectedCiComponent } from "../affected-ci/affected-ci.component";
import { forkJoin, map } from 'rxjs';

interface Node {
  id: string;
  componentName: string;
  children: string[];
  parents: string[];
}

interface HierarchyResponse {
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

interface TrafficData {
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

interface TeamData {
  team: string;
  records: {
    deviceVendor: string[];
    destination: string;
    ports: PortData[];
    ciName: string;
    impactType: string;
  }[];
}

interface PortData {
  id: string;
  eventId: string;
}

interface PortProtocolGroup {
  protocol: string;
  ports: {
    id: string;
    eventId: string;
  }[];
}

@Component({
  selector: 'app-impact-analysis',
  standalone: true,
  imports: [CommonModule, MaterialModule, ParentChildComponent, AffectedCiComponent],
  templateUrl: './impact-analysis.component.html',
  styleUrl: './impact-analysis.component.scss'
})
export class ImpactAnalysisComponent implements OnInit {
  trafficData: any[] = [];
  isLoading = true;
  changeData: any;
  selectedTab = 0;
  imagePath = 'assets/images/architecture_diagram.png';
  imageError = false;
  relationshipData: any = null;
  impactData: any = null
  uniquePorts: { port: string; eventId: string; protocol: string }[] = [];
  affectedCi: any = null;
  protocolGroups: PortProtocolGroup[] = [];
  ipData: any = null;

  constructor(private ticketService: TicketService, private serviceNow : ServiceNowService, private route: ActivatedRoute ) {
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params: any) => {
      if (params['data']) {
        this.changeData = JSON.parse(params['data']);
        console.log('Change Data:', this.changeData);
    }
    });
    this.getImpactedCIs();
    // this.getRelationshipData();
}

  getIpData(): void {
    this.serviceNow.getIpData()
      .subscribe({
        next: (data: any) => {
          console.log(data.result);
          this.ipData = data.result;
          this.getImpactAnalysis(this.getAffectedCI(data.result), this.relationshipData);
        },
        error: (error: any) => {
          console.error('Error fetching Ip data:', error);
        }
      });
  }

  getImpactedCIs(){
    this.serviceNow.getImpactedCIs(this.changeData.changeId)
      .subscribe({
        next: (data: { result: any }) => {
          if (!this.changeData) {
            this.changeData = {};
          }
          
          // Extract CI names from response and store in changeData
          this.changeData.impactedCIs = {
            result: data.result.map((item: any) => ({
              ci_item: {
                display_value: item.ci_item.display_value,
                link: item.ci_item.link,
                value: item.ci_item.value
              }
            }))
          };

          console.log('Impacted CIs:', this.changeData.impactedCIs);
          
          // Proceed with getting relationship data if needed
          this.getRelationshipData();
        },
        error: (error: any) => {
          console.error('Error fetching Impacted CIs:', error);
        }
      });
  }

  getAffectedCI(data: CI[]): { 
    firewall: CI | null, selectedCI: CI[] | null, otherCI: CI[] | null  } {
      const selectedCINames = this.changeData.impactedCIs.result
      .map((item: any) => item.ci_item.display_value);
    
    // Find firewall and selected CI details
    const firewall = data.find(ci => ci.name.toLowerCase().includes('firewall'));
    const selectedCIs = data.filter(ci => selectedCINames.includes(ci.name));
    const otherCI = data
  
  
    return {
      firewall: firewall || null,
      selectedCI: selectedCIs || null,
      otherCI: otherCI || null
    };
  }

  processIpData(): void {
    this.isLoading = true;
    this.ticketService.processIpData(this.impactData)
      .subscribe({
        next: (response: { data: TrafficData }) => {
          this.trafficData = response.data.teams;
          this.affectedCi = this.impactData.affectedCIs;
          this.setupPortData();
          this.isLoading = false;
          this.updateChangeImpactData();
        },
        error: (error) => {
          console.error('Error processing IP data:', error);
          this.isLoading = false;
        }
      });
  }

  private setupPortData(): void {
    const protocolMap = new Map<string, Set<string>>();
    const portDetailsMap = new Map<string, { id: string; eventId: string; protocol: string }>();

    // Collect all unique ports and their protocols
    this.trafficData.forEach(team => {
      team.records.forEach((record: any) => {
        record.ports?.forEach((port: any) => {
          if (port.id && port.protocol) {
            const key = `${port.id}-${port.protocol}`;
            if (!protocolMap.has(port.protocol)) {
              protocolMap.set(port.protocol, new Set());
            }
            protocolMap.get(port.protocol)?.add(port.id);
            portDetailsMap.set(key, {
              id: port.id,
              eventId: port.eventId || `${port.protocol} Access`,
              protocol: port.protocol
            });
          }
        });
      });
    });

    // Convert to array format
    this.protocolGroups = Array.from(protocolMap.entries()).map(([protocol, ports]) => ({
      protocol,
      ports: Array.from(ports).map(portId => {
        const key = `${portId}-${protocol}`;
        const details = portDetailsMap.get(key);
        return {
          id: portId,
          eventId: details?.eventId || ''
        };
      }).sort((a, b) => Number(a.id) - Number(b.id))
    })).sort((a, b) => a.protocol.localeCompare(b.protocol));

    // Update uniquePorts for table display
    this.uniquePorts = this.protocolGroups.flatMap(group => 
      group.ports.map(port => ({
        port: port.id,
        eventId: port.eventId,
        protocol: group.protocol
      }))
    );
  }

  getDisplayedColumns(): string[] {
    return ['protocol', ...this.getUniqueTeams()];
  }

  hasPortAccess(element: any, team: string): boolean {
    const teamData = this.trafficData.find(t => t.team === team);
    if (!teamData) return false;

    return teamData.records.some((record: any) => 
      record.ports?.some((p: any) => 
        p.id === element.port && 
        p.protocol === element.protocol
      )
    );
  }

  getUniqueTeams(): string[] {
    return [...new Set(this.trafficData.map(item => item.team))];
  }

  getPortDataSource() {
    const allPorts: any[] = [];
    this.trafficData.forEach(teamData => {
      teamData.records[0].port.forEach((port: any) => {
        if (!allPorts.find(p => p.port === port.id)) {
          allPorts.push({
            port: port.id,
            eventId: port.eventId.replace('Access over ', ''),
            teams: [teamData.team]
          });
        } else {
          const existingPort = allPorts.find(p => p.port === port.id);
          if (!existingPort.teams.includes(teamData.team)) {
            existingPort.teams.push(teamData.team);
          }
        }
      });
    });
    return allPorts;
  }

  handleImageError() {
    this.imageError = true;
  }

  getRelationshipData(): void {
    this.serviceNow.getRelationshipData()
      .subscribe({
        next: (data: any) => {
          this.processRelationshipData(data.result);
        },
        error: (error: any) => {
          console.error('Error fetching Relationship data:', error);
        }
      });
  }

  processRelationshipData(data: HierarchyResponse): void {
    this.ticketService.processRelationship(data)
      .subscribe({
        next: (response) => {
          if (response?.data?.hierarchy) {
            // Share the processed data with child components
            this.relationshipData = response.data;
            this.getIpData();
          }
        },
        error: (error) => {
          console.error('Error processing relationship data:', error);
        }
      });
  }

  getImpactAnalysis(data: any, relationshipData: any): void {
    const inputData = {affetcedCI: data, relationshipData: relationshipData };
    this.ticketService.getImpactAnalysis(inputData)
      .subscribe({
        next: (response) => {
          this.impactData = response.data;
          console.log(response);
          this.processIpData();
        },
        error: (error) => {
          console.error('Error processing relationship data:', error);
        }
      });
  }

  getImpactTypeClass(team: string): string {
    const record = this.trafficData
      .find(t => t.team === team)?.records[0];
    return record?.impactType || '';
  }
  
  isNewProtocolGroup(row: any): boolean {
    const index = this.uniquePorts.indexOf(row);
    if (index === 0) return true;
    return row.protocol !== this.uniquePorts[index - 1]?.protocol;
  }

  updateChangeImpactData(): void {
    console.log('Here');
    // Use existing data instead of making new API calls
    const formattedData = {
      change_id: this.changeData.changeId,
      change_description: this.changeData.description,
      impact: {
        affectedCIs: this.impactData.affectedCIs.map((ci: any) => ci.name),
        directImpact: this.impactData.directImpact || [],
        partialImpact: this.impactData.partialImpact || [],
        impactedIPs: this.impactData.impactedIPs || [],
        metadata: {
          totalComponents: this.impactData.metadata?.totalComponents || 0,
          directlyImpactedCount: this.impactData.metadata?.directlyImpactedCount || 0,
          partiallyImpactedCount: this.impactData.metadata?.partiallyImpactedCount || 0,
          impactedIPsCount: this.impactData.metadata?.impactedIPsCount || 0,
          affectedCICount: this.impactData.metadata?.affectedCICount || 0
        },
        severity: this.impactData.severity || 'MEDIUM',
        details: {
          affectedCIDetails: this.impactData.details?.affectedCIDetails || [],
          firewallDetails: this.impactData.details?.firewallDetails || {
            name: 'Web Application Firewall',
            ip: '10.70.1.1'
          }
        }
      },
      ipData: {
        teams: this.trafficData || [],
        metadata: {
          totalTeams: this.impactData.metadata?.totalTeams || 0,
          impactSummary: {
            affected: this.impactData.metadata?.impactSummary?.affected || 0,
            direct: this.impactData.metadata?.impactSummary?.direct || 0,
            partial: this.impactData.metadata?.impactSummary?.partial || 0
          },
          severity: this.impactData.severity || 'MEDIUM'
        },
        affectedCI: this.getAffectedCI(this.ipData) || {}
      }
    };
  
    // Send formatted data to updateChangeData endpoint
    this.ticketService.updateChangeImpactData(formattedData).subscribe({
      next: (response) => {
        console.log('Change impact data updated successfully:', response);
      },
      error: (error) => {
        console.error('Error updating change impact data:', error);
      }
    });
  }

}
