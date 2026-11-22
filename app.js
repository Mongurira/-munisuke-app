(() => {
  'use strict';

  /* ================= 時計 ================= */
  const dateEl = document.getElementById('clock-date');
  const timeEl = document.getElementById('clock-time');
  const WEEK = ['日', '月', '火', '水', '木', '金', '土'];
  const pad = (n) => String(n).padStart(2, '0');

  function tick() {
    const d = new Date();
    dateEl.textContent = `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日(${WEEK[d.getDay()]})`;
    timeEl.innerHTML = `${pad(d.getHours())}:${pad(d.getMinutes())}<span class="sec">:${pad(d.getSeconds())}</span>`;
    // 秒の切り替わりに合わせて次回を予約
    setTimeout(tick, 1000 - d.getMilliseconds() + 5);
  }
  tick();

  /* ================= 電卓 ================= */
  const resultEl = document.getElementById('result');
  const exprEl = document.getElementById('expr');
  const clearKey = document.getElementById('clear-key');
  const opKeys = document.querySelectorAll('.key.op');
  const OP_SYMBOL = { '+': '+', '-': '−', '*': '×', '/': '÷' };
  const MAX_DIGITS = 12;

  const state = {
    current: '0',      // 入力中の数値(文字列)
    stored: null,      // 前の数値
    op: null,          // 待機中の演算子
    fresh: true,       // 次の数字入力で current を置き換えるか
    lastOp: null,      // = 連打用
    lastOperand: null,
    error: false,
  };

  function calc(a, op, b) {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '*': return a * b;
      case '/': return b === 0 ? NaN : a / b;
    }
    return b;
  }

  // 浮動小数点の誤差を丸めて表示用の文字列にする
  function toStr(n) {
    if (!isFinite(n)) return 'エラー';
    let s = String(parseFloat(n.toPrecision(MAX_DIGITS)));
    if (s.replace(/[-.]/g, '').length > MAX_DIGITS || s.includes('e')) {
      s = n.toExponential(6).replace(/\.?0+e/, 'e');
    }
    return s;
  }

  function format(s) {
    if (s === 'エラー' || s.includes('e')) return s;
    const neg = s.startsWith('-');
    if (neg) s = s.slice(1);
    const [int, dec] = s.split('.');
    const withComma = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return (neg ? '-' : '') + withComma + (dec !== undefined ? '.' + dec : '');
  }

  function fitText() {
    resultEl.style.transform = '';
    const parent = resultEl.parentElement;
    const avail = parent.clientWidth - 24;
    const w = resultEl.scrollWidth;
    if (w > avail) {
      resultEl.style.transformOrigin = 'right center';
      resultEl.style.transform = `scale(${avail / w})`;
    }
  }

  function render() {
    resultEl.textContent = format(state.current);
    exprEl.textContent = state.op && state.stored !== null
      ? `${format(toStr(state.stored))} ${OP_SYMBOL[state.op]}`
      : ' ';
    clearKey.textContent = (state.current !== '0' && !state.fresh) ? 'C' : 'AC';
    opKeys.forEach((k) => k.classList.toggle('selected', state.fresh && state.op === k.dataset.op));
    fitText();
  }

  function resetAll() {
    Object.assign(state, {
      current: '0', stored: null, op: null, fresh: true,
      lastOp: null, lastOperand: null, error: false,
    });
  }

  function inputDigit(d) {
    if (state.error) resetAll();
    if (state.fresh) {
      state.current = d;
      state.fresh = false;
    } else {
      const digits = state.current.replace(/[-.]/g, '').length;
      if (digits >= MAX_DIGITS) return;
      state.current = state.current === '0' ? d : state.current === '-0' ? '-' + d : state.current + d;
    }
  }

  function inputDot() {
    if (state.error) resetAll();
    if (state.fresh) {
      state.current = '0.';
      state.fresh = false;
    } else if (!state.current.includes('.')) {
      state.current += '.';
    }
  }

  function setOp(op) {
    if (state.error) return;
    const cur = parseFloat(state.current);
    if (state.op && !state.fresh) {
      const r = calc(state.stored, state.op, cur);
      state.current = toStr(r);
      if (!isFinite(r)) { state.error = true; state.op = null; state.stored = null; return; }
      state.stored = parseFloat(state.current);
    } else if (!state.op || state.stored === null) {
      state.stored = cur;
    }
    state.op = op;
    state.fresh = true;
    state.lastOp = null;
  }

  function equals() {
    if (state.error) return;
    let a, op, b;
    if (state.op) {
      a = state.stored;
      op = state.op;
      b = state.fresh ? state.stored : parseFloat(state.current);
    } else if (state.lastOp) {
      a = parseFloat(state.current);
      op = state.lastOp;
      b = state.lastOperand;
    } else {
      state.fresh = true;
      return;
    }
    const r = calc(a, op, b);
    state.current = toStr(r);
    state.error = !isFinite(r);
    state.lastOp = op;
    state.lastOperand = b;
    state.op = null;
    state.stored = null;
    state.fresh = true;
  }

  function clear() {
    if (state.current !== '0' && !state.fresh && !state.error) {
      state.current = '0';
      state.fresh = true;
    } else {
      resetAll();
    }
  }

  function toggleSign() {
    if (state.error) return;
    if (state.fresh && state.op) {
      state.current = '-0';
      state.fresh = false;
      return;
    }
    state.current = state.current.startsWith('-') ? state.current.slice(1) : '-' + state.current;
  }

  function percent() {
    if (state.error) return;
    const cur = parseFloat(state.current);
    // 足し算・引き算のときは「前の数の◯%」として計算
    const v = (state.op === '+' || state.op === '-') && state.stored !== null
      ? state.stored * cur / 100
      : cur / 100;
    state.current = toStr(v);
    state.fresh = false;
  }

  function backspace() {
    if (state.fresh || state.error) return;
    state.current = state.current.slice(0, -1);
    if (state.current === '' || state.current === '-') {
      state.current = '0';
      state.fresh = true;
    }
  }

  function handle(btn) {
    if (btn.dataset.digit !== undefined) inputDigit(btn.dataset.digit);
    else if (btn.dataset.op) setOp(btn.dataset.op);
    else {
      switch (btn.dataset.action) {
        case 'dot': inputDot(); break;
        case 'equals': equals(); break;
        case 'clear': clear(); break;
        case 'sign': toggleSign(); break;
        case 'percent': percent(); break;
      }
    }
    render();
  }

  // pointerdown で即反応(iPad でのタップ遅延を防ぐ)
  document.querySelector('.keys').addEventListener('pointerdown', (e) => {
    const btn = e.target.closest('.key');
    if (!btn) return;
    e.preventDefault();
    handle(btn);
  });
  // ダブルタップでのズーム防止
  document.addEventListener('dblclick', (e) => e.preventDefault(), { passive: false });
  document.addEventListener('gesturestart', (e) => e.preventDefault());

  // 外付けキーボード対応
  const KEYMAP = {
    Enter: '[data-action="equals"]', '=': '[data-action="equals"]',
    Escape: '[data-action="clear"]', Delete: '[data-action="clear"]',
    '.': '[data-action="dot"]', ',': '[data-action="dot"]',
    '%': '[data-action="percent"]',
    '+': '[data-op="+"]', '-': '[data-op="-"]', '*': '[data-op="*"]', '/': '[data-op="/"]',
  };
  document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === 'Backspace') { e.preventDefault(); backspace(); render(); return; }
    const sel = /^[0-9]$/.test(e.key) ? `[data-digit="${e.key}"]` : KEYMAP[e.key];
    if (!sel) return;
    e.preventDefault();
    const btn = document.querySelector('.keys ' + sel);
    btn.classList.add('pressed');
    setTimeout(() => btn.classList.remove('pressed'), 120);
    handle(btn);
  });

  window.addEventListener('resize', fitText);
  render();

  /* ================= ムニスケ(タップでジャンプ) ================= */
  const muni = document.getElementById('munisuke');
  muni.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    muni.classList.remove('jump');
    void muni.offsetWidth; // アニメーションを最初から再生
    muni.classList.add('jump');
  });
  muni.addEventListener('animationend', () => muni.classList.remove('jump'));

  /* ================= オフライン対応 ================= */
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
})();
