/* ==========================================================================
   ВЕРЕСКЪ — нишевая парфюмерия
   Чистый vanilla JS (ES6), без библиотек.
   Источник правды: массив PRODUCTS (каталог, модалка, корзина).
   ========================================================================== */
'use strict';

(function () {

  /* ---------- утилиты ---------- */

  const $  = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const fmt = (value) => Number(value).toLocaleString('ru-RU') + ' ₽';
  const pad = (n) => String(n).padStart(2, '0');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- данные: семейства и ароматы ---------- */

  const FAMILY = {
    fresh:    { label: 'Свежие',    liquid: ['#CFE0D8', '#7FA08F'], bg: ['#EFF4F1', '#DFE9E3'] },
    floral:   { label: 'Цветочные', liquid: ['#F1D6CF', '#C08A85'], bg: ['#F8EEEA', '#F0E0DA'] },
    woody:    { label: 'Древесные', liquid: ['#DCC89E', '#8A7048'], bg: ['#F4EEE0', '#EAE0C9'] },
    oriental: { label: 'Восточные', liquid: ['#E3BC7C', '#9A6A2E'], bg: ['#F6EDDC', '#EDDFC3'] }
  };

  const PRODUCTS = [
    {
      id: 1, name: 'Белый шумъ', family: 'fresh', tag: 'new', level: 0.62,
      price: { 30: 6400, 50: 9800, 100: 14200 },
      top: ['бергамот', 'мята', 'морская соль'],
      heart: ['белый чай', 'фрезия'],
      base: ['белый мускус', 'амбретта', 'плавник'],
      description: 'Холодное утро мегаполиса: первый снег на проводах, пар над стаканом кофе и чистота, доведённая до звона.'
    },
    {
      id: 2, name: 'Северное море', family: 'fresh', tag: null, level: 0.55,
      price: { 30: 6700, 50: 10200, 100: 14900 },
      top: ['лимон', 'бергамот', 'розмарин'],
      heart: ['морская ламинария', 'лаванда'],
      base: ['серая амбра', 'дубовый мох', 'кедр'],
      description: 'Солёный ветер, мокрый гранит и горькая зелень — акварель балтийского побережья в октябре.'
    },
    {
      id: 3, name: 'Ирис и дождь', family: 'floral', tag: 'new', level: 0.6,
      price: { 30: 7200, 50: 10900, 100: 15900 },
      top: ['альдегиды', 'бергамот'],
      heart: ['ирис', 'фиалка', 'гелиотроп'],
      base: ['замша', 'белый мускус', 'бобы тонка'],
      description: 'Пудровая нежность ириса под тонкой плёнкой дождя: запах старых писем, чистых подоконников и тишины.'
    },
    {
      id: 4, name: 'Полночь в саду', family: 'floral', tag: 'hit', level: 0.7,
      price: { 30: 7400, 50: 11200, 100: 16400 },
      top: ['чёрная смородина', 'бергамот', 'розовый перец'],
      heart: ['жасмин самбак', 'тубероза', 'османтус'],
      base: ['амбретта', 'кашмеран', 'ваниль'],
      description: 'Густой ночной сад после жары: жасмин распускается в темноте, а амбра держит его до рассвета.'
    },
    {
      id: 5, name: 'Кедровая тропа', family: 'woody', tag: null, level: 0.66,
      price: { 30: 6900, 50: 10400, 100: 15300 },
      top: ['грейпфрут', 'можжевельник', 'чёрный перец'],
      heart: ['атласский кедр', 'кипарис', 'еловая смола'],
      base: ['дубовый мох', 'гваяковое дерево', 'кожа'],
      description: 'Дорога через заповедник: нагретая кора, смола на ладонях и сухая хвоя под ботинками.'
    },
    {
      id: 6, name: 'Ветивер и туман', family: 'woody', tag: null, level: 0.6,
      price: { 30: 6900, 50: 10600, 100: 15600 },
      top: ['фиалковый лист', 'кардамон'],
      heart: ['ветивер', 'корень ириса'],
      base: ['серая амбра', 'дубовый мох', 'тёмный кедр'],
      description: 'Дымный ветивер, выращенный на камне, и туман, который не рассеивается до полудня.'
    },
    {
      id: 7, name: 'Янтарная комната', family: 'oriental', tag: 'hit', level: 0.74,
      price: { 30: 7900, 50: 11900, 100: 17400 },
      top: ['шафран', 'кардамон', 'бергамот'],
      heart: ['амбра', 'лабданум', 'роза'],
      base: ['ваниль', 'бензоин', 'сандал'],
      description: 'Тёплый свет свечей в зеркалах: амбра, лабданум и ваниль — как самое дорогое воспоминание.'
    },
    {
      id: 8, name: 'Дым и мёдъ', family: 'oriental', tag: 'new', level: 0.68,
      price: { 30: 7900, 50: 11900, 100: 17400 },
      top: ['коньяк', 'корица'],
      heart: ['табачный лист', 'тёмный мёд', 'бессмертник'],
      base: ['гваяк', 'бобы тонка', 'ваниль'],
      description: 'Камин в старой библиотеке: табачный лист, гречишный мёд и корица на дне бокала.'
    }
  ];

  const VOLUMES = [30, 50, 100];

  const getProduct = (id) => PRODUCTS.find((p) => p.id === Number(id)) || null;

  /* ---------- генератор флакона (чистый SVG, без картинок) ---------- */

  let uidCounter = 0;

  function bottleSVG(product) {
    const fam = FAMILY[product.family];
    const gid = 'liq-' + (++uidCounter);
    const levelY = 140 + Math.round((1 - product.level) * 150);

    return `
      <svg viewBox="0 0 220 380" role="img" aria-label="Флакон аромата «${product.name}»">
        <defs>
          <linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="${fam.liquid[0]}"/>
            <stop offset="1" stop-color="${fam.liquid[1]}"/>
          </linearGradient>
          <clipPath id="${gid}-clip">
            <path d="M45 130 C45 92 78 78 95 74 L125 74 C142 78 175 92 175 130 L175 322 C175 338 163 350 147 350 L73 350 C57 350 45 338 45 322 Z"/>
          </clipPath>
        </defs>
        <rect x="88" y="14" width="44" height="42" rx="5" fill="#1C1B1A"/>
        <rect x="88" y="52" width="44" height="6" fill="#C1A05C"/>
        <rect x="95" y="58" width="30" height="18" fill="#EDE6D8" stroke="rgba(28,27,26,0.25)"/>
        <path d="M45 130 C45 92 78 78 95 74 L125 74 C142 78 175 92 175 130 L175 322 C175 338 163 350 147 350 L73 350 C57 350 45 338 45 322 Z"
              fill="#F1EBDF" stroke="rgba(28,27,26,0.28)" stroke-width="1.2"/>
        <g clip-path="url(#${gid}-clip)">
          <rect x="45" y="${levelY}" width="130" height="${352 - levelY}" fill="url(#${gid})"/>
          <ellipse cx="110" cy="${levelY}" rx="66" ry="7" fill="${fam.liquid[0]}"/>
        </g>
        <rect x="58" y="110" width="9" height="212" rx="4.5" fill="#FFFFFF" opacity="0.45"/>
        <rect x="76" y="214" width="68" height="86" class="mini-label"/>
        <text x="110" y="240" text-anchor="middle" class="mini-brand">ВЕРЕСКЪ</text>
        <text x="110" y="274" text-anchor="middle" class="mini-no">№ ${pad(product.id)}</text>
      </svg>`;
  }

  /* ---------- toast ---------- */

  const toastEl = $('#toast');
  let toastTimer = null;

  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('is-visible');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-visible'), 2600);
  }

  /* ---------- оверлей, блокировка скролла, открытые состояния ---------- */

  const overlay = $('#overlay');
  const body = document.body;

  function anyPanelOpen() {
    return body.classList.contains('is-nav-open')
        || body.classList.contains('is-cart-open')
        || body.classList.contains('is-modal-open');
  }

  function syncChrome() {
    if (overlay) overlay.classList.toggle('is-visible', anyPanelOpen());
    body.classList.toggle('is-locked', anyPanelOpen());
  }

  /* ---------- мобильное меню ---------- */

  const burgerButton = $('#burgerButton');
  const siteNav = $('#siteNav');

  function openNav() {
    if (!siteNav) return;
    body.classList.add('is-nav-open');
    if (burgerButton) {
      burgerButton.setAttribute('aria-expanded', 'true');
      burgerButton.setAttribute('aria-label', 'Закрыть меню');
    }
    syncChrome();
  }

  function closeNav() {
    if (!body.classList.contains('is-nav-open')) return;
    body.classList.remove('is-nav-open');
    if (burgerButton) {
      burgerButton.setAttribute('aria-expanded', 'false');
      burgerButton.setAttribute('aria-label', 'Открыть меню');
      burgerButton.focus();
    }
    syncChrome();
  }

  if (burgerButton && siteNav) {
    burgerButton.addEventListener('click', () => {
      if (body.classList.contains('is-nav-open')) closeNav();
      else openNav();
    });

    // клик по любому пункту меню закрывает панель (плавный скролл делает CSS)
    siteNav.addEventListener('click', (e) => {
      if (e.target.closest('a')) closeNav();
    });
  }

  /* ---------- шапка: фон при скролле + параллакс ---------- */

  const siteHeader = $('#siteHeader');
  const parallaxEl = $('[data-parallax]');
  let scrollTicking = false;

  function onScrollFrame() {
    scrollTicking = false;
    if (siteHeader) siteHeader.classList.toggle('is-scrolled', window.scrollY > 8);
    if (parallaxEl && !reduceMotion) {
      const y = Math.max(0, Math.min(window.scrollY, 900));
      parallaxEl.style.transform = `translate3d(0, ${(y * -0.07).toFixed(1)}px, 0)`;
    }
  }

  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      scrollTicking = true;
      requestAnimationFrame(onScrollFrame);
    }
  }, { passive: true });
  onScrollFrame();

  /* ---------- scroll-reveal ---------- */

  function initReveal() {
    const items = $$('[data-reveal]');
    if (!items.length) return;

    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    items.forEach((el) => observer.observe(el));
  }

  /* ---------- цифры в «Философии» ---------- */

  function initCounters() {
    const counters = $$('[data-count]');
    if (!counters.length) return;

    const setFinal = (el) => { el.textContent = el.dataset.count; };

    if (reduceMotion || !('IntersectionObserver' in window)) {
      counters.forEach(setFinal);
      return;
    }

    const animate = (el) => {
      const target = Number(el.dataset.count);
      const duration = 1400;
      const start = performance.now();

      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 4);
        el.textContent = Math.round(target * eased);
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach((el) => observer.observe(el));
  }

  /* ---------- каталог: рендер и фильтры ---------- */

  const catalogGrid = $('#catalogGrid');
  const familyChips = $('#familyChips');

  function cardTemplate(product) {
    const fam = FAMILY[product.family];
    const tagHTML = product.tag
      ? `<span class="card-tag card-tag--${product.tag}">${product.tag === 'new' ? 'new' : 'hit'}</span>`
      : '';

    return `
      <article class="card" data-family="${product.family}" data-id="${product.id}">
        ${tagHTML}
        <button class="card-media" type="button" data-open="${product.id}"
                aria-label="Подробнее об аромате «${product.name}»">
          ${bottleSVG(product)}
        </button>
        <div class="card-body">
          <div class="card-top">
            <span class="card-index">№ ${pad(product.id)}</span>
            <span class="card-family">${fam.label}</span>
          </div>
          <h3 class="card-name">
            <button class="card-name-btn" type="button" data-open="${product.id}">${product.name}</button>
          </h3>
          <dl class="pyramid">
            <div class="pyramid-row"><dt>Верхние</dt><dd>${product.top.join(', ')}</dd></div>
            <div class="pyramid-row"><dt>Сердце</dt><dd>${product.heart.join(', ')}</dd></div>
            <div class="pyramid-row"><dt>База</dt><dd>${product.base.join(', ')}</dd></div>
          </dl>
          <div class="card-foot">
            <div class="card-price">
              <strong>${fmt(product.price[50])}</strong>
              <span>50 мл · экстракт</span>
            </div>
            <button class="btn btn-outline btn-small" type="button" data-add="${product.id}"
                    aria-label="Добавить «${product.name}» в корзину">В корзину</button>
          </div>
        </div>
      </article>`;
  }

  function renderCatalog(filter) {
    if (!catalogGrid) return;
    const list = filter === 'all'
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.family === filter);

    catalogGrid.innerHTML = list.map(cardTemplate).join('');

    // ступенчатое появление карточек
    $$('.card', catalogGrid).forEach((card, i) => {
      card.classList.add('card-enter');
      card.style.animationDelay = `${i * 55}ms`;
    });
  }

  if (familyChips) {
    familyChips.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip || chip.classList.contains('is-active')) return;

      $$('.chip', familyChips).forEach((c) => {
        c.classList.remove('is-active');
        c.setAttribute('aria-pressed', 'false');
      });
      chip.classList.add('is-active');
      chip.setAttribute('aria-pressed', 'true');

      renderCatalog(chip.dataset.filter);
    });
  }

  if (catalogGrid) {
    // одно делегирование на всю сетку — обработчики не дублируются
    catalogGrid.addEventListener('click', (e) => {
      const addBtn = e.target.closest('[data-add]');
      if (addBtn) {
        addToCart(Number(addBtn.dataset.add), 50);
        return;
      }
      const openBtn = e.target.closest('[data-open]');
      if (openBtn) openProductModal(Number(openBtn.dataset.open));
    });
  }

  /* ---------- корзина ---------- */

  const STORAGE_KEY = 'veresk-cart-v1';
  const cartDrawer = $('#cartDrawer');
  const cartToggle = $('#cartToggle');
  const cartClose = $('#cartClose');
  const cartBody = $('#cartBody');
  const cartCount = $('#cartCount');
  const cartHeadCount = $('#cartHeadCount');

  let cart = [];
  let lastCartFocus = null;

  function loadCart() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((item) => {
        return item
          && getProduct(item.id)
          && VOLUMES.includes(Number(item.volume))
          && Number.isFinite(Number(item.qty))
          && Number(item.qty) > 0;
      }).map((item) => ({
        id: Number(item.id),
        volume: Number(item.volume),
        qty: Math.min(99, Math.floor(Number(item.qty)))
      }));
    } catch (err) {
      return [];
    }
  }

  function saveCart() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (err) {
      /* приватный режим и т.п. — тихо работаем без сохранения */
    }
  }

  function cartQtyTotal() {
    return cart.reduce((sum, item) => sum + item.qty, 0);
  }

  function cartSumTotal() {
    return cart.reduce((sum, item) => {
      const p = getProduct(item.id);
      return p ? sum + p.price[item.volume] * item.qty : sum;
    }, 0);
  }

  function pulseCount() {
    if (!cartCount || reduceMotion) return;
    cartCount.classList.remove('is-pop');
    void cartCount.offsetWidth; // перезапуск анимации
    cartCount.classList.add('is-pop');
  }

  function updateCartBadge() {
    if (!cartCount) return;
    const qty = cartQtyTotal();
    cartCount.textContent = qty;
    cartCount.classList.toggle('is-visible', qty > 0);
    if (cartHeadCount) cartHeadCount.textContent = qty > 0 ? `· ${qty}` : '';
  }

  function cartItemTemplate(item) {
    const p = getProduct(item.id);
    if (!p) return '';
    const unit = p.price[item.volume];

    return `
      <div class="cart-item">
        <div class="cart-item-thumb" aria-hidden="true">${bottleSVG(p)}</div>
        <div class="cart-item-info">
          <p class="cart-item-name">${p.name}</p>
          <p class="cart-item-meta">${item.volume} мл · ${fmt(unit)} / шт.</p>
          <div class="qty" role="group" aria-label="Количество: ${p.name}, ${item.volume} мл">
            <button class="qty-btn" type="button" data-dec data-id="${p.id}" data-vol="${item.volume}"
                    aria-label="Уменьшить количество" ${item.qty <= 1 ? 'disabled' : ''}>−</button>
            <span class="qty-value">${item.qty}</span>
            <button class="qty-btn" type="button" data-inc data-id="${p.id}" data-vol="${item.volume}"
                    aria-label="Увеличить количество">+</button>
          </div>
        </div>
        <div class="cart-item-side">
          <button class="cart-item-remove" type="button" data-remove data-id="${p.id}" data-vol="${item.volume}"
                  aria-label="Удалить «${p.name}» из корзины">×</button>
          <p class="cart-item-total">${fmt(unit * item.qty)}</p>
        </div>
      </div>`;
  }

  function renderCart() {
    if (!cartBody) return;
    updateCartBadge();

    if (cart.length === 0) {
      cartBody.innerHTML = `
        <div class="cart-empty">
          <span class="cart-empty-mark" aria-hidden="true">✦</span>
          <p>В корзине пока пусто.<br>Выберите характер — мы бережно упакуем.</p>
          <a class="cart-empty-link" href="#catalog" data-close-cart>Перейти в каталог</a>
        </div>`;
      return;
    }

    cartBody.innerHTML = `
      <div class="cart-items">${cart.map(cartItemTemplate).join('')}</div>
      <div class="cart-foot">
        <div class="cart-total-row">
          <span>Итого</span>
          <strong>${fmt(cartSumTotal())}</strong>
        </div>
        <button class="btn btn-primary btn-block" type="button" data-checkout>Оформить заказ</button>
        <p class="cart-note">Доставка по России — 2–4 дня. Пробник следующего аромата в подарок.</p>
      </div>`;
  }

  function addToCart(id, volume) {
    const product = getProduct(id);
    if (!product) return;

    const existing = cart.find((item) => item.id === id && item.volume === volume);
    if (existing) {
      existing.qty = Math.min(99, existing.qty + 1);
    } else {
      cart.push({ id, volume, qty: 1 });
    }

    saveCart();
    renderCart();
    pulseCount();
    showToast(`«${product.name}», ${volume} мл — добавлено в корзину`);
  }

  function changeQty(id, volume, delta) {
    const item = cart.find((i) => i.id === id && i.volume === volume);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
      cart = cart.filter((i) => i !== item);
    } else {
      item.qty = Math.min(99, item.qty);
    }
    saveCart();
    renderCart();
  }

  function removeItem(id, volume) {
    cart = cart.filter((i) => !(i.id === id && i.volume === volume));
    saveCart();
    renderCart();
  }

  function openCart() {
    if (!cartDrawer) return;
    lastCartFocus = document.activeElement;
    renderCart(); // всегда актуальное состояние (в т.ч. после заказа)
    body.classList.add('is-cart-open');
    cartDrawer.classList.add('is-open');
    cartDrawer.setAttribute('aria-hidden', 'false');
    syncChrome();
    if (cartClose) cartClose.focus();
  }

  function closeCart() {
    if (!cartDrawer || !body.classList.contains('is-cart-open')) return;
    body.classList.remove('is-cart-open');
    cartDrawer.classList.remove('is-open');
    cartDrawer.setAttribute('aria-hidden', 'true');
    syncChrome();
    if (lastCartFocus && typeof lastCartFocus.focus === 'function') lastCartFocus.focus();
  }

  if (cartToggle) cartToggle.addEventListener('click', openCart);
  if (cartClose) cartClose.addEventListener('click', closeCart);

  if (cartBody) {
    cartBody.addEventListener('click', (e) => {
      const inc = e.target.closest('[data-inc]');
      if (inc) { changeQty(Number(inc.dataset.id), Number(inc.dataset.vol), 1); return; }

      const dec = e.target.closest('[data-dec]');
      if (dec) { changeQty(Number(dec.dataset.id), Number(dec.dataset.vol), -1); return; }

      const remove = e.target.closest('[data-remove]');
      if (remove) { removeItem(Number(remove.dataset.id), Number(remove.dataset.vol)); return; }

      const closer = e.target.closest('[data-close-cart]');
      if (closer) { closeCart(); return; }

      const checkout = e.target.closest('[data-checkout]');
      if (checkout) checkoutOrder();
    });
  }

  function checkoutOrder() {
    if (cart.length === 0) {
      showToast('Корзина пуста — выберите аромат в каталоге');
      return;
    }

    const orderNo = 'В-' + (1000 + Math.floor(Math.random() * 9000));
    cart = [];
    saveCart();
    updateCartBadge();

    if (cartBody) {
      cartBody.innerHTML = `
        <div class="cart-success">
          <span class="cart-success-mark" aria-hidden="true">✓</span>
          <h3>Заказ ${orderNo} принят</h3>
          <p>Мы свяжемся с вами в течение часа, чтобы подтвердить доставку.<br>
          Спасибо, что выбираете медленное.</p>
          <button class="btn btn-outline" type="button" data-close-cart>Продолжить покупки</button>
        </div>`;
    }
  }

  /* ---------- модалка товара ---------- */

  const productModal = $('#productModal');
  const modalMedia = $('#modalMedia');
  const modalFamily = $('#modalFamily');
  const modalTitle = $('#productModalTitle');
  const modalDescription = $('#modalDescription');
  const modalPyramid = $('#modalPyramid');
  const modalVolumes = $('#modalVolumes');
  const modalAddButton = $('#modalAddButton');
  const modalAddPrice = $('#modalAddPrice');
  const modalCloseBtn = productModal ? productModal.querySelector('.modal-close') : null;

  let modalProduct = null;
  let modalVolume = 50;
  let lastModalFocus = null;

  function updateModalPrice() {
    if (!modalAddPrice || !modalProduct) return;
    modalAddPrice.textContent = fmt(modalProduct.price[modalVolume]);
  }

  function openProductModal(id) {
    const product = getProduct(id);
    if (!product || !productModal) return;

    modalProduct = product;
    modalVolume = 50;
    lastModalFocus = document.activeElement;

    const fam = FAMILY[product.family];

    if (modalFamily) modalFamily.textContent = `№ ${pad(product.id)} · ${fam.label}`;
    if (modalTitle) modalTitle.textContent = product.name;
    if (modalDescription) modalDescription.textContent = product.description;

    if (modalPyramid) {
      modalPyramid.innerHTML = `
        <div class="pyramid-row"><dt>Верхние</dt><dd>${product.top.join(', ')}</dd></div>
        <div class="pyramid-row"><dt>Сердце</dt><dd>${product.heart.join(', ')}</dd></div>
        <div class="pyramid-row"><dt>База</dt><dd>${product.base.join(', ')}</dd></div>`;
    }

    if (modalVolumes) {
      modalVolumes.innerHTML = VOLUMES.map((vol) => `
        <label class="volume-option ${vol === modalVolume ? 'is-selected' : ''}">
          <input type="radio" name="modalVolume" value="${vol}" ${vol === modalVolume ? 'checked' : ''}>
          <span class="volume-value">${vol} мл</span>
          <span class="volume-price">${fmt(product.price[vol])}</span>
        </label>`).join('');
    }

    if (modalMedia) {
      modalMedia.style.background = `linear-gradient(165deg, ${fam.bg[0]} 0%, ${fam.bg[1]} 100%)`;
      modalMedia.innerHTML = bottleSVG(product);
    }

    updateModalPrice();

    body.classList.add('is-modal-open');
    productModal.classList.add('is-open');
    productModal.setAttribute('aria-hidden', 'false');
    syncChrome();
    if (modalCloseBtn) modalCloseBtn.focus();
  }

  function closeProductModal() {
    if (!productModal || !body.classList.contains('is-modal-open')) return;
    body.classList.remove('is-modal-open');
    productModal.classList.remove('is-open');
    productModal.setAttribute('aria-hidden', 'true');
    syncChrome();
    if (lastModalFocus && typeof lastModalFocus.focus === 'function') lastModalFocus.focus();
  }

  if (productModal) {
    // крестик и клик по фону внутри модалки
    productModal.addEventListener('click', (e) => {
      if (e.target.closest('[data-close-modal]')) closeProductModal();
    });
  }

  if (modalVolumes) {
    modalVolumes.addEventListener('change', (e) => {
      const input = e.target.closest('input[name="modalVolume"]');
      if (!input) return;
      modalVolume = Number(input.value);
      $$('.volume-option', modalVolumes).forEach((label) => {
        const checked = label.querySelector('input');
        label.classList.toggle('is-selected', Boolean(checked && checked.checked));
      });
      updateModalPrice();
    });
  }

  if (modalAddButton) {
    modalAddButton.addEventListener('click', () => {
      if (!modalProduct) return;
      addToCart(modalProduct.id, modalVolume);
      closeProductModal();
    });
  }

  /* ---------- глобальные закрытия: Esc и оверлей ---------- */

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (body.classList.contains('is-modal-open')) closeProductModal();
    else if (body.classList.contains('is-cart-open')) closeCart();
    else if (body.classList.contains('is-nav-open')) closeNav();
  });

  if (overlay) {
    overlay.addEventListener('click', () => {
      if (body.classList.contains('is-modal-open')) closeProductModal();
      if (body.classList.contains('is-cart-open')) closeCart();
      if (body.classList.contains('is-nav-open')) closeNav();
    });
  }

  /* ---------- подписка: валидация email без перезагрузки ---------- */

  const subscribeForm = $('#subscribeForm');
  const emailInput = $('#emailInput');
  const formMessage = $('#formMessage');

  if (subscribeForm && emailInput && formMessage) {
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

    subscribeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const value = emailInput.value.trim();

      if (!EMAIL_RE.test(value)) {
        emailInput.classList.remove('is-invalid');
        void emailInput.offsetWidth; // перезапуск анимации «тряски»
        emailInput.classList.add('is-invalid');
        emailInput.setAttribute('aria-invalid', 'true');
        formMessage.textContent = 'Похоже, в адресе опечатка. Формат: имя@домен.ру';
        formMessage.classList.remove('is-success');
        formMessage.classList.add('is-error');
        emailInput.focus();
        return;
      }

      emailInput.classList.remove('is-invalid');
      emailInput.removeAttribute('aria-invalid');
      formMessage.textContent = 'Готово! Первое письмо из мастерской уже в пути.';
      formMessage.classList.remove('is-error');
      formMessage.classList.add('is-success');
      subscribeForm.reset();
    });

    emailInput.addEventListener('input', () => {
      emailInput.classList.remove('is-invalid');
      emailInput.removeAttribute('aria-invalid');
    });
  }

  /* ---------- старт ---------- */

  cart = loadCart();
  renderCatalog('all');
  renderCart();
  initReveal();
  initCounters();

})();