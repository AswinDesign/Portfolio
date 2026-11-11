/* ============================================================
   ASWIN — THE DESIGNER-VERSE
   Interactions, generated web graphics and cinematic details.
   ============================================================ */

document.documentElement.classList.remove('no-js');

const body = document.body;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/* ------------------------------------------------------------
   Logo loader
   ------------------------------------------------------------ */
(function loader() {
    const el = document.getElementById('preloader');
    const started = performance.now();
    let released = false;

    if (!el) {
        body.classList.add('is-loaded', 'is-landed');
        return;
    }

    body.classList.add('is-loading');

    function release() {
        if (released) return;
        released = true;

        const minTime = reduceMotion ? 120 : 1000;
        const delay = Math.max(0, minTime - (performance.now() - started));

        window.setTimeout(() => {
            body.classList.remove('is-loading');
            body.classList.add('is-loaded', 'is-landed');
            el.classList.add('is-done');
            window.setTimeout(() => el.remove(), 900);
        }, delay);
    }

    if (document.readyState === 'complete') {
        release();
    } else {
        window.addEventListener('load', release, { once: true });
    }

    // Never hold the page hostage if a slow asset stalls the load event.
    window.setTimeout(release, 6000);
})();

/* ------------------------------------------------------------
   Mobile menu
   ------------------------------------------------------------ */
(function mobileMenu() {
    const toggle = document.getElementById('menuToggle');
    const menu = document.getElementById('mobileMenu');
    if (!toggle || !menu) return;

    const links = menu.querySelectorAll('a[href^="#"]');
    let open = false;

    function setOpen(next, restoreFocus) {
        open = next;
        body.classList.toggle('menu-open', open);
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        menu.setAttribute('aria-hidden', String(!open));
        if (!open && restoreFocus) toggle.focus();
    }

    toggle.addEventListener('click', () => setOpen(!open, false));

    links.forEach((link) => {
        link.addEventListener('click', () => setOpen(false, false));
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && open) setOpen(false, true);
    });

    const desktop = window.matchMedia('(min-width: 1025px)');
    desktop.addEventListener('change', (event) => {
        if (event.matches && open) setOpen(false, false);
    });
})();

/* ------------------------------------------------------------
   Header glass density
   ------------------------------------------------------------ */
(function headerGlass() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    let ticking = false;

    function paint() {
        ticking = false;
        header.classList.toggle('is-scrolled', (window.scrollY || 0) > 24);
    }

    function requestPaint() {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(paint);
    }

    paint();
    window.addEventListener('scroll', requestPaint, { passive: true });
    window.addEventListener('resize', requestPaint);
})();

/* ------------------------------------------------------------
   Active top-bar option (scroll spy)
   ------------------------------------------------------------ */
(function navSpy() {
    const links = Array.from(document.querySelectorAll('.main-nav a[data-nav]'));
    if (!links.length) return;

    const sections = links
        .map((link) => document.getElementById(link.dataset.nav))
        .filter(Boolean);
    if (!sections.length) return;

    let ticking = false;
    let current = null;

    function paint() {
        ticking = false;
        const probe = window.innerHeight * 0.42;
        let next = null;

        for (const section of sections) {
            if (section.getBoundingClientRect().top <= probe) next = section.id;
        }

        if (next === current) return;
        current = next;

        links.forEach((link) => {
            const on = link.dataset.nav === current;
            link.classList.toggle('is-active', on);
            if (on) link.setAttribute('aria-current', 'true');
            else link.removeAttribute('aria-current');
        });
    }

    function requestPaint() {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(paint);
    }

    paint();
    window.addEventListener('scroll', requestPaint, { passive: true });
    window.addEventListener('resize', requestPaint);
    window.addEventListener('load', requestPaint);
})();

/* ------------------------------------------------------------
   Hero poster depth exit
   ------------------------------------------------------------ */
(function heroExit() {
    const hero = document.querySelector('.hero');
    if (!hero || reduceMotion) return;

    let ticking = false;

    function paint() {
        ticking = false;
        const travel = Math.max(1, hero.offsetHeight * 0.72);
        const exit = Math.min(1, Math.max(0, (window.scrollY || 0) / travel));
        hero.style.setProperty('--hero-exit', exit.toFixed(3));
    }

    function requestPaint() {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(paint);
    }

    paint();
    window.addEventListener('scroll', requestPaint, { passive: true });
    window.addEventListener('resize', requestPaint);
    window.addEventListener('load', requestPaint);
})();

/* ------------------------------------------------------------
   Hero card 3D flight
   The portrait flips a full 360° into the lockup on load, then
   flips away on scroll. Every cycle launches from a new angle.
   ------------------------------------------------------------ */
(function heroCardFlight() {
    const wrap = document.querySelector('.hero-poster-wrap');
    const hero = document.querySelector('.hero');
    if (!wrap || !hero || reduceMotion) return;

    const LOAD_MS = 1100;
    const SETTLE = 0.0005;
    const CORNERS = [
        [-0.66, -0.58],
        [0.66, -0.58],
        [-0.66, 0.58],
        [0.66, 0.58],
        [-0.28, -0.74],
        [0.28, -0.74],
        [-0.8, 0],
        [0.8, 0],
    ];

    let loadStart = 0;
    let loadDone = false;
    let started = false;
    let scrollTarget = 0;
    let scrollCurrent = 0;
    let lastTarget = 0;
    let raf = 0;
    let lastTime = 0;
    let flight = pickFlight();

    function clamp01(value) {
        return Math.min(1, Math.max(0, value));
    }

    function easeOutBack(t) {
        const c1 = 1.2;
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    }

    function pickFlight() {
        const corner = CORNERS[Math.floor(Math.random() * CORNERS.length)];

        return {
            x: corner[0] * window.innerWidth,
            y: corner[1] * window.innerHeight,
            z: -(500 + Math.random() * 300),
            axis: Math.random() < 0.55 ? 'y' : 'x',
            spin: Math.random() < 0.5 ? -1 : 1,
            tiltX: (Math.random() * 2 - 1) * 20,
            tiltY: (Math.random() * 2 - 1) * 20,
            tiltZ: (Math.random() * 2 - 1) * 14,
            scale: 0.52 + Math.random() * 0.1,
        };
    }

    function pose(away) {
        const a = Math.max(-0.12, away);
        const opacity = clamp01((1 - a) / 0.03);
        const flip = a * 360 * flight.spin;
        const rx = (flight.axis === 'x' ? flip : 0) + a * flight.tiltX;
        const ry = (flight.axis === 'y' ? flip : 0) + a * flight.tiltY;
        const rz = a * flight.tiltZ;

        wrap.style.transform = [
            'perspective(1400px)',
            `translate3d(${(a * flight.x).toFixed(2)}px, ${(a * flight.y).toFixed(2)}px, ${(a * flight.z).toFixed(2)}px)`,
            `rotateX(${rx.toFixed(2)}deg)`,
            `rotateY(${ry.toFixed(2)}deg)`,
            `rotateZ(${rz.toFixed(2)}deg)`,
            `scale(${(1 - a * (1 - flight.scale)).toFixed(4)})`,
        ].join(' ');
        wrap.style.opacity = opacity.toFixed(3);
        wrap.classList.toggle('is-flying', Math.abs(a) > 0.02);
    }

    function scrollProgress() {
        const travel = Math.max(1, hero.offsetHeight * 0.55);
        const raw = clamp01((window.scrollY || document.documentElement.scrollTop || 0) / travel);
        return raw * raw * (3 - 2 * raw);
    }

    function tick(now) {
        raf = 0;
        if (!started) return;

        const dt = lastTime ? Math.min(60, now - lastTime) : 16.67;
        lastTime = now;

        let loadAway = 0;
        if (!loadDone) {
            const t = clamp01((now - loadStart) / LOAD_MS);
            loadAway = 1 - easeOutBack(t);
            if (t >= 1) {
                loadDone = true;
                loadAway = 0;
            }
        }

        const blend = 1 - Math.pow(0.8, dt / 16.67);
        scrollCurrent += (scrollTarget - scrollCurrent) * blend;
        if (Math.abs(scrollTarget - scrollCurrent) < SETTLE) scrollCurrent = scrollTarget;

        pose(scrollCurrent + loadAway * (1 - scrollCurrent));

        if (!loadDone || Math.abs(scrollTarget - scrollCurrent) > SETTLE) {
            raf = window.requestAnimationFrame(tick);
        }
    }

    function kick() {
        if (raf) return;
        raf = window.requestAnimationFrame(tick);
    }

    function readScroll() {
        const next = scrollProgress();

        // New corner each time a fresh flight starts, and a new one for
        // the return trip once the card is fully out of sight.
        if (next > 0.001 && lastTarget <= 0.001 && scrollCurrent < 0.01) {
            flight = pickFlight();
        } else if (next <= 0.001 && lastTarget > 0.001 && scrollCurrent > 0.98) {
            flight = pickFlight();
        }

        lastTarget = next;
        scrollTarget = next;
        kick();
    }

    function start() {
        if (started) return;
        started = true;
        loadStart = performance.now();
        lastTime = loadStart;
        readScroll();
    }

    // Hold the card off-screen until the loader lifts.
    pose(1);
    scrollTarget = scrollProgress();
    scrollCurrent = scrollTarget;
    lastTarget = scrollTarget;

    if (body.classList.contains('is-loaded')) {
        start();
    } else {
        const observer = new MutationObserver(() => {
            if (!body.classList.contains('is-loaded')) return;
            observer.disconnect();
            start();
        });
        observer.observe(body, { attributes: true, attributeFilter: ['class'] });
    }

    window.addEventListener('scroll', readScroll, { passive: true });
    window.addEventListener('resize', readScroll);
    window.addEventListener('load', readScroll);
})();

