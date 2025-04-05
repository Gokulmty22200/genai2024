import { Component, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin, map, switchMap } from 'rxjs';

import { ChangeTicket } from 'src/app/interface/change-ticket.interface';
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
    const dates = {
      'CHG0030005': '04-15-2025',
      'CHG0030006': '04-15-2025',
      'CHG0030008': '04-15-2025'
    };
    this.serviceNow.getChangeTicketData()
      .pipe(
        switchMap((ticketData: any) => {
          // Store the ticket data
          const tickets = ticketData.result;
          
          // Create an array of observables for each ticket's impacted CIs
          const ciRequests = tickets.map((ticket: any) => 
            this.serviceNow.getImpactedCIs(ticket.number.value).pipe(
              map(impactedCIsResponse => ({
                ticketNumber: ticket.number.value,
                ciNames: impactedCIsResponse.result
                  .map((ci: any) => ci.ci_item.display_value)
                  .join(', ')
              }))
            )
          );

          // Combine all CI requests
          return forkJoin(ciRequests).pipe(
            map((ciResults: any) => {
              // Create a map of ticket numbers to their CI names
              const ciMap = new Map(
                ciResults.map((result: any) => [result.ticketNumber, result.ciNames])
              );
              console.log(tickets);

              // Update each ticket with its corresponding CIs
              return tickets.map((ticket: { number: { value: keyof typeof dates }, cmdb_ci: any }) => ({
                ...ticket,
                cmdb_ci: {
                  ...ticket.cmdb_ci,
                  display_value: ciMap.get(ticket.number.value) || '',
                  date: dates[ticket.number.value] || ''
                }
              }));
            })
          );
        })
      )
      .subscribe({
        next: (processedData: any) => {
          this.dataSource.data = processedData;
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
        },
        error: (error: any) => {
          console.error('Error fetching data:', error);
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
