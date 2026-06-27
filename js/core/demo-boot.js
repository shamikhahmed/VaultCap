'use strict';
async function ensureDemoVaultReady() {
  if (VaultProfiles.active() !== 'demo') return;
  if (await VaultDB.isInitialized()) return;
  loadDemoProfile('business');
  S.pin = VaultProfiles.DEMO_PIN;
  S.noPin = false;
  S.user.onboardingComplete = true;
  S.user.setupProgress = { pinSet: true, recoveryAck: true, profileDone: true };
  await VaultDB.init(VaultProfiles.DEMO_PIN);
  await VaultDB.save(Store._data());
  Store._savePrefs();
  localStorage.setItem('vo_demo_seeded', '1');
}