/* ------------------------------------------------------------
   Spider-suit hover mask
   ------------------------------------------------------------ */
(function suitMask() {
    const wrap = document.querySelector('.hero-poster-wrap');
    const poster = document.querySelector('.hero-poster');
    if (!wrap || !poster) return;

    let glitchTimer = 0;
    let remaskTimer = 0;

    function glitch() {
        if (reduceMotion) return;
        poster.classList.remove('is-glitching');
        void poster.offsetWidth;
        poster.classList.add('is-glitching');
        window.clearTimeout(glitchTimer);
        glitchTimer = window.setTimeout(() => poster.classList.remove('is-glitching'), 620);
    }

    function unmask() {
        if (poster.classList.contains('is-unmasked')) return;
        window.clearTimeout(remaskTimer);
        poster.classList.remove('is-remasking');
        poster.classList.add('is-unmasked');
        glitch();
        document.dispatchEvent(new CustomEvent('hero:maskchange', { detail: { unmasked: true } }));
    }

    function remask() {
        if (!poster.classList.contains('is-unmasked')) return;
        poster.classList.remove('is-unmasked');
        poster.classList.add('is-remasking');
        glitch();
        document.dispatchEvent(new CustomEvent('hero:maskchange', { detail: { unmasked: false } }));
        window.clearTimeout(remaskTimer);
        remaskTimer = window.setTimeout(() => poster.classList.remove('is-remasking'), reduceMotion ? 0 : 640);
    }

    if (finePointer) {
        wrap.addEventListener('pointerenter', (event) => {
            if (event.pointerType && event.pointerType !== 'mouse') return;
            unmask();
        });

        wrap.addEventListener('pointerleave', (event) => {
            if (event.pointerType && event.pointerType !== 'mouse') return;
            remask();
        });
    } else {
        poster.addEventListener('click', () => {
            if (poster.classList.contains('is-unmasked')) remask();
            else unmask();
        });
    }
})();

/* ------------------------------------------------------------
   Reveal on scroll
   ------------------------------------------------------------ */
(function revealOnScroll() {
    const items = Array.from(document.querySelectorAll('.reveal'));
    if (!items.length) return;

    if (reduceMotion || !('IntersectionObserver' in window)) {
        items.forEach((item) => item.classList.add('is-visible'));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.08, rootMargin: '0px 0px 9% 0px' });

    items.forEach((item) => observer.observe(item));
})();

/* ------------------------------------------------------------
   Generated spider-webs
   ------------------------------------------------------------ */
(function webs() {
    const NS = 'http://www.w3.org/2000/svg';

    function makeNode(name) {
        return document.createElementNS(NS, name);
    }

    function buildWeb(svg) {
        const center = svg.dataset.center || 'center';
        const spokes = Math.max(4, parseInt(svg.dataset.spokes, 10) || 12);
        const rings = Math.max(2, parseInt(svg.dataset.rings, 10) || 6);
        const radius = parseFloat(svg.dataset.radius) || 600;
        const sag = parseFloat(svg.dataset.sag) || 0.16;
        const isFull = center === 'center';

        let cx = 500;
        let cy = 500;
        let a0 = 0;
        let a1 = Math.PI * 2;

        if (center === 'tl') {
            cx = 0;
            cy = 0;
            a0 = 0;
            a1 = Math.PI / 2;
        } else if (center === 'br') {
            cx = 1000;
            cy = 1000;
            a0 = Math.PI;
            a1 = Math.PI * 1.5;
        }

        const group = makeNode('g');
        group.setAttribute('fill', 'none');
        group.setAttribute('stroke', 'currentColor');
        group.setAttribute('stroke-width', '1');
        group.setAttribute('stroke-opacity', '0.82');
        group.setAttribute('stroke-linecap', 'round');

        const angleAt = (i) => {
            if (isFull) return a0 + ((a1 - a0) * i) / spokes;
            return a0 + ((a1 - a0) * i) / (spokes - 1);
        };

        // Radial threads
        for (let i = 0; i < spokes; i += 1) {
            const angle = angleAt(i);
            const line = makeNode('line');
            line.setAttribute('x1', cx);
            line.setAttribute('y1', cy);
            line.setAttribute('x2', (cx + Math.cos(angle) * radius * 1.06).toFixed(1));
            line.setAttribute('y2', (cy + Math.sin(angle) * radius * 1.06).toFixed(1));
            line.setAttribute('vector-effect', 'non-scaling-stroke');
            group.appendChild(line);
        }

        // Sagging rings and intersection beads
        for (let r = 1; r <= rings; r += 1) {
            const ringRadius = radius * (r / rings);
            const points = [];

            for (let i = 0; i < spokes; i += 1) {
                const angle = angleAt(i);
                points.push([
                    cx + Math.cos(angle) * ringRadius,
                    cy + Math.sin(angle) * ringRadius,
                ]);
            }

            const segments = isFull ? spokes : spokes - 1;

            for (let i = 0; i < segments; i += 1) {
                const p1 = points[i];
                const p2 = points[(i + 1) % points.length];
                const midX = (p1[0] + p2[0]) / 2;
                const midY = (p1[1] + p2[1]) / 2;
                const ctrlX = cx + (midX - cx) * (1 - sag);
                const ctrlY = cy + (midY - cy) * (1 - sag);

                const path = makeNode('path');
                path.setAttribute(
                    'd',
                    `M ${p1[0].toFixed(1)} ${p1[1].toFixed(1)} Q ${ctrlX.toFixed(1)} ${ctrlY.toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`
                );
                path.setAttribute('vector-effect', 'non-scaling-stroke');
                group.appendChild(path);
            }

            points.forEach((point) => {
                const dot = makeNode('circle');
                dot.setAttribute('cx', point[0].toFixed(1));
                dot.setAttribute('cy', point[1].toFixed(1));
                dot.setAttribute('r', '1.5');
                dot.setAttribute('fill', 'currentColor');
                dot.setAttribute('stroke', 'none');
                dot.setAttribute('opacity', '0.55');
                group.appendChild(dot);
            });
        }

        svg.replaceChildren(group);
    }

    document.querySelectorAll('.js-web').forEach(buildWeb);
})();

