import { Component, ViewChild } from '@angular/core';
import { ChangeTicket } from 'src/app/interface/change-ticket.interface';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';

import { MaterialModule } from '../../material.module';
import { TicketService } from '../../services/ticket.service';
import { ServiceNowService } from 'src/app/services/service-now.service';

@Component({
  selector: 'app-change-ticket',
  standalone: true,
  imports: [MaterialModule, DatePipe],
  templateUrl: './change-ticket.component.html',
  styleUrl: './change-ticket.component.scss'
})
export class ChangeTicketComponent {
  displayedColumns: string[] = [
    'changeId',
    'creationDate',
    'description',
    'impactedCIs',
    'implementationDate',
    'category',
    // 'implementer',
    'impactAnalysis'
  ];
  
  dataSource!: MatTableDataSource<ChangeTicket>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private ticketService: TicketService, private serviceNow : ServiceNowService, private router: Router, ) {
    // Initialize with empty array of ChangeTicket type
    this.dataSource = new MatTableDataSource<ChangeTicket>([]);
  }

  ngOnInit() {
    this.getChangeTicketData();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  getChangeTicketData(): void {
    this.serviceNow.getChangeTicketData()
      .subscribe({
        next: (data: any) => {
          console.log(data.result);
          this.dataSource.data = data.result;
        },
        error: (error: any) => {
          console.error('Error fetching change tickets:', error);
        }
      });
  }

  navigateToImpactAnalysis(changeData: any): void {
    const navigationData = {
      changeId: changeData.number?.value,
      description: changeData.short_description?.value,
      category: changeData.category?.value,
      implementationDate: changeData.expected_start?.value,
      impactedCIs: changeData.cmdb_ci?.display_value,
  };

  this.router.navigate(['/extra/impact-analysis'], {
      queryParams: { data: JSON.stringify(navigationData) }
  });
}
}
