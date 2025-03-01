import { Routes } from '@angular/router';


// pages
import { AppIconsComponent } from './icons/icons.component';
import { AppSamplePageComponent } from './sample-page/sample-page.component';
import { ChangeTicketComponent } from '../change-ticket/change-ticket.component';
import { ImpactAnalysisComponent } from '../impact-analysis/impact-analysis.component';
import { ChatboxComponent } from '../chatbox/chatbox.component';

export const ExtraRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'icons',
        component: AppIconsComponent,
      },
      {
        path: 'sample-page',
        component: AppSamplePageComponent,
      },
      {
        path: 'change-ticket',
        component: ChangeTicketComponent,
      },
      {
        path: 'impact-analysis',
        component: ImpactAnalysisComponent,
      },
      {
        path: 'chat-window',
        component: ChatboxComponent,
      },
    ],
  },
];
