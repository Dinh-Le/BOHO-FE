import { Component, OnInit, inject } from '@angular/core';
import {
  ColumnConfig,
  ExpandableTableRowData,
  ExpandableTableRowItemModelBase,
} from '../expandable-table/expandable-table.component';
import { v4 } from 'uuid';
import { SelectItemModel } from '@shared/models/select-item-model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EventSourceComponent } from './event-source/event-source.component';
import {
  Level2Menu,
  NavigationService,
} from 'src/app/data/service/navigation.service';
import { IntegrationService } from 'src/app/data/service/integration.service';
import { RuleService } from 'src/app/data/service/rule.service';
import { MilestoneService } from 'src/app/data/service/milestone.service';
import { ActivatedRoute } from '@angular/router';
import { map, of, switchMap } from 'rxjs';
import { Integration } from 'src/app/data/schema/boho-v2';
import { FormControl, FormGroup, Validators } from '@angular/forms';

class RowItemModel extends ExpandableTableRowItemModelBase {
  id?: string;
  name?: string;
  type?: SelectItemModel;
  source?: SelectItemModel;
  cameraGuid?: string;
  isSendSnapshot?: boolean;
  form = new FormGroup({
    id: new FormControl<number>(0, [Validators.required]),
    name: new FormControl<string>('', [Validators.required]),
    type: new FormControl<SelectItemModel | null>(null, [Validators.required]),
    source: new FormControl<SelectItemModel | number | null>(null, [Validators.required]),
    guid: new FormControl<string>('', [Validators.required]),    
    isSendSnapshot: new FormControl<boolean>(false, [Validators.required]),
    ruleIdList: new FormControl<number[]>([], [Validators.required]),
  })

  setData(data: Integration, type: SelectItemModel): void { 
    this.form.reset({
      id: data.id,
      name: data.name,
      type: type,
      source: data.milestone_id,
      guid: data.guid,
      isSendSnapshot: data.is_send_snapshot
    });
  }
}

@Component({
  selector: 'app-integration',
  templateUrl: 'integration.component.html',
  styleUrls: ['../shared/my-input.scss'],
})
export class IntegrationComponent implements OnInit {
  private _modalService = inject(NgbModal);
  private _navigationService = inject(NavigationService);
  private _integrationService = inject(IntegrationService);
  private _ruleService = inject(RuleService);
  private _milestoneService = inject(MilestoneService);
  private _activatedRoute = inject(ActivatedRoute);

  private _nodeId: string = '';
  private _deviceId: number = 0;

  data: RowItemModel[] = [];
  columns: ColumnConfig[] = [
    {
      label: 'Tên',
      prop: 'name',
      sortable: true,
    },
    {
      label: 'Loại',
      prop: 'type.label',
      sortable: true,
    },
    {
      label: 'Đích',
      prop: 'source.label',
      sortable: true,
    },
  ];
  types: SelectItemModel[] = ['Milestone'].map((e) => ({
    value: e,
    label: e,
  }));
  sources: SelectItemModel[] = [];

  ngOnInit(): void {
    this._navigationService.level2 = Level2Menu.INTEGRATION;
    this._activatedRoute.params.pipe(
      switchMap((params) => {
        const { nodeId, cameraId } = params;
        this._nodeId = nodeId;
        this._deviceId = parseInt(cameraId);
        this.data = [];
        return this._integrationService.findAll(this._nodeId, this._deviceId);
      }),
      map(response => { 
        if (!response.success) { 
          throw Error(`Fetch integration list failed with error ${response.message}`);
        }

        return of(response.data);
      })
    ).subscribe({
      next: (integrationList) => { 
        this.data = 
      }
    });
  }

  add() {
    const newRow: RowItemModel = {
      id: v4(),
      isEditable: true,
      isExpanded: true,
    };
    this.data.push(newRow);
  }

  remove(row: RowItemModel) {
    this.data = this.data.filter((e) => e.id !== row.id);
  }

  onEventSourceClick(item: RowItemModel) {
    this._modalService.open(EventSourceComponent, {
      size: 'xl',
      centered: true,
    });
  }
}
