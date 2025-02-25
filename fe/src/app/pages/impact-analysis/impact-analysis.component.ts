import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialModule } from '../../material.module';
import { TicketService } from '../../services/ticket.service';

@Component({
  selector: 'app-impact-analysis',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './impact-analysis.component.html',
  styleUrl: './impact-analysis.component.scss'
})
export class ImpactAnalysisComponent {
  hierarchyData: any;
  
  constructor(private ticketService: TicketService ) {
    this.getRelationshipData();
  }

  getRelationshipData(): void {
    this.ticketService.getRelationshipData()
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
}
