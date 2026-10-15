(function(){var p=location.pathname.split('/').filter(Boolean),h;
if(p.length>1&&p[p.length-1].indexOf('.')===-1){h='/'+p[0]+'/index.html';}
else if(p.length>0&&p[p.length-1].indexOf('.')===-1){h='index.html';}
else{h='index.html';}document.getElementById('home').setAttribute('href',h);})();