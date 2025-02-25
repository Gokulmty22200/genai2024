import { Component } from '@angular/core';
import { MaterialModule } from '../../../material.module';
import * as plantumlEncoder from 'plantuml-encoder';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sample-page',
  standalone: true,
  imports: [MaterialModule, FormsModule],
  templateUrl: './sample-page.component.html',
  styleUrls: ['./sample-page.component.scss']
})

export class AppSamplePageComponent { 

  plantUmlCode: string = 
  `
  @startuml
  Alice -> Bob: Hello
  Bob --> Alice: Hi
  @enduml
  `;
diagramUrl: string = '';

constructor() {
  this.generateDiagram();
}

generateDiagram(): void {
  const encoded = plantumlEncoder.encode(this.plantUmlCode);
  this.diagramUrl = `https://www.plantuml.com/plantuml/svg/${encoded}`;
}
}
