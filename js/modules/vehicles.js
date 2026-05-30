const Vehicles = {
  render() {
    const el = document.getElementById('vItems');
    if (!el) return;
    const data = S.vehicles || [];
    if (!data.length) {
      el.innerHTML = `<div class="empty"><div class="empty-ic">🚗</div><h3>No vehicles</h3><p>Track your cars, fuel logs, service history, insurance and documents</p><button class="btn btn-p" style="margin-top:12px" onclick="Vehicles.openAdd()">🚗 Add Vehicle</button></div>`;
      return;
    }
    el.innerHTML = data.map(v => {
      const ins = v.insurance || [];
      const hasIns = ins.some(i => i.expiryDate && new Date(i.expiryDate) >= new Date());
      return `<div class="entry" onclick="Vehicles.detail('${v.id}')">
        <div class="entry-main">
          <div class="entry-ic">🚗</div>
          <div class="entry-body">
            <div class="entry-name">${v.year ? v.year + ' ' : ''}${v.make || ''} ${v.model || ''}</div>
            <div class="entry-sub">${[v.color, v.regNumber, v.fuelType].filter(Boolean).join(' · ')}</div>
            <div class="entry-meta">
              ${v.currentValue ? `<span class="badge b-acc">${v.currency || ''} ${U.fmt(v.currentValue)}</span>` : ''}
              <span class="badge ${hasIns ? 'b-ok' : 'b-err'}">${hasIns ? 'Insured' : 'No Insurance'}</span>
              ${(v.fuelLog||[]).length ? `<span class="badge b-muted">⛽ ${(v.fuelLog||[]).length} logs</span>` : ''}
            </div>
          </div>
          <div class="entry-acts">
            <button class="icb" onclick="event.stopPropagation();Vehicles.edit('${v.id}')">✏️</button>
            <button class="icb del" onclick="event.stopPropagation();Vehicles.del('${v.id}')">🗑️</button>
          </div>
        </div>
      </div>`;
    }).join('');
  },

  openAdd() {
    Modal.open('🚗 Add Vehicle', this.form(), `<button class="btn btn-g" onclick="Modal.close()">Cancel</button><button class="btn btn-p" onclick="Vehicles.save()">Save</button>`);
    setTimeout(() => { const c = document.getElementById('vf-cur'); if (c) c.value = S.user.currency || 'PKR'; }, 50);
  },

  form(v = {}) {
    const yr = new Date().getFullYear();
    const makeModel = v.make ? (v.make + (v.model ? ' ' + v.model : '')) : '';
    const hasExtra = !!(v.regNumber || v.vinNumber || v.fuelType || v.engineCC || v.transmission || v.purchaseDate || v.purchasePrice || v.currentValue);
    return `
      <div class="fg"><label class="fl">Make &amp; Model *</label>
        <datalist id="vModelDL">
          <option>Toyota Corolla</option><option>Toyota Hilux Revo</option><option>Toyota Prado</option><option>Toyota Land Cruiser</option>
          <option>Honda Civic</option><option>Honda City</option><option>Honda BR-V</option><option>Honda HR-V</option>
          <option>Suzuki Swift</option><option>Suzuki Alto</option><option>Suzuki Cultus</option><option>Suzuki Vitara</option>
          <option>BMW 3 Series</option><option>BMW 5 Series</option><option>BMW X5</option>
          <option>Mercedes C-Class</option><option>Mercedes E-Class</option><option>Mercedes GLC</option>
          <option>Audi A4</option><option>Audi Q7</option><option>Hyundai Tucson</option><option>Kia Sportage</option>
          <option>Tesla Model 3</option><option>Tesla Model Y</option>
        </datalist>
        <input class="inp" id="vf-makemodel" value="${makeModel}" list="vModelDL" placeholder="e.g. Toyota Hilux Revo GR-S">
      </div>
      <div class="fr">
        <div class="fg"><label class="fl">Year</label><input class="inp" id="vf-year" type="number" value="${v.year||''}" placeholder="${yr}" min="1900" max="${yr+2}"></div>
        <div class="fg"><label class="fl">Color</label><input class="inp" id="vf-color" value="${v.color||''}" placeholder="White, Black..."></div>
      </div>
      <details${hasExtra?' open':''} style="margin-top:10px">
        <summary style="cursor:pointer;font-size:12px;font-weight:700;color:var(--text2);padding:6px 0;list-style:none;display:flex;align-items:center;gap:6px"><span style="flex:1">More details</span><span style="font-size:10px;color:var(--text3)">▾</span></summary>
        <div style="padding-top:10px">
          <div class="fr">
            <div class="fg"><label class="fl">Reg Number</label><input class="inp" id="vf-reg" value="${v.regNumber||''}" placeholder="ABC-1234"></div>
            <div class="fg"><label class="fl">VIN / Chassis</label><input class="inp" id="vf-vin" value="${v.vinNumber||''}" placeholder="17-char VIN"></div>
          </div>
          <div class="fr">
            <div class="fg"><label class="fl">Fuel Type</label>
              <datalist id="vFuelDL"><option>Petrol</option><option>Diesel</option><option>Electric</option><option>Hybrid</option><option>CNG</option><option>LPG</option></datalist>
              <input class="inp" id="vf-fuel" value="${v.fuelType||''}" list="vFuelDL" placeholder="Petrol...">
            </div>
            <div class="fg"><label class="fl">Engine CC</label><input class="inp" id="vf-cc" type="number" value="${v.engineCC||''}" placeholder="1300..."></div>
          </div>
          <div class="fr">
            <div class="fg"><label class="fl">Transmission</label>
              <datalist id="vTransDL"><option>Manual</option><option>Automatic</option><option>CVT</option><option>DCT</option><option>AMT</option></datalist>
              <input class="inp" id="vf-trans" value="${v.transmission||''}" list="vTransDL" placeholder="Manual...">
            </div>
            <div class="fg"><label class="fl">Purchase Date</label><input class="inp" id="vf-date" type="date" value="${v.purchaseDate||''}"></div>
          </div>
          <div class="fr">
            <div class="fg"><label class="fl">Purchase Price</label><input class="inp" id="vf-pp" type="number" value="${v.purchasePrice||''}" placeholder="0"></div>
            <div class="fg"><label class="fl">Current Value</label><input class="inp" id="vf-cv" type="number" value="${v.currentValue||''}" placeholder="0"></div>
          </div>
          <div class="fg"><label class="fl">Currency</label><select class="inp" id="vf-cur">${U.currencies()}</select></div>
        </div>
      </details>`;
  },

  save(editId = null) {
    const makeModel = (document.getElementById('vf-makemodel')?.value || '').trim();
    if (!makeModel) { Toast.show('Make & Model required', 'warning'); return; }
    const parts = makeModel.split(' ');
    const make = parts[0];
    const model = parts.slice(1).join(' ');
    const v = {
      make, model,
      year: parseInt(document.getElementById('vf-year')?.value) || null,
      color: document.getElementById('vf-color')?.value.trim() || '',
      regNumber: document.getElementById('vf-reg')?.value.trim() || '',
      vinNumber: document.getElementById('vf-vin')?.value.trim() || '',
      fuelType: document.getElementById('vf-fuel')?.value.trim() || '',
      engineCC: parseInt(document.getElementById('vf-cc')?.value) || null,
      transmission: document.getElementById('vf-trans')?.value.trim() || '',
      purchaseDate: document.getElementById('vf-date')?.value || '',
      purchasePrice: parseFloat(document.getElementById('vf-pp')?.value) || 0,
      currentValue: parseFloat(document.getElementById('vf-cv')?.value) || 0,
      currency: document.getElementById('vf-cur')?.value || S.user.currency || 'PKR',
    };
    if (!S.vehicles) S.vehicles = [];
    if (editId) {
      const idx = S.vehicles.findIndex(x => x.id === editId);
      if (idx >= 0) S.vehicles[idx] = { ...S.vehicles[idx], ...v };
      Store.save(); Modal.close();
      Toast.show('Vehicle updated', 'success');
      this.render();
      Activity.log('Updated vehicle', makeModel);
    } else {
      const vid = U.id();
      S.vehicles.push({ id: vid, createdAt: new Date().toISOString(), fuelLog:[], serviceHistory:[], insurance:[], documents:{}, modifications:[], ...v });
      Store.save(); Modal.close();
      Toast.show('Vehicle saved', 'success');
      this.render();
      Activity.log('Added vehicle', makeModel);
      // Prompt to add first fuel log
      const bar = document.createElement('div');
      bar.id = 'add-fuel-bar';
      bar.style.cssText = 'position:fixed;bottom:calc(var(--tabh) + env(safe-area-inset-bottom) + 8px);left:50%;transform:translateX(-50%);background:var(--bg2);border:1px solid var(--border2);border-radius:var(--rfull);padding:10px 18px;display:flex;align-items:center;gap:12px;z-index:9999;box-shadow:var(--shadowlg);animation:slideIn .25s var(--spring);white-space:nowrap;';
      bar.innerHTML = `<span style="font-size:13px;color:var(--text2)">⛽ Add a fuel log?</span><button class="btn btn-p btn-sm" onclick="document.getElementById('add-fuel-bar').remove();Vehicles.addFuelLog('${vid}')">Yes</button><button class="btn btn-g btn-sm" onclick="document.getElementById('add-fuel-bar').remove()">No</button>`;
      document.body.appendChild(bar);
      setTimeout(() => { if (bar.isConnected) bar.remove(); }, 8000);
    }
  },

  edit(id) {
    const v = S.vehicles.find(x => x.id === id);
    if (!v) return;
    Modal.open('✏️ Edit Vehicle', this.form(v), `<button class="btn btn-g" onclick="Modal.close()">Cancel</button><button class="btn btn-p" onclick="Vehicles.save('${id}')">Save</button>`);
    setTimeout(() => {
      const c = document.getElementById('vf-cur'); if (c) c.value = v.currency || 'PKR';
      const mm = document.getElementById('vf-makemodel'); if (mm) mm.value = v.make + (v.model ? ' ' + v.model : '');
    }, 50);
  },

  del(id) {
    if (!window.__vos_confirm('Delete this vehicle?')) return;
    S.vehicles = S.vehicles.filter(x => x.id !== id);
    Store.save();
    Toast.show('Deleted', 'info');
    this.render();
  },

  detail(id) {
    const v = S.vehicles.find(x => x.id === id);
    if (!v) return;
    const tabs = ['Overview','Fuel','Service','Insurance','Docs','Mods'];
    Modal.open(`🚗 ${v.make} ${v.model}`,
      `<div style="padding-bottom:6px"><div style="font-size:16px;font-weight:700">${v.year||''} ${v.make} ${v.model}</div><div style="font-size:12px;color:var(--text3)">${v.regNumber||'No reg'} · ${v.color||''}</div></div>
       <div class="chips" id="vDetailTabs" style="margin:8px 0 10px"></div>
       <div id="vDetailBody"></div>`,
      `<button class="btn btn-g" onclick="Modal.close()">Close</button><button class="btn btn-s btn-sm" onclick="Vehicles.edit('${id}')">✏️ Edit</button>`
    );
    setTimeout(() => Vehicles._tab(id, 'Overview'), 50);
  },

  _tab(id, tab) {
    const v = S.vehicles.find(x => x.id === id);
    if (!v) return;
    const tabs = ['Overview','Fuel','Service','Insurance','Docs','Mods'];
    const tb = document.getElementById('vDetailTabs');
    const body = document.getElementById('vDetailBody');
    if (tb) tb.innerHTML = tabs.map(t => `<div class="chip${t===tab?' on':''}" onclick="Vehicles._tab('${id}','${t}')">${t}</div>`).join('');
    if (body) body.innerHTML = Vehicles._tabContent(v, tab);
  },

  _tabContent(v, tab) {
    if (tab === 'Overview') return `
      ${v.color ? `<div class="dr"><div class="dk">Color</div><div class="dv">${v.color}</div></div>` : ''}
      ${v.regNumber ? `<div class="dr"><div class="dk">Reg No.</div><div class="dv sens">${v.regNumber}</div></div>` : ''}
      ${v.vinNumber ? `<div class="dr"><div class="dk">VIN</div><div class="dv sens" style="font-size:11px">${v.vinNumber}</div></div>` : ''}
      ${v.fuelType ? `<div class="dr"><div class="dk">Fuel</div><div class="dv">${v.fuelType}</div></div>` : ''}
      ${v.engineCC ? `<div class="dr"><div class="dk">Engine</div><div class="dv">${v.engineCC}cc</div></div>` : ''}
      ${v.transmission ? `<div class="dr"><div class="dk">Transmission</div><div class="dv">${v.transmission}</div></div>` : ''}
      ${v.purchaseDate ? `<div class="dr"><div class="dk">Purchase Date</div><div class="dv">${v.purchaseDate}</div></div>` : ''}
      ${v.purchasePrice ? `<div class="dr"><div class="dk">Purchase Price</div><div class="dv sens">${v.currency} ${U.fmt(v.purchasePrice)}</div></div>` : ''}
      ${v.currentValue ? `<div class="dr"><div class="dk">Current Value</div><div class="dv sens">${v.currency} ${U.fmt(v.currentValue)}</div></div>` : ''}`;

    if (tab === 'Fuel') {
      const logs = (v.fuelLog || []).slice().reverse();
      return `<button class="btn btn-p btn-sm" style="width:100%;margin-bottom:10px" onclick="Vehicles.addFuelLog('${v.id}')">+ Add Fuel Log</button>
        ${logs.length ? logs.map(f => `<div class="entry"><div class="entry-main"><div class="entry-ic">⛽</div><div class="entry-body"><div class="entry-name">${f.date||''}</div><div class="entry-sub">${f.liters||0}L${f.station?' · '+f.station:''}</div><div class="entry-meta"><span class="badge b-acc sens">${v.currency} ${U.fmt(f.totalCost||0)}</span>${f.odometer?`<span class="badge b-muted">${U.fmt(f.odometer)} km</span>`:''}</div></div></div></div>`).join('') : '<div class="empty" style="padding:20px"><div class="empty-ic" style="font-size:24px">⛽</div><p>No fuel logs yet</p></div>'}`;
    }
    if (tab === 'Service') {
      const hist = (v.serviceHistory || []).slice().reverse();
      return `<button class="btn btn-p btn-sm" style="width:100%;margin-bottom:10px" onclick="Vehicles.addService('${v.id}')">+ Add Service</button>
        ${hist.length ? hist.map(s => `<div class="entry"><div class="entry-main"><div class="entry-ic">🔧</div><div class="entry-body"><div class="entry-name">${s.type||'Service'}</div><div class="entry-sub">${s.date||''}${s.garage?' · '+s.garage:''}</div><div class="entry-meta"><span class="badge b-acc sens">${v.currency} ${U.fmt(s.cost||0)}</span>${s.nextDue?`<span class="badge b-warn">Next: ${s.nextDue}</span>`:''}</div></div></div></div>`).join('') : '<div class="empty" style="padding:20px"><div class="empty-ic" style="font-size:24px">🔧</div><p>No service history yet</p></div>'}`;
    }
    if (tab === 'Insurance') {
      const ins = v.insurance || [];
      return `<button class="btn btn-p btn-sm" style="width:100%;margin-bottom:10px" onclick="Vehicles.addInsurance('${v.id}')">+ Add Insurance</button>
        ${ins.length ? ins.map(i => `<div class="entry"><div class="entry-main"><div class="entry-ic">🛡️</div><div class="entry-body"><div class="entry-name">${i.provider||'Insurance'}</div><div class="entry-sub">Policy: ${i.policyNumber||'—'} · ${i.coverType||''}</div><div class="entry-meta"><span class="badge b-acc">Premium: ${U.fmt(i.premium||0)}</span>${i.expiryDate?`<span class="badge ${new Date(i.expiryDate)<new Date()?'b-err':'b-ok'}">Exp ${i.expiryDate}</span>`:''}</div></div></div></div>`).join('') : '<div class="empty" style="padding:20px"><div class="empty-ic" style="font-size:24px">🛡️</div><p>No insurance records yet</p></div>'}`;
    }
    if (tab === 'Docs') {
      const d = v.documents || {};
      return `<button class="btn btn-p btn-sm" style="width:100%;margin-bottom:10px" onclick="Vehicles.editDocs('${v.id}')">✏️ Edit Documents</button>
        ${d.regExpiry ? `<div class="dr"><div class="dk">Reg Expiry</div><div class="dv">${d.regExpiry}</div></div>` : '<div style="color:var(--text3);font-size:12px;padding:6px 0">Registration: not set</div>'}
        ${d.tokenTaxDue ? `<div class="dr"><div class="dk">Token Tax Due</div><div class="dv">${d.tokenTaxDue}</div></div>` : ''}
        ${d.fitnessExpiry ? `<div class="dr"><div class="dk">Fitness Expiry</div><div class="dv">${d.fitnessExpiry}</div></div>` : ''}
        ${d.routePermitExpiry ? `<div class="dr"><div class="dk">Route Permit Expiry</div><div class="dv">${d.routePermitExpiry}</div></div>` : ''}`;
    }
    if (tab === 'Mods') {
      const mods = (v.modifications || []).slice().reverse();
      return `<button class="btn btn-p btn-sm" style="width:100%;margin-bottom:10px" onclick="Vehicles.addMod('${v.id}')">+ Add Modification</button>
        ${mods.length ? mods.map(m => `<div class="entry"><div class="entry-main"><div class="entry-ic">🔩</div><div class="entry-body"><div class="entry-name">${m.desc||'Modification'}</div><div class="entry-sub">${m.date||''}</div><div class="entry-meta"><span class="badge b-acc sens">${v.currency} ${U.fmt(m.cost||0)}</span></div></div></div></div>`).join('') : '<div class="empty" style="padding:20px"><div class="empty-ic" style="font-size:24px">🔩</div><p>No modifications yet</p></div>'}`;
    }
    return '';
  },

  addFuelLog(vid) {
    Modal.open('⛽ Add Fuel Log', `
      <div class="fr"><div class="fg"><label class="fl">Date</label><input class="inp" id="fl-date" type="date" value="${new Date().toISOString().slice(0,10)}"></div><div class="fg"><label class="fl">Liters *</label><input class="inp" id="fl-liters" type="number" step="0.1" placeholder="40"></div></div>
      <div class="fr"><div class="fg"><label class="fl">Cost / Liter</label><input class="inp" id="fl-cpl" type="number" step="0.01" placeholder="0"></div><div class="fg"><label class="fl">Total Cost</label><input class="inp" id="fl-total" type="number" step="any" placeholder="0"></div></div>
      <div class="fr"><div class="fg"><label class="fl">Odometer (km)</label><input class="inp" id="fl-odo" type="number" placeholder="0"></div><div class="fg"><label class="fl">Station</label><input class="inp" id="fl-station" placeholder="PSO, Shell..."></div></div>`,
      `<button class="btn btn-g" onclick="Modal.close()">Cancel</button><button class="btn btn-p" onclick="Vehicles._saveFuel('${vid}')">Save</button>`);
  },

  _saveFuel(vid) {
    const v = S.vehicles.find(x => x.id === vid); if (!v) return;
    if (!v.fuelLog) v.fuelLog = [];
    v.fuelLog.push({ date: document.getElementById('fl-date')?.value||'', liters: parseFloat(document.getElementById('fl-liters')?.value)||0, costPerLiter: parseFloat(document.getElementById('fl-cpl')?.value)||0, totalCost: parseFloat(document.getElementById('fl-total')?.value)||0, odometer: parseInt(document.getElementById('fl-odo')?.value)||0, station: document.getElementById('fl-station')?.value.trim()||'' });
    Store.save(); Modal.close(); Toast.show('Fuel log added','success');
    setTimeout(() => Vehicles.detail(vid), 100);
  },

  addService(vid) {
    Modal.open('🔧 Add Service Record', `
      <div class="fr"><div class="fg"><label class="fl">Date</label><input class="inp" id="sv-date" type="date" value="${new Date().toISOString().slice(0,10)}"></div><div class="fg"><label class="fl">Type *</label><datalist id="svTypeDL"><option>Oil Change</option><option>Tyre Change</option><option>Brake Service</option><option>Major Service</option><option>Minor Service</option><option>Battery</option><option>AC Service</option></datalist><input class="inp" id="sv-type" list="svTypeDL" placeholder="Oil Change, Service..."></div></div>
      <div class="fg"><label class="fl">Description</label><textarea class="inp" id="sv-desc" rows="2" placeholder="Work done..."></textarea></div>
      <div class="fr"><div class="fg"><label class="fl">Cost</label><input class="inp" id="sv-cost" type="number" placeholder="0"></div><div class="fg"><label class="fl">Mileage (km)</label><input class="inp" id="sv-mileage" type="number" placeholder="0"></div></div>
      <div class="fr"><div class="fg"><label class="fl">Next Due</label><input class="inp" id="sv-next" type="date"></div><div class="fg"><label class="fl">Garage</label><input class="inp" id="sv-garage" placeholder="Garage name"></div></div>`,
      `<button class="btn btn-g" onclick="Modal.close()">Cancel</button><button class="btn btn-p" onclick="Vehicles._saveService('${vid}')">Save</button>`);
  },

  _saveService(vid) {
    const v = S.vehicles.find(x => x.id === vid); if (!v) return;
    if (!v.serviceHistory) v.serviceHistory = [];
    v.serviceHistory.push({ date: document.getElementById('sv-date')?.value||'', type: document.getElementById('sv-type')?.value.trim()||'', desc: document.getElementById('sv-desc')?.value.trim()||'', cost: parseFloat(document.getElementById('sv-cost')?.value)||0, mileage: parseInt(document.getElementById('sv-mileage')?.value)||0, nextDue: document.getElementById('sv-next')?.value||'', garage: document.getElementById('sv-garage')?.value.trim()||'' });
    Store.save(); Modal.close(); Toast.show('Service record added','success');
    setTimeout(() => Vehicles.detail(vid), 100);
  },

  addInsurance(vid) {
    Modal.open('🛡️ Add Insurance', `
      <div class="fr"><div class="fg"><label class="fl">Provider *</label><input class="inp" id="in-prov" placeholder="EFU, Jubilee, AXA..."></div><div class="fg"><label class="fl">Policy Number</label><input class="inp" id="in-pol" placeholder="Policy #"></div></div>
      <div class="fr"><div class="fg"><label class="fl">Start Date</label><input class="inp" id="in-start" type="date"></div><div class="fg"><label class="fl">Expiry Date</label><input class="inp" id="in-exp" type="date"></div></div>
      <div class="fr"><div class="fg"><label class="fl">Premium (annual)</label><input class="inp" id="in-prem" type="number" placeholder="0"></div><div class="fg"><label class="fl">Cover Type</label><datalist id="inCoverDL"><option>Comprehensive</option><option>Third Party</option><option>Third Party Fire &amp; Theft</option></datalist><input class="inp" id="in-cover" list="inCoverDL" placeholder="Comprehensive..."></div></div>`,
      `<button class="btn btn-g" onclick="Modal.close()">Cancel</button><button class="btn btn-p" onclick="Vehicles._saveInsurance('${vid}')">Save</button>`);
  },

  _saveInsurance(vid) {
    const v = S.vehicles.find(x => x.id === vid); if (!v) return;
    if (!v.insurance) v.insurance = [];
    v.insurance.push({ provider: document.getElementById('in-prov')?.value.trim()||'', policyNumber: document.getElementById('in-pol')?.value.trim()||'', startDate: document.getElementById('in-start')?.value||'', expiryDate: document.getElementById('in-exp')?.value||'', premium: parseFloat(document.getElementById('in-prem')?.value)||0, coverType: document.getElementById('in-cover')?.value.trim()||'' });
    Store.save(); Modal.close(); Toast.show('Insurance added','success');
    setTimeout(() => Vehicles.detail(vid), 100);
  },

  editDocs(vid) {
    const v = S.vehicles.find(x => x.id === vid); if (!v) return;
    const d = v.documents || {};
    Modal.open('🪪 Vehicle Documents', `
      <div class="fg"><label class="fl">Registration Expiry</label><input class="inp" id="vd-reg" type="date" value="${d.regExpiry||''}"></div>
      <div class="fg"><label class="fl">Token Tax Due</label><input class="inp" id="vd-tax" type="date" value="${d.tokenTaxDue||''}"></div>
      <div class="fg"><label class="fl">Fitness Certificate Expiry</label><input class="inp" id="vd-fit" type="date" value="${d.fitnessExpiry||''}"></div>
      <div class="fg"><label class="fl">Route Permit Expiry</label><input class="inp" id="vd-route" type="date" value="${d.routePermitExpiry||''}"></div>`,
      `<button class="btn btn-g" onclick="Modal.close()">Cancel</button><button class="btn btn-p" onclick="Vehicles._saveDocs('${vid}')">Save</button>`);
  },

  _saveDocs(vid) {
    const v = S.vehicles.find(x => x.id === vid); if (!v) return;
    v.documents = { regExpiry: document.getElementById('vd-reg')?.value||'', tokenTaxDue: document.getElementById('vd-tax')?.value||'', fitnessExpiry: document.getElementById('vd-fit')?.value||'', routePermitExpiry: document.getElementById('vd-route')?.value||'' };
    Store.save(); Modal.close(); Toast.show('Documents updated','success');
    setTimeout(() => Vehicles.detail(vid), 100);
  },

  addMod(vid) {
    Modal.open('🔩 Add Modification', `
      <div class="fr"><div class="fg"><label class="fl">Date</label><input class="inp" id="md-date" type="date" value="${new Date().toISOString().slice(0,10)}"></div><div class="fg"><label class="fl">Cost</label><input class="inp" id="md-cost" type="number" placeholder="0"></div></div>
      <div class="fg"><label class="fl">Description *</label><textarea class="inp" id="md-desc" rows="2" placeholder="Tinted windows, alloy wheels..."></textarea></div>`,
      `<button class="btn btn-g" onclick="Modal.close()">Cancel</button><button class="btn btn-p" onclick="Vehicles._saveMod('${vid}')">Save</button>`);
  },

  _saveMod(vid) {
    const v = S.vehicles.find(x => x.id === vid); if (!v) return;
    if (!v.modifications) v.modifications = [];
    const desc = document.getElementById('md-desc')?.value.trim();
    if (!desc) { Toast.show('Description required','warning'); return; }
    v.modifications.push({ date: document.getElementById('md-date')?.value||'', desc, cost: parseFloat(document.getElementById('md-cost')?.value)||0 });
    Store.save(); Modal.close(); Toast.show('Modification added','success');
    setTimeout(() => Vehicles.detail(vid), 100);
  },
};
