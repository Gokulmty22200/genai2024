import { Component, ViewChild } from '@angular/core';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MaterialModule } from 'src/app/material.module';
import { MatButtonModule } from '@angular/material/button';

import {
  ApexChart,
  ChartComponent,
  ApexDataLabels,
  ApexLegend,
  ApexStroke,
  ApexTooltip,
  ApexAxisChartSeries,
  ApexXAxis,
  ApexYAxis,
  ApexGrid,
  ApexPlotOptions,
  ApexFill,
  ApexMarkers,
  ApexResponsive,
  NgApexchartsModule,
} from 'ng-apexcharts';


interface month {
  value: string;
  viewValue: string;
}

export interface profitExpanceChart {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  yaxis: ApexYAxis;
  xaxis: ApexXAxis;
  fill: ApexFill;
  tooltip: ApexTooltip;
  stroke: ApexStroke;
  legend: ApexLegend;
  grid: ApexGrid;
  marker: ApexMarkers;
}

@Component({
  selector: 'app-profit-expenses',
  standalone: true,
  imports: [MaterialModule, TablerIconsModule, MatButtonModule, NgApexchartsModule],
  templateUrl: './profit-expenses.component.html',
})
export class AppProfitExpensesComponent {

  @ViewChild('chart') chart: ChartComponent = Object.create(null);
  public profitExpanceChart!: Partial<profitExpanceChart> | any;

  constructor() {
    this.profitExpanceChart = {
      series: [
        {
          name: 'Major',
          data: [25, 28, 22, 20, 18, 22, 27, 20, 24, 25, 21, 26]
        },
        {
          name: 'Medium',
          data: [17, 18, 10, 19, 17, 26, 20, 16, 17, 24, 24, 14]
        }
      ],
      chart: {
        type: 'bar',
        height: 450,
        stacked: true,
        toolbar: {
          show: false
        },
        zoom: {
          enabled: false
        }
      },
      grid: {
        borderColor: 'rgba(0,0,0,0.1)',
        strokeDashArray: 3,
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '80%',
          borderRadius: 4,
          endingShape: "rounded",
        },
      },
      xaxis: {
        type: 'category',
        categories: ['Feb-24', 'Mar-24', 'Apr-24', 'May-24', 'Jun-24', 
                    'Jul-24', 'Aug-24', 'Sep-24', 'Oct-24', 'Nov-24', 
                    'Dec-24', 'Jan-25'],
        labels: {
          style: { 
            fontSize: '12px'
          },
          rotate: -45,
          rotateAlways: true
        },
        axisTicks: { show: false },
        axisBorder: { show: false }
      },
      yaxis: {
        title: {
          text: 'Number of Tickets'
        },
        min: 0,
        max: 60,
        tickAmount: 6
      },
      colors: ['#008FFB', '#775DD0'],
      dataLabels: {
        enabled: true,
        formatter: function(val: number) {
          return val;
        },
        style: {
          fontSize: '10px'
        }
      },
      legend: {
        position: 'bottom',
        offsetY: 0
      },
      tooltip: {
        y: {
          formatter: function(val: number) {
            return val + " tickets";
          }
        }
      },
      fill: {
        opacity: 1
      }
    };
  }
}
