import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-emma-success-modal',
  standalone: true,
  imports: [MatDialogModule],
  template: `
    <div class="modal-wrap">
      <div class="top-band"></div>

      <div class="question-icon">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
          <circle cx="12" cy="17" r="0.5" fill="currentColor"/>
        </svg>
      </div>

      <h2 class="modal-title">Register Without a Room?</h2>
      <p class="modal-sub">
        You have selected to <strong>Pay Registration Fee only</strong>.<br>
        Hotel booking will <em>not</em> be included in this payment.<br>
        Are you sure you want to continue?
      </p>

      <div class="amount-chip">
        ₹{{ data.totalAmount.toLocaleString('en-IN') }} <span>(Including GST)</span>
      </div>

      <p class="modal-question">Choose how to proceed</p>

      <div class="action-cards">

        <button class="action-card pay-card" (click)="choose('pay')">
          <div class="action-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="2"/>
              <line x1="2" y1="10" x2="22" y2="10"/>
            </svg>
          </div>
          <div class="action-content">
            <div class="action-title">Yes, Register Only</div>
            <div class="action-desc">Pay ₹{{ data.totalAmount.toLocaleString('en-IN') }} now — hotel can be arranged separately</div>
          </div>
          <span class="confirm-badge">Confirm</span>
        </button>

        <button class="action-card book-card" (click)="choose('book')">
          <div class="action-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <div class="action-content">
            <div class="action-title">Registration + Book Hotel</div>
            <div class="action-desc">Include hotel room in the same payment — one checkout for everything</div>
          </div>
          <span class="arrow">→</span>
        </button>

      </div>
    </div>
  `,
  styles: [`
    .modal-wrap {
      position: relative;
      overflow: hidden;
      padding: 40px 28px 28px;
      text-align: center;
      font-family: inherit;
      background: linear-gradient(180deg, #fffbeb 0%, #ffffff 32%);
      min-width: 360px;
    }

    .top-band {
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 5px;
      background: linear-gradient(90deg, #f59e0b, #f97316, #ef4444);
    }

    /* ── Question Icon ── */
    .question-icon {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: linear-gradient(135deg, #fef3c7, #fde68a);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 18px;
      color: #d97706;
      box-shadow: 0 8px 24px rgba(245, 158, 11, 0.22);
    }

    /* ── Text ── */
    .modal-title {
      font-size: 22px;
      font-weight: 800;
      color: #111827;
      margin: 0 0 10px;
      letter-spacing: -0.3px;
    }

    .modal-sub {
      font-size: 13.5px;
      color: #4b5563;
      line-height: 1.7;
      margin: 0 auto 16px;
      max-width: 340px;

      strong { color: #111827; }
      em { font-style: normal; color: #dc2626; font-weight: 600; }
    }

    /* ── Amount chip ── */
    .amount-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #fff7ed;
      border: 1.5px solid #fed7aa;
      border-radius: 999px;
      padding: 6px 16px;
      font-size: 15px;
      font-weight: 800;
      color: #c2410c;
      margin-bottom: 20px;

      span {
        font-size: 11px;
        font-weight: 500;
        color: #9a3412;
      }
    }

    .modal-question {
      font-size: 10.5px;
      font-weight: 700;
      color: #9ca3af;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin: 0 0 12px;
    }

    /* ── Cards ── */
    .action-cards {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .action-card {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 15px 16px;
      border-radius: 12px;
      border: 1.5px solid #e5e7eb;
      background: #ffffff;
      cursor: pointer;
      text-align: left;
      transition: all 0.2s;
      width: 100%;
      box-shadow: 0 2px 8px rgba(15, 23, 42, 0.05);

      &:hover { transform: translateY(-2px); }

      .action-icon {
        width: 46px;
        height: 46px;
        border-radius: 11px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .action-content {
        flex: 1;

        .action-title {
          font-size: 14px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 3px;
        }

        .action-desc {
          font-size: 11.5px;
          color: #64748b;
          line-height: 1.4;
        }
      }

      .arrow {
        font-size: 16px;
        color: #94a3b8;
        flex-shrink: 0;
        transition: transform 0.2s;
      }

      &:hover .arrow { transform: translateX(3px); }

      .confirm-badge {
        background: #16a34a;
        color: #fff;
        font-size: 11.5px;
        font-weight: 700;
        padding: 5px 13px;
        border-radius: 999px;
        flex-shrink: 0;
        letter-spacing: 0.2px;
      }
    }

    /* Pay-only card — primary/confirm action */
    .pay-card {
      border-color: #bbf7d0;
      background: linear-gradient(135deg, #f0fdf4, #ffffff);

      .action-icon {
        background: #dcfce7;
        color: #15803d;
      }

      &:hover {
        border-color: #22c55e;
        box-shadow: 0 4px 16px rgba(34, 197, 94, 0.14);
      }
    }

    /* Book+hotel card — secondary action */
    .book-card {
      .action-icon {
        background: #eef2ff;
        color: #4f46e5;
      }

      &:hover {
        border-color: #a5b4fc;
        background: #fafaff;
        box-shadow: 0 4px 14px rgba(99, 102, 241, 0.10);
      }
    }
  `]
})
export class EmmaConfirmModal {
  constructor(
    private dialogRef: MatDialogRef<EmmaConfirmModal>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  choose(action: 'book' | 'pay') {
    this.dialogRef.close(action);
  }
}
