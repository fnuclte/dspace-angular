import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';

import { Subscription } from 'rxjs/Subscription';

import { hasValue, isEmpty } from '../../shared/empty.util';
import { SubmissionDefinitionsModel } from '../../core/shared/config/config-submission-definitions.model';
import { SubmissionRestService } from '../submission-rest.service';
import { Workspaceitem } from '../../core/submission/models/workspaceitem.model';
import { PlatformService } from '../../shared/services/platform.service';
import { Observable } from 'rxjs/Observable';
import { TranslateService } from '@ngx-translate/core';
import { NotificationsService } from '../../shared/notifications/notifications.service';

@Component({
  selector: 'ds-submit-page',
  styleUrls: ['./submission-submit.component.scss'],
  templateUrl: './submission-submit.component.html'
})
export class SubmissionSubmitComponent implements OnDestroy, OnInit {

  public collectionId: string;
  public model: any;
  public selfUrl: string;
  public submissionDefinition: SubmissionDefinitionsModel;
  public submissionId: string;

  protected subs: Subscription[] = [];

  constructor(private changeDetectorRef: ChangeDetectorRef,
              private notificationsService: NotificationsService,
              private platform: PlatformService,
              private restService: SubmissionRestService,
              private router: Router,
              private translate: TranslateService,
              private viewContainerRef: ViewContainerRef) {
  }

  ngOnInit() {
    if (this.platform.isBrowser) {
      // NOTE execute the code on the browser side only, otherwise it is executed twice
      this.subs.push(
        this.restService.postToEndpoint('workspaceitems', {})
          .map((workspaceitems) => workspaceitems[0])
          .catch((Error) => Observable.of({}))
          .subscribe((workspaceitems: Workspaceitem) => {
            if (isEmpty(workspaceitems)) {
              this.notificationsService.info(null, this.translate.get('submission.general.cannot_submit'));
              this.router.navigate(['/mydspace']);
            } else {
              this.collectionId = workspaceitems.collection[0].id;
              this.selfUrl = workspaceitems.self;
              this.submissionDefinition = workspaceitems.submissionDefinition[0];
              this.submissionId = workspaceitems.id;
              this.changeDetectorRef.detectChanges();
            }
          })
      )
    }
  }

  ngOnDestroy() {
    this.subs
      .filter((subscription) => hasValue(subscription))
      .forEach((subscription) => subscription.unsubscribe());
    const containerLength = this.viewContainerRef.length;
    for (let _i = 0; _i < containerLength; _i++) {
      // this.viewContainerRef.get(_i).destroy();
      // this.viewContainerRef.detach(_i);
      // this.viewContainerRef.remove(_i);
    }
    this.viewContainerRef.clear();
    this.changeDetectorRef.markForCheck();
  }

}
