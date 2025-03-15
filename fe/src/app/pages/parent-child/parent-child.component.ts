import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

import { MaterialModule } from 'src/app/material.module';
import { ServiceNowService } from 'src/app/services/service-now.service';
import { TicketService } from 'src/app/services/ticket.service';


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

@Component({
  selector: 'app-parent-child',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './parent-child.component.html',
  styleUrl: './parent-child.component.scss'
})
export class ParentChildComponent implements OnInit{
  loading = true;
  hasData = false;
  hierarchicalNodes: Node[] = [];
  componentMap = new Map<string, string>();

  constructor(private ticketService: TicketService, private serviceNow : ServiceNowService ) {}

  ngOnInit(): void {
    this.getRelationshipData();
  }

  getRelationshipData(): void {
    this.loading = true;
      this.serviceNow.getRelationshipData()
        .subscribe({
          next: (data: any) => {
            console.log(data.result);
            this.processRelationshipData(data.result);
          },
          error: (error: any) => {
            console.error('Error fetching Relationship data:', error);
          }
        });
    }

    processRelationshipData(data: HierarchyResponse): void {
      this.loading = true;
      this.ticketService.processRelationship(data)
        .subscribe({
          next: (response) => {
            if (response?.data?.hierarchy) {
              try {
                this.hierarchicalNodes = response.data.hierarchy;
                
                // Build the component map first
                this.componentMap.clear();
                this.hierarchicalNodes.forEach(node => {
                  this.componentMap.set(node.id, node.componentName);
                });
  
                // Sort the nodes after mapping is complete
                this.hierarchicalNodes = this.hierarchicalNodes.sort((a, b) => {
                  if (a.parents.length === 0 && b.parents.length > 0) return -1;
                  if (b.parents.length === 0 && a.parents.length > 0) return 1;
                  return b.children.length - a.children.length;
                });
  
                this.hasData = this.hierarchicalNodes.length > 0;
                
                // Debug logging
                // console.log('Component Map:', Array.from(this.componentMap.entries()));
                // console.log('Hierarchical Nodes:', this.hierarchicalNodes);
              } catch (error) {
                console.error('Error processing hierarchy:', error);
                this.hasData = false;
              }
            } else {
              this.hasData = false;
            }
            this.loading = false;
          },
          error: (error) => {
            console.error('Error processing relationship data:', error);
            this.hasData = false;
            this.loading = false;
          }
        });
    }
  
    getComponentName(id: string): string {
      const name = this.componentMap.get(id);
      if (!name) {
        return id;
      }
      return name;
    }
  
    isRootNode(node: Node): boolean {
      return node.parents.length === 0;
    }
  
    isLeafNode(node: Node): boolean {
      return node.children.length === 0;
    }
    }
