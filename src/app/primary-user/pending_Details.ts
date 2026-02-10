import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogActions, MatDialogContent } from '@angular/material/dialog';
import { AsyncPipe, JsonPipe } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';


@Component({
    selector: 'app-duplicate-details',
    template: `
        <div class="container">
            @if(state){
                <h2 mat-dialog-title class="title">Alert</h2>
            }@else {
                <h2 mat-dialog-title class="title">Finish your booking</h2>
            }

            <mat-dialog-content class="content">
            <div class="icon">⚠️</div>

            @if(state){
                <div class="text">
                    <p class="main">Your previous booking has proceed with payment.</p>
                    <p class="sub">check email.</p>
                </div>
            }@else {
                <div class="text">
                    <p class="main">You have an incomplete form.</p>
                    <p class="sub">If you start again, the entered details will be lost.</p>
                </div>
            }
            </mat-dialog-content>

            <mat-dialog-actions align="end">
            <button mat-stroked-button color="warn" (click)="startNew()">
                Start over
            </button>

            <button mat-flat-button color="primary" (click)="continue()">
                Continue where I left
            </button>
            </mat-dialog-actions>
        </div>
  `,
    styles: [`
    .container{
        padding: 20px;
    }

    .title {
      font-weight: 500;
    }

    .content {
      display: flex;
      gap: 16px;
      align-items: center;
      padding-top: 8px;
      padding: 28px;
    }

    .icon {
      font-size: 28px;
    }

    .text .main {
      font-weight: 600;
      margin: 0;
    }

    .text .sub {
      margin: 4px 0 0;
      opacity: 0.7;
      font-size: 13px;
    }
    button{
        outline: none;
        padding: 6px 15px;
        border-radius: 5px;
        border: none;
        margin-left: 6px;
        background: rgb(122 122 255);
        color: white
    }
  `],
    imports: [
        MatDialogActions,
        MatDialogContent,
        MatIconModule,
        MatAutocompleteModule
    ]
})
export class pendingDetailsComponent {

    constructor(private dialogRef: MatDialogRef<pendingDetailsComponent>, @Inject(MAT_DIALOG_DATA) public data: any) { }
    state: Boolean = false;

    ngOnInit() {
        this.state = (this.data.res.data[0].stage == 5) ? true : false
    }

    startNew() {
        this.dialogRef.close('startNew');
    }

    continue() {
        this.dialogRef.close('continue');
    }

}
