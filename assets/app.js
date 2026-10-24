
(function(){
  var root=document.documentElement;
  var saved=localStorage.getItem('theme');
  if(saved){root.setAttribute('data-theme',saved);}
  else if(window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches){root.setAttribute('data-theme','dark');}
  var t=document.getElementById('theme-toggle');
  if(t){t.addEventListener('click',function(){
    var cur=root.getAttribute('data-theme')==='dark'?'light':'dark';
    root.setAttribute('data-theme',cur);localStorage.setItem('theme',cur);upd(t);
  });upd(t);}
  function upd(b){b.textContent=root.getAttribute('data-theme')==='dark'?'☀':'☾';}
  var mt=document.getElementById('menu-toggle');
  if(mt){mt.addEventListener('click',function(){document.getElementById('nav').classList.toggle('open');});}

  /* 复制代码 */
  document.querySelectorAll('.prose .highlight').forEach(function(pre){
    var b=document.createElement('button');b.className='copy-btn';b.textContent='复制';
    b.addEventListener('click',function(){
      var code=pre.querySelector('code')||pre;
      navigator.clipboard.writeText(code.innerText).then(function(){b.textContent='已复制';setTimeout(function(){b.textContent='复制';},1500);});
    });
    pre.appendChild(b);
  });

  /* 目录 scrollspy */
  var links=[].slice.call(document.querySelectorAll('.toc a'));
  if(links.length&&'IntersectionObserver' in window){
    var map={};
    links.forEach(function(a){map[a.getAttribute('href').slice(1)]=a;});
    var obs=new IntersectionObserver(function(es){
      es.forEach(function(e){
        var a=map[e.target.id];if(!a)return;
        if(e.isIntersecting){links.forEach(function(x){x.classList.remove('active');});a.classList.add('active');}
      });
    },{rootMargin:'0px 0px -70% 0px'});
    links.forEach(function(a){var s=document.getElementById(a.getAttribute('href').slice(1));if(s)obs.observe(s);});
  }

  /* 回到顶部 */
  var top=document.getElementById('top-btn');
  if(top){window.addEventListener('scroll',function(){top.classList.toggle('show',scrollY>600);});
    top.addEventListener('click',function(){scrollTo({top:0,behavior:'smooth'});});}

  /* 搜索 */
  var si=document.getElementById('search-input');
  if(si&&window.fetch){
    fetch(SITE_BASE+'search-index.json').then(function(r){return r.json();}).then(function(data){
      window.__idx=data;
    });
    si.addEventListener('input',function(){
      var q=si.value.trim().toLowerCase();
      var box=document.getElementById('search-results');
      if(!window.__idx)return;
      if(!q){box.innerHTML='';return;}
      var hits=window.__idx.filter(function(p){
        return (p.title+' '+p.cat+' '+p.tags+' '+p.text).toLowerCase().indexOf(q)>-1;
      }).slice(0,20);
      box.innerHTML=hits.length?hits.map(function(p){
        var t=p.title.replace(new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'gi'),function(m){return '<mark>'+m+'</mark>';});
        return '<a class="post-row" href="'+p.url+'"><time>'+p.date+'</time><div class="body"><h3>'+t+'</h3><p>'+p.desc+'</p></div></a>';
      }).join(''):'<p style="color:var(--muted)">没有找到相关文章</p>';
    });
  }
})();