/* ------------------------------------------------------------
   Custom cursor — spider dot, multiverse ring and web bursts
   ------------------------------------------------------------ */
(function cursor() {
    const ring = document.getElementById('cursorRing');
    const dot = document.getElementById('cursorDot');
    const label = document.getElementById('cursorLabel');
    if (!ring || !dot) return;

    if (!finePointer || reduceMotion) {
        ring.style.display = 'none';
        dot.style.display = 'none';
        return;
    }

    const root = document.documentElement;
    root.classList.add('has-custom-cursor');
    dot.classList.add('is-hidden');
    ring.classList.add('is-hidden');

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let seen = false;

    dot.style.translate = `${mouseX}px ${mouseY}px`;
    ring.style.translate = `${ringX}px ${ringY}px`;

    function setCursorVisibility(hidden) {
        dot.classList.toggle('is-hidden', hidden);
        ring.classList.toggle('is-hidden', hidden);
    }

    window.addEventListener('pointermove', (event) => {
        if (event.pointerType === 'touch') return;
        mouseX = event.clientX;
        mouseY = event.clientY;
        if (!seen) {
            seen = true;
            ringX = mouseX;
            ringY = mouseY;
            setCursorVisibility(false);
        }
        dot.style.translate = `${mouseX}px ${mouseY}px`;
    }, { passive: true });

    function loop() {
        ringX += (mouseX - ringX) * 0.16;
        ringY += (mouseY - ringY) * 0.16;
        ring.style.translate = `${ringX}px ${ringY}px`;
        window.requestAnimationFrame(loop);
    }
    window.requestAnimationFrame(loop);

    const interactiveSelector = 'a, button, [role="button"], input, textarea, select, .hero-poster-wrap, #heroPoster, .film-card, .poster-card';
    let hoverTarget = null;

    document.addEventListener('pointerover', (event) => {
        const target = event.target.closest(interactiveSelector);
        hoverTarget = target || null;

        if (!target) {
            ring.classList.remove('is-hovering');
            dot.classList.remove('is-hovering');
            if (label) label.textContent = 'VIEW';
            return;
        }

        if (target.matches('input, textarea, select')) {
            ring.classList.remove('is-hovering');
            dot.classList.remove('is-hovering');
            setCursorVisibility(true);
            return;
        }

        setCursorVisibility(false);
        const text = cursorLabelFor(target);
        if (text) {
            if (label) label.textContent = text;
            ring.classList.add('is-hovering');
            dot.classList.add('is-hovering');
        } else {
            ring.classList.remove('is-hovering');
            dot.classList.remove('is-hovering');
        }
    });

    document.addEventListener('pointerout', (event) => {
        if (event.relatedTarget && event.relatedTarget.closest && event.relatedTarget.closest(interactiveSelector)) return;
        hoverTarget = null;
        ring.classList.remove('is-hovering');
        dot.classList.remove('is-hovering');
        if (label) label.textContent = 'VIEW';
    });

    document.documentElement.addEventListener('pointerleave', () => setCursorVisibility(true));
    document.documentElement.addEventListener('pointerenter', () => {
        if (seen) setCursorVisibility(false);
    });

    let lastBurst = -1;

    window.addEventListener('pointerdown', (event) => {
        if (event.pointerType === 'touch') return;
        ring.classList.add('is-pressed');

        // The hero card and the theme spider are drag surfaces; skip
        // the click burst there so grabbing them stays clean.
        if (event.target.closest && event.target.closest('.hero-poster-wrap, #themeSpider')) return;

        clickBurst(event.clientX, event.clientY);
    });

    window.addEventListener('pointerup', () => ring.classList.remove('is-pressed'));
    window.addEventListener('blur', () => setCursorVisibility(true));

    function cursorLabelFor(element) {
        if (element.closest('#themeSpider')) return 'PULL';
        if (element.closest('.hero-poster-wrap')) return 'DRAG';
        if (element.closest('[data-wall-open]')) return 'VIEW';
        if (element.closest('.film-card, .poster-card')) return 'VIEW';
        if (element.closest('#wallTour')) return 'TOUR';
        if (element.closest('#wallboxNext')) return 'NEXT';
        if (element.closest('#wallboxPrev')) return 'PREV';
        if (element.closest('[data-wall-close]')) return 'CLOSE';
        if (element.closest('#secretBtn')) return 'SECRET';
        if (element.tagName === 'A') {
            const href = element.getAttribute('href') || '';
            return href.startsWith('#') ? 'GO' : 'OPEN';
        }
        if (element.tagName === 'BUTTON') return 'CLICK';
        return '';
    }

    function webBurst(x, y, text = 'THWIP!') {
        const burst = document.createElement('div');
        burst.className = 'web-burst';
        burst.style.left = `${x}px`;
        burst.style.top = `${y}px`;

        for (let i = 0; i < 12; i += 1) {
            const spoke = document.createElement('i');
            spoke.style.setProperty('--a', `${i * 30}deg`);
            spoke.style.animationDelay = `${i * 7}ms`;
            burst.appendChild(spoke);
        }

        if (text) {
            const sfx = document.createElement('b');
            sfx.textContent = text;
            burst.appendChild(sfx);
        }

        document.body.appendChild(burst);
        window.setTimeout(() => burst.remove(), 850);
    }

    function clickBurst(x, y) {
        const effects = [webBurst, shutterBurst, impactBurst];
        let pick = Math.floor(Math.random() * effects.length);
        if (pick === lastBurst) pick = (pick + 1 + Math.floor(Math.random() * (effects.length - 1))) % effects.length;
        lastBurst = pick;
        effects[pick](x, y);
    }

    function shutterBurst(x, y) {
        const burst = document.createElement('div');
        burst.className = 'shutter-burst';
        burst.style.left = `${x}px`;
        burst.style.top = `${y}px`;

        const frame = document.createElement('span');
        frame.className = 'shutter-frame';
        for (let i = 0; i < 4; i += 1) frame.appendChild(document.createElement('i'));
        burst.appendChild(frame);

        const sfx = document.createElement('b');
        sfx.textContent = 'SNAP!';
        burst.appendChild(sfx);

        document.body.appendChild(burst);
        window.setTimeout(() => burst.remove(), 850);
    }

    function impactBurst(x, y) {
        const burst = document.createElement('div');
        burst.className = 'impact-burst';
        burst.style.left = `${x}px`;
        burst.style.top = `${y}px`;

        burst.appendChild(document.createElement('span'));

        for (let i = 0; i < 8; i += 1) {
            const dot = document.createElement('i');
            dot.style.setProperty('--a', `${i * 45}deg`);
            dot.style.animationDelay = `${i * 9}ms`;
            burst.appendChild(dot);
        }

        const sfx = document.createElement('b');
        sfx.textContent = 'BAM!';
        burst.appendChild(sfx);

        document.body.appendChild(burst);
        window.setTimeout(() => burst.remove(), 850);
    }
})();

