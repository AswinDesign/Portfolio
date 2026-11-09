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

        const minTime = reduceMotion ? 120 : 1900;
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
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

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

    const interactiveSelector = 'a, button, [role="button"], input, textarea, select, .hero-poster-wrap, #heroPoster, .film-card, .poster-thumb, .poster-card';
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
        clickBurst(event.clientX, event.clientY);
    });

    window.addEventListener('pointerup', () => ring.classList.remove('is-pressed'));
    window.addEventListener('blur', () => setCursorVisibility(true));

    function cursorLabelFor(element) {
        if (element.closest('.hero-poster-wrap')) return 'DRAG';
        if (element.closest('.poster-feature')) return 'VIEW';
        if (element.closest('.film-card, .poster-thumb, .poster-card')) return 'VIEW';
        if (element.closest('#wallToggle')) return 'SWING';
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
        if (wrap.classList.contains('is-dragging')) return;
        poster.classList.add('is-tilting');
    });

    wrap.addEventListener('pointermove', (event) => {
        if (event.pointerType && event.pointerType !== 'mouse') return;
        if (wrap.classList.contains('is-dragging')) return;
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
    }

    wrap.addEventListener('pointerdown', (event) => {
        if (event.pointerType && event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
        if (event.button !== 0 || pointerId !== null) return;
        if (wrap.classList.contains('is-flying')) return;
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
        }
    });

    wrap.addEventListener('pointermove', (event) => {
        if (pointerId === null || event.pointerId !== pointerId) return;

        const bounds = limits();
        x = clamp(baseX + (event.clientX - startX), bounds.minX, bounds.maxX);
        y = clamp(baseY + (event.clientY - startY), bounds.minY, bounds.maxY);

        wrap.style.translate = `${x.toFixed(1)}px ${y.toFixed(1)}px`;
        wrap.style.rotate = `${clamp(x / 70, -6, 6).toFixed(2)}deg`;
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
   Scroll-linked 3D scenes
   ------------------------------------------------------------ */
(function sceneDepth() {
    // The hero has its own dedicated scroll exit; don't stack the scene
    // transform and its parallax on the same layer.
    const scenes = Array.from(document.querySelectorAll('main > section:not(.hero)'));
    if (!scenes.length) return;

    if (reduceMotion) {
        scenes.forEach((scene) => {
            scene.style.setProperty('--scene-rx', '0deg');
            scene.style.setProperty('--scene-tz', '0px');
            scene.style.setProperty('--scene-sc', '1');
            scene.style.setProperty('--scene-op', '1');
            scene.style.setProperty('--scene-edge', '0');
        });
        return;
    }

    let ticking = false;

    const clamp01 = (value) => Math.min(1, Math.max(0, value));
    const smooth = (value) => value * value * (3 - 2 * value);

    function paint() {
        ticking = false;
        const viewH = window.innerHeight;
        const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
        const intensity = viewH < 720 ? 0.72 : 1;

        scenes.forEach((scene) => {
            // Layout measurements only — transformed rects would feed the
            // rotation back into its own progress and cause jitter.
            const top = scene.offsetTop - scrollY;
            const height = scene.offsetHeight;
            const bottom = top + height;
            const heightFactor = Math.min(1, 1050 / Math.max(height, 1));

            let amount = 0;
            let direction = 1;

            if (top >= 0 && bottom <= viewH) {
                // Fully inside the frame: sit flat.
                amount = 0;
            } else if (top > 0) {
                // Entering from below the frame.
                amount = smooth(clamp01((top - viewH * 0.32) / (viewH * 0.6)));
                direction = 1;
            } else if (bottom < viewH) {
                // Leaving through the top of the frame.
                amount = smooth(clamp01((viewH - bottom) / (viewH * 0.65)));
                direction = -1;
            }

            const rx = direction * amount * 5.2 * intensity * heightFactor;
            const tz = -amount * 150 * intensity * (0.35 + 0.65 * heightFactor);
            const scale = 1 - amount * 0.02 * heightFactor;
            const opacity = 1 - amount * (direction > 0 ? 0.22 : 0.16);

            scene.style.setProperty('--scene-rx', `${rx.toFixed(2)}deg`);
            scene.style.setProperty('--scene-tz', `${tz.toFixed(1)}px`);
            scene.style.setProperty('--scene-sc', scale.toFixed(4));
            scene.style.setProperty('--scene-op', opacity.toFixed(3));
            scene.style.setProperty('--scene-edge', (amount * 0.7).toFixed(3));

            const live = top < viewH + 220 && bottom > -220;
            scene.classList.toggle('is-scene-live', live);
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
   Poster room
   ------------------------------------------------------------ */
(function posterRoom() {
    const room = document.getElementById('posterRoom');
    const feature = document.getElementById('posterFeature');
    const image = document.getElementById('posterFeatureImg');
    const kicker = document.getElementById('posterFeatureKicker');
    const title = document.getElementById('posterFeatureTitle');
    const index = document.getElementById('posterFeatureIndex');
    const current = document.getElementById('posterCurrent');
    const toggle = document.getElementById('wallToggle');
    const thumbs = Array.from(document.querySelectorAll('.poster-thumb'));
    if (!room || !feature || !image || !thumbs.length) return;

    const FEATURE_URL = 'https://www.behance.net/aswin-design';
    const INTERVAL = 4600;
    let active = 0;
    let timer = 0;
    let swapTimer = 0;
    let inView = false;
    let hovering = false;
    let userPaused = false;

    function updateToggle() {
        if (!toggle) return;
        const label = toggle.querySelector('.reel-label');
        const icon = toggle.querySelector('.reel-icon');
        if (label) label.textContent = userPaused ? 'Play wall' : 'Pause wall';
        if (icon) icon.textContent = userPaused ? '▶' : '❚❚';
        toggle.setAttribute('aria-pressed', String(userPaused));
    }

    function schedule() {
        window.clearInterval(timer);
        timer = 0;
        if (reduceMotion || !inView || userPaused || hovering || document.hidden) return;
        timer = window.setInterval(() => setActive(active + 1, true), INTERVAL);
    }

    function setActive(next, animate) {
        const i = (next + thumbs.length) % thumbs.length;
        const thumb = thumbs[i];
        const src = thumb.dataset.src;
        if (!src) return;

        active = i;
        if (image.getAttribute('src') !== src) image.src = src;
        image.alt = thumb.dataset.alt || '';
        feature.href = thumb.dataset.href || FEATURE_URL;
        if (kicker) kicker.textContent = `Frame ${thumb.dataset.index} · ${thumb.dataset.tag}`;
        if (title) title.textContent = thumb.dataset.title || '';
        if (index) index.textContent = thumb.dataset.index || '';
        if (current) current.textContent = thumb.dataset.index || '';

        thumbs.forEach((item, itemIndex) => {
            const on = itemIndex === i;
            item.classList.toggle('is-active', on);
            item.setAttribute('aria-current', on ? 'true' : 'false');
        });

        if (animate && !reduceMotion) {
            feature.classList.remove('is-swapping');
            void feature.offsetWidth;
            feature.classList.add('is-swapping');
            window.clearTimeout(swapTimer);
            swapTimer = window.setTimeout(() => feature.classList.remove('is-swapping'), 560);
        }

        schedule();
    }

    thumbs.forEach((thumb, i) => {
        thumb.addEventListener('pointerenter', () => {
            if (!finePointer) return;
            setActive(i, true);
        });
        thumb.addEventListener('focus', () => setActive(i, true));
        thumb.addEventListener('click', () => setActive(i, true));
    });

    if (toggle) {
        if (reduceMotion) {
            toggle.hidden = true;
        } else {
            toggle.addEventListener('click', () => {
                userPaused = !userPaused;
                updateToggle();
                schedule();
            });
        }
    }

    room.addEventListener('pointerenter', () => {
        if (!finePointer) return;
        hovering = true;
        schedule();
    });

    room.addEventListener('pointerleave', () => {
        if (!finePointer) return;
        hovering = false;
        schedule();
    });

    room.addEventListener('focusin', () => {
        hovering = true;
        schedule();
    });

    room.addEventListener('focusout', (event) => {
        if (room.contains(event.relatedTarget)) return;
        hovering = false;
        schedule();
    });

    document.addEventListener('visibilitychange', schedule);

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                inView = entry.isIntersecting;
            });
            schedule();
        }, { threshold: 0.12 });
        observer.observe(room);
    } else {
        inView = true;
        schedule();
    }

    updateToggle();
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

