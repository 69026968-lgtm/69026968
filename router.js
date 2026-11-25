// ===== router (ใช้ #hash แทนหลายไฟล์ เพื่อให้เป็นไฟล์เดียวรันบนคลาวด์ได้) =====
function route(){
  const h=location.hash.slice(1)||'home',isAuth=h==='login'||h==='register';
  if(isAuth&&me){go('home');return}
  if(PRIVATE.includes(h)&&!me){nextR=h;go('login');return}
  if(!P[h]){go('home');return}
  $('#shell').hidden=isAuth;$('#auth').hidden=!isAuth;
  if(!isAuth){drawNav(h);window.scrollTo(0,0)}
  P[h]();
}
addEventListener('hashchange',route);route();
