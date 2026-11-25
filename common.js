const $=s=>document.querySelector(s),app=$('#app');
const LOAN_DAYS=7,FINE=5,DAY=864e5,MAX=3;           // poka-yoke: ยืมได้สูงสุด 3 เล่ม
let me=null;try{me=JSON.parse(localStorage.getItem('session'))}catch(_){}
const BOOKS=[
 {id:'b1',cat:'คณิตศาสตร์',title:'แคลคูลัสเบื้องต้น',color:'#3b4aa8',out:false,rec:1},
 {id:'b2',cat:'วิทยาศาสตร์',title:'ฟิสิกส์ทั่วไป',color:'#f2a33a',out:false,dark:1,rec:1},
 {id:'b3',cat:'เทคโนโลยี',title:'พื้นฐานปัญญาประดิษฐ์',color:'#2a7b6b',out:true,rec:1},
 {id:'b4',cat:'ภาษา',title:'ภาษาอังกฤษเพื่อการสื่อสาร',color:'#8b3a5c',out:false},
 {id:'b5',cat:'คณิตศาสตร์',title:'พีชคณิตเชิงเส้น',color:'#1f2a6b',out:false},
 {id:'b6',cat:'วิทยาศาสตร์',title:'เคมีพื้นฐาน',color:'#2a7b6b',out:true},
 {id:'b7',cat:'เทคโนโลยี',title:'การเขียนโปรแกรมเบื้องต้น',color:'#3b4aa8',out:false},
 {id:'b8',cat:'ภาษา',title:'การเขียนเชิงวิชาการ',color:'#8b3a5c',out:false},
 {id:'b9',cat:'คณิตศาสตร์',title:'สถิติเพื่อการวิเคราะห์',color:'#c9741a',out:false}]; // 9 เล่ม = ตาราง 3×3
const find=id=>BOOKS.find(b=>b.id===id)||{title:id,cat:'',color:'#6b6f8a'};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const K=p=>p+':'+(me&&me.memberId);
const load=k=>{try{return JSON.parse(localStorage.getItem(k)||'[]')}catch(_){return[]}};
const save=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(_){}};
const loans=()=>me?load(K('loans')):[],resv=()=>me?load(K('resv')):[],hist=()=>me?load(K('history')):[];
const fmt=t=>new Date(t).toLocaleDateString('th-TH',{day:'numeric',month:'short',year:'numeric'});
const fineOf=(due,end)=>Math.max(0,Math.floor(((end||Date.now())-due)/DAY))*FINE;
const owed=()=>loans().reduce((s,l)=>s+fineOf(l.due),0);
let toastT;function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>e.classList.remove('show'),2200)}
let nextR='home';
const go=h=>{location.hash=h};
const PRIVATE=['borrowed','history','reserved'];
const NAV=[['home','หน้าหลัก'],['search','ค้นหาหนังสือ'],['borrowed','หนังสือที่ยืมอยู่'],['history','ประวัติการยืม'],['reserved','รายการที่จอง'],['contact','แจ้งปัญหา']];

function drawNav(on){
  $('#nav').innerHTML='<div class="logo">Library<span>.</span>Lend</div><div class="links">'+NAV.map(([h,t])=>`<a href="#${h}"${h===on?' class="on" aria-current="page"':''}>${t}</a>`).join('')+`</div><button class="out" id="out">${me?'ออกจากระบบ':'เข้าสู่ระบบ'}</button>`;
  $('#out').onclick=()=>{if(!me){nextR=on;return go('login')}
    if(!confirm('ออกจากระบบ?'))return;try{localStorage.removeItem('session')}catch(_){}me=null;go('home');route()};
}
// ===== poka-yoke: ปุ่มส่งกดไม่ได้จนกว่าข้อมูลถูกต้อง + แสดงสิ่งที่ต้องแก้ทันที =====
function guard(form,btn,msg,check){
  let touched=false;
  const run=()=>{const e=check();btn.disabled=!!e;msg.className='msg';msg.textContent=touched?e:''};
  form.addEventListener('input',()=>{touched=true;run()});run();
}
const digits=(el,n)=>el.addEventListener('input',()=>{el.value=el.value.replace(/\D/g,'').slice(0,n)}); // พิมพ์ได้เฉพาะตัวเลข

function card(b){
  const L=loans(),mine=L.some(l=>l.id===b.id),r=resv().includes(b.id);
  const st=mine?'คุณยืมอยู่':b.out?'ถูกยืมอยู่':'พร้อมให้ยืม';let a;
  if(mine)a='<button class="btn" disabled>ยืมแล้ว</button>';
  else if(b.out)a=`<button class="ghost" data-r="${b.id}">${r?'ยกเลิกการจอง':'จองคิว'}</button>`;
  else if(me&&owed()>0)a='<button class="btn" disabled>ชำระค่าปรับก่อนยืม</button>';
  else if(me&&L.length>=MAX)a=`<button class="btn" disabled>ยืมครบ ${MAX} เล่มแล้ว</button>`;
  else a=`<button class="btn" data-b="${b.id}">ยืมเลย</button>`;
  return `<article class="book"><div class="cover" style="background:${b.color};${b.dark?'color:#1a1f3c':''}">${b.cat}</div><p>${b.title}</p><small>${st}</small>${a}</article>`;
}
