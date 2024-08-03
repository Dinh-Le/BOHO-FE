import { FormControl, FormGroup, Validators } from '@angular/forms';
import { v4 } from 'uuid';
import { InvalidId } from 'src/app/data/constants';
import { notEmptyArrayValidator } from '@app/helpers/custom-form-validators';
import { HandoverLinking } from 'src/app/data/schema/boho-v2';

export class StaticPostActionItemModel {
  public form = new FormGroup({
    key: new FormControl<string>(v4(), [Validators.required]),
    id: new FormControl<number>(+InvalidId, [Validators.required]),
    selected: new FormControl<boolean>(false, [Validators.required]),
    ruleIds: new FormControl<number[]>([], [notEmptyArrayValidator]),
    handoverId: new FormControl<number>(+InvalidId, [Validators.required]),
  });

  get selected(): boolean {
    return this.form.controls.selected.value!;
  }

  get isNew(): boolean {
    return this.id === +InvalidId;
  }

  get id(): number {
    return this.form.controls.id.value!;
  }

  get handoverId(): number {
    return this.form.controls.handoverId.value!;
  }

  get ruleIds(): number[] {
    return this.form.controls.ruleIds.value ?? [];
  }

  constructor(data?: HandoverLinking) {
    this.form.patchValue(
      {
        id: data?.id ?? +InvalidId,
        handoverId: data?.handover_id ?? +InvalidId,
        ruleIds: data?.rule_ids ?? [],
      },
      {
        emitEvent: false,
      }
    );
  }
}
