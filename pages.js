// ===== ปุ่มยืม / คืน / จอง / ลบ =====
let after=()=>{};
app.addEventListener('click',e=>{
  const t=e.target.closest('button');if(!t)return;const d=t.dataset;
  if((d.b||d.r)&&!me){toast('กรุณาเข้าสู่ระบบก่อนยืมหรือจองหนังสือ');nextR=location.hash.slice(1)||'home';setTimeout(()=>go('login'),900);return}
  if(d.b){
    if(loans().length>=MAX||owed()>0||loans().some(l=>l.id===d.b))return;   // poka-yoke: กันซ้ำที่ชั้นข้อมูลอีกชั้น
    const due=Date.now()+LOAN_DAYS*DAY;
    save(K('loans'),[...loans(),{id:d.b,due}]);save(K('history'),[...hist(),{id:d.b,at:Date.now(),due,ret:null}]);
    toast('ยืมสำเร็จ กำหนดคืน '+fmt(due));
  }else if(d.ret){
    save(K('loans'),loans().filter(l=>l.id!==d.ret));
    const h=hist(),j=h.findIndex(x=>x.id===d.ret&&x.ret===null);if(j>=0)h[j].ret=Date.now();save(K('history'),h);
    toast('คืนหนังสือเรียบร้อย');
  }else if(d.r){
    const on=resv().includes(d.r);save(K('resv'),on?resv().filter(x=>x!==d.r):[...resv(),d.r]);toast(on?'ยกเลิกการจองแล้ว':'จองคิวแล้ว');
  }else if(d.c!==undefined){cat=d.c;
  }else if(d.del){
    if(!confirm('ลบรายการนี้ออกจากประวัติ?'))return;
    const [id,at]=d.del.split('|');save(K('history'),hist().filter(h=>!(h.id===id&&String(h.at)===at)));toast('ลบรายการแล้ว');
  }else if(d.clr){
    if(!confirm('ล้างประวัติที่คืนแล้วทั้งหมด? การลบนี้ย้อนกลับไม่ได้'))return;
    save(K('history'),hist().filter(h=>!h.ret));toast('ล้างประวัติแล้ว');
  }else if(d.rep){
    if(!confirm('ยกเลิกเรื่องที่แจ้งนี้?'))return;
    const rk='reports:'+me.memberId;save(rk,load(rk).filter(r=>String(r.at)!==d.rep));toast('ยกเลิกเรื่องแล้ว');
  }else return;
  after();
});
let cat='',q='';
const P={};
P.home=()=>{
  app.innerHTML=`<div class="ph"><div><small>ยินดีต้อนรับ</small><h1>สวัสดี, ${esc(me?me.name:'ผู้เยี่ยมชม')}</h1></div><div class="av">${me?esc(me.name.trim().charAt(0)):'?'}</div></div>
  <form class="search" id="sf" role="search"><input id="q" placeholder="ค้นหาชื่อหนังสือหรือหมวดหมู่" aria-label="ค้นหาหนังสือ"><button class="btn">ค้นหา</button></form>
  <section class="stats" ${me?'':'hidden'}><div class="stat"><small>กำลังยืม</small><b id="s1"></b></div><div class="stat w"><small>ใกล้ครบกำหนดคืน</small><b id="s2"></b></div><div class="stat p"><small>ค่าปรับค้างชำระ</small><b id="s3"></b></div></section>
  <h2>หนังสือแนะนำ</h2><section class="grid" id="books"></section>`;
  const fill=()=>{const L=loans(),due=L.map(l=>l.due).sort((a,b)=>a-b)[0];
    $('#s1').textContent=L.length+' / '+MAX+' เล่ม';$('#s2').textContent=due?fmt(due):'-';$('#s3').textContent=owed()+' บาท';
    const k=$('#q').value.trim().toLowerCase(),l=BOOKS.filter(b=>b.rec&&(!k||(b.title+b.cat).toLowerCase().includes(k)));
    $('#books').innerHTML=l.length?l.map(card).join(''):'<p class="empty">ไม่พบหนังสือที่ค้นหา ลองใช้คำอื่น</p>'};
  $('#q').oninput=fill;$('#sf').onsubmit=e=>{e.preventDefault();fill()};after=fill;fill();
};
P.search=()=>{
  app.innerHTML=`<div class="ph"><h1>ค้นหาหนังสือ</h1></div><form class="search" id="sf" role="search"><input id="q" value="${esc(q)}" placeholder="ค้นหาชื่อหนังสือหรือหมวดหมู่" aria-label="ค้นหาหนังสือ"><button class="btn">ค้นหา</button></form><div class="chips" id="chips"></div><section class="grid" id="books"></section>`;
  const fill=()=>{q=$('#q').value;const cs=['',...new Set(BOOKS.map(b=>b.cat))];
    $('#chips').innerHTML=cs.map(c=>`<button type="button" class="chip${c===cat?' on':''}" data-c="${esc(c)}">${c||'ทั้งหมด'}</button>`).join('');
    const k=q.trim().toLowerCase(),l=BOOKS.filter(b=>(!cat||b.cat===cat)&&(!k||(b.title+b.cat).toLowerCase().includes(k)));
    $('#books').innerHTML=l.length?l.map(card).join(''):'<p class="empty">ไม่พบหนังสือที่ค้นหา ลองใช้คำอื่นหรือเลือกหมวดอื่น</p>'};
  $('#q').oninput=fill;$('#sf').onsubmit=e=>{e.preventDefault();fill()};after=fill;fill();
};
P.borrowed=()=>{
  app.innerHTML='<div class="ph"><h1>หนังสือที่ยืมอยู่</h1></div><div id="note"></div><section class="list" id="list"></section>';
  after=()=>{const L=loans().sort((a,b)=>a.due-b.due),o=owed();
    $('#note').innerHTML=o>0?`<div class="notice">มีค่าปรับค้างชำระ ${o} บาท ต้องคืนเล่มที่เกินกำหนดก่อนจึงจะยืมเล่มใหม่ได้</div>`:'';
    $('#list').innerHTML=L.length?L.map(l=>{const b=find(l.id),left=Math.ceil((l.due-Date.now())/DAY),f=fineOf(l.due);
      const st=f>0?`<small class="late">เกินกำหนด ${-left} วัน ค่าปรับ ${f} บาท</small>`:`<small>เหลืออีก ${Math.max(left,0)} วัน</small>`;
      return `<article class="item"><div class="mini" style="background:${b.color}"></div><div class="info"><p>${b.title}</p><small>${b.cat} · กำหนดคืน ${fmt(l.due)}</small>${st}</div><button class="btn" data-ret="${l.id}">คืนหนังสือ</button></article>`}).join(''):'<p class="empty">ยังไม่มีหนังสือที่ยืมอยู่ ไปที่หน้าค้นหาเพื่อยืมเล่มแรก</p>'};after();
};
P.history=()=>{
  app.innerHTML='<div class="ph"><h1>ประวัติการยืม</h1><button class="ghost" data-clr="1" id="clr" hidden>ล้างประวัติที่คืนแล้ว</button></div><section class="list" id="list"></section>';
  after=()=>{const H=hist().sort((a,b)=>b.at-a.at);$('#clr').hidden=!H.some(h=>h.ret);
    $('#list').innerHTML=H.length?H.map(h=>{const b=find(h.id),f=fineOf(h.due,h.ret);
      const st=h.ret?`<small class="done">คืนแล้ว ${fmt(h.ret)}</small>`:`<small class="late">ยังไม่คืน (กำหนดคืน ${fmt(h.due)})</small>`;
      return `<article class="item"><div class="mini" style="background:${b.color}"></div><div class="info"><p>${b.title}</p><small>ยืมเมื่อ ${fmt(h.at)}</small>${st}${f>0?`<small class="late">ค่าปรับ ${f} บาท</small>`:''}</div>${h.ret?`<button class="ghost" data-del="${h.id}|${h.at}">ลบ</button>`:''}</article>`}).join(''):'<p class="empty">ยังไม่มีประวัติการยืม</p>'};after();
};
P.reserved=()=>{
  app.innerHTML='<div class="ph"><h1>รายการที่จอง</h1></div><section class="list" id="list"></section>';
  after=()=>{const R=resv();$('#list').innerHTML=R.length?R.map(id=>{const b=find(id);
    return `<article class="item"><div class="mini" style="background:${b.color}"></div><div class="info"><p>${b.title}</p><small>${b.cat}</small><small>${b.out?'รอคิว: มีผู้ยืมอยู่':'พร้อมให้ยืมแล้ว'}</small></div><button class="ghost" data-r="${id}">ยกเลิกการจอง</button></article>`}).join(''):'<p class="empty">ยังไม่มีรายการจอง หนังสือที่ถูกยืมอยู่จะมีปุ่มจองคิว</p>'};after();
};
P.contact=()=>{
  const CATS=['ยืม/คืนหนังสือ','ค่าปรับไม่ถูกต้อง','เข้าสู่ระบบ / บัญชีผู้ใช้','ข้อมูลหนังสือไม่ตรง','ข้อเสนอแนะ','อื่น ๆ'];
  app.innerHTML=`<div class="ph"><div><small>พบปัญหาหรือมีข้อเสนอแนะ แจ้งเราได้ที่นี่</small><h1>ติดต่อ / แจ้งปัญหา</h1></div></div>
  <section class="contact"><div class="panel"><h2>แบบฟอร์มแจ้งปัญหา</h2><p class="sub">เจ้าหน้าที่จะติดต่อกลับตามช่องทางที่ระบุ</p>
  <form id="f" novalidate>
   <label for="cat">ประเภทปัญหา</label><select id="cat"><option value="">เลือกประเภทปัญหา</option>${CATS.map(c=>`<option>${c}</option>`).join('')}</select>
   <label for="book">หนังสือที่เกี่ยวข้อง (ถ้ามี)</label><select id="book"><option value="">ไม่เกี่ยวกับหนังสือเล่มใด</option>${BOOKS.map(b=>`<option value="${b.id}">${b.title}</option>`).join('')}</select>
   <label for="subject">หัวข้อ</label><input id="subject" maxlength="80" placeholder="สรุปปัญหาสั้น ๆ">
   <label for="detail">รายละเอียด</label><textarea id="detail" maxlength="500" placeholder="อธิบายปัญหาที่พบ เช่น เกิดขึ้นเมื่อไหร่ ทำอะไรอยู่"></textarea><small class="count" id="cnt">0 / 500</small>
   <label for="ct">อีเมล หรือเบอร์โทรสำหรับติดต่อกลับ</label><input id="ct" placeholder="name@email.com หรือ 0812345678" autocomplete="email">
   <button class="btn" id="go">ส่งเรื่อง</button><p class="msg" id="m" role="alert"></p></form></div>
  <aside class="panel"><h2>ช่องทางติดต่อห้องสมุด</h2><ul class="il"><li><small>เวลาทำการ</small><b>จันทร์–ศุกร์ 08:30–16:30 น.</b></li><li><small>อีเมล</small><b>library@example.ac.th</b></li><li><small>โทรศัพท์</small><b>02-123-4567</b></li><li><small>ที่ตั้ง</small><b>อาคารห้องสมุด ชั้น 1 เคาน์เตอร์บริการยืม-คืน</b></li></ul></aside></section>
  <section id="mine" hidden><h2>เรื่องที่คุณแจ้งไว้</h2><div class="list" id="list"></div></section>`;
  const RK='reports:'+(me?me.memberId:'guest');
  if(me){let us=load('users');const u=us.find(x=>x.memberId===me.memberId);if(u)$('#ct').value=u.email||u.tel||''}
  const val=()=>({cat:$('#cat').value,book:$('#book').value,subject:$('#subject').value.trim(),detail:$('#detail').value.trim(),contact:$('#ct').value.trim()});
  guard($('#f'),$('#go'),$('#m'),()=>{const v=val();return !v.cat?'เลือกประเภทปัญหา':!v.subject?'กรอกหัวข้อ':v.detail.length<10?'อธิบายรายละเอียดอย่างน้อย 10 ตัวอักษร':!(/^\S+@\S+\.\S+$/.test(v.contact)||/^0\d{9}$/.test(v.contact))?'กรอกอีเมลหรือเบอร์โทร 10 หลัก (ขึ้นต้นด้วย 0) ให้ถูกต้อง':''});
  $('#detail').addEventListener('input',()=>{$('#cnt').textContent=$('#detail').value.length+' / 500'});
  after=()=>{$('#mine').hidden=!me;if(!me)return;const R=load(RK).sort((a,b)=>b.at-a.at);
    $('#list').innerHTML=R.length?R.map(r=>`<article class="item"><div class="info"><p>${esc(r.subject)}</p><small>${esc(r.cat)}${r.book?' · '+esc(find(r.book).title):''} · แจ้งเมื่อ ${fmt(r.at)}</small><small>${esc(r.detail)}</small><span class="tag">รอดำเนินการ</span></div><button type="button" class="ghost" data-rep="${r.at}">ยกเลิกเรื่อง</button></article>`).join(''):'<p class="empty">ยังไม่มีเรื่องที่แจ้งไว้</p>'};
  $('#f').onsubmit=e=>{e.preventDefault();save(RK,[...load(RK),{...val(),at:Date.now()}]);P.contact();toast('ส่งเรื่องเรียบร้อย เจ้าหน้าที่จะติดต่อกลับโดยเร็ว')};
  after();
};
// ===== หน้า login / register (ซ้าย 1 : ขวา 1.618) =====
const side=(h,p)=>`<aside class="side"><div class="logo">Library<span>.</span>Lend</div><div><h2>${h}</h2><p>${p}</p><div class="bks" aria-hidden="true"><i></i><i></i><i></i><i></i></div></div></aside>`;
P.login=()=>{
  $('#auth').innerHTML=`<div class="auth">${side('ยืมหนังสือได้ง่าย<br>ติดตามกำหนดคืนได้ในที่เดียว','เข้าสู่ระบบเพื่อค้นหา ยืม และจองหนังสือ')}<div class="pane"><div class="card"><a class="back" href="#home">← กลับหน้าหลัก</a><h1>เข้าสู่ระบบ</h1><p class="sub">ยินดีต้อนรับกลับมา</p>
  <form id="f" novalidate><label for="id">รหัสสมาชิก หรืออีเมล</label><input id="id" placeholder="เช่น 12345678" autocomplete="username">
  <label for="pw">รหัสผ่าน</label><div class="pw"><input id="pw" type="password" placeholder="กรอกรหัสผ่าน" autocomplete="current-password"><button type="button" id="t">แสดง</button></div>
  <button class="btn" id="go">เข้าสู่ระบบ</button><p class="msg" id="m" role="alert"></p></form><p class="alt">ยังไม่มีบัญชี? <a href="#register">สมัครสมาชิก</a></p></div></div></div>`;
  $('#t').onclick=()=>{const s=$('#pw').type==='password';$('#pw').type=s?'text':'password';$('#t').textContent=s?'ซ่อน':'แสดง'};
  guard($('#f'),$('#go'),$('#m'),()=>!$('#id').value.trim()||!$('#pw').value?'กรอกรหัสสมาชิกและรหัสผ่านให้ครบ':'');
  $('#f').onsubmit=e=>{e.preventDefault();const k=$('#id').value.trim().toLowerCase(),m=$('#m');
    const u=load('users').find(x=>(x.memberId.toLowerCase()===k||x.email.toLowerCase()===k)&&x.password===$('#pw').value);
    if(!u){m.textContent='รหัสสมาชิก/อีเมล หรือรหัสผ่านไม่ถูกต้อง';return}
    me={memberId:u.memberId,name:u.name};save('session',me);m.className='msg ok';m.textContent='เข้าสู่ระบบสำเร็จ กำลังไปหน้าหลัก...';
    setTimeout(()=>{go(nextR==='login'||nextR==='register'?'home':nextR)},700)};
};
P.register=()=>{
  $('#auth').innerHTML=`<div class="auth">${side('สมัครสมาชิกครั้งเดียว<br>ยืมหนังสือได้ทันที','ใช้รหัสสมาชิกเพื่อสแกนยืมและคืนหนังสือ')}<div class="pane"><div class="card"><a class="back" href="#home">← กลับหน้าหลัก</a><h1>สมัครสมาชิก</h1><p class="sub">กรอกข้อมูลเพื่อสร้างบัญชีใหม่</p>
  <form id="f" novalidate><label for="name">ชื่อ-นามสกุล</label><input id="name" placeholder="ชื่อ นามสกุล" autocomplete="name">
  <label for="mid">รหัสสมาชิก / รหัสนักศึกษา</label><input id="mid" inputmode="numeric" placeholder="เช่น 12345678">
  <div class="row"><div><label for="email">อีเมล</label><input id="email" type="email" placeholder="name@email.com" autocomplete="email"></div><div><label for="tel">เบอร์โทร</label><input id="tel" type="tel" inputmode="numeric" placeholder="0812345678" autocomplete="tel"></div></div>
  <div class="row"><div><label for="pw">รหัสผ่าน</label><input id="pw" type="password" placeholder="อย่างน้อย 6 ตัวอักษร" autocomplete="new-password"></div><div><label for="pw2">ยืนยันรหัสผ่าน</label><input id="pw2" type="password" placeholder="กรอกอีกครั้ง" autocomplete="new-password"></div></div>
  <button class="btn" id="go">สมัครสมาชิก</button><p class="msg" id="m" role="alert"></p></form><p class="alt">มีบัญชีอยู่แล้ว? <a href="#login">เข้าสู่ระบบ</a></p></div></div></div>`;
  digits($('#tel'),10);digits($('#mid'),12);
  const val=()=>({name:$('#name').value.trim(),memberId:$('#mid').value.trim(),email:$('#email').value.trim(),tel:$('#tel').value.trim(),password:$('#pw').value});
  guard($('#f'),$('#go'),$('#m'),()=>{const v=val();return !v.name||!v.memberId||!v.email||!v.tel||!v.password?'กรอกข้อมูลให้ครบทุกช่อง':!/^\S+@\S+\.\S+$/.test(v.email)?'รูปแบบอีเมลไม่ถูกต้อง':!/^0\d{9}$/.test(v.tel)?'เบอร์โทรต้องเป็นตัวเลข 10 หลัก ขึ้นต้นด้วย 0':v.password.length<6?'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร':v.password!==$('#pw2').value?'รหัสผ่านทั้งสองช่องไม่ตรงกัน':''});
  $('#f').onsubmit=e=>{e.preventDefault();const v=val(),m=$('#m'),us=load('users');
    if(us.some(u=>u.memberId===v.memberId||u.email.toLowerCase()===v.email.toLowerCase())){m.textContent='รหัสสมาชิกหรืออีเมลนี้ถูกใช้แล้ว';return}
    save('users',[...us,v]);m.className='msg ok';m.textContent='สมัครสมาชิกสำเร็จ กำลังไปหน้าเข้าสู่ระบบ...';setTimeout(()=>go('login'),800)};
};
