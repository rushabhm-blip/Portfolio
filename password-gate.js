// ==========================================================================
// Portfolio Passcode Protection Gate
// Passcode: 11222
// Easy toggle: Change ENABLED to false to disable/remove gate completely.
// ==========================================================================

(function () {
  'use strict';

  const ENABLED = true;
  const CORRECT_PIN = '11222';
  const STORAGE_KEY = 'site_access_pin';

  if (!ENABLED) return;

  function isUnlocked() {
    try {
      if (typeof window !== 'undefined' && window.location && window.location.search && window.location.search.includes('unlock=11222')) {
        sessionStorage.setItem(STORAGE_KEY, CORRECT_PIN);
        localStorage.setItem(STORAGE_KEY, CORRECT_PIN);
        return true;
      }
      return (
        sessionStorage.getItem(STORAGE_KEY) === CORRECT_PIN ||
        localStorage.getItem(STORAGE_KEY) === CORRECT_PIN
      );
    } catch (e) {
      return false;
    }
  }

  if (isUnlocked()) {
    return;
  }

  // Prevent flash of content before DOM is ready
  const preLockStyle = document.createElement('style');
  preLockStyle.id = 'gate-prelock-style';
  preLockStyle.textContent = `
    html.gate-locked, html.gate-locked body {
      overflow: hidden !important;
      height: 100vh !important;
    }
  `;
  document.head.appendChild(preLockStyle);
  document.documentElement.classList.add('gate-locked');

  function initGate() {
    if (isUnlocked()) {
      document.documentElement.classList.remove('gate-locked');
      const s = document.getElementById('gate-prelock-style');
      if (s) s.remove();
      return;
    }

    // Styles for the gate overlay
    const gateStyles = document.createElement('style');
    gateStyles.id = 'gate-styles';
    gateStyles.textContent = `
      #portfolioPasswordGate {
        position: fixed;
        inset: 0;
        width: 100vw;
        height: 100vh;
        z-index: 2147483647;
        background: #ffffff;
        background: radial-gradient(circle at 50% 30%, #ffffff 0%, #f8fafc 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1.5rem;
        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        color: #0f172a;
        opacity: 1;
        transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.4s;
      }

      #portfolioPasswordGate.gate-hidden {
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
      }

      .gate-modal-card {
        background: #ffffff;
        border: 1px solid rgba(226, 232, 240, 0.9);
        box-shadow: 0 20px 40px -15px rgba(15, 23, 42, 0.08), 0 0 1px 1px rgba(15, 23, 42, 0.04);
        border-radius: 24px;
        padding: 2.75rem 2.25rem 2.5rem;
        width: 100%;
        max-width: 420px;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        position: relative;
        transform: translateY(0);
        transition: transform 0.3s ease;
      }

      .gate-lock-icon {
        width: 52px;
        height: 52px;
        border-radius: 16px;
        background: #f1f5f9;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 1.25rem;
        color: #0f172a;
      }

      .gate-lock-icon svg {
        width: 24px;
        height: 24px;
      }

      .gate-title {
        font-size: 1.45rem;
        font-weight: 700;
        color: #0f172a;
        margin-bottom: 0.5rem;
        letter-spacing: -0.02em;
      }

      .gate-desc {
        font-size: 0.9rem;
        color: #64748b;
        line-height: 1.5;
        margin-bottom: 2rem;
        max-width: 320px;
      }

      .gate-input-wrapper {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1.25rem;
      }

      .gate-pin-boxes {
        display: flex;
        gap: 10px;
        justify-content: center;
      }

      .gate-pin-digit {
        width: 48px;
        height: 56px;
        border-radius: 14px;
        border: 1.5px solid #cbd5e1;
        background: #f8fafc;
        font-size: 1.5rem;
        font-weight: 700;
        text-align: center;
        color: #0f172a;
        outline: none;
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        -webkit-text-security: disc;
      }

      .gate-pin-digit:focus {
        border-color: #0f172a;
        background: #ffffff;
        box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.1);
        transform: translateY(-2px);
      }

      .gate-pin-digit.is-filled {
        border-color: #94a3b8;
        background: #ffffff;
      }

      .gate-pin-digit.is-error {
        border-color: #ef4444;
        background: #fef2f2;
        color: #ef4444;
      }

      .gate-error-message {
        font-size: 0.85rem;
        color: #ef4444;
        font-weight: 500;
        min-height: 1.25rem;
        opacity: 0;
        transition: opacity 0.2s ease;
      }

      .gate-error-message.visible {
        opacity: 1;
      }

      .gate-submit-btn {
        width: 100%;
        padding: 0.85rem 1.25rem;
        border-radius: 14px;
        border: none;
        background: #0f172a;
        color: #ffffff;
        font-size: 0.95rem;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        transition: all 0.2s ease;
      }

      .gate-submit-btn:hover {
        background: #1e293b;
        transform: translateY(-1px);
      }

      .gate-submit-btn:active {
        transform: translateY(0);
      }

      .gate-footer-note {
        margin-top: 1.5rem;
        font-size: 0.8rem;
        color: #94a3b8;
      }

      @keyframes gateShake {
        0%, 100% { transform: translateX(0); }
        20%, 60% { transform: translateX(-8px); }
        40%, 80% { transform: translateX(8px); }
      }

      .gate-shake {
        animation: gateShake 0.4s ease-in-out;
      }
    `;
    document.head.appendChild(gateStyles);

    // Overlay DOM markup
    const gateOverlay = document.createElement('div');
    gateOverlay.id = 'portfolioPasswordGate';
    gateOverlay.setAttribute('role', 'dialog');
    gateOverlay.setAttribute('aria-modal', 'true');
    gateOverlay.setAttribute('aria-label', 'Protected Portfolio Access');

    gateOverlay.innerHTML = `
      <div class="gate-modal-card" id="gateModalCard">
        <div class="gate-lock-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        <h1 class="gate-title">Portfolio Protected</h1>
        <p class="gate-desc">Please enter the 5-digit passcode to explore Rushabh Mahore's design portfolio.</p>

        <form class="gate-input-wrapper" id="gatePinForm" onsubmit="return false;">
          <div class="gate-pin-boxes" id="gatePinBoxes">
            <input type="password" inputmode="numeric" maxlength="1" class="gate-pin-digit" data-idx="0" autofocus />
            <input type="password" inputmode="numeric" maxlength="1" class="gate-pin-digit" data-idx="1" />
            <input type="password" inputmode="numeric" maxlength="1" class="gate-pin-digit" data-idx="2" />
            <input type="password" inputmode="numeric" maxlength="1" class="gate-pin-digit" data-idx="3" />
            <input type="password" inputmode="numeric" maxlength="1" class="gate-pin-digit" data-idx="4" />
          </div>
          <div class="gate-error-message" id="gateErrorMsg">Incorrect passcode. Please try again.</div>
          <button type="submit" class="gate-submit-btn" id="gateSubmitBtn">
            <span>Unlock Portfolio</span>
            <span aria-hidden="true">→</span>
          </button>
        </form>

        <div class="gate-footer-note">rushabh. &bull; design &amp; systems</div>
      </div>
    `;

    document.body.appendChild(gateOverlay);

    const card = document.getElementById('gateModalCard');
    const digits = Array.from(document.querySelectorAll('.gate-pin-digit'));
    const errorMsg = document.getElementById('gateErrorMsg');
    const form = document.getElementById('gatePinForm');

    function getEnteredPin() {
      return digits.map(d => d.value.trim()).join('');
    }

    function unlockSuccess() {
      try {
        sessionStorage.setItem(STORAGE_KEY, CORRECT_PIN);
        localStorage.setItem(STORAGE_KEY, CORRECT_PIN);
      } catch (e) {}

      digits.forEach(d => {
        d.classList.remove('is-error');
        d.style.borderColor = '#10b981';
        d.style.background = '#ecfdf5';
      });

      setTimeout(() => {
        gateOverlay.classList.add('gate-hidden');
        document.documentElement.classList.remove('gate-locked');
        setTimeout(() => {
          gateOverlay.remove();
          const s = document.getElementById('gate-prelock-style');
          if (s) s.remove();
        }, 450);
      }, 200);
    }

    function triggerError() {
      errorMsg.classList.add('visible');
      digits.forEach(d => {
        d.classList.add('is-error');
        d.value = '';
        d.classList.remove('is-filled');
      });
      card.classList.add('gate-shake');
      setTimeout(() => {
        card.classList.remove('gate-shake');
        digits[0].focus();
      }, 450);
    }

    function checkPin() {
      const pin = getEnteredPin();
      if (pin.length < 5) return;

      if (pin === CORRECT_PIN) {
        unlockSuccess();
      } else {
        triggerError();
      }
    }

    // Digit inputs navigation (auto advance & backspace)
    digits.forEach((digit, idx) => {
      digit.addEventListener('input', e => {
        errorMsg.classList.remove('visible');
        digit.classList.remove('is-error');

        const val = digit.value;
        if (val) {
          digit.classList.add('is-filled');
          if (idx < 4) {
            digits[idx + 1].focus();
          } else {
            digit.blur();
            checkPin();
          }
        } else {
          digit.classList.remove('is-filled');
        }
      });

      digit.addEventListener('keydown', e => {
        if (e.key === 'Backspace' && !digit.value && idx > 0) {
          digits[idx - 1].focus();
          digits[idx - 1].value = '';
          digits[idx - 1].classList.remove('is-filled');
        } else if (e.key === 'ArrowLeft' && idx > 0) {
          digits[idx - 1].focus();
        } else if (e.key === 'ArrowRight' && idx < 4) {
          digits[idx + 1].focus();
        }
      });

      // Handle paste of whole PIN (e.g. 11222)
      digit.addEventListener('paste', e => {
        e.preventDefault();
        const pasted = (e.clipboardData || window.clipboardData).getData('text').trim();
        if (/^\d+$/.test(pasted)) {
          const chars = pasted.slice(0, 5).split('');
          chars.forEach((ch, cIdx) => {
            if (digits[cIdx]) {
              digits[cIdx].value = ch;
              digits[cIdx].classList.add('is-filled');
            }
          });
          if (chars.length >= 5) {
            checkPin();
          } else if (digits[chars.length]) {
            digits[chars.length].focus();
          }
        }
      });
    });

    form.addEventListener('submit', e => {
      e.preventDefault();
      checkPin();
    });

    // Focus first input
    setTimeout(() => {
      if (digits[0]) digits[0].focus();
    }, 150);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGate);
  } else {
    initGate();
  }
})();
