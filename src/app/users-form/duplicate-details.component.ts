import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogActions, MatDialogContent } from '@angular/material/dialog';
import { AsyncPipe, JsonPipe } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { LoggerService } from '../service/logger.service';


@Component({
    selector: 'app-duplicate-details',
    templateUrl: './duplicate-details.component.html',
    styles: `
        $background: rgb(122 122 255);
        $disabled-bg: #e0e0e0;
        
        div {
            padding: 20px
        }

        button {
            margin-right: 10px;
            border: none;
            padding: 10px;
            border-radius: 5px;
            color: white;
            cursor: pointer;

            &:nth-child(1) {
                background-color: #8f0101b9;
            }

            &:nth-child(2) {
                background-color: $background;

                &:disabled {
                background-color: $disabled-bg;
                cursor: not-allowed;
                }
            }
        }

        .user-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 12px;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
            font-size: 14px;
        }

        .user-table thead {
        background-color: #f5f7fa;
        }

        .user-table th,
        .user-table td {
        padding: 10px 14px;
        border: 1px solid #e1e5eb;
        text-align: left;
        }

        .user-table th {
        font-weight: 600;
        color: #333;
        }

        .user-table tbody tr:hover {
        background-color: #f0f4ff;
        }

        .user-table tbody tr:nth-child(even) {
        background-color: #fafafa;
        }

`,
    imports: [
        MatDialogActions,
        MatDialogContent,
        MatIconModule,
        MatAutocompleteModule
    ]
})
export class DuplicateDialogComponent {

    constructor(private dialogRef: MatDialogRef<DuplicateDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any, private logger:LoggerService) { }


    ngOnInit() {
        this.logger.log(this.data)
    }

    close() {
        this.dialogRef.close();
    }

}
