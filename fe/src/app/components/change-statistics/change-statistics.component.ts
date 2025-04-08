import { Component, ViewChild } from '@angular/core';
import { MaterialModule } from 'src/app/material.module';
import { NgApexchartsModule, ChartComponent } from 'ng-apexcharts';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-change-statistics',
  standalone: true,
  imports: [MaterialModule, NgApexchartsModule,CommonModule,FormsModule],
  templateUrl: './change-statistics.component.html'
})
export class ChangeStatisticsComponent {
  @ViewChild('statusChart') statusChart!: ChartComponent;
  @ViewChild('typeChart') typeChart!: ChartComponent;
  @ViewChild('stackedChart') stackedChart!: ChartComponent;

  public statusChartOptions: any;
  public typeChartOptions: any;
  public stackedChartOptions: any;
  selectedPeriod = 'FY2024';
  periods = [
    { value: 'FY2024', label: 'Feb 2024- Jan 2025' }
  ];
  constructor() {
    // Status Chart Configuration
    this.statusChartOptions = {
      series: [26, 404, 70],
      chart: {
        type: 'pie',
        height: 350,
        width: '100%'
      },
      labels: ['Cancelled', 'Implemented and Closed', 'Rolled Back'],
      title: {
        text: 'Change Status Distribution',
        align: 'center',
        style: {
          fontSize: '16px',
          fontWeight: 600
        }
      },
      colors: ['#FE9900', '#008FFB', '#E4080A'],
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
    // Stacked Column Chart Configuration
  this.stackedChartOptions = {
    series: [
      {
        name: 'Major',
        data: [222, 43, 13]
      },
      {
        name: 'Medium',
        data: [182, 27, 13]
      }
    ],
    chart: {
      type: 'bar',
      height: 350,
      stacked: true,
      toolbar: {
        show: false
      }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
      },
    },
    title: {
      text: 'Change Distribution by Status and Type',
      align: 'center',
      style: {
        fontSize: '16px',
        fontWeight: 600
      }
    },
    xaxis: {
      categories: ['Implemented and Closed', 'Rolled Back', 'Cancelled'],
      labels: {
        style: {
          fontSize: '12px'
        }
      }
    },
    yaxis: {
      title: {
        text: 'Number of Changes'
      }
    },
    legend: {
      position: 'bottom'
    },
    fill: {
      opacity: 1
    },
    colors: ['#008FFB', '#775DD0'],
    dataLabels: {
      enabled: true,
      formatter: function(val: number) {
        return val.toString();
      }
    },
    tooltip: {
      y: {
        formatter: function(val: number) {
          return val + " changes";
        }
      }
    }
  };
  }
}