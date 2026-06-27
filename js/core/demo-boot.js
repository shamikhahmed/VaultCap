'use strict';

async function seedDemoVault() {
  loadDemoProfile('business');
  S.pin = VaultProfiles.DEMO_PIN;
  S.noPin = false;
  S.fails = 0;
  S.lockedUntil = 0;
  S.user.onboardingComplete = true;
  S.user.setupProgress = { pinSet: true, recoveryAck: true, profileDone: true };
  try {
    await VaultDB.wipe();
  } catch (e) { /* non-fatal */ }
  await VaultDB.init(VaultProfiles.DEMO_PIN);
  await VaultDB.save(Store._data());
  Store._savePrefs();
  VaultDB.sessionKey = null;
  localStorage.setItem('vo_demo_seeded', '1');
}

async function demoVaultUnlockable() {
  if (!(await VaultDB.isInitialized())) return false;
  const trial = await VaultDB.tryPin(VaultProfiles.DEMO_PIN);
  const ok = !!(trial && trial.slot === 'main');
  VaultDB.sessionKey = null;
  return ok;
}

async function ensureDemoVaultReady() {
  if (VaultProfiles.active() !== 'demo') return;
  S.fails = 0;
  S.lockedUntil = 0;
  try { sessionStorage.removeItem('vos_fails'); localStorage.removeItem('vos_fails'); } catch (e) {}
  if (await demoVaultUnlockable()) return;
  await seedDemoVault();
}

async function unlockDemoVaultWithPin(pin) {
  if (String(pin) !== VaultProfiles.DEMO_PIN) return null;
  await ensureDemoVaultReady();
  let result = await VaultDB.tryPin(VaultProfiles.DEMO_PIN);
  if (!result || result.slot !== 'main') {
    await seedDemoVault();
    result = await VaultDB.tryPin(VaultProfiles.DEMO_PIN);
  }
  return result && result.slot === 'main' ? result : null;
}
