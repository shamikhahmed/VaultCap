const DocsModule={
  filter:'all',
  render(){
    const ci=document.getElementById('docsChips');
    const el=document.getElementById('docsItems');
    if(!ci||!el)return;
    const cats=[['all','All'],['passport','📘 Passport'],['nic','🪪 ID'],['driving_license','🚗 Driving'],['visa','✈️ Visa'],['property_doc','🏠 Property'],['insurance_doc','🛡️ Insurance'],['vehicle_reg','🚗 Vehicle Reg'],['tax','📋 Tax'],['medical','🏥 Medical'],['warranty','🧾 Warranty'],['contract','📝 Contract'],['certificate','🎓 Certificate'],['other','📄 Other']];
    ci.innerHTML=cats.map(([v,l])=>`<div class="chip${this.filter===v?' on':''}" onclick="DocsModule.filter='${v}';DocsModule.render()">${l}</div>`).join('');
    const q=(document.getElementById('docsQ')?.value||'').toLowerCase();
    const docs=(S.documents||[]).filter(d=>(this.filter==='all'||d.docType===this.filter)&&(!q||JSON.stringify(d).toLowerCase().includes(q)));
    if(!docs.length){
      el.innerHTML=`<div class="empty"><div class="empty-ic">🪪</div><h3>No documents yet</h3><p>Store your IDs, passports, visas and more</p><button class="btn btn-p" style="margin-top:12px" onclick="DocsModule.openAdd()">+ Add Document</button></div>`;
      return;
    }
    const now=new Date();
    el.innerHTML=docs.map(d=>{
      const schema=DOC_SCHEMAS[d.docType]||DOC_SCHEMAS.other;
      const exp=d.expiryDate?new Date(d.expiryDate):null;
      const daysLeft=exp?Math.ceil((exp-now)/864e5):null;
      const expStatus=!exp?'':daysLeft<0?'b-err':daysLeft<=30?'b-warn':daysLeft<=90?'b-ok':'b-muted';
      const expLabel=!exp?'':daysLeft<0?'Expired '+Math.abs(daysLeft)+'d ago':daysLeft<=0?'Expires today':'Exp '+exp.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'2-digit'});
      const subtitle=[d.holderName,d.issuingCountry,d.docNumber?'Ref: '+d.docNumber.slice(-4).padStart(d.docNumber.length,'•'):''].filter(Boolean).join(' · ');
      return `<div class="entry"><div class="entry-main"><div class="entry-ic">${schema.ic}</div><div class="entry-body"><div class="entry-name">${schema.label}${d.docSubType?' — '+d.docSubType:''}</div><div class="entry-sub">${subtitle}</div><div class="entry-meta">${exp?`<span class="badge ${expStatus}">${expLabel}</span>`:''} ${d.notes?'<span class="badge b-muted">Notes</span>':''} ${d.linkedEntries?.length?'<span class="badge b-muted">🔗 Linked</span>':''}</div></div><div class="entry-acts"><button class="icb${d.pinned?' on':''}" onclick="DocsModule.pin('${d.id}')" title="Pin">📌</button><button class="icb" onclick="DocsModule.edit('${d.id}')">✏️</button><button class="icb del" onclick="DocsModule.del('${d.id}')">🗑️</button></div></div></div>`;
    }).join('');
  },
  buildForm(schema,d={}){
    return schema.fields.map(f=>{
      const val=d[f.id]||'';
      if(f.multi)return `<div class="fg"><label class="fl">${f.label}</label><textarea class="inp" id="df-${f.id}" rows="3" placeholder="${f.ph||''}">${val}</textarea></div>`;
      if(f.type==='date')return `<div class="fg"><label class="fl">${f.label}</label><input class="inp" id="df-${f.id}" type="date" value="${val}"></div>`;
      if(f.list)return `<div class="fg"><label class="fl">${f.label}</label><datalist id="dl-${f.id}">${f.list.split(',').map(o=>`<option>${o}</option>`).join('')}</datalist><input class="inp" id="df-${f.id}" list="dl-${f.id}" value="${val}" placeholder="${f.ph||''}"></div>`;
      return `<div class="fg"><label class="fl">${f.label}</label><input class="inp" id="df-${f.id}" value="${val}" placeholder="${f.ph||''}"></div>`;
    }).join('');
  },
  _smartToSchemaType(t){
    const m={cnic:'nic',driving_licence:'driving_license',ntn:'tax',emirates_id:'nic',vaccination:'medical'};
    return m[t]||t;
  },
  openAdd(){
    const smartNames=(SMART_DB.documents||[]).map(d=>`<option value="${d.name}">`).join('');
    Modal.open('🪪 Add Document',`
    <div class="fg"><label class="fl">Document Type *</label>
      <datalist id="docTypeDL2">${DOC_TYPES.map(t=>`<option value="${DOC_SCHEMAS[t].label}">`).join('')}${smartNames}</datalist>
      <input class="inp" id="doc-type-sel" list="docTypeDL2" placeholder="CNIC, Passport, Visa, Insurance..." oninput="DocsModule.onTypeChange(this.value)" autocomplete="off">
    </div>
    <div id="doc-dynamic-fields"></div>
    <div class="fg"><label class="fl">Notes</label><textarea class="inp" id="df-notes" rows="2" placeholder="Any additional details..."></textarea></div>
    <div class="fg"><label class="fl">Tags</label>${U.tags([])}`,
    `<button class="btn btn-g" onclick="Modal.close()">Cancel</button><button class="btn btn-p" onclick="DocsModule.save()">Save Document</button>`);
  },
  onTypeChange(val){
    if(!val.trim()){document.getElementById('doc-dynamic-fields').innerHTML='';return;}
    // Check SMART_DB.documents first for known doc types
    const smartDoc=(SMART_DB.documents||[]).find(d=>
      d.name.toLowerCase().includes(val.toLowerCase())||
      val.toLowerCase().includes(d.name.toLowerCase().split(' ').slice(-1)[0])
    );
    // Resolve to a DOC_SCHEMAS key
    const key=smartDoc
      ?this._smartToSchemaType(smartDoc.type)
      :Object.keys(DOC_SCHEMAS).find(k=>
          DOC_SCHEMAS[k].label.toLowerCase()===val.toLowerCase()||
          k===val.toLowerCase().replace(/[\s-]+/g,'_')
        );
    const schema=key?DOC_SCHEMAS[key]:null;
    const el=document.getElementById('doc-dynamic-fields');
    if(el&&schema){
      el.innerHTML=this.buildForm(schema);
      // Auto-fill number format hint from SMART_DB
      if(smartDoc){
        setTimeout(()=>{
          const numEl=document.getElementById('df-docNumber');
          if(numEl&&smartDoc.numberFormat){
            numEl.placeholder=smartDoc.numberFormat+' (format hint)';
            numEl.title='Format: '+smartDoc.numberFormat;
          }
          // Hide expiry date field if document type doesn't have expiry
          if(smartDoc.hasExpiry===false){
            const expEl=document.getElementById('df-expiryDate');
            if(expEl){const fg=expEl.closest('.fg');if(fg)fg.style.display='none';}
          }
        },30);
      }
    } else if(el){el.innerHTML='';}
  },
  save(editId=null){
    const typeRaw=document.getElementById('doc-type-sel')?.value||'other';
    const docType=Object.keys(DOC_SCHEMAS).find(k=>DOC_SCHEMAS[k].label.toLowerCase()===typeRaw.toLowerCase()||k===typeRaw.toLowerCase().replace(/\s+/g,'_'))||'other';
    const schema=DOC_SCHEMAS[docType];
    const g=id=>{const e=document.getElementById('df-'+id);return e?e.value.trim():''};
    const data={id:editId||U.id(),docType,createdAt:editId?(S.documents||[]).find(x=>x.id===editId)?.createdAt:new Date().toISOString(),notes:g('notes'),tags:U.getTags()};
    schema.fields.forEach(f=>{data[f.id]=g(f.id);});
    if(!S.documents)S.documents=[];
    if(editId)S.documents=S.documents.map(x=>x.id===editId?data:x);else S.documents.push(data);
    Activity.log((editId?'Edited':'Added')+' document',schema.label);Store.save();Modal.close();this.render();
    Toast.show((editId?'Updated':'Added')+': '+schema.label,'success');
  },
  edit(id){
    if(!S.documents)return;
    const d=S.documents.find(x=>x.id===id);if(!d)return;
    const schema=DOC_SCHEMAS[d.docType]||DOC_SCHEMAS.other;
    Modal.open(`✏️ Edit ${schema.label}`,`
    <div class="fg"><label class="fl">Document Type</label><input class="inp" id="doc-type-sel" value="${schema.label}" readonly style="opacity:.7"></div>
    ${this.buildForm(schema,d)}
    <div class="fg"><label class="fl">Notes</label><textarea class="inp" id="df-notes" rows="2">${d.notes||''}</textarea></div>
    <div class="fg"><label class="fl">Tags</label>${U.tags(d.tags||[])}`,
    `<button class="btn btn-g" onclick="Modal.close()">Cancel</button><button class="btn btn-d btn-sm" onclick="DocsModule.del('${id}',true)">Delete</button><button class="btn btn-p" onclick="DocsModule.save('${id}')">Update</button>`);
  },
  pin(id){if(!S.documents)return;const d=S.documents.find(x=>x.id===id);if(d){d.pinned=!d.pinned;Store.save();this.render();}},
  del(id,fromModal=false){
    if(!window.__vos_confirm('Delete this document?'))return;
    if(!S.documents)return;
    const d=S.documents.find(x=>x.id===id);
    S.documents=S.documents.filter(x=>x.id!==id);
    Activity.log('Deleted document',d?.docType);Store.save();if(fromModal)Modal.close();this.render();
  }
};
