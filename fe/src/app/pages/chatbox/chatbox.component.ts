import { Component, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../material.module';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { PreserveLineBreaksPipe } from '../../pipes/preserve-line-breaks.pipe';
import { TicketService } from 'src/app/services/ticket.service';

interface ChatMessage {
  text: string;
  sender: 'user' | 'bot';
  time: Date;
}

@Component({
  selector: 'app-chatbox',
  standalone: true,
  imports: [CommonModule, MaterialModule, FormsModule, PreserveLineBreaksPipe],
  templateUrl: './chatbox.component.html',
  styleUrls: ['./chatbox.component.scss']
})
export class ChatboxComponent implements OnDestroy {
  @ViewChild('scrollMe') private messagesContainer!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef;

  showUpload = true;
  currentMessage = '';
  messages: ChatMessage[] = [];
  isLoading = false;
  isRecording = false;
  recognition: any;

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private ticketService: TicketService
  ) {
    this.initializeSpeechRecognition();
  }

  initializeSpeechRecognition() {
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new (window as any).webkitSpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        this.currentMessage = transcript;
      };

      this.recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        this.isRecording = false;
      };

      this.recognition.onend = () => {
        this.isRecording = false;
      };
    }
  }

  toggleSpeechRecognition() {
    if (this.isRecording) {
      this.recognition.stop();
    } else {
      this.recognition.start();
      this.isRecording = true;
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.processFile(file);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const files = event.dataTransfer?.files;
    if (files?.length) {
      this.processFile(files[0]);
    }
  }

// Update processFile method
processFile(file: File) {
  if (!file) {
    this.snackBar.open('No file selected!', 'Close', { duration: 3000 });
    return;
  }

  // Check if file is CSV
  if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
    this.snackBar.open('Please upload a CSV file', 'Close', { duration: 3000 });
    return;
  }

  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    this.snackBar.open('File size should be less than 10MB', 'Close', { duration: 3000 });
    return;
  }

  this.isLoading = true;
  this.ticketService.uploadCsvFile(file)
    .subscribe({
      next: (response: any) => {
        this.showUpload = false;
        
        // Process the uploaded CSV data
        this.ticketService.processCsvData(response.data)
          .subscribe({
            next: (processedData: any) => {
              this.isLoading = false;
              this.snackBar.open('CSV file processed successfully!', 'Close', {
                duration: 3000
              });

              // Add processing result to chat
              this.messages.push({
                text: `File "${file.name}" processed successfully`,
                sender: 'bot',
                time: new Date()
              });
              this.scrollToBottom();
            },
            error: (error) => {
              this.handleError('Error processing CSV data');
            }
          });
      },
      error: (error) => {
        this.handleError('Error uploading file');
      }
    });
}

// Add error handler method
private handleError(message: string): void {
  this.isLoading = false;
  console.error('Error:', message);
  this.snackBar.open(`${message}. Please try again.`, 'Close', {
    duration: 3000
  });
}

  async sendMessage() {
    if (!this.currentMessage.trim()) return;

    this.messages.push({
      text: this.currentMessage,
      sender: 'user',
      time: new Date()
    });

    const userMessage = this.currentMessage;
    this.currentMessage = '';
    this.isLoading = true;

    // Simulate API call
    setTimeout(() => {
      this.messages.push({
        text: `Reply to: ${userMessage}`,
        sender: 'bot',
        time: new Date()
      });
      this.isLoading = false;
      this.scrollToBottom();
    }, 1000);
  }

  scrollToBottom() {
    setTimeout(() => {
      const element = this.messagesContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    });
  }

  confirmReupload() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.messages = [];
        this.showUpload = true;
      }
    });
  }

  ngOnDestroy() {
    if (this.recognition) {
      this.recognition.stop();
    }
  }
}
