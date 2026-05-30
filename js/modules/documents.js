const DocsModule={
  filter:'all',
  // Doc types that need front+back capture (physical ID cards)
  _frontBackTypes:new Set(['nic','driving_license']),
  _needsFrontBack(docType,rawVal){
    if(this._frontBackTypes.has(docType))return true;
    const r=(rawVal||'').toLowerCase();
    return ['cnic','driving','emirates id','iqama','voter','resident permit','brp','biometric'].some(function(kw){return r.includes(kw);});
  },
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
      const hasPhotos=d.frontPhoto||d.backPhoto;
      return `<div class="entry"><div class="entry-main"><div class="entry-ic">${schema.ic}</div><div class="entry-body"><div class="entry-name">${schema.label}${d.docSubType?' — '+d.docSubType:''}</div><div class="entry-sub">${subtitle}</div><div class="entry-meta">${exp?`<span class="badge ${expStatus}">${expLabel}</span>`:''} ${d.notes?'<span class="badge b-muted">Notes</span>':''} ${hasPhotos?'<span class="badge b-info">📷 Photo</span>':''} ${d.linkedEntries?.length?'<span class="badge b-muted">🔗 Linked</span>':''}</div></div><div class="entry-acts"><button class="icb${d.pinned?' on':''}" onclick="DocsModule.pin('${d.id}')" title="Pin">📌</button><button class="icb" onclick="DocsModule.openDetail('${d.id}')">👁️</button><button class="icb" onclick="DocsModule.edit('${d.id}')">✏️</button><button class="icb del" onclick="DocsModule.del('${d.id}')">🗑️</button></div></div></div>`;
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
    <div id="doc-photo-area"></div>
    <div class="fg"><label class="fl">Notes</label><textarea class="inp" id="df-notes" rows="2" placeholder="Any additional details..."></textarea></div>
    <div class="fg"><label class="fl">Tags</label>${U.tags([])}`,
    `<button class="btn btn-g" onclick="Modal.close()">Cancel</button><button class="btn btn-p" onclick="DocsModule.save()">Save Document</button>`);
  },
  onTypeChange(val){
    if(!val.trim()){document.getElementById('doc-dynamic-fields').innerHTML='';document.getElementById('doc-photo-area').innerHTML='';return;}
    const smartDoc=(SMART_DB.documents||[]).find(d=>
      d.name.toLowerCase().includes(val.toLowerCase())||
      val.toLowerCase().includes(d.name.toLowerCase().split(' ').slice(-1)[0])
    );
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
      if(smartDoc){
        setTimeout(()=>{
          const numEl=document.getElementById('df-docNumber');
          if(numEl&&smartDoc.numberFormat){numEl.placeholder=smartDoc.numberFormat+' (format hint)';numEl.title='Format: '+smartDoc.numberFormat;}
          if(smartDoc.hasExpiry===false){const expEl=document.getElementById('df-expiryDate');if(expEl){const fg=expEl.closest('.fg');if(fg)fg.style.display='none';}}
        },30);
      }
    } else if(el){el.innerHTML='';}
    // Show photo capture buttons
    this._buildPhotoArea(key||'other',val);
  },
  _buildPhotoArea(docType,rawVal){
    const area=document.getElementById('doc-photo-area');
    if(!area)return;
    const needsBack=this._needsFrontBack(docType,rawVal);
    area.innerHTML='<div style="margin:10px 0;display:flex;gap:10px;align-items:flex-start;flex-wrap:wrap">'
      +'<div><button type="button" class="btn btn-g btn-sm" onclick="DocsModule._capturePhoto(\'front\')" style="gap:6px">📷 '+(needsBack?'Front':'Capture')+'</button><div id="doc-photo-front" style="margin-top:4px"></div></div>'
      +(needsBack?'<div><button type="button" class="btn btn-g btn-sm" onclick="DocsModule._capturePhoto(\'back\')" style="gap:6px">📷 Back</button><div id="doc-photo-back" style="margin-top:4px"></div></div>':'')
      +'</div>';
  },
  _capturePhoto(targetId){
    const overlay=document.createElement('div');
    overlay.style.cssText='position:fixed;inset:0;z-index:2001;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;';
    overlay.innerHTML=[
      '<video id="_docVid" autoplay playsinline style="width:100%;max-width:400px;border-radius:12px;display:block"></video>',
      '<canvas id="_docCanvas" style="display:none"></canvas>',
      '<div id="_docStatus" style="color:rgba(255,255,255,.8);font-size:13px;margin-top:14px;text-align:center">Position document in frame then tap Capture</div>',
      '<div style="display:flex;gap:12px;margin-top:18px">',
      '<button onclick="DocsModule._doPhotoCapture(\''+targetId+'\')" style="padding:14px 32px;background:var(--accent,#6c63ff);border:none;border-radius:99px;color:#fff;font-size:15px;font-weight:700;cursor:pointer">📷 Capture</button>',
      '<button onclick="DocsModule._stopPhoto()" style="padding:14px 24px;background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.3);border-radius:99px;color:#fff;font-size:14px;cursor:pointer">Cancel</button>',
      '</div>'
    ].join('');
    document.body.appendChild(overlay);
    DocsModule._photoOverlay=overlay;
    navigator.mediaDevices&&navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}}).then(function(stream){
      const vid=document.getElementById('_docVid');if(!vid)return;
      vid.srcObject=stream;DocsModule._photoStream=stream;
    }).catch(function(){overlay.remove();Toast.show('Camera not available','warning');});
  },
  _stopPhoto(){
    if(DocsModule._photoStream)DocsModule._photoStream.getTracks().forEach(function(t){t.stop();});
    if(DocsModule._photoOverlay)DocsModule._photoOverlay.remove();
  },
  _doPhotoCapture(targetId){
    const vid=document.getElementById('_docVid');
    const canvas=document.getElementById('_docCanvas');
    const statusEl=document.getElementById('_docStatus');
    if(!vid||!vid.videoWidth||!canvas)return;
    canvas.width=vid.videoWidth;canvas.height=vid.videoHeight;
    canvas.getContext('2d').drawImage(vid,0,0);
    let quality=0.6;
    let dataUrl=canvas.toDataURL('image/jpeg',quality);
    while(dataUrl.length>270000&&quality>0.2){quality-=0.1;dataUrl=canvas.toDataURL('image/jpeg',quality);}
    DocsModule._stopPhoto();
    const base64=dataUrl.split(',')[1];
    const thumbId='doc-photo-'+targetId;
    const thumbEl=document.getElementById(thumbId);
    if(thumbEl){
      thumbEl.innerHTML='<img src="'+dataUrl+'" style="width:100%;max-width:120px;border-radius:8px;border:2px solid var(--accent);cursor:pointer;margin-top:6px" onclick="DocsModule._viewPhotoB64(\''+targetId+'\')" title="Tap to view">';
      thumbEl.dataset.photo=base64;
    }
    Toast.show('Photo saved — fill in the document details below','info',2000);
  },
  _fillFromOCR(data){
    const hi='outline:2px solid var(--info);outline-offset:2px';
    const _set=function(id,val){if(!val)return;const el=document.getElementById(id);if(el){el.value=val;el.style.cssText+=hi;}};
    _set('df-docNumber',data.docNumber);
    _set('df-holderName',data.name||data.holderName);
    _set('df-issuingCountry',data.issuingCountry);
    if(data.dob){const el=document.getElementById('df-dob');if(el){try{const d=new Date(data.dob);if(!isNaN(d))el.value=d.toISOString().split('T')[0];}catch(e){el.value=data.dob;}el.style.cssText+=hi;}}
    if(data.expiry){const el=document.getElementById('df-expiryDate');if(el){try{const d=new Date(data.expiry);if(!isNaN(d))el.value=d.toISOString().split('T')[0];}catch(e){el.value=data.expiry;}el.style.cssText+=hi;}}
    Toast.show('Fields pre-filled from photo','success',3000);
  },
  _viewPhotoB64(targetId){
    const el=document.getElementById('doc-photo-'+targetId);
    const b64=el&&el.dataset&&el.dataset.photo;
    if(!b64)return;
    const v=document.createElement('div');
    v.style.cssText='position:fixed;inset:0;z-index:3000;background:rgba(0,0,0,.92);display:flex;align-items:center;justify-content:center;cursor:pointer';
    v.onclick=function(){v.remove();};
    v.innerHTML='<img src="data:image/jpeg;base64,'+b64+'" style="max-width:95vw;max-height:90vh;border-radius:12px;object-fit:contain">';
    document.body.appendChild(v);
  },
  save(editId=null){
    const typeRaw=document.getElementById('doc-type-sel')?.value||'other';
    const docType=Object.keys(DOC_SCHEMAS).find(k=>DOC_SCHEMAS[k].label.toLowerCase()===typeRaw.toLowerCase()||k===typeRaw.toLowerCase().replace(/\s+/g,'_'))||'other';
    const schema=DOC_SCHEMAS[docType];
    const g=id=>{const e=document.getElementById('df-'+id);return e?e.value.trim():''};
    const frontEl=document.getElementById('doc-photo-front');
    const backEl=document.getElementById('doc-photo-back');
    const prev=editId?(S.documents||[]).find(x=>x.id===editId):null;
    const frontPhoto=(frontEl&&frontEl.dataset&&frontEl.dataset.photo)||prev&&prev.frontPhoto||'';
    const backPhoto=(backEl&&backEl.dataset&&backEl.dataset.photo)||prev&&prev.backPhoto||'';
    const data={id:editId||U.id(),docType,frontPhoto,backPhoto,createdAt:editId?(S.documents||[]).find(x=>x.id===editId)?.createdAt:new Date().toISOString(),notes:g('notes'),tags:U.getTags()};
    schema.fields.forEach(f=>{data[f.id]=g(f.id);});
    if(!S.documents)S.documents=[];
    if(editId)S.documents=S.documents.map(x=>x.id===editId?data:x);else S.documents.push(data);
    const _dPhotoBytes=(S.documents).reduce((a,d)=>a+(d.frontPhoto||'').length+(d.backPhoto||'').length,0)/1.37;
    if(_dPhotoBytes>10*1024*1024)Toast.show('Storage is getting large. Consider removing old photos.','warning',5000);
    Activity.log((editId?'Edited':'Added')+' document',schema.label);Store.save();Modal.close();this.render();
    Toast.show((editId?'Updated':'Added')+': '+schema.label,'success');
  },
  edit(id){
    if(!S.documents)return;
    const d=S.documents.find(x=>x.id===id);if(!d)return;
    const schema=DOC_SCHEMAS[d.docType]||DOC_SCHEMAS.other;
    const needsBack=this._needsFrontBack(d.docType,'');
    const photoHtml='<div id="doc-photo-area"><div style="margin:10px 0;display:flex;gap:10px;align-items:flex-start;flex-wrap:wrap">'
      +'<div><button type="button" class="btn btn-g btn-sm" onclick="DocsModule._capturePhoto(\'front\')" style="gap:6px">📷 '+(needsBack?'Front':'Capture')+'</button><div id="doc-photo-front" style="margin-top:4px">'+(d.frontPhoto?'<img src="data:image/jpeg;base64,'+d.frontPhoto+'" style="width:100%;max-width:120px;border-radius:8px;border:2px solid var(--accent);cursor:pointer;margin-top:6px" onclick="DocsModule._viewPhotoB64(\'front\')" title="Tap to view">':'')+'</div></div>'
      +(needsBack?'<div><button type="button" class="btn btn-g btn-sm" onclick="DocsModule._capturePhoto(\'back\')" style="gap:6px">📷 Back</button><div id="doc-photo-back" style="margin-top:4px">'+(d.backPhoto?'<img src="data:image/jpeg;base64,'+d.backPhoto+'" style="width:100%;max-width:120px;border-radius:8px;border:2px solid var(--accent);cursor:pointer;margin-top:6px" onclick="DocsModule._viewPhotoB64(\'back\')" title="Tap to view">':'')+'</div></div>':'')
      +'</div></div>';
    Modal.open('✏️ Edit '+schema.label,`
    <div class="fg"><label class="fl">Document Type</label><input class="inp" id="doc-type-sel" value="${schema.label}" readonly style="opacity:.7"></div>
    ${this.buildForm(schema,d)}
    ${photoHtml}
    <div class="fg"><label class="fl">Notes</label><textarea class="inp" id="df-notes" rows="2">${d.notes||''}</textarea></div>
    <div class="fg"><label class="fl">Tags</label>${U.tags(d.tags||[])}`,
    `<button class="btn btn-g" onclick="Modal.close()">Cancel</button><button class="btn btn-d btn-sm" onclick="DocsModule.del('${id}',true)">Delete</button><button class="btn btn-p" onclick="DocsModule.save('${id}')">Update</button>`);
    // Restore saved photo data attributes for save() to read
    setTimeout(function(){
      if(d.frontPhoto){const f=document.getElementById('doc-photo-front');if(f)f.dataset.photo=d.frontPhoto;}
      if(d.backPhoto){const b=document.getElementById('doc-photo-back');if(b)b.dataset.photo=d.backPhoto;}
    },80);
  },
  openDetail(id){
    if(!S.documents)return;
    const d=S.documents.find(x=>x.id===id);if(!d)return;
    const schema=DOC_SCHEMAS[d.docType]||DOC_SCHEMAS.other;
    let photoHtml='';
    if(d.frontPhoto||d.backPhoto){
      photoHtml='<div style="display:flex;gap:10px;margin-top:12px;flex-wrap:wrap">'
        +(d.frontPhoto?'<div><div style="font-size:10px;color:var(--text3);margin-bottom:4px">Front</div><img src="data:image/jpeg;base64,'+d.frontPhoto+'" style="width:130px;border-radius:8px;cursor:pointer" onclick="DocsModule._openPhotoFull(\''+d.frontPhoto+'\')"></div>':'')
        +(d.backPhoto?'<div><div style="font-size:10px;color:var(--text3);margin-bottom:4px">Back</div><img src="data:image/jpeg;base64,'+d.backPhoto+'" style="width:130px;border-radius:8px;cursor:pointer" onclick="DocsModule._openPhotoFull(\''+d.backPhoto+'\')"></div>':'')
        +'</div>';
    }
    const rows=schema.fields.map(f=>{const v=d[f.id];return v?U.drRow(f.label,v):''}).filter(Boolean).join('');
    Modal.open(schema.ic+' '+schema.label,'<div>'+rows+(d.notes?U.drRow('Notes',d.notes):'')+'</div>'+photoHtml,`<button class="btn btn-g" onclick="Modal.close()">Close</button><button class="btn btn-p" onclick="DocsModule.edit('${id}');Modal.close()">Edit</button>`);
  },
  _openPhotoFull(base64){
    const v=document.createElement('div');
    v.style.cssText='position:fixed;inset:0;z-index:3000;background:rgba(0,0,0,.92);display:flex;align-items:center;justify-content:center;cursor:pointer';
    v.onclick=function(){v.remove();};
    v.innerHTML='<img src="data:image/jpeg;base64,'+base64+'" style="max-width:95vw;max-height:90vh;border-radius:12px;object-fit:contain">';
    document.body.appendChild(v);
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
