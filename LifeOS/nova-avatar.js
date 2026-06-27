// Nova crystal avatar — vanilla port of the Claude Design "Money Coach Avatar"
// component. No framework: mount with `new NovaAvatar(hostEl)`, drive it with
// `.go('thinking' | 'asking' | 'positive' | 'negative' | 'speaking' | 'idle')`.
// Requires an import map for "three" / "three/addons/" before this module loads.
// Falls back to a flat purple glyph (no WebGL) automatically.

const STATES = {
  idle:     { speed: 0.10, bob: 0.05, bloom: 0.80, emissive: 0.15, yOff: 0 },
  asking:   { speed: 0.07, bob: 0.05, bloom: 0.90, emissive: 0.15, yOff: 0 },
  positive: { speed: 0.16, bob: 0.08, bloom: 1.10, emissive: 0.22, yOff: 0 },
  negative: { speed: 0.05, bob: 0.03, bloom: 0.50, emissive: 0.06, yOff: -0.04 },
  thinking: { speed: 0.22, bob: 0.05, bloom: 0.85, emissive: 0.15, yOff: 0 },
  speaking: { speed: 0.10, bob: 0.05, bloom: 0.95, emissive: 0.15, yOff: 0 },
};

const ease = (p) => p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

export class NovaAvatar {
  constructor(host, opts = {}) {
    this.host = host;
    this.reduced = (opts.reducedMotion != null)
      ? !!opts.reducedMotion
      : (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    this.fallback = false;
    this.timers = [];
    this.clock = 0;
    this.last = performance.now() / 1000;
    this.popVal = 1;
    this.speakEnv = 0;
    this.curTiltZ = 0;
    this.tiltTarget = 0;
    this.tStart = null;
    this._active = 'idle';
    this._init();
  }

  async _init() {
    if (!this._hasWebGL()) { this._showFallback(); return; }
    try {
      const THREE = this.THREE = await import('three');
      const { EffectComposer } = await import('three/addons/postprocessing/EffectComposer.js');
      const { RenderPass } = await import('three/addons/postprocessing/RenderPass.js');
      const { UnrealBloomPass } = await import('three/addons/postprocessing/UnrealBloomPass.js');
      const { OutputPass } = await import('three/addons/postprocessing/OutputPass.js');
      const { RoomEnvironment } = await import('three/addons/environments/RoomEnvironment.js');
      this._build(THREE, { EffectComposer, RenderPass, UnrealBloomPass, OutputPass, RoomEnvironment });
      this.anim = { speed: 0.10, bob: 0.05, bloom: 0.80, yOff: 0, emissive: 0.15, color: new THREE.Color(0x9A8AE6) };
      this.glyphDrawState = 'idle';
      this._applyImmediate('idle');
      this._loop();
    } catch (e) {
      console.warn('Nova avatar failed to init, using fallback:', e);
      this._showFallback();
    }
  }

  _showFallback() {
    this.fallback = true;
    this.host.innerHTML =
      '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;">' +
      '<div style="width:55%;aspect-ratio:1/1;border-radius:24px;background:conic-gradient(from 220deg,#C7BEF4,#9A8AE6,#6450C6,#4A3AA8,#9A8AE6,#C7BEF4);' +
      'clip-path:polygon(50% 0,90% 20%,100% 60%,75% 100%,25% 100%,0 60%,10% 20%);display:flex;align-items:center;justify-content:center;' +
      'color:#EDE9FF;font-size:48px;box-shadow:0 0 60px rgba(150,130,240,0.4);">&#8744;</div></div>';
  }

  _hasWebGL() {
    try {
      const c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
    } catch (e) { return false; }
  }

  _build(THREE, A) {
    const host = this.host;
    const w = host.clientWidth || 360, h = host.clientHeight || 360;

    const renderer = this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';
    host.appendChild(renderer.domElement);

    const scene = this.scene = new THREE.Scene();
    const camera = this.camera = new THREE.PerspectiveCamera(35, w / h, 0.1, 100);
    camera.position.set(0, 0, 3.2);
    camera.lookAt(0, 0, 0);

    // in-scene radial glow background, keeps the canvas reading as part of the dark panel
    const bgC = document.createElement('canvas'); bgC.width = bgC.height = 256;
    const bgX = bgC.getContext('2d');
    const grd = bgX.createRadialGradient(128, 122, 10, 128, 128, 150);
    grd.addColorStop(0, '#16291F'); grd.addColorStop(0.45, '#112019'); grd.addColorStop(1, '#0A1410');
    bgX.fillStyle = grd; bgX.fillRect(0, 0, 256, 256);
    const bgTex = new THREE.CanvasTexture(bgC); bgTex.colorSpace = THREE.SRGBColorSpace;
    const bgPlane = new THREE.Mesh(new THREE.PlaneGeometry(14, 14),
      new THREE.MeshBasicMaterial({ map: bgTex, depthWrite: false, depthTest: false, toneMapped: false }));
    bgPlane.position.z = -3; bgPlane.renderOrder = -1; scene.add(bgPlane);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const env = new A.RoomEnvironment();
    scene.environment = pmrem.fromScene(env, 0.04).texture;

    const body = this.body = new THREE.Group();
    scene.add(body);

    const geo = new THREE.DodecahedronGeometry(1, 0);
    const mat = this.mat = new THREE.MeshPhysicalMaterial({
      color: 0x9A8AE6, roughness: 0.28, metalness: 0.0,
      transmission: 0.55, thickness: 1.2, ior: 1.45,
      clearcoat: 0.6, clearcoatRoughness: 0.25,
      attenuationColor: new THREE.Color(0x6450C6), attenuationDistance: 1.5,
      iridescence: 0.2, emissive: new THREE.Color(0x3A2F8C), emissiveIntensity: 0.15,
      transparent: true, opacity: 0.96, envMapIntensity: 1.0,
    });
    const crystal = new THREE.Mesh(geo, mat);
    body.add(crystal);

    const edges = new THREE.EdgesGeometry(geo, 1);
    const edgeMat = new THREE.LineBasicMaterial({ color: 0xE4DFFB, transparent: true, opacity: 0.35 });
    body.add(new THREE.LineSegments(edges, edgeMat));

    const coreMat = new THREE.MeshBasicMaterial({ color: 0x7E68F0, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false });
    body.add(new THREE.Mesh(new THREE.DodecahedronGeometry(0.55, 0), coreMat));
    const inner = new THREE.PointLight(0x7E68F0, 0.6, 6); body.add(inner);

    const key = new THREE.DirectionalLight(0xFFFFFF, 1.6); key.position.set(-3, 4, 4); scene.add(key);
    const rim = new THREE.DirectionalLight(0x8E7BFF, 1.0); rim.position.set(2, -1, -3); scene.add(rim);
    scene.add(new THREE.HemisphereLight(0xB9B0FF, 0x1A1530, 0.5));

    // glyph plane — billboarded, independent of crystal rotation
    const cv = this.gcanvas = document.createElement('canvas'); cv.width = cv.height = 512;
    this.gctx = cv.getContext('2d');
    const tex = this.glyphTex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    // NormalBlending + a glyph color kept below the bloom threshold (fix #1: no halo)
    const gMat = this.glyphMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, depthTest: false, blending: THREE.NormalBlending, toneMapped: false, opacity: 1 });
    const gPlane = this.glyphPlane = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.1), gMat);
    gPlane.position.set(0, 0, 0.15);
    gPlane.renderOrder = 10;
    scene.add(gPlane);

    const composer = this.composer = new A.EffectComposer(renderer);
    composer.addPass(new A.RenderPass(scene, camera));
    const bloom = this.bloom = new A.UnrealBloomPass(new THREE.Vector2(w, h), 0.8, 0.6, 0.85);
    composer.addPass(bloom);
    composer.addPass(new A.OutputPass());
    this._resize(w, h);

    this._ro = new ResizeObserver(() => {
      const nw = host.clientWidth, nh = host.clientHeight;
      if (nw && nh) this._resize(nw, nh);
    });
    this._ro.observe(host);

    this.paused = false;
    this._io = new IntersectionObserver((es) => { this.paused = !es[0].isIntersecting; }, { threshold: 0.01 });
    this._io.observe(host);
    this._onVis = () => { this.hidden = document.hidden; };
    document.addEventListener('visibilitychange', this._onVis);
  }

  _resize(w, h) {
    this.renderer.setSize(w, h);
    this.composer.setSize(w, h);
    this.camera.aspect = w / h; this.camera.updateProjectionMatrix();
  }

  _colorFor(name) {
    const T = this.THREE;
    if (name === 'positive') return new T.Color(0x9A8AE6).lerp(new T.Color(0x8FE6C4), 0.25);
    if (name === 'negative') return new T.Color(0x5A6B86);
    return new T.Color(0x9A8AE6);
  }

  _applyImmediate(name) {
    const s = STATES[name];
    this.anim.speed = s.speed; this.anim.bob = s.bob; this.anim.bloom = s.bloom;
    this.anim.emissive = s.emissive; this.anim.yOff = s.yOff;
    this.anim.color.copy(this._colorFor(name));
    this.glyphDrawState = name; this.glyphDrawn = false;
  }

  go(name) {
    if (!STATES[name]) return;
    this._active = name;
    if (this.fallback || !this.THREE) return;
    const s = STATES[name];
    this.from = { speed: this.anim.speed, bob: this.anim.bob, bloom: this.anim.bloom, emissive: this.anim.emissive, yOff: this.anim.yOff, color: this.anim.color.clone() };
    this.to = { speed: s.speed, bob: s.bob, bloom: s.bloom, emissive: s.emissive, yOff: s.yOff, color: this._colorFor(name) };
    this.tStart = performance.now() / 1000;
    this.tDur = this.reduced ? 0.001 : 0.5;
    this.glyphFadeStart = performance.now() / 1000; this.glyphSwitchTo = name; this.glyphPhase = 'out';
    if (name === 'asking') { this.popVal = 1.04; this.tiltTarget = 0.12; this._t(() => { this.tiltTarget = 0; }, 650); }
    else { this.tiltTarget = 0; }
    if (name === 'positive') { this.popVal = 1.06; }
  }

  _t(fn, ms) { const id = setTimeout(fn, ms); this.timers.push(id); return id; }

  _loop() {
    this.raf = requestAnimationFrame(() => this._loop());
    if (this.paused || this.hidden) return;
    const now = performance.now() / 1000;
    const dt = Math.min(now - this.last, 0.05); this.last = now; this.clock += dt;
    const R = this.reduced;

    if (this.tStart != null) {
      const p = clamp((now - this.tStart) / this.tDur, 0, 1), e = ease(p);
      this.anim.speed = lerp(this.from.speed, this.to.speed, e);
      this.anim.bob = lerp(this.from.bob, this.to.bob, e);
      this.anim.bloom = lerp(this.from.bloom, this.to.bloom, e);
      this.anim.emissive = lerp(this.from.emissive, this.to.emissive, e);
      this.anim.yOff = lerp(this.from.yOff, this.to.yOff, e);
      this.anim.color.copy(this.from.color).lerp(this.to.color, e);
      if (p >= 1) this.tStart = null;
    }

    this.mat.color.copy(this.anim.color);
    this.mat.emissiveIntensity = this.anim.emissive;
    this.bloom.strength = this.anim.bloom;

    // body motion — fix #3: a gentle bounded sway instead of a full continuous spin
    this.body.rotation.y = R ? 0 : Math.sin(this.clock * this.anim.speed * 1.6) * 0.35;
    this.body.rotation.x = R ? 0 : Math.sin(this.clock / 6 * Math.PI * 2) * 0.08;
    this.curTiltZ += (this.tiltTarget - this.curTiltZ) * Math.min(dt * 6, 1);
    this.body.rotation.z = this.curTiltZ;
    const bob = R ? 0 : Math.sin(this.clock * 0.8) * this.anim.bob;
    this.body.position.y = bob + this.anim.yOff;
    this.popVal += (1 - this.popVal) * Math.min(dt * 5, 1);
    let breathe = R ? 1 : (1 + Math.sin(this.clock * 1.2) * 0.015);
    if (this.glyphDrawState === 'speaking') breathe *= 1 + this.speakEnv * 0.02;
    this.body.scale.setScalar(breathe * this.popVal);

    let gOp = 1, gScale = 1;
    if (this.glyphFadeStart != null) {
      const gp = (now - this.glyphFadeStart) / 0.15;
      if (this.glyphPhase === 'out') {
        gOp = 1 - clamp(gp, 0, 1);
        if (gp >= 1) { this.glyphDrawState = this.glyphSwitchTo; this.glyphDrawn = false; this.glyphPhase = 'in'; this.glyphFadeStart = now; }
      } else {
        gOp = clamp(gp, 0, 1);
        gScale = 1.08 - 0.08 * clamp(gp, 0, 1);
        if (gp >= 1) this.glyphFadeStart = null;
      }
    }
    this.glyphMat.opacity = gOp;
    this.glyphPlane.scale.setScalar(gScale);
    this.glyphPlane.position.set(0, (R ? 0 : bob) + this.anim.yOff, 0.15);
    this.glyphPlane.lookAt(this.camera.position);

    const ds = this.glyphDrawState;
    if (ds === 'thinking' || ds === 'speaking' || this.glyphFadeStart != null || !this.glyphDrawn) {
      this._drawGlyph(this.gctx, ds);
      this.glyphTex.needsUpdate = true; this.glyphDrawn = true;
    }

    this.composer.render();
  }

  _drawGlyph(ctx, state) {
    const S = 512, C = 256, t = this.clock;
    // fix #4: icon-style glyphs (dots / bars) sit left-of-center, not dead-center
    const IC = C - 60;
    ctx.clearRect(0, 0, S, S);
    ctx.lineWidth = 26; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    // fix #1: a muted color that stays under the bloom threshold — no halo
    ctx.strokeStyle = '#9A8AE6'; ctx.fillStyle = '#9A8AE6';
    ctx.shadowBlur = 0; ctx.globalAlpha = 1;

    if (state === 'idle') {
      ctx.beginPath(); ctx.moveTo(150, 215); ctx.lineTo(C, 300); ctx.lineTo(362, 215); ctx.stroke();
    } else if (state === 'asking') {
      ctx.font = "700 230px 'Space Mono', monospace";
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('?', C, C + 12);
    } else if (state === 'positive') {
      // fix #2: control point ABOVE the endpoints — a real upward smile, not a frown
      ctx.beginPath(); ctx.moveTo(150, 232); ctx.quadraticCurveTo(C, 152, 362, 232); ctx.stroke();
    } else if (state === 'negative') {
      ctx.beginPath();
      for (let x = 150; x <= 362; x += 3) {
        const y = C + Math.sin((x - 150) / 22 + t * 1.1) * 14;
        x === 150 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    } else if (state === 'thinking') {
      [-92, 0, 92].forEach((dx, i) => {
        const a = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(t * 4 - i * 1.1));
        ctx.globalAlpha = a; ctx.beginPath(); ctx.arc(IC + dx, C, 17, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = 1;
    } else if (state === 'speaking') {
      const bars = 6, w = 22, gap = 18, total = bars * w + (bars - 1) * gap;
      let x = IC - total / 2, sum = 0;
      for (let i = 0; i < bars; i++) {
        let amp;
        if (this.amp && this.amp.length) amp = clamp(this.amp[i % this.amp.length], 0, 1);
        else amp = Math.abs(Math.sin(t * 6 + i * 0.9)) * 0.6 + Math.abs(Math.sin(t * 11 + i)) * 0.4;
        const hh = 40 + amp * 150; sum += amp;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(x, C - hh / 2, w, hh, 11); else ctx.rect(x, C - hh / 2, w, hh);
        ctx.fill();
        x += w + gap;
      }
      this.speakEnv = sum / bars;
    }
  }

  feedAmplitude(arr) { this.amp = arr; }

  dispose() {
    if (this.raf) cancelAnimationFrame(this.raf);
    (this.timers || []).forEach(clearTimeout);
    if (this._ro) this._ro.disconnect();
    if (this._io) this._io.disconnect();
    if (this._onVis) document.removeEventListener('visibilitychange', this._onVis);
    if (this.renderer) this.renderer.dispose();
  }
}