/* ------------------------------------------------------------
   Hero poster 3D tilt
   ------------------------------------------------------------ */
(function heroTilt() {
    const wrap = document.querySelector('.hero-poster-wrap');
    const poster = document.getElementById('heroPoster');
    if (!wrap || !poster || !finePointer || reduceMotion) return;

    function reset() {
        poster.classList.remove('is-tilting');
        poster.style.setProperty('--rx', '0deg');
        poster.style.setProperty('--ry', '0deg');
    }

    wrap.addEventListener('pointerenter', (event) => {
        if (event.pointerType && event.pointerType !== 'mouse') return;
        if (wrap.classList.contains('is-dragging') || wrap.classList.contains('is-spinning')) return;
        if (poster.classList.contains('is-spinning') || poster.classList.contains('is-springing')) return;
        poster.classList.add('is-tilting');
    });

    wrap.addEventListener('pointermove', (event) => {
        if (event.pointerType && event.pointerType !== 'mouse') return;
        if (wrap.classList.contains('is-dragging') || wrap.classList.contains('is-spinning')) return;
        if (poster.classList.contains('is-spinning') || poster.classList.contains('is-springing')) return;
        const rect = wrap.getBoundingClientRect();
        if (!rect.width || !rect.height) return;

        const px = (event.clientX - rect.left) / rect.width - 0.5;
        const py = (event.clientY - rect.top) / rect.height - 0.5;

        poster.style.setProperty('--rx', `${(-py * 7).toFixed(2)}deg`);
        poster.style.setProperty('--ry', `${(px * 9).toFixed(2)}deg`);
    });

    wrap.addEventListener('pointerleave', reset);
    window.addEventListener('blur', reset);
})();

/* ------------------------------------------------------------
   Hero poster drag
   Drag the card with a mouse or pen. On release it springs back
   to its resting spot with a small overshoot.
   ------------------------------------------------------------ */
(function heroDrag() {
    const wrap = document.querySelector('.hero-poster-wrap');
    const poster = document.getElementById('heroPoster');
    if (!wrap || !finePointer) return;

    const stage = wrap.closest('.hero-name-stage');
    let pointerId = null;
    let startX = 0;
    let startY = 0;
    let baseX = 0;
    let baseY = 0;
    let x = 0;
    let y = 0;

    function currentOffset() {
        const computed = window.getComputedStyle(wrap).translate;
        if (!computed || computed === 'none') return { x: 0, y: 0 };
        const parts = computed.split(' ');
        return {
            x: Number.parseFloat(parts[0]) || 0,
            y: Number.parseFloat(parts[1]) || 0,
        };
    }

    function limits() {
        const cardW = wrap.offsetWidth;
        const cardH = wrap.offsetHeight;
        const stageRect = stage ? stage.getBoundingClientRect() : null;
        const restLeft = stageRect ? stageRect.left + wrap.offsetLeft : (window.innerWidth - cardW) / 2;
        const restTop = stageRect ? stageRect.top + wrap.offsetTop : (window.innerHeight - cardH) / 2;
        const margin = 24;

        return {
            minX: margin - restLeft,
            maxX: document.documentElement.clientWidth - margin - (restLeft + cardW),
            minY: margin - restTop,
            maxY: window.innerHeight - margin - (restTop + cardH),
        };
    }

    function clamp(value, min, max) {
        return Math.min(max, Math.max(min, value));
    }

    function release() {
        if (pointerId === null) return;
        const id = pointerId;
        pointerId = null;

        if (wrap.hasPointerCapture(id)) wrap.releasePointerCapture(id);
        wrap.classList.remove('is-dragging');
        // Commit the drag offset with the spring transition active before
        // resetting, otherwise the browser snaps instead of animating.
        void wrap.offsetWidth;
        wrap.style.translate = '0px 0px';
        wrap.style.rotate = '0deg';
        if (poster) {
            poster.style.setProperty('--drag-rx', '0deg');
            poster.style.setProperty('--drag-ry', '0deg');
        }
    }

    wrap.addEventListener('pointerdown', (event) => {
        if (event.pointerType && event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
        if (event.button !== 0 || pointerId !== null) return;
        if (wrap.classList.contains('is-flying') || wrap.classList.contains('is-spinning')) return;
        if (poster && (poster.classList.contains('is-spinning') || poster.classList.contains('is-springing'))) return;
        event.preventDefault();

        pointerId = event.pointerId;
        wrap.setPointerCapture(pointerId);

        const offset = currentOffset();
        baseX = offset.x;
        baseY = offset.y;
        startX = event.clientX;
        startY = event.clientY;
        x = baseX;
        y = baseY;

        wrap.classList.add('is-dragging');
        wrap.style.translate = `${baseX}px ${baseY}px`;
        wrap.style.rotate = '0deg';

        if (poster) {
            poster.classList.remove('is-tilting');
            poster.style.setProperty('--rx', '0deg');
            poster.style.setProperty('--ry', '0deg');
            poster.style.setProperty('--drag-rx', '0deg');
            poster.style.setProperty('--drag-ry', '0deg');
        }
    });

    wrap.addEventListener('pointermove', (event) => {
        if (pointerId === null || event.pointerId !== pointerId) return;

        const bounds = limits();
        x = clamp(baseX + (event.clientX - startX), bounds.minX, bounds.maxX);
        y = clamp(baseY + (event.clientY - startY), bounds.minY, bounds.maxY);

        wrap.style.translate = `${x.toFixed(1)}px ${y.toFixed(1)}px`;
        wrap.style.rotate = `${clamp(x / 70, -6, 6).toFixed(2)}deg`;

        if (poster) {
            // The card leans into the direction it is being carried:
            // left drag turns the face left, right drag turns it right,
            // and vertical drag adds a small forward/back tip.
            const rangeX = Math.max(280, window.innerWidth * 0.26);
            const rangeY = Math.max(220, window.innerHeight * 0.3);
            const nx = clamp(x / rangeX, -1, 1);
            const ny = clamp(y / rangeY, -1, 1);
            poster.style.setProperty('--drag-ry', `${(-nx * 20).toFixed(2)}deg`);
            poster.style.setProperty('--drag-rx', `${(-ny * 11).toFixed(2)}deg`);
        }
    });

    wrap.addEventListener('pointerup', (event) => {
        if (event.pointerId === pointerId) release();
    });
    wrap.addEventListener('pointercancel', (event) => {
        if (event.pointerId === pointerId) release();
    });
    wrap.addEventListener('dragstart', (event) => event.preventDefault());
    window.addEventListener('blur', release);
})();

/* ------------------------------------------------------------
   Hero poster right-drag spin
   Hold the right mouse button and drag to spin the card in
   either direction. Releasing springs it back to the resting
   angle with a small overshoot.
   ------------------------------------------------------------ */
(function heroSpin() {
    const wrap = document.querySelector('.hero-poster-wrap');
    const poster = document.getElementById('heroPoster');
    if (!wrap || !poster || !finePointer) return;

    const X_RATE = 0.7;
    const Y_RATE = 0.85;
    let pointerId = null;
    let startX = 0;
    let startY = 0;
    let spinX = 0;
    let spinY = 0;
    let settleTimer = 0;
    let menuTimer = 0;

    function blockMenu(event) {
        event.preventDefault();
    }

    function setSpin(x, y) {
        poster.style.setProperty('--spin-x', `${x.toFixed(2)}deg`);
        poster.style.setProperty('--spin-y', `${y.toFixed(2)}deg`);
    }

    function settle() {
        if (pointerId === null) return;
        const id = pointerId;
        pointerId = null;

        if (wrap.hasPointerCapture(id)) wrap.releasePointerCapture(id);
        wrap.classList.remove('is-spinning');

        // The context menu can fire on right-button release after the
        // pointer has left the card, so keep blocking it briefly.
        window.clearTimeout(menuTimer);
        menuTimer = window.setTimeout(() => {
            window.removeEventListener('contextmenu', blockMenu, true);
        }, 450);
        window.clearTimeout(settleTimer);

        if (reduceMotion) {
            setSpin(0, 0);
            poster.classList.remove('is-spinning');
            return;
        }

        // Drop whole turns before springing back so the card settles
        // along the shortest path instead of unwinding every spin.
        spinX -= Math.round(spinX / 360) * 360;
        spinY -= Math.round(spinY / 360) * 360;
        setSpin(spinX, spinY);
        void poster.offsetWidth;

        poster.classList.remove('is-spinning');
        poster.classList.add('is-springing');
        void poster.offsetWidth;

        setSpin(0, 0);

        settleTimer = window.setTimeout(() => {
            poster.classList.remove('is-springing');
        }, 1150);
    }

    wrap.addEventListener('contextmenu', blockMenu);

    wrap.addEventListener('pointerdown', (event) => {
        if (event.button !== 2 || pointerId !== null) return;
        if (wrap.classList.contains('is-flying') || wrap.classList.contains('is-dragging')) return;
        if (poster.classList.contains('is-springing')) return;

        event.preventDefault();

        pointerId = event.pointerId;
        wrap.setPointerCapture(pointerId);
        wrap.classList.add('is-spinning');
        poster.classList.add('is-spinning');

        window.clearTimeout(menuTimer);
        window.addEventListener('contextmenu', blockMenu, true);

        startX = event.clientX;
        startY = event.clientY;
        spinX = 0;
        spinY = 0;
        setSpin(0, 0);

        poster.style.setProperty('--rx', '0deg');
        poster.style.setProperty('--ry', '0deg');
        poster.style.setProperty('--drag-rx', '0deg');
        poster.style.setProperty('--drag-ry', '0deg');
    });

    wrap.addEventListener('pointermove', (event) => {
        if (pointerId === null || event.pointerId !== pointerId) return;

        spinX = (event.clientY - startY) * X_RATE;
        spinY = (event.clientX - startX) * Y_RATE;
        setSpin(spinX, spinY);
    });

    wrap.addEventListener('pointerup', (event) => {
        if (event.pointerId === pointerId) settle();
    });
    wrap.addEventListener('pointercancel', (event) => {
        if (event.pointerId === pointerId) settle();
    });
    window.addEventListener('blur', () => {
        if (pointerId !== null) settle();
    });
})();

/* ------------------------------------------------------------
   Project poster 3D tilt
   ------------------------------------------------------------ */
(function posterTilt() {
    const cards = Array.from(document.querySelectorAll('.film-card'));
    if (!cards.length || !finePointer || reduceMotion) return;

    cards.forEach((card) => {
        const poster = card.querySelector('.poster');
        if (!poster) return;

        card.addEventListener('pointermove', (event) => {
            if (event.pointerType && event.pointerType !== 'mouse') return;
            const rect = card.getBoundingClientRect();
            if (!rect.width || !rect.height) return;

            const px = (event.clientX - rect.left) / rect.width - 0.5;
            const py = (event.clientY - rect.top) / rect.height - 0.5;

            poster.style.setProperty('--rx', `${(-py * 7).toFixed(2)}deg`);
            poster.style.setProperty('--ry', `${(px * 9).toFixed(2)}deg`);
        });

        card.addEventListener('pointerleave', () => {
            poster.style.setProperty('--rx', '0deg');
            poster.style.setProperty('--ry', '0deg');
        });
    });
})();

/* ------------------------------------------------------------
   Stacked pages
   Each scene scrolls normally, then pins with its bottom at the
   viewport bottom. The next scene slides up over it like a new
   sheet of paper, so the sections build a stack as you scroll.
   Tall sections still scroll in full before they pin.
   ------------------------------------------------------------ */
(function pageStack() {
    const pages = Array.from(document.querySelectorAll('main > section'));
    if (!pages.length || reduceMotion) return;

    let queued = false;

    function paint() {
        queued = false;
        const viewH = window.innerHeight;

        pages.forEach((page) => {
            // Pin when the bottom edge of the page meets the viewport
            // bottom, so the next page slides straight over it. Bottom
            // padding is intentionally zero on sections, which keeps
            // dead space out of the pinned frame.
            const offset = Math.min(0, Math.round(viewH - page.offsetHeight));
            page.style.setProperty('--stack-top', `${offset}px`);
        });
    }

    function requestPaint() {
        if (queued) return;
        queued = true;
        window.requestAnimationFrame(paint);
    }

    paint();
    pages.forEach((page) => page.classList.add('is-page-stack'));

    window.addEventListener('resize', requestPaint);
    window.addEventListener('load', requestPaint);

    if ('ResizeObserver' in window) {
        const observer = new ResizeObserver(requestPaint);
        pages.forEach((page) => observer.observe(page));
    }
})();

/* ------------------------------------------------------------
   Section links — always land on the top of that stacked page
   ------------------------------------------------------------ */
(function sectionNav() {
    const pages = Array.from(document.querySelectorAll('main > section'));

    // A pinned (sticky) section's offsetTop reports its current pinned
    // position, not its place in the document. Measure it with the
    // stack temporarily released so every nav click lands on the true
    // top of the page instead of dropping into the middle of it.
    function naturalTop(page) {
        if (!page.classList.contains('is-page-stack')) {
            return page.getBoundingClientRect().top + window.scrollY;
        }

        const stack = pages.filter((p) => p.classList.contains('is-page-stack'));
        stack.forEach((p) => p.classList.remove('is-page-stack'));
        const top = page.getBoundingClientRect().top + window.scrollY;
        stack.forEach((p) => p.classList.add('is-page-stack'));
        return top;
    }

    document.addEventListener('click', (event) => {
        if (event.defaultPrevented) return;
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

        const link = event.target.closest && event.target.closest('a[href^="#"]');
        if (!link) return;

        const hash = link.getAttribute('href');
        if (!hash || hash === '#') return;

        const id = decodeURIComponent(hash.slice(1));
        const page = document.getElementById(id);
        if (!page) return;
        if (id !== 'top' && !page.matches('main > section')) return;

        event.preventDefault();
        const top = id === 'top' ? 0 : Math.round(naturalTop(page));
        window.scrollTo({
            top,
            behavior: reduceMotion ? 'auto' : 'smooth',
        });

        try {
            window.history.replaceState(null, '', hash);
        } catch (error) { /* file:// and privacy modes can block this */ }
    });
})();

/* ------------------------------------------------------------
   Poster room
   ------------------------------------------------------------ */
/* ------------------------------------------------------------
   Poster salon — spotlight tour + full-frame viewer
   ------------------------------------------------------------ */
(function posterSalon() {
    const stage = document.getElementById('wallStage');
    const grid = document.getElementById('wallGrid');
    const tourBtn = document.getElementById('wallTour');
    const buttons = Array.from(document.querySelectorAll('[data-wall-open]'))
        .sort((a, b) => Number(a.dataset.index) - Number(b.dataset.index));
    if (!stage || !grid || !buttons.length) return;

    const GALLERY_I = 'https://www.behance.net/gallery/213621883/Sport-Design-II';
    const GALLERY_II = 'https://www.behance.net/gallery/239405795/2025-Sports-Poster-Design-(Personal-Projects)';

    const POSTERS = [
        {
            title: 'Symbiote',
            tag: 'Raphinha · Fan art · 2025',
            full: './assets/image/posters/wall/full/symbiote.webp',
            collection: 'Vol. I · Sport Design II',
            link: GALLERY_I,
            desc: 'A Venomised portrait built around tension, texture and one red eye.',
        },
        {
            title: 'Seleção',
            tag: 'Vini Jr × Raphinha · Brazil · 2025',
            full: './assets/image/posters/wall/full/selecao.webp',
            collection: 'Vol. I · Sport Design II',
            link: GALLERY_I,
            desc: 'Two generations of Brazilian flair beneath the CBF stars.',
        },
        {
            title: 'Neymar Jr',
            tag: 'Brazil · Number 10 · 2025',
            full: './assets/image/posters/wall/full/neymar.webp',
            collection: 'Vol. I · Sport Design II',
            link: GALLERY_I,
            desc: 'Purple voltage, a number ten and a nation holding its breath.',
        },
        {
            title: 'Golden Lightning',
            tag: 'Haaland · Manchester City · 2025',
            full: './assets/image/posters/wall/full/golden-lightning.webp',
            collection: 'Vol. I · Sport Design II',
            link: GALLERY_I,
            desc: 'Haaland’s strike turned into pure electric gold.',
        },
        {
            title: 'Blaugrana',
            tag: 'Lamine Yamal · Barcelona · 2025',
            full: './assets/image/posters/wall/full/blaugrana.webp',
            collection: 'Vol. I · Sport Design II',
            link: GALLERY_I,
            desc: 'La Masia’s next chapter, lit like a night match.',
        },
        {
            title: 'Don Andrés',
            tag: 'Iniesta · Farewell · 2025',
            full: './assets/image/posters/wall/full/don-andres.webp',
            collection: 'Vol. I · Sport Design II',
            link: GALLERY_I,
            desc: 'Don Andrés, surrounded by everything he won.',
        },
        {
            title: 'Panther',
            tag: 'Cristiano Ronaldo · Portugal · 2025',
            full: './assets/image/posters/wall/full/panther.webp',
            collection: 'Vol. II · 2025 Series',
            link: GALLERY_II,
            desc: 'Portugal’s captain flanked by a panther and open flame.',
        },
        {
            title: 'Bicycle',
            tag: 'Haaland · Overhead kick · 2025',
            full: './assets/image/posters/wall/full/bicycle.webp',
            collection: 'Vol. II · 2025 Series',
            link: GALLERY_II,
            desc: 'An overhead kick with lightning in the boots.',
        },
        {
            title: 'Hat-Trick',
            tag: 'Mbappé · Real Madrid · 2025',
            full: './assets/image/posters/wall/full/hat-trick.webp',
            collection: 'Vol. II · 2025 Series',
            link: GALLERY_II,
            desc: 'A hat-trick in green fire, with the defender left seated.',
        },
        {
            title: 'Here We Go Again',
            tag: 'Messi × Neymar × Ronaldo · 2025',
            full: './assets/image/posters/wall/full/here-we-go-again.webp',
            collection: 'Vol. II · 2025 Series',
            link: GALLERY_II,
            desc: 'Three icons walking toward one last World Cup.',
        },
        {
            title: 'Planets',
            tag: 'Messi × Yamal · Deep space · 2025',
            full: './assets/image/posters/wall/full/planets.webp',
            collection: 'Vol. II · 2025 Series',
            link: GALLERY_II,
            desc: 'Messi and Yamal playing across the solar system.',
        },
        {
            title: 'World Cup',
            tag: 'Haaland · Norway · 2025',
            full: './assets/image/posters/wall/full/world-cup.webp',
            collection: 'Vol. II · 2025 Series',
            link: GALLERY_II,
            desc: 'A golden trophy, a Norwegian striker, one empty pitch.',
        },
    ];

    const items = buttons.map((btn, i) => {
        const source = POSTERS[i] || POSTERS[0];
        const img = btn.querySelector('img');
        return {
            btn,
            print: btn.closest('.wall-print'),
            img,
            title: source.title,
            tag: source.tag,
            full: source.full,
            collection: source.collection,
            link: source.link,
            desc: source.desc,
            alt: img ? img.alt : source.title,
            preloaded: false,
        };
    });

    /* ---------- Spotlight ---------- */
    const canTour = finePointer && !reduceMotion;
    let tourOn = canTour;
    let tourIndex = -1;
    let tourTimer = 0;
    let inView = false;
    let hovering = false;
    let boxOpen = false;

    function moveSpotTo(print) {
        if (!print) return;
        const stageRect = stage.getBoundingClientRect();
        const rect = print.getBoundingClientRect();
        stage.style.setProperty('--spot-x', `${Math.round(rect.left - stageRect.left + rect.width / 2)}px`);
        stage.style.setProperty('--spot-y', `${Math.round(rect.top - stageRect.top + rect.height * 0.4)}px`);
        stage.classList.add('is-live');
    }

    function setLit(index) {
        items.forEach((item, i) => {
            item.print.classList.toggle('is-lit', i === index);
        });
        if (index >= 0) moveSpotTo(items[index].print);
    }

    function stopTour() {
        window.clearTimeout(tourTimer);
        tourTimer = 0;
    }

    function canRunTour() {
        return tourOn && canTour && inView && !hovering && !document.hidden && !boxOpen;
    }

    function scheduleTour(delay = 2800) {
        stopTour();
        if (!canRunTour()) return;
        tourTimer = window.setTimeout(() => {
            tourIndex = (tourIndex + 1) % items.length;
            setLit(tourIndex);
            scheduleTour();
        }, delay);
    }

    function beginTour() {
        if (!canTour || hovering) return;
        if (tourIndex < 0) tourIndex = 0;
        setLit(tourIndex);
        scheduleTour(2400);
    }

    function paintTourButton() {
        if (!tourBtn) return;
        if (!canTour) {
            tourBtn.hidden = true;
            return;
        }
        tourBtn.hidden = false;
        tourBtn.setAttribute('aria-pressed', String(tourOn));
        const label = tourBtn.querySelector('.wall-tour-label');
        const icon = tourBtn.querySelector('.wall-tour-icon');
        if (label) label.textContent = tourOn ? 'Pause tour' : 'Play tour';
        if (icon) icon.textContent = tourOn ? '❚❚' : '▶';
    }

    if (tourBtn) {
        tourBtn.addEventListener('click', () => {
            tourOn = !tourOn;
            paintTourButton();
            if (tourOn) {
                beginTour();
            } else {
                stopTour();
                setLit(-1);
                stage.classList.remove('is-live', 'is-pointer');
            }
        });
    }

    if (canTour) {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                stopTour();
            } else if (tourOn) {
                scheduleTour(1600);
            }
        });

        stage.addEventListener('pointermove', (event) => {
            const rect = stage.getBoundingClientRect();
            stage.style.setProperty('--spot-x', `${Math.round(event.clientX - rect.left)}px`);
            stage.style.setProperty('--spot-y', `${Math.round(event.clientY - rect.top)}px`);
            stage.classList.add('is-live', 'is-pointer');
        });

        stage.addEventListener('pointerleave', () => {
            stage.classList.remove('is-pointer');
            if (tourOn) {
                setLit(tourIndex);
            } else {
                stage.classList.remove('is-live');
            }
        });

        window.addEventListener('resize', () => {
            if (tourIndex >= 0) moveSpotTo(items[tourIndex].print);
        });
    }

    items.forEach((item, i) => {
        item.btn.addEventListener('pointerenter', () => {
            if (!finePointer || boxOpen) return;
            hovering = true;
            stopTour();
            setLit(i);
            stage.classList.add('is-pointer');
        });

        item.btn.addEventListener('focus', () => {
            if (boxOpen) return;
            hovering = true;
            stopTour();
            setLit(i);
        });

        item.btn.addEventListener('blur', () => {
            hovering = false;
            if (tourOn) scheduleTour(1400);
        });

        item.btn.addEventListener('pointerleave', () => {
            if (!finePointer || boxOpen) return;
            hovering = false;
            if (tourOn) scheduleTour(1800);
        });
    });

    paintTourButton();

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                inView = entry.isIntersecting;
            });
            if (inView && tourOn) {
                beginTour();
            } else if (!inView) {
                stopTour();
            }
        }, { threshold: 0.16 });
        observer.observe(stage);
    } else {
        inView = true;
        if (tourOn) beginTour();
    }

    /* ---------- Full-frame viewer ---------- */
    const box = document.getElementById('wallBox');
    if (!box) return;

    const boxPanel = box.querySelector('.wallbox-panel');
    const boxMedia = document.getElementById('wallboxMedia');
    const boxImg = document.getElementById('wallboxImg');
    const boxTitle = document.getElementById('wallboxTitle');
    const boxDesc = document.getElementById('wallboxDesc');
    const boxTag = document.getElementById('wallboxTag');
    const boxCollection = document.getElementById('wallboxCollection');
    const boxCurrent = document.getElementById('wallboxCurrent');
    const boxLink = document.getElementById('wallboxLink');
    const boxPrev = document.getElementById('wallboxPrev');
    const boxNext = document.getElementById('wallboxNext');
    const closeButtons = Array.from(box.querySelectorAll('[data-wall-close]'));

    let boxIndex = 0;
    let boxLastFocus = null;
    let boxHideTimer = 0;
    let boxSwapTimer = 0;

    function preloadFull(index) {
        const item = items[(index + items.length) % items.length];
        if (!item || item.preloaded) return;
        item.preloaded = true;
        const preload = new Image();
        preload.src = item.full;
    }

    function renderBox(animate) {
        const item = items[boxIndex];
        if (!item) return;

        boxImg.src = item.full;
        boxImg.alt = item.alt;
        if (boxTitle) boxTitle.textContent = item.title;
        if (boxDesc) boxDesc.textContent = item.desc;
        if (boxTag) boxTag.textContent = item.tag;
        if (boxCollection) boxCollection.textContent = item.collection;
        if (boxCurrent) boxCurrent.textContent = String(boxIndex + 1).padStart(2, '0');
        if (boxLink) {
            boxLink.href = item.link;
            boxLink.setAttribute('aria-label', `View ${item.title} project on Behance`);
        }

        if (animate && !reduceMotion) {
            boxMedia.classList.remove('is-swapping');
            void boxMedia.offsetWidth;
            boxMedia.classList.add('is-swapping');
            window.clearTimeout(boxSwapTimer);
            boxSwapTimer = window.setTimeout(() => boxMedia.classList.remove('is-swapping'), 460);
        }

        preloadFull(boxIndex + 1);
        preloadFull(boxIndex - 1);
    }

    function openBox(index) {
        boxIndex = ((index % items.length) + items.length) % items.length;
        boxLastFocus = document.activeElement;
        window.clearTimeout(boxHideTimer);
        renderBox(false);
        box.hidden = false;
        document.body.classList.add('wall-open');
        const gap = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.paddingRight = gap > 0 ? `${gap}px` : '';
        boxOpen = true;
        hovering = false;
        stopTour();
        setLit(-1);
        stage.classList.remove('is-live', 'is-pointer');
        window.requestAnimationFrame(() => {
            box.classList.add('is-open');
            const close = box.querySelector('.wallbox-close');
            if (close) close.focus();
        });
    }

    function closeBox() {
        if (!boxOpen) return;
        boxOpen = false;
        box.classList.remove('is-open');
        document.body.classList.remove('wall-open');
        document.body.style.paddingRight = '';
        window.clearTimeout(boxHideTimer);
        boxHideTimer = window.setTimeout(() => {
            box.hidden = true;
            if (boxLastFocus && typeof boxLastFocus.focus === 'function') boxLastFocus.focus();
        }, reduceMotion ? 0 : 360);
        if (tourOn) scheduleTour(2200);
    }

    function stepBox(direction) {
        if (!boxOpen) return;
        boxIndex = (boxIndex + direction + items.length) % items.length;
        renderBox(true);
    }

    buttons.forEach((btn, i) => {
        btn.addEventListener('click', () => openBox(i));
    });

    closeButtons.forEach((button) => {
        button.addEventListener('click', closeBox);
    });

    if (boxPrev) boxPrev.addEventListener('click', () => stepBox(-1));
    if (boxNext) boxNext.addEventListener('click', () => stepBox(1));

    document.addEventListener('keydown', (event) => {
        if (!boxOpen) return;

        if (event.key === 'Escape') {
            event.preventDefault();
            closeBox();
            return;
        }

        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            stepBox(-1);
            return;
        }

        if (event.key === 'ArrowRight') {
            event.preventDefault();
            stepBox(1);
            return;
        }

        if (event.key === 'Tab' && boxPanel) {
            const focusable = Array.from(box.querySelectorAll('button:not([disabled]), a[href]'))
                .filter((el) => el.offsetParent !== null);
            if (!focusable.length) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        }
    });

    let swipeStart = null;
    if (boxMedia) {
        boxMedia.addEventListener('pointerdown', (event) => {
            if (event.pointerType !== 'touch') return;
            swipeStart = event.clientX;
        });

        boxMedia.addEventListener('pointerup', (event) => {
            if (swipeStart === null) return;
            const distance = event.clientX - swipeStart;
            swipeStart = null;
            if (Math.abs(distance) > 44) stepBox(distance < 0 ? 1 : -1);
        });

        boxMedia.addEventListener('pointercancel', () => {
            swipeStart = null;
        });
    }

    document.addEventListener('visibilitychange', () => {
        if (document.hidden && boxOpen) closeBox();
    });
})();

