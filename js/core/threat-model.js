'use strict';
/* ThreatModel — in-app security & privacy explainer */

const ThreatModel = {
  show() {
    const body = `
      <div style="display:flex;flex-direction:column;gap:14px;font-size:13px;line-height:1.6;color:var(--text2)">
        <div style="background:rgba(0,122,255,.08);border:1px solid rgba(0,122,255,.22);border-radius:14px;padding:14px">
          <div style="font-weight:800;font-size:14px;color:var(--text);margin-bottom:6px">Your threat model</div>
          <div>VaultCap assumes your device may be lost, inspected, or used offline. Secrets stay on-device unless <strong>you</strong> export them.</div>
        </div>

        <div>
          <div style="font-weight:700;color:var(--text);margin-bottom:6px">PIN (daily unlock)</div>
          <ul style="margin:0;padding-left:18px">
            <li>6-digit code derives your vault key via PBKDF2 (600k iterations).</li>
            <li>Never uploaded — wrong guesses trigger lockout.</li>
            <li>Separate from backup key and master recovery key.</li>
          </ul>
        </div>

        <div>
          <div style="font-weight:700;color:var(--text);margin-bottom:6px">Master recovery key</div>
          <ul style="margin:0;padding-left:18px">
            <li>Shown once at setup — resets PIN on <em>this</em> device.</li>
            <li>Capricorn Systems cannot retrieve it.</li>
            <li>Store offline (paper / password manager).</li>
          </ul>
        </div>

        <div>
          <div style="font-weight:700;color:var(--text);margin-bottom:6px">Backup key + .vos file</div>
          <ul style="margin:0;padding-left:18px">
            <li>Portable encrypted backup for device migration.</li>
            <li>Backup key is generated on export — not your PIN.</li>
            <li>Need <strong>both</strong> file and key to restore.</li>
          </ul>
        </div>

        <div>
          <div style="font-weight:700;color:var(--text);margin-bottom:6px">Decoy PIN</div>
          <ul style="margin:0;padding-left:18px">
            <li>Optional second PIN opens plausible fake vault under duress.</li>
            <li>Real vault remains hidden behind your true PIN.</li>
          </ul>
        </div>

        <div>
          <div style="font-weight:700;color:var(--text);margin-bottom:6px">What we do not do</div>
          <ul style="margin:0;padding-left:18px">
            <li>No cloud account or central vault.</li>
            <li>No ads, no selling financial data.</li>
            <li>No LLM required — Smart Help &amp; Smart Parser are optional / rules-based.</li>
            <li>100% free consumer app — no premium tier.</li>
          </ul>
        </div>

        <div>
          <div style="font-weight:700;color:var(--text);margin-bottom:6px">When online</div>
          <ul style="margin:0;padding-left:18px">
            <li>Exchange &amp; metal rates may fetch from public APIs (cached offline).</li>
            <li>Bank logos may load via bundled assets or privacy proxy — not your balances.</li>
            <li>Optional LLM assist (off by default) sends only text you paste to a proxy you configure.</li>
          </ul>
        </div>

        <div style="background:var(--glass);border:1px solid var(--border);border-radius:12px;padding:12px;font-size:12px;color:var(--text3)">
          Vault ID (Settings → About) helps support tickets — it is <strong>not</strong> a password and cannot decrypt data.
        </div>
      </div>`;

    if (typeof Modal !== 'undefined') {
      Modal.open('Security & privacy model', body,
        '<button type="button" class="btn btn-p btn-full" onclick="Modal.close()">Got it</button>');
    }
  },

  hookSettings() {
    if (typeof Settings !== 'undefined') {
      Settings.showThreatModel = () => ThreatModel.show();
    }
  },
};

ThreatModel.hookSettings();

window.ThreatModel = ThreatModel;
