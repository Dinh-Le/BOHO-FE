import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchInputComponent } from './components/search-input/search-input.component';
import { SelectComponent } from './components/select/select.component';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Select2Component } from './components/select-2/select-2.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TreeViewComponent } from './components/tree-view/tree-view.component';
import { TreeViewItemComponent } from './components/tree-view/tree-view-item.component';
import { TreeViewItemDropDownComponent } from './components/tree-view/tree-view-item-dropdown.component';
import { ListViewComponent } from './components/list-view/list-view.component';
import { LoadingDirective } from './directives/loading.directive';
import { LoadingComponent } from './components/loading/loading.component';
import { ObjectEntries } from './pipes/object-entries.pipe';
import { SvgIconComponent } from './components/svg-icon/svg-icon.component';
import { MaskPipe } from './pipes/mask.pipe';
import { NumberToStringPipe } from './pipes/number-to-string.pipe';
import { BoundingBoxEditorComponent } from '@shared/components/bounding-box-editor/bounding-box-editor.component';
import { PaginationComponent } from './components/pagination/pagination.component';
import { NumericInputComponent } from './components/numeric-input/numeric-input.component';
import { EventImage } from './components/event-image/event-image.component';
import { DateTimeFormatPipe } from './pipes/datetime.pipe';
import { TranslatePipe } from './pipes/translate-vi.pipe';

@NgModule({
  declarations: [
    SearchInputComponent,
    SelectComponent,
    Select2Component,
    TreeViewComponent,
    TreeViewItemDropDownComponent,
    TreeViewItemComponent,
    ListViewComponent,
    LoadingComponent,
    LoadingDirective,
    ObjectEntries,
    MaskPipe,
    NumberToStringPipe,
    DateTimeFormatPipe,
    TranslatePipe,
    SvgIconComponent,
    BoundingBoxEditorComponent,
    PaginationComponent,
    NumericInputComponent,
    EventImage,
  ],
  imports: [CommonModule, FormsModule, NgbModule, FontAwesomeModule],
  exports: [
    SearchInputComponent,
    SelectComponent,
    Select2Component,
    FontAwesomeModule,
    TreeViewComponent,
    ListViewComponent,
    LoadingDirective,
    ObjectEntries,
    MaskPipe,
    NumberToStringPipe,
    DateTimeFormatPipe,
    TranslatePipe,
    SvgIconComponent,
    BoundingBoxEditorComponent,
    PaginationComponent,
    NumericInputComponent,
    EventImage,
  ],
})
export class SharedModule {}
