import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchInputComponent } from './components/search-input/search-input.component';
import { SelectComponent } from './components/select/select.component';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [SearchInputComponent, SelectComponent],
  imports: [CommonModule, FormsModule, NgbModule],
  exports: [SearchInputComponent, SelectComponent],
})
export class SharedModule {}
