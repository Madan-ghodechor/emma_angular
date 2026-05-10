import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-emma-success-modal',
  standalone: true,
  imports: [MatDialogModule],
  template: `
    <div class="modal-wrap">

      <div class="success-icon">
        <span class="checkmark">✓</span>
        <div class="ripple"></div>
      </div>

      <h2 class="modal-title">You're registered!</h2>
      <p class="modal-sub">
        Welcome, <strong>{{ data.payload.firstName }}</strong>!
        Your registration as an
        <span class="type-badge">{{ data.isEmma ? 'EMMA Member' : 'Non-EMMA Member' }}</span>
        is confirmed.
      </p>

      <div class="fee-pill">
        Registration fee: <strong>₹{{ data.fee.toLocaleString('en-IN') }}</strong>
      </div>

      <p class="modal-question">What would you like to do next?</p>

      <div class="action-cards">

        <button class="action-card book-card" (click)="choose('book')">
          <div class="action-icon">🏨</div>
          <div class="action-content">
            <div class="action-title">Book a Room</div>
            <div class="action-desc">Select room type and add members</div>
          </div>
          <span class="arrow">→</span>
        </button>

        <button class="action-card pay-card" (click)="choose('pay')">
          <div class="action-icon">💳</div>
          <div class="action-content">
            <div class="action-title">Pay Registration Fee</div>
            <div class="action-desc">Pay ₹{{ data.fee.toLocaleString('en-IN') }} and you're done</div>
          </div>
          <span class="arrow">→</span>
        </button>

      </div>

      <button class="skip-btn" (click)="choose('skip')">
        Maybe later
      </button>

    </div>
  `,
  styles: [`
    .modal-wrap {
      padding: 36px 28px 28px;
      text-align: center;
      font-family: inherit;
    }

    .success-icon {
      position: relative;
      width: 72px;
      height: 72px;
      margin: 0 auto 20px;
      display: flex;
      align-items: center;
      justify-content: center;

      .checkmark {
        width: 72px;
        height: 72px;
        background: linear-gradient(135deg, #10b981, #059669);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 32px;
        color: white;
        font-weight: 700;
        position: relative;
        z-index: 1;
        line-height: 72px;
      }

      .ripple {
        position: absolute;
        inset: -8px;
        border-radius: 50%;
        border: 2px solid rgba(16, 185, 129, 0.3);
        animation: ripple 1.5s ease-out infinite;
      }
    }

    @keyframes ripple {
      0% { transform: scale(0.9); opacity: 1; }
      100% { transform: scale(1.3); opacity: 0; }
    }

    .modal-title {
      font-size: 24px;
      font-weight: 700;
      color: #1e1b4b;
      margin: 0 0 8px;
    }

    .modal-sub {
      font-size: 14px;
      color: #6b7280;
      margin: 0 0 14px;
      line-height: 1.6;

      strong { color: #1e1b4b; }
    }

    .type-badge {
      display: inline-block;
      background: #eef2ff;
      color: #4f46e5;
      font-size: 11px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 100px;
    }

    .fee-pill {
      display: inline-block;
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      color: #065f46;
      font-size: 13px;
      padding: 6px 16px;
      border-radius: 100px;
      margin-bottom: 20px;

      strong { font-weight: 700; }
    }

    .modal-question {
      font-size: 13px;
      font-weight: 600;
      color: #374151;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin: 0 0 12px;
    }

    .action-cards {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 14px;
    }

    .action-card {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 16px 18px;
      border-radius: 14px;
      border: 1.5px solid #e5e7eb;
      background: #f8fafc;
      cursor: pointer;
      text-align: left;
      transition: all 0.2s;
      width: 100%;

      &:hover {
        transform: translateY(-1px);
      }

      .action-icon {
        font-size: 24px;
        flex-shrink: 0;
      }

      .action-content {
        flex: 1;

        .action-title {
          font-size: 14px;
          font-weight: 600;
          color: #1e1b4b;
          margin-bottom: 2px;
        }

        .action-desc {
          font-size: 12px;
          color: #6b7280;
        }
      }

      .arrow {
        font-size: 16px;
        color: #9ca3af;
        transition: transform 0.2s;
      }

      &:hover .arrow {
        transform: translateX(3px);
      }
    }

    .book-card {
      &:hover {
        border-color: #6366f1;
        background: #eef2ff;
        box-shadow: 0 4px 14px rgba(99, 102, 241, 0.12);
      }
    }

    .pay-card {
      &:hover {
        border-color: #10b981;
        background: #f0fdf4;
        box-shadow: 0 4px 14px rgba(16, 185, 129, 0.12);
      }
    }

    .skip-btn {
      background: none;
      border: none;
      color: #9ca3af;
      font-size: 13px;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 6px;
      transition: color 0.2s;

      &:hover { color: #6b7280; }
    }
  `]
})
export class EmmaSuccessModal {
  constructor(
    private dialogRef: MatDialogRef<EmmaSuccessModal>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  choose(action: 'book' | 'pay' | 'skip') {
    this.dialogRef.close(action);
  }
}