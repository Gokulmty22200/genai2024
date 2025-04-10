import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { MaterialModule } from 'src/app/material.module';
import { ServiceNowService } from 'src/app/services/service-now.service';
import { TicketService } from 'src/app/services/ticket.service';

@Component({
  selector: 'app-affected-ci',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './affected-ci.component.html',
  styleUrl: './affected-ci.component.scss'
})
export class AffectedCiComponent {
  @Input() impactData: any;

  changeData: any;

  constructor( private route: ActivatedRoute ) {}
  
    
    ngOnInit(): void {
      this.route.queryParams.subscribe((params: any) => {
        if (params['data']) {
          this.changeData = JSON.parse(params['data']);
      }
      });
    }
}
