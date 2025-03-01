import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'preserveLineBreaks',
  standalone: true
})
export class PreserveLineBreaksPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string): SafeHtml {
    if (!value) return value;
    const text = value.replace(/\n/g, '<br>');
    return this.sanitizer.bypassSecurityTrustHtml(text);
  }
}