import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';

import { MaterialModule } from 'src/app/material.module';
import { ServiceNowService } from 'src/app/services/service-now.service';
import { TicketService } from 'src/app/services/ticket.service';


interface Node {
  id: string;
  componentName: string;
  children: string[];
  parents: string[];
  relationships: { [key: string]: string };
  runsOn: {
    runsOnParents: string[];
    runsOnChildren: string[];
  };
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
  @Input() relationshipData: any;
  loading = false;
  hasData = false;
  hierarchicalNodes: Node[] = [];
  componentMap = new Map<string, string>();

  constructor(private ticketService: TicketService, private serviceNow : ServiceNowService ) {}

  ngOnInit(): void {
    if (this.relationshipData) {
      this.processData(this.relationshipData);
    }
  }

  private processData(data: any): void {
    try {
      this.hierarchicalNodes = data.hierarchy;
      
      // Build component map
      this.componentMap.clear();
      this.hierarchicalNodes.forEach(node => {
        this.componentMap.set(node.id, node.componentName);
      });

      // Sort nodes
      this.hierarchicalNodes = this.hierarchicalNodes.sort((a, b) => {
        if (a.parents.length === 0 && b.parents.length > 0) return -1;
        if (b.parents.length === 0 && a.parents.length > 0) return 1;
        return b.children.length - a.children.length;
      });

      this.hasData = this.hierarchicalNodes.length > 0;
    } catch (error) {
      console.error('Error processing hierarchy data:', error);
      this.hasData = false;
    }
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

    getFilteredParents(node: Node): string[] {
      return node.parents.filter(parentId => 
        !this.isRunsOnComponent(parentId, node)
      );
    }
  
    getFilteredChildren(node: Node): string[] {
      return node.children.filter(childId => 
        !this.isRunsOnComponent(childId, node)
      );
    }
  
    getRunsOnComponents(node: Node): string[] {
      return [
        ...node.runsOn.runsOnParents,
        ...node.runsOn.runsOnChildren
      ];
    }
  
    private isRunsOnComponent(componentId: string, node: Node): boolean {
      const componentName = this.getComponentName(componentId);
      return node.runsOn.runsOnParents.includes(componentName) || 
             node.runsOn.runsOnChildren.includes(componentName);
    }
  
    shouldShowAssociatedApps(node: Node): boolean {
      return this.getRunsOnComponents(node).length > 0;
    }
  }
