import { Component, ViewChild } from '@angular/core';
import { MaterialModule } from 'src/app/material.module';
import { NgApexchartsModule, ChartComponent } from 'ng-apexcharts';

@Component({
  selector: 'app-category-tickets',
  standalone: true,
  imports: [MaterialModule, NgApexchartsModule],
  templateUrl: './category-tickets.component.html'
})
export class CategoryTicketsComponent {
  @ViewChild('chart') chart: ChartComponent = Object.create(null);
  public categoryChart: any;

  constructor() {
    this.categoryChart = {
      series: [{
        name: 'Change Tickets',
        data: [
          { x: 'Directory (Systems)', y: 21 },
          { x: 'Server (Systems)', y: 244 },
          { x: 'Web (Systems)', y: 7 },
          { x: 'Web (Application)', y: 102 },
          { x: 'Internet (Network)', y: 29 },
          { x: 'Load Balancer (Network)', y: 21 },
          { x: 'Private Network (Network)', y: 32 },
          { x: 'VPN (Network)', y: 1 },
          { x: 'Service (Security)', y: 23 },
          { x: 'Monitoring (Resource)', y: 18 },
          { x: 'Permissions (IAM)', y: 1 }
        ]
      }],
      chart: {
        type: 'bar',
        height: 500,
        toolbar: { show: false }
      },
      plotOptions: {
        bar: {
          horizontal: true,
          distributed: true,
          barHeight: '70%',
          dataLabels: {
            position: 'bottom'
          }
        }
      },
      xaxis: {
        type: 'category',
        title: {
          text: 'Tickets',
        },
        labels: {
          style: { 
            fontSize: '12px',
            style: {
              fontSize: '14px',
              fontWeight: 500
            }
          },
          formatter: function(value: string) {
            return value; // Show only subcategory name
          }
        },
        group: {
          groups: [
            { title: 'Systems (272)', cols: 3 },
            { title: 'Application (102)', cols: 1 },
            { title: 'Network (83)', cols: 4 },
            { title: 'Security (23)', cols: 1 },
            { title: 'Resource (18)', cols: 1 },
            { title: 'IAM (1)', cols: 1 }
          ],
          style: {
            fontSize: '13px',
            fontWeight: 600,
            colors: ['#555']
          }
        }
      },
      yaxis: {
        title: {
          text: 'Tickets',
          style: {
            fontSize: '14px',
            fontWeight: 500
          }
        },
        labels: {
          style: {
            fontSize: '12px'
          }
        }
      },
      colors: [
        '#0085db', '#0085db', '#0085db',  // Systems
        '#00E396',                        // Application
        '#FEB019', '#FEB019', '#FEB019', '#FEB019',  // Network
        '#FF4560',                        // Security
        '#775DD0',                        // Resource
        '#69D2E7'                         // IAM
      ],
      dataLabels: {
        enabled: true,
        formatter: function(val: number) {
          return val;
        },
        textAnchor: 'start',
        style: {
          fontSize: '11px'
        },
        offsetX: 0
      },
      legend: {
        show: false
      },
      tooltip: {
        theme: 'light',
        y: {
          formatter: function(val: number) {
            return val + ' tickets';
          }
        },
        x: {
          formatter: function(val: string) {
            return val;
          }
        }
      }
    };
  }
}