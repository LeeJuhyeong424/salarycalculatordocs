/* =====================================================================
   근태관리 계산기 사용법 — 화면 동작
   외부 라이브러리 없음. 스크립트가 실패해도 문서는 그대로 읽힌다.
   ===================================================================== */
(() => {
  'use strict'

  const $ = (sel) => document.querySelector(sel)
  const $$ = (sel) => [...document.querySelectorAll(sel)]

  // ── 1. 테마 ───────────────────────────────────────────────────────
  // auto → light → dark 순으로 돈다. 고른 값은 다음 방문에도 남는다.
  const THEMES = ['auto', 'light', 'dark']
  const LABEL = { auto: '시스템 설정 따름', light: '밝게', dark: '어둡게' }
  const root = document.documentElement
  const themeBtn = $('#themeBtn')

  const applyTheme = (t) => {
    root.dataset.theme = t
    if (themeBtn) themeBtn.title = `화면 밝기 — ${LABEL[t]} (눌러서 변경)`
    // 주소창 색까지 맞춰야 모바일에서 이질감이 없다
    const dark =
      t === 'dark' ||
      (t === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    $$('meta[name="theme-color"]').forEach((m) => m.remove())
    const meta = document.createElement('meta')
    meta.name = 'theme-color'
    meta.content = dark ? '#0d1117' : '#f6f7f9'
    document.head.appendChild(meta)
  }

  let stored = null
  try {
    stored = localStorage.getItem('theme')
  } catch {
    /* 사파리 시크릿 모드 등에서 막힐 수 있다 — 없으면 그냥 auto */
  }
  applyTheme(THEMES.includes(stored) ? stored : 'auto')

  themeBtn?.addEventListener('click', () => {
    const next = THEMES[(THEMES.indexOf(root.dataset.theme) + 1) % THEMES.length]
    applyTheme(next)
    try {
      localStorage.setItem('theme', next)
    } catch {
      /* 저장 못 해도 이번 방문에는 적용된다 */
    }
  })

  // ── 2. 좁은 화면 목차 서랍 ─────────────────────────────────────────
  const toc = $('#toc')
  const scrim = $('#scrim')
  const menuBtn = $('#menuBtn')

  const setDrawer = (open) => {
    toc?.classList.toggle('is-open', open)
    if (scrim) scrim.hidden = !open
    menuBtn?.setAttribute('aria-expanded', String(open))
    document.body.style.overflow = open ? 'hidden' : ''
  }

  menuBtn?.addEventListener('click', () =>
    setDrawer(menuBtn.getAttribute('aria-expanded') !== 'true'),
  )
  scrim?.addEventListener('click', () => setDrawer(false))
  // 목차에서 항목을 고르면 서랍은 닫는다
  toc?.addEventListener('click', (e) => {
    if (e.target.closest('a')) setDrawer(false)
  })
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setDrawer(false)
  })

  // ── 3. 지금 읽는 곳을 목차에 표시 ──────────────────────────────────
  const links = $$('.toc__list a')
  const sections = links
    .map((a) => document.querySelector(a.getAttribute('href')))
    .filter(Boolean)

  const markCurrent = (id) => {
    links.forEach((a) => {
      if (a.getAttribute('href') === '#' + id) a.setAttribute('aria-current', 'true')
      else a.removeAttribute('aria-current')
    })
  }

  if (sections.length && 'IntersectionObserver' in window) {
    // 화면 위쪽 1/3 지점을 지나는 절을 '지금 보는 곳' 으로 본다
    const seen = new Set()
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) seen.add(en.target.id)
          else seen.delete(en.target.id)
        })
        // 문서 순서상 가장 위에 있는 것을 고른다
        const current = sections.find((s) => seen.has(s.id))
        if (current) markCurrent(current.id)
      },
      { rootMargin: '-15% 0px -70% 0px', threshold: 0 },
    )
    sections.forEach((s) => io.observe(s))
  }

  // ── 4. 읽은 만큼 진행 막대 ────────────────────────────────────────
  const bar = $('#progress')
  const toTop = $('#toTop')

  const onScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight
    const ratio = max > 0 ? Math.min(1, window.scrollY / max) : 0
    if (bar) bar.style.width = (ratio * 100).toFixed(1) + '%'
    if (toTop) toTop.hidden = window.scrollY < 600
  }
  addEventListener('scroll', onScroll, { passive: true })
  addEventListener('resize', onScroll, { passive: true })
  onScroll()

  toTop?.addEventListener('click', () =>
    window.scrollTo({ top: 0, behavior: 'smooth' }),
  )

  // ── 5. 미사용 휴무 수당 계산기 ────────────────────────────────────
  // 앱이 실제로 쓰는 식과 같다:
  //   미사용 = max(0, 그달 휴무일 − '휴무'로 찍은 날)
  //   수당   = 미사용 × 1일 소정근로시간 × 시급 × 1.5
  const OUT = $('#cOut')
  const inputs = ['cWage', 'cHours', 'cOfficial', 'cUsed'].map((id) => $('#' + id))

  const won = (n) => Math.round(n).toLocaleString('ko-KR') + '원'
  const num = (el, min, max) => {
    const v = Number(el?.value)
    if (!Number.isFinite(v)) return min
    return Math.min(max, Math.max(min, v))
  }

  const render = () => {
    if (!OUT) return
    const [wageEl, hoursEl, officialEl, usedEl] = inputs
    const wage = num(wageEl, 0, 10_000_000)
    const hours = num(hoursEl, 0, 24)
    const official = num(officialEl, 0, 31)
    const used = num(usedEl, 0, 31)

    const daily = hours * wage // 1일치 (기본급분)
    const unused = Math.max(0, official - used)
    const pay = unused * daily * 1.5

    const rows = [
      ['1일치 (소정근로 ' + hours + '시간 × 시급)', won(daily)],
      ['미사용 휴무 (' + official + '일 − ' + used + '일)', unused + '일'],
    ]

    OUT.innerHTML =
      rows.map(([k, v]) => `<span class="r"><span>${k}</span><span>${v}</span></span>`).join('') +
      `<span class="r r--total"><span>미사용 휴무 수당</span><b>${won(pay)}</b></span>` +
      (unused === 0
        ? '<span class="msg msg--zero">쉰 날을 전부 찍으셨습니다. 붙는 수당이 없는 게 정상입니다.</span>'
        : `<span class="msg">${unused}일 × ${won(daily)} × 1.5 배. 이 ${unused}일을 실제로 쉬었다면 달력에서 <b>휴무</b>로 찍어야 이 금액이 사라집니다.</span>`)
  }

  inputs.forEach((el) => el?.addEventListener('input', render))
  render()

  // ── 6. FAQ 는 하나만 펼친다 ───────────────────────────────────────
  const faqs = $$('.faq details')
  faqs.forEach((d) =>
    d.addEventListener('toggle', () => {
      if (d.open) faqs.forEach((o) => o !== d && (o.open = false))
    }),
  )
})()
