import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from '../../material.module';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss'
})
export class ConfirmDialogComponent {
  constructor(public dialogRef: MatDialogRef<ConfirmDialogComponent>) {}
}