/* ------------------------------------------------------------
   Post-credits easter egg
   ------------------------------------------------------------ */
(function postCredit() {
    const card = document.getElementById('postCredit');
    const button = document.getElementById('secretBtn');
    const message = document.getElementById('secretMsg');
    if (!card || !button || !message) return;

    const secret = message.textContent.trim();
    message.textContent = '';
    button.setAttribute('aria-expanded', 'false');

    button.addEventListener('click', () => {
        const revealed = card.classList.toggle('is-revealed');
        button.setAttribute('aria-expanded', String(revealed));
        button.setAttribute(
            'aria-label',
            revealed ? 'Hide the secret message' : 'Click the A for a secret message'
        );
        message.textContent = revealed ? secret : '';
    });
})();

/* ------------------------------------------------------------
   Footer year
   ------------------------------------------------------------ */
(function year() {
    const el = document.getElementById('year');
    if (el) el.textContent = new Date().getFullYear();
})();

/* ------------------------------------------------------------
   Theme switch — hanging spider
   Pull the spider down past the threshold to swap between the
   dark cinema theme and the paper theme. Release and it springs
   back with a rubber-ball bounce. Keyboard: focus + Enter/Space.
   ------------------------------------------------------------ */
(function themeSpider() {
    const spider = document.getElementById('themeSpider');
    const hit = document.getElementById('themeSpiderHit');
    const meta = document.getElementById('themeColor');
    if (!spider || !hit) return;

    const root = document.documentElement;
    const STORAGE_KEY = 'aswin-theme';
    const THRESHOLD = 74;
    const MAX_PULL = 260;
    const media = window.matchMedia('(max-width: 680px)');

    let rest = media.matches ? 40 : 58;
    let y = rest;
    let sway = 0;
    let dragging = false;
    let pointerId = null;
    let startY = 0;
    let startX = 0;
    let startPull = 0;
    let startSway = 0;
    let lastY = rest;
    let lastSway = 0;
    let lastTime = 0;
    let velocity = 0;
    let swayVelocity = 0;
    let maxPull = 0;
    let lastPointerAt = 0;
    let raf = 0;

    function lightOn() {
        return root.getAttribute('data-theme') === 'light';
    }

    function paint() {
        spider.style.setProperty('--spider-y', `${y.toFixed(2)}px`);
        spider.style.setProperty('--spider-sway', `${sway.toFixed(3)}deg`);
    }

    function syncUI() {
        const light = lightOn();
        hit.setAttribute('aria-pressed', String(light));
        hit.setAttribute('aria-label', light
            ? 'Drag down to switch to the dark theme'
            : 'Drag down to switch to the light theme');
        if (meta) meta.setAttribute('content', light ? '#f4f1ea' : '#060607');
    }

    function applyTheme(light, persist) {
        if (light) root.setAttribute('data-theme', 'light');
        else root.removeAttribute('data-theme');
        syncUI();
        if (!persist) return;
        try {
            localStorage.setItem(STORAGE_KEY, light ? 'light' : 'dark');
        } catch (error) { /* storage can be blocked */ }
    }

    function settle() {
        window.cancelAnimationFrame(raf);
        raf = 0;

        if (reduceMotion) {
            y = rest;
            sway = 0;
            paint();
            return;
        }

        // Damped springs: light underdamping for a couple of rubber
        // bounces, plus a slower pendulum wobble on the thread.
        const kY = 0.00016;
        const dY = 0.005;
        const kS = 0.00009;
        const dS = 0.0025;
        let vy = velocity;
        let vs = swayVelocity;
        let last = performance.now();

        function tick(now) {
            let dt = now - last;
            last = now;
            dt = Math.min(32, Math.max(0, dt));
            if (!dt) {
                raf = window.requestAnimationFrame(tick);
                return;
            }

            vy += (-kY * (y - rest) - dY * vy) * dt;
            y += vy * dt;
            vs += (-kS * sway - dS * vs) * dt;
            sway += vs * dt;

            if (y < 10) {
                y = 10;
                vy = Math.abs(vy) * 0.35;
            }

            if (Math.abs(y - rest) < 0.2 && Math.abs(vy) < 0.02 &&
                Math.abs(sway) < 0.08 && Math.abs(vs) < 0.004) {
                y = rest;
                sway = 0;
                velocity = 0;
                swayVelocity = 0;
                paint();
                raf = 0;
                return;
            }

            paint();
            raf = window.requestAnimationFrame(tick);
        }

        raf = window.requestAnimationFrame(tick);
    }

    function endDrag(event) {
        if (!dragging) return;
        if (event && event.pointerId !== undefined && event.pointerId !== pointerId) return;

        const now = performance.now();
        if (now - lastTime > 90) {
            velocity = 0;
            swayVelocity = 0;
        }

        const shouldSwitch = y - rest >= THRESHOLD;
        const tapped = maxPull < 8;

        dragging = false;
        pointerId = null;
        lastPointerAt = performance.now();
        spider.classList.remove('is-dragging', 'is-armed');
        document.body.classList.remove('is-spider-dragging');

        if (shouldSwitch) {
            applyTheme(!lightOn(), true);
        } else if (tapped) {
            // Simple tap/click toggles too, with a small tug.
            applyTheme(!lightOn(), true);
            y = rest + 34;
            sway = 0;
        }

        settle();
    }

    hit.addEventListener('pointerdown', (event) => {
        if (event.pointerType === 'mouse' && event.button !== 0) return;
        event.preventDefault();
        window.cancelAnimationFrame(raf);
        raf = 0;
        dragging = true;
        pointerId = event.pointerId;
        startY = event.clientY;
        startX = event.clientX;
        startPull = y - rest;
        startSway = sway;
        lastY = y;
        lastSway = sway;
        lastTime = performance.now();
        velocity = 0;
        swayVelocity = 0;
        maxPull = 0;
        lastPointerAt = performance.now();
        spider.classList.add('is-dragging');
        document.body.classList.add('is-spider-dragging');
        try {
            hit.setPointerCapture(pointerId);
        } catch (error) { /* capture is best-effort */ }
    });

    hit.addEventListener('pointermove', (event) => {
        if (!dragging || event.pointerId !== pointerId) return;

        const now = performance.now();
        const dt = Math.max(8, now - lastTime);
        const pull = Math.max(0, Math.min(MAX_PULL, startPull + (event.clientY - startY)));
        const nextSway = Math.max(-18, Math.min(18, startSway + (event.clientX - startX) * 0.16));

        y = rest + pull;
        sway = nextSway;
        maxPull = Math.max(maxPull, pull);
        velocity = Math.max(-4, Math.min(4, (y - lastY) / dt));
        swayVelocity = Math.max(-0.06, Math.min(0.06, (sway - lastSway) / dt));
        lastY = y;
        lastSway = sway;
        lastTime = now;

        const armed = pull >= THRESHOLD;
        spider.classList.toggle('is-armed', armed);
        paint();
    });

    hit.addEventListener('pointerup', endDrag);
    hit.addEventListener('pointercancel', endDrag);
    hit.addEventListener('lostpointercapture', endDrag);

    hit.addEventListener('click', (event) => {
        if (event.detail !== 0 || performance.now() - lastPointerAt < 500) return;
        applyTheme(!lightOn(), true);
        y = rest + 34;
        sway = 0;
        paint();
        settle();
    });

    function updateRest() {
        const next = media.matches ? 40 : 58;
        if (next === rest) return;
        const delta = next - rest;
        rest = next;
        y += delta;
        paint();
    }

    if (media.addEventListener) media.addEventListener('change', updateRest);
    else if (media.addListener) media.addListener(updateRest);

    paint();
    syncUI();
})();

