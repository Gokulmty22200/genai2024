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
          name: 'Tickets',
          data: [
            // {x: '2024', y: 460},
            // {x: 'Q1 2024', y: 88},
            // {x: 'Jan', y: 40},
            {x: `Feb '24`, y: 42},
            {x: `Mar '24`, y: 46},
            // {x: 'Q2 2024', y: 106},
            {x: `Apr '24`, y: 32},
            {x: `May '24`, y: 39},
            {x: `Jun '24`, y: 35},
            // {x: 'Q3 `024 '24`, y: 131},
            {x: `Jul '24`, y: 48},
            {x: `Aug '24`, y: 47},
            {x: `Sep '24`, y: 36},
            // {x: 'Q4 `024 '24`, y: 135},
            {x: `Oct '24`, y: 41},
            {x: `Nov '24`, y: 49},
            {x: `Dec '24`, y: 45},
            // {x: '2025', y: 40},
            // {x: 'Q1 2025', y: 40},
            {x: `Jan '25`, y: 40}
          ],
          color: '#0085db',
        }
      ],
      grid: {
        borderColor: 'rgba(0,0,0,0.1)',
        strokeDashArray: 3,
      },
      chart: {
        type: 'bar',
        height: 450, // Increased height for better visibility
        offsetY: 10,
        foreColor: '#adb0bb',
        fontFamily: 'inherit',
        toolbar: { show: false },
      },
      xaxis: {
        type: 'category',
        axisTicks: { show: false },
        axisBorder: { show: false },
        labels: {
          style: { 
            cssClass: 'grey--text lighten-2--text fill-color',
            fontSize: '12px'
          },
          rotate: -45,
          rotateAlways: true
        }
      },
      yaxis: {
        title: {
          text: 'Number of Tickets'
        },
        min: 0,
        max: 100,
        tickAmount: 5
      },
      dataLabels: {
        enabled: true,
        formatter: function (val: number) {
          return val;
        },
        style: {
          fontSize: '10px'
        },
        offsetY: -20
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '80%',
          borderRadius: 4,
          endingShape: "rounded",
        },
      },
      // Highlight quarters with different colors
      colors: ['#0085db', '#00E396', '#0085db', '#0085db', '#0085db', 
               '#FEB019', '#0085db', '#0085db', '#0085db',
               '#FF4560', '#0085db', '#0085db', '#0085db',
               '#775DD0', '#0085db', '#0085db', '#0085db',
               '#0085db', '#00E396', '#0085db'],
      tooltip: {
        theme: 'light',
        y: {
          formatter: function(val: number) {
            return val + " tickets";
          }
        }
      },
      responsive: [
        {
          breakpoint: 600,
          options: {
            plotOptions: {
              bar: {
                borderRadius: 3,
              },
            },
          },
        },
      ],
    };
  }
}
