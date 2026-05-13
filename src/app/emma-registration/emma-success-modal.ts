import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-emma-success-modal',
  standalone: true,
  imports: [MatDialogModule],
  template: `
    <div class="modal-wrap">
      <div class="top-band"></div>

      <div class="success-icon">
        <span class="checkmark">!</span>
        <div class="ripple"></div>
      </div>

      <h2 class="modal-title">Almost There!</h2>
      <p class="modal-sub">
        Hi, <strong>{{ data.payload.firstName }}</strong>!
        Your registration as an
        <span class="type-badge">{{ data.isEmma ? 'EEMA Member' : 'Non-EEMA Member' }}</span>
        is received but <strong>not confirmed yet</strong> — your spot will be secured once payment is complete.
      </p>

      <p class="modal-question">Complete your registration</p>

      <div class="action-cards">
        <button class="action-card book-card" (click)="choose('book')">
          <div class="action-icon">ROOM</div>
          <div class="action-content">
            <div class="action-title">Book a Room</div>
            <div class="action-desc">Final payment will include registration, room charges, and GST</div>
          </div>
          <span class="arrow">Next</span>
        </button>

        <button class="action-card pay-card" (click)="choose('pay')">
          <div class="action-icon">PAY</div>
          <div class="action-content">
            <div class="action-title">Pay Registration Fee</div>
            <div class="action-desc">Pay INR {{ data.totalAmount.toLocaleString('en-IN') }} including GST</div>
          </div>
          <span class="arrow">Pay</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .modal-wrap {
      position: relative;
      overflow: hidden;
      padding: 42px 30px 30px;
      text-align: center;
      font-family: inherit;
      background:
        linear-gradient(180deg, rgba(255, 251, 235, 0.9), rgba(255, 255, 255, 0) 42%),
        #ffffff;
    }

    .top-band {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 8px;
      background: linear-gradient(90deg, #f59e0b, #f97316, #6366f1);
    }

    .success-icon {
      position: relative;
      width: 82px;
      height: 82px;
      margin: 0 auto 22px;
      display: flex;
      align-items: center;
      justify-content: center;

      .checkmark {
        width: 82px;
        height: 82px;
        background:
          radial-gradient(circle at 30% 25%, rgba(255, 255, 255, 0.45), transparent 28%),
          linear-gradient(135deg, #fbbf24, #d97706);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28px;
        color: white;
        font-weight: 900;
        letter-spacing: 0;
        position: relative;
        z-index: 1;
        line-height: 82px;
        box-shadow: 0 18px 38px rgba(217, 119, 6, 0.28);
      }

      .ripple {
        position: absolute;
        inset: -10px;
        border-radius: 50%;
        border: 2px solid rgba(251, 191, 36, 0.35);
        animation: ripple 1.5s ease-out infinite;
      }
    }

    @keyframes ripple {
      0% { transform: scale(0.9); opacity: 1; }
      100% { transform: scale(1.3); opacity: 0; }
    }

    .modal-title {
      font-size: 26px;
      font-weight: 800;
      color: #111827;
      margin: 0 0 8px;
    }

    .modal-sub {
      font-size: 14px;
      color: #4b5563;
      margin: 0 auto 16px;
      line-height: 1.6;
      max-width: 390px;

      strong { color: #111827; }
    }

    .type-badge {
      display: inline-block;
      background: #eff6ff;
      color: #1d4ed8;
      font-size: 11px;
      font-weight: 700;
      padding: 3px 9px;
      border-radius: 100px;
      border: 1px solid #bfdbfe;
    }

    .modal-question {
      font-size: 12px;
      font-weight: 800;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0;
      margin: 0 0 14px;
    }

    .action-cards {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .action-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 17px 18px;
      border-radius: 12px;
      border: 1.5px solid #e5e7eb;
      background: #ffffff;
      cursor: pointer;
      text-align: left;
      transition: all 0.2s;
      width: 100%;
      min-height: 82px;
      box-shadow: 0 10px 28px rgba(15, 23, 42, 0.06);

      &:hover {
        transform: translateY(-2px);
      }

      .action-icon {
        width: 54px;
        height: 54px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0;
        flex-shrink: 0;
      }

      .action-content {
        flex: 1;

        .action-title {
          font-size: 15px;
          font-weight: 800;
          color: #111827;
          margin-bottom: 4px;
        }

        .action-desc {
          font-size: 12px;
          color: #64748b;
          line-height: 1.35;
        }
      }

      .arrow {
        min-width: 48px;
        text-align: center;
        font-size: 12px;
        font-weight: 800;
        color: #475569;
        background: #f8fafc;
        border-radius: 999px;
        padding: 7px 10px;
        transition: transform 0.2s;
      }

      &:hover .arrow {
        transform: translateX(3px);
      }
    }

    .book-card {
      .action-icon {
        background: #eef2ff;
        color: #4f46e5;
      }

      &:hover {
        border-color: #6366f1;
        background: #f8faff;
        box-shadow: 0 4px 14px rgba(99, 102, 241, 0.12);
      }
    }

    .pay-card {
      .action-icon {
        background: #ecfdf5;
        color: #047857;
      }

      &:hover {
        border-color: #10b981;
        background: #f8fffb;
        box-shadow: 0 4px 14px rgba(16, 185, 129, 0.12);
      }
    }
  `]
})
export class EmmaSuccessModal {
  constructor(
    private dialogRef: MatDialogRef<EmmaSuccessModal>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  choose(action: 'book' | 'pay') {
    this.dialogRef.close(action);
  }
}
