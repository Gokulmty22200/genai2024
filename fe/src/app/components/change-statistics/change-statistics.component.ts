import { Component, ViewChild } from '@angular/core';
import { MaterialModule } from 'src/app/material.module';
import { NgApexchartsModule, ChartComponent } from 'ng-apexcharts';

@Component({
  selector: 'app-change-statistics',
  standalone: true,
  imports: [MaterialModule, NgApexchartsModule],
  templateUrl: './change-statistics.component.html'
})
export class ChangeStatisticsComponent {
  @ViewChild('statusChart') statusChart!: ChartComponent;
  @ViewChild('typeChart') typeChart!: ChartComponent;
  
  public statusChartOptions: any;
  public typeChartOptions: any;

  constructor() {
    // Status Chart Configuration
    this.statusChartOptions = {
      series: [26, 404, 70],
      chart: {
        type: 'pie',
        height: 350,
        width: '100%'
      },
      labels: ['Failed / Cancelled', 'Implemented and Closed', 'Rolled Back'],
      title: {
        text: 'Change Status Distribution',
        align: 'center',
        style: {
          fontSize: '16px',
          fontWeight: 600
        }
      },
      colors: ['#FF4560', '#00E396', '#FEB019'],
      legend: {
        position: 'bottom'
      },
      dataLabels: {
        enabled: true,
        formatter: function(val: number, opts: any) {
          return opts.w.config.series[opts.seriesIndex] + ' (' + val.toFixed(1) + '%)';
        }
      },
      tooltip: {
        y: {
          formatter: function(val: number) {
            return val + ' tickets';
          }
        }
      },
      responsive: [{
        breakpoint: 992,
        options: {
          chart: {
            width: '100%'
          }
        }
      }]
    };

    // Type Chart Configuration
    this.typeChartOptions = {
      series: [278, 222],
      chart: {
        type: 'pie',
        height: 350,
        width: '100%'
      },
      labels: ['Major', 'Medium'],
      title: {
        text: 'Change Type Distribution',
        align: 'center',
        style: {
          fontSize: '16px',
          fontWeight: 600
        }
      },
      colors: ['#008FFB', '#775DD0'],
      legend: {
        position: 'bottom'
      },
      dataLabels: {
        enabled: true,
        formatter: function(val: number, opts: any) {
          return opts.w.config.series[opts.seriesIndex] + ' (' + val.toFixed(1) + '%)';
        }
      },
      tooltip: {
        y: {
          formatter: function(val: number) {
            return val + ' tickets';
          }
        }
      },
      responsive: [{
        breakpoint: 992,
        options: {
          chart: {
            width: '100%'
          }
        }
      }]
    };
  }
}