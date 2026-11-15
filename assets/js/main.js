// 広島三育学院 Web School Guide — 共通スクリプト（メニュー開閉・スクロール表示）
(function () {
  var btn = document.querySelector('.menu-btn');
  var nav = document.getElementById('gnav');
  if (btn && nav) {
    btn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') { nav.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }
    });
  }
  var els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) { els.forEach(function (el) { el.classList.add('on'); }); return; }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('on'); io.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -8% 0px' });
  els.forEach(function (el) { io.observe(el); });
})();

// 写真番号の表示（確認モードのときだけ）
(function () {
  var root = document.documentElement;
  if (!root.classList.contains('photo-review')) return;
  var slots = Array.prototype.slice.call(document.querySelectorAll('[data-photo]'));
  var badges = slots.map(function (el) {
    var b = document.createElement('span');
    b.className = 'photo-badge';
    b.textContent = el.getAttribute('data-photo');
    document.body.appendChild(b);
    return b;
  });
  function place() {
    slots.forEach(function (el, i) {
      var r = el.getBoundingClientRect();
      var b = badges[i];
      var tr = el.closest('.gl-track'), vis = r.width > 0;
      if (tr) { var tb = tr.getBoundingClientRect(); vis = vis && r.left >= tb.left - 2 && r.right <= tb.right + 2; }
      b.style.display = vis ? '' : 'none';
      b.style.left = (r.left + window.scrollX + 8) + 'px';
      b.style.top = (r.top + window.scrollY + 8) + 'px';
      var o = r.width / (r.height || 1);
      var s = b.querySelector('small') || b.appendChild(document.createElement('small'));
      s.textContent = o > 1.15 ? '横' : (o < 0.87 ? '縦' : '正方形');
    });
  }
  var bar = document.createElement('div');
  bar.className = 'review-bar';
  bar.innerHTML = '写真確認モード<a href="photos.html">写真番号一覧</a>';
  document.body.appendChild(bar);
  window.addEventListener('load', place);
  window.addEventListener('resize', place);
  document.querySelectorAll('.gl-track').forEach(function (t) { var tm; t.addEventListener('scroll', function () { clearTimeout(tm); tm = setTimeout(place, 120); }); });
  document.addEventListener('transitionend', place, true);
  setTimeout(place, 300); setTimeout(place, 1200);
})();

// ギャラリー（スライド）
(function () {
  document.querySelectorAll('.gallery').forEach(function (g) {
    var track = g.querySelector('.gl-track');
    var slides = g.querySelectorAll('.gl-slide');
    var dots = g.querySelector('.gl-dots');
    slides.forEach(function () { dots.appendChild(document.createElement('span')); });
    function idx() { return Math.round(track.scrollLeft / track.clientWidth); }
    function go(i) { i = (i + slides.length) % slides.length; track.scrollTo({ left: i * track.clientWidth }); }
    function mark() { var i = idx(); dots.querySelectorAll('span').forEach(function (d, j) { d.classList.toggle('on', i === j); }); }
    g.querySelector('.gl-prev').addEventListener('click', function () { go(idx() - 1); });
    g.querySelector('.gl-next').addEventListener('click', function () { go(idx() + 1); });
    track.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') { e.preventDefault(); go(idx() + 1); } if (e.key === 'ArrowLeft') { e.preventDefault(); go(idx() - 1); } });
    var t; track.addEventListener('scroll', function () { clearTimeout(t); t = setTimeout(mark, 80); });
    mark();
  });
})();

// 申込につながるクリックを Googleアナリティクスに記録
(function () {
  var rules = [
    { name: 'request_materials', test: function (h) { return h.indexOf('docs.google.com/') > -1 && h.indexOf('/forms/') > -1; } },
    { name: 'event_application', test: function (h) { return h.indexOf('saniku.ac.jp/hiroshima/news/') > -1; } },
    { name: 'line_click', test: function (h) { return h.indexOf('lin.ee/') > -1 || h.indexOf('line.me/') > -1; } },
    { name: 'phone_click', test: function (h) { return h.indexOf('tel:') === 0; } },
    { name: 'guidebook_pdf', test: function (h) { return h.indexOf('drive.google.com/file/') > -1; } }
  ];
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href]') : null;
    if (!a || typeof window.gtag !== 'function') return;
    var h = a.getAttribute('href');
    for (var i = 0; i < rules.length; i++) {
      if (rules[i].test(h)) {
        var place = a.closest('header') ? 'header' : a.closest('footer') ? 'footer' : a.closest('.cta') ? 'cta' : 'body';
        window.gtag('event', rules[i].name, { link_url: h, link_text: (a.textContent || '').trim().slice(0, 40), placement: place });
        break;
      }
    }
  }, true);
})();
