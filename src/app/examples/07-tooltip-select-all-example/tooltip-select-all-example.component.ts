import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ReplaySubject, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { MatSelect } from '@angular/material/select';

import { Bank, BANKS } from '../demo-data';

@Component({
  selector: 'app-tooltip-select-all-example',
  standalone: false,
  templateUrl: './tooltip-select-all-example.component.html',
  styleUrls: ['./tooltip-select-all-example.component.scss']
})
export class TooltipSelectAllExampleComponent implements OnInit, AfterViewInit, OnDestroy {

  /** List of banks */
  protected banks: Bank[] = BANKS;

  /** Control for the selected bank for multi-selection */
  public bankMultiCtrl: FormControl<Bank[]> = new FormControl<Bank[]>([], {nonNullable: true});

  /** Control for the MatSelect filter keyword multi-selection */
  public bankMultiFilterCtrl: FormControl<string> = new FormControl<string>('', {nonNullable: true});

  /** List of banks filtered by search keyword */
  public filteredBanksMulti: ReplaySubject<Bank[]> = new ReplaySubject<Bank[]>(1);

  public tooltipMessage = 'Select All / Unselect All';

  @ViewChild('multiSelect', { static: true }) multiSelect: MatSelect;

  /** Subject that emits when the component has been destroyed. */
  protected _onDestroy = new Subject<void>();




  ngOnInit() {
    // set initial selection
    this.bankMultiCtrl.setValue([this.banks[10], this.banks[11], this.banks[12]]);

    // load the initial bank list
    this.filteredBanksMulti.next(this.banks.slice());

    // listen for search field value changes
    this.bankMultiFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterBanksMulti();
      });
  }

  ngAfterViewInit() {
    this.setInitialValue();
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  toggleSelectAll(selectAllValue: boolean) {
    this.filteredBanksMulti
      .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe(() => {
        if (selectAllValue) {
          this.bankMultiCtrl.patchValue([...this.banks]);
        } else {
          this.bankMultiCtrl.patchValue([]);
        }
      });
  }

  /**
   * Sets the initial value after the filteredBanks are loaded initially
   */
  protected setInitialValue() {
    this.filteredBanksMulti
      .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe(() => {
        // setting the compareWith property to a comparison function
        // triggers initializing the selection according to the initial value of
        // the form control (i.e. _initializeSelection())
        // this needs to be done after the filteredBanks are loaded initially
        // and after the mat-option elements are available
        this.multiSelect.compareWith = (a: Bank, b: Bank) => a && b && a.id === b.id;
      });
  }

  protected filterBanksMulti() {
    if (!this.banks) {
      return;
    }
    // get the search keyword
    let search = this.bankMultiFilterCtrl.value;
    if (!search) {
      this.filteredBanksMulti.next(this.banks.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredBanksMulti.next(
      this.banks.filter(bank => bank.name.toLowerCase().indexOf(search) > -1)
    );
  }

}
