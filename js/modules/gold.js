const Gold = {
  get() { return JSON.parse(localStorage.getItem('vo_gold')||'[]'); },
  save(d) { localStorage.setItem('vo_gold',JSON.stringify(d)); },

  render() {
    const body = document.getElementById('pg-gold-body');
    if (!body) return;
    const items = this.get();
    const cur = Currency.get();
    const totalValue = items.reduce((a,x)=>a+(x.weight*(x.pricePerUnit||0)),0);
    body.innerHTML = `
      <div style="padding:16px">
        ${totalValue > 0 ? `<div style="background:linear-gradient(135deg,rgba(255,193,7,.15),rgba(255,152,0,.1));border:1px solid rgba(255,193,7,.3);border-radius:var(--r);padding:16px;margin-bottom:16px;text-align:center">
          <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px">Total Precious Metals Value</div>
          <div style="font-size:26px;font-weight:900;color:#ffc107">${Currency.format(totalValue,cur.base)}</div>
        </div>` : ''}
        <button class="btn btn-p" style="width:100%;margin-bottom:16px" onclick="Gold.openAdd()">+ Add Gold / Silver</button>
        ${items.length ? items.map((x,i)=>`
          <div style="background:var(--glass);border-radius:var(--r);padding:14px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center">
            <div>
              <div style="font-size:13px;font-weight:700;color:var(--text)">${x.type==='gold'?'🥇':'🥈'} ${x.name||x.type}</div>
              <div style="font-size:12px;color:var(--text3)">${x.weight}${x.unit} · ${Currency.format(x.pricePerUnit,cur.base)}/${x.unit}</div>
            </div>
            <div style="text-align:right">
              <div style="font-size:15px;font-weight:800;color:#ffc107">${Currency.format(x.weight*x.pricePerUnit,cur.base)}</div>
              <button onclick="Gold.del(${i})" style="font-size:11px;color:var(--danger);background:none;border:none;cursor:pointer;touch-action:manipulation;margin-top:4px">Remove</button>
            </div>
          </div>`).join('') : '<div style="text-align:center;padding:40px;color:var(--text3)">No precious metals added yet</div>'}
      </div>`;
  },

  openAdd() {
    Modal.open('➕ Add Precious Metal',`
      <div style="display:flex;flex-direction:column;gap:12px">
        <select id="gld-type" style="background:var(--input);border:1px solid var(--border);border-radius:8px;padding:10px;color:var(--text)">
          <option value="gold">🥇 Gold</option>
          <option value="silver">🥈 Silver</option>
          <option value="platinum">🪙 Platinum</option>
        </select>
        <input id="gld-name" placeholder="Label (e.g. 22k bangles, wedding set)" style="background:var(--input);border:1px solid var(--border);border-radius:8px;padding:10px;color:var(--text);font-size:16px">
        <div style="display:flex;gap:8px">
          <input id="gld-weight" type="number" placeholder="Weight" min="0" step="0.01" style="flex:1;background:var(--input);border:1px solid var(--border);border-radius:8px;padding:10px;color:var(--text);font-size:16px">
          <select id="gld-unit" style="width:80px;background:var(--input);border:1px solid var(--border);border-radius:8px;padding:10px;color:var(--text)">
            <option value="g">g</option>
            <option value="tola">tola</option>
            <option value="oz">oz</option>
            <option value="kg">kg</option>
          </select>
        </div>
        <input id="gld-price" type="number" placeholder="Current price per unit (enter manually)" min="0" style="background:var(--input);border:1px solid var(--border);border-radius:8px;padding:10px;color:var(--text);font-size:16px">
        <div style="font-size:11px;color:var(--text3)">Enter today's price per gram/tola/oz manually. Check your local gold rate.</div>
      </div>`,
      `<button class="btn btn-g" onclick="Modal.close()">Cancel</button><button class="btn btn-p" onclick="Gold.save_item()">Save</button>`);
  },

  save_item() {
    const type = document.getElementById('gld-type')?.value;
    const name = document.getElementById('gld-name')?.value;
    const weight = parseFloat(document.getElementById('gld-weight')?.value||0);
    const unit = document.getElementById('gld-unit')?.value;
    const price = parseFloat(document.getElementById('gld-price')?.value||0);
    if (!weight || !price) { Toast.show('Enter weight and price','error'); return; }
    const items = this.get();
    items.push({ type, name, weight, unit, pricePerUnit: price, addedAt: new Date().toISOString() });
    this.save(items);
    Modal.close();
    this.render();
    Toast.show('Added to vault','success');
  },

  del(i) {
    const items = this.get();
    items.splice(i,1);
    this.save(items);
    this.render();
  }
};
window.Gold = Gold;
