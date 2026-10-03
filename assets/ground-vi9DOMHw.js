import{c as ko,P as ft,r as Ao,s as rt}from"./sito-CCMHQ30Q.js";import{S as To,s as Ze,h as Co,p as No,C as Do,N as Po,i as Ro,b as Bo,a as Fo,r as Lo,f as Ue,c as so,d as Ko,e as Go,g as Ho,j as Vo,k as It}from"./journey-scene-Y1zu0Tze.js";import{ak as no,C as Re,V as de,a as ct,q as ke,D as _e,M as Se,S as Ae,aq as ie,G as Qe,B as Ke,al as ro,a9 as Io,p as Et,ab as tt,ar as io,as as lo,at as co,au as uo,av as ho,t as Tt,a0 as Eo,a1 as Uo,aw as qe,ax as Ct,ay as _o,F as he,az as Oo,aA as Wo,aa as $o,ae as Ne,aB as fo,aC as jo,aD as qo,an as po,a4 as pt,aE as Yo,aF as Xo,aG as Zo,aH as Qo,aI as bt,b as it,T as ut,d as mt,aJ as Jo,O as ea}from"./three-DC_DBYxh.js";import"./common-BJAAWmJM.js";const Ee=e=>{const o=new Re(e);return`vec3(${o.r.toFixed(4)},${o.g.toFixed(4)},${o.b.toFixed(4)})`},ta=`
float gHash(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float gHash3(vec3 p3){ p3 = fract(p3 * 0.1031); p3 += dot(p3, p3.zyx + 31.32); return fract((p3.x + p3.y) * p3.z); }
float gNoise(vec2 p){
  vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(gHash(i), gHash(i + vec2(1.0, 0.0)), u.x), mix(gHash(i + vec2(0.0, 1.0)), gHash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float gNoise3(vec3 p){
  vec3 i = floor(p), f = fract(p); vec3 u = f * f * (3.0 - 2.0 * f);
  float a = mix(mix(gHash3(i), gHash3(i + vec3(1,0,0)), u.x), mix(gHash3(i + vec3(0,1,0)), gHash3(i + vec3(1,1,0)), u.x), u.y);
  float b = mix(mix(gHash3(i + vec3(0,0,1)), gHash3(i + vec3(1,0,1)), u.x), mix(gHash3(i + vec3(0,1,1)), gHash3(i + vec3(1,1,1)), u.x), u.y);
  return mix(a, b, u.z);
}
// p and fw in the same units (fw = pixel footprint).
float gFbm(vec2 p, float fw, int oct){
  float s = 0.0, a = 0.5, n = 0.0, f = 1.0;
  mat2 m = mat2(0.8, -0.6, 0.6, 0.8);
  for (int i = 0; i < 6; i++) {
    if (i >= oct) break;
    float k = 1.0 - smoothstep(0.22, 0.55, fw * f);
    if (k <= 0.0) { float w = 2.0 * a * (1.0 - exp2(float(i - oct))); s += 0.5 * w; n += w; break; }   // sub-pixel octaves: their mean
    s += a * mix(0.5, gNoise(p), k); n += a;
    p = m * p * 2.03 + 17.1; f *= 2.03; a *= 0.5;
  }
  return s / n;
}
// 1 while a feature of size 'size' spans several pixels, 0 when sub-pixel.
float gVis(float size, float fw){ return 1.0 - smoothstep(0.18, 0.5, fw / size); }
`,oa="uniform float uCalK;",aa=`{
  vec3 upV = normalize( ( viewMatrix * vec4( 0.0, 1.0, 0.0, 0.0 ) ).xyz );
  vec3 eRef = ambientLightColor;
  #if NUM_DIR_LIGHTS > 0
  for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) eRef += directionalLights[ i ].color * max( dot( upV, directionalLights[ i ].direction ), 0.0 );
  #endif
  #if NUM_HEMI_LIGHTS > 0
  for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) eRef += getHemisphereLightIrradiance( hemisphereLights[ i ], upV );
  #endif
  #if defined( USE_ENVMAP ) && defined( STANDARD )
  eRef += getIBLIrradiance( upV );
  #endif
  outgoingLight *= uCalK * PI / max( eRef, vec3( 0.02 ) );
}`,sa=no.lights_fragment_begin.replace("getDirectionalLightInfo( directionalLight, directLight );",`getDirectionalLightInfo( directionalLight, directLight );
		directLight.color *= gSunVis;`);let na=0;function ot(e,o={}){const a=`ground-${o.key||""}-${na++}`;return e.onBeforeCompile=t=>{Object.assign(t.uniforms,o.uniforms||{});let s=t.vertexShader.replace("#include <common>",`#include <common>
varying vec3 vGW;
${o.vHead||""}`).replace("#include <begin_vertex>",`#include <begin_vertex>
${o.vMain||""}`).replace("#include <project_vertex>",o.project||`{ vec4 gw = vec4(transformed, 1.0);
#ifdef USE_INSTANCING
 gw = instanceMatrix * gw;
#endif
 vGW = (modelMatrix * gw).xyz; }
#include <project_vertex>`);o.colorVertex&&(s=s.replace("vColor.xyz *= instanceColor.xyz;",o.colorVertex)),t.vertexShader=s;let r=t.fragmentShader.replace("#include <common>",`#include <common>
varying vec3 vGW;
${ta}
float gSunVis = 1.0;
${o.cal?oa:""}
${o.fHead||""}`).replace("#include <color_fragment>",`#include <color_fragment>
${o.color||""}`).replace("#include <roughnessmap_fragment>",`#include <roughnessmap_fragment>
${o.rough||""}`).replace("#include <metalnessmap_fragment>",`#include <metalnessmap_fragment>
${o.metal||""}`).replace("#include <normal_fragment_maps>",`#include <normal_fragment_maps>
${o.normal||""}`).replace("#include <emissivemap_fragment>",`#include <emissivemap_fragment>
${o.emissive||""}`).replace("#include <opaque_fragment>",`${o.cal?aa:""}
${o.out||""}
#include <opaque_fragment>`);o.sunVis&&(r=r.replace("#include <lights_fragment_begin>",sa)),t.fragmentShader=r},e.customProgramCacheKey=()=>a,e}const Be=e=>new Re(e),ht={asphalt:"#7d7b77",pavers:"#a59d90",slabs:"#b2a893",gravel:"#a39a89",soil:"#665748",needles:"#7e6750",lawn:"#6b7a41",granite:"#aaa79f"},Ie={kerb:.15,strip:1.94,flush:2.06,x0:-31.3,x1:51,zMax:10.5};function ra({shadeTex:e,shadeRect:o,detailTex:a,noiseTex:t,frame:s,ortho:r,tiles:l}){const c=ht,p={uShade:{value:e},uShadeRect:{value:o},uDetail:{value:a},uNoise:{value:t},uFade:{value:0},uFadeDist:{value:new ke(260,420)},uAsph:{value:Be(c.asphalt)},uPave:{value:Be(c.pavers)},uSlab:{value:Be(c.slabs)},uGravel:{value:Be(c.gravel)},uSoil:{value:Be(c.soil)},uNeedle:{value:Be(c.needles)},uGrass:{value:Be(c.lawn)},uSMMat:{value:new Se},uSMOn:{value:0},uD:{value:new ke(s.D.x,s.D.z)},uT:{value:new ke(s.T.x,s.T.z)},uN:{value:new ke(s.N.x,s.N.z)},uCalK:{value:1},uHex:{value:l?.hex||new _e(new Uint8Array([134,123,112,255]),1,1)},uGrid:{value:l?.grass||new _e(new Uint8Array([131,130,114,255]),1,1)},uTileHex:{value:new ke(...l?.size?.hex||[1,1.03923])},uTileGrid:{value:new ke(...l?.size?.grass||[1.2,1.2])},uNorth:{value:new ct(Ie.x0,Ie.x1,Ie.zMax,0)},uSect:{value:new de(Ie.kerb,Ie.strip,Ie.flush)},uNorthGain:{value:1}};for(const f of[p.uHex.value,p.uGrid.value])f.isDataTexture&&(f.colorSpace=Ae,f.needsUpdate=!0);if(r)for(const f of["orthoTex2","orthoRect2","orthoWeight"])p[f]=r.uniforms[f];else p.orthoTex2={value:new _e(new Uint8Array([128,128,128,255]),1,1)},p.orthoRect2={value:new ct},p.orthoWeight={value:new ct};return p}const mo=`
  uniform sampler2D uShade, uDetail; uniform vec4 uShadeRect;
  uniform float uFade; uniform vec2 uFadeDist;
  uniform mat4 uSMMat; uniform float uSMOn;
  uniform sampler2D orthoTex2; uniform vec4 orthoRect2, orthoWeight;
  // 1 outside the footprint of the real shadow map (the baked shade takes over there)
  float gOutside(vec3 w) {
    if (uSMOn < 0.5) return 1.0;
    vec4 c = uSMMat * vec4(w, 1.0);
    float e = min(min(c.x, 1.0 - c.x), min(c.y, 1.0 - c.y));
    return 1.0 - smoothstep(0.0, 0.04, e);
  }
  vec2 gShadeUv(vec2 xz) { return clamp((xz - uShadeRect.xy) * uShadeRect.zw, 0.0, 1.0); }
  float gFadeAt(vec3 w, float edge) {
    float d = length(w.xz - cameraPosition.xz);
    return uFade * (1.0 - smoothstep(uFadeDist.x, uFadeDist.y, d)) * edge;
  }
  // The L2 photo, never sharper than 'blur' metres (its 4x4 ETC1S blocks stay invisible up close).
  // pdx, pdy: screen derivatives of xz, taken outside any branch.
  vec3 gPhoto(vec2 xz, vec2 pdx, vec2 pdy, float fw, float blur) {
    vec2 uv = (xz - orthoRect2.xy) * orthoRect2.zw;
    float s = max(1.0, blur / max(fw, 1e-4));
    return textureGrad(orthoTex2, uv, pdx * orthoRect2.zw * s, pdy * orthoRect2.zw * s).rgb;
  }`,ia=`
  uniform vec3 uAsph, uPave, uSlab, uGravel, uSoil, uNeedle, uGrass; uniform vec2 uD, uT, uN;
  uniform sampler2D uNoise, uHex, uGrid; uniform vec2 uTileHex, uTileGrid; uniform vec4 uNorth; uniform vec3 uSect; uniform float uNorthGain;
  varying float vKind; varying vec4 vDist;
  float gRough = 0.85; float gAlpha = 1.0; float gH = 0.0; vec2 gTilt = vec2(0.0);
  // tileable detail (noise.png: R, G fbm, B crack network) at scale s (tiles per metre), rotated by m;
  // explicit gradients: safe inside branches, antialiased by the mipmaps
  vec3 gTex(vec2 p, float s, mat2 m, vec2 pdx, vec2 pdy) { return textureGrad(uNoise, m * p * s, m * pdx * s, m * pdy * s).rgb; }
  // running-bond units: joint mask; id = unit id, e = distance to the unit's edge
  float gBond(vec2 q, vec2 sz, float jw, float fw, out vec2 id, out float e) {
    float row = floor(q.y / sz.y);
    float qx = q.x + row * sz.x * 0.5;
    id = vec2(floor(qx / sz.x), row);
    vec2 r = vec2(qx - id.x * sz.x, q.y - row * sz.y);
    e = min(min(r.x, sz.x - r.x), min(r.y, sz.y - r.y));
    return 1.0 - smoothstep(jw, jw + fw * 0.9, e);
  }`,la=e=>`{
  vec2 p = vGW.xz;
  vec2 pdx = dFdx(p), pdy = dFdy(p);
  float fw = max(length(abs(pdx) + abs(pdy)), 1e-4);
  float A = vDist.x, Bd = vDist.y, Pd = vDist.z, R = vDist.w;
  vec2 suv = gShadeUv(p);
  vec4 sh = texture2D(uShade, suv), dt = texture2D(uDetail, suv);
  gSunVis = 1.0 - sh.g * 0.92 * gOutside(vGW);
  // distance to the nearest trunk (detail.png G, 0..4 m)
  float dT = dt.g * 4.0;
  // street-aligned frame (the avenue runs along -uN)
  vec2 q = vec2(dot(p - uD, -uN), dot(p - uD, uT));
  // Texture detail is antialiased by its mipmaps; analytic patterns fade once their units shrink
  // under a few pixels (gVis(unit size, footprint)).
  float near = gVis(0.15, fw);        // centimetre-sized analytic detail (joints, pavers, stones)
  float mid = gVis(1.2, fw);          // metre-sized analytic detail (patches, strips)
  const mat2 I2 = mat2(1.0), R1 = mat2(0.8, -0.6, 0.6, 0.8), R2 = mat2(0.28, 0.96, -0.96, 0.28);
  vec3 nA = gTex(p, 1.0 / 37.0, I2, pdx, pdy);      // tens of metres
  vec3 nB = gTex(p, 1.0 / 5.3, R1, pdx, pdy);       // metres (cracks of ~0.7 m cells)
  vec3 nD = gTex(p, 1.0 / 11.0, R2, pdx, pdy);      // metres (cracks of ~1.4 m cells)
  vec3 nC = gTex(p, 1.0 / 0.9, R1, pdx, pdy);       // centimetres (grain)
  vec3 col, base;
  float northK = 0.0;
  if (vKind > 1.5) {
    // ---------------- carriageway: worn asphalt
    float k = -A;                                         // metres from the kerb into the road
    base = uAsph;
    col = base * (0.84 + 0.3 * smoothstep(0.32, 0.68, nA.r));                 // tone drifts
    col *= 0.86 + 0.26 * smoothstep(0.3, 0.7, nD.g);                          // stains, damp, wear
    // wheel tracks of each lane: polished, a little paler; oil drips between them
    float tr = (1.0 - smoothstep(0.25, 0.6, abs(k - 0.95))) + (1.0 - smoothstep(0.25, 0.6, abs(k - 2.65)));
    col *= 1.0 + 0.06 * tr;
    float oil = (1.0 - smoothstep(0.15, 0.55, abs(k - 1.8))) * smoothstep(0.52, 0.72, nB.g);
    col *= 1.0 - 0.38 * oil;
    gRough = 0.92 - 0.12 * tr - 0.25 * oil;
    // trench repairs along the kerb (pipes, cables): long strips of a different asphalt
    float ti = floor(q.x / 14.0), tl = fract(q.x / 14.0);
    float trench = step(0.62, gHash(vec2(ti, 8.0))) * (1.0 - smoothstep(0.0, 0.02 + fw, abs(k - 0.95) - 0.38)) * smoothstep(0.0, 0.02, tl - 0.08) * smoothstep(0.0, 0.02, 0.9 - tl);
    col = mix(col, uAsph * (gHash(vec2(ti, 3.0)) > 0.5 ? 0.74 : 1.14), trench * mid);
    // rectangular repairs: fresh dark asphalt or grey worn patches with sealed seams
    vec2 rq = q + vec2(gHash(vec2(floor(q.y / 2.2), 17.0)) * 6.5, 0.0);        // rows shifted at random
    vec2 rc = rq / vec2(6.5, 2.2), id = floor(rc), f = fract(rc);
    vec2 lo = vec2(0.06 + 0.3 * gHash(id + 3.1), 0.1 + 0.25 * gHash(id + 7.7)), hi2 = vec2(0.45 + 0.5 * gHash(id + 5.3), 0.62 + 0.33 * gHash(id + 1.9));
    vec2 dd = min(f - lo, hi2 - f) * vec2(6.5, 2.2);
    float pe = min(dd.x, dd.y);
    float isP = step(0.76, gHash(id + 1.7));
    float patchK = isP * smoothstep(0.0, 0.01 + fw, pe) * mid;
    col = mix(col, uAsph * (gHash(id + 9.0) > 0.45 ? 0.7 : 1.15) * (0.94 + 0.12 * nB.r), patchK);
    float seam = max(isP * (1.0 - smoothstep(0.015, 0.04 + fw, abs(pe))), trench * (1.0 - smoothstep(0.015, 0.04 + fw, abs(abs(k - 0.95) - 0.38))));
    col *= 1.0 - 0.28 * seam * gVis(0.3, fw);
    // tar-sealed cracks: networks in a few worn zones (under a fifth of the road, whole stretches
    // without), a long joint between the lanes, radial ones over the roots; fainter and thinner from afar
    float zone = smoothstep(0.64, 0.74, nA.g) * step(0.45, gHash(vec2(floor(q.x / 27.0), 61.0)));
    float roots = 1.0 - smoothstep(1.5, 3.0, dT);
    float cr = max(nD.b * max(zone, roots), nB.b * roots) * (1.0 - patchK);
    cr = max(cr, (1.0 - smoothstep(0.012, 0.012 + fw, abs(k - 3.6 - 0.3 * (nB.r - 0.5)))) * step(0.45, nA.b + nA.r * 0.5));
    float camD = length(vGW - cameraPosition);
    cr *= gVis(0.4, fw) * mix(1.0, 0.35, smoothstep(8.0, 30.0, camD));
    col *= 1.0 - 0.5 * cr;
    gRough = mix(gRough, 0.55, cr);                                 // the tar shines a little
    // aggregate: grey grains with a few pale stones, polished in the tracks
    col *= 0.8 + 0.4 * nC.r * (1.0 - 0.5 * tr) + 0.2 * tr;
    col = mix(col, col * 1.4, smoothstep(0.72, 0.84, nC.g) * 0.6);
    // gutter: dust, then a band of pine needles and grit against the kerb
    float gut = 1.0 - smoothstep(0.1, 0.45 + 0.5 * nB.g, k);
    col = mix(col, mix(uNeedle, uSoil, 0.4) * (0.75 + 0.5 * nC.g), gut * smoothstep(0.35, 0.6, nB.r) * 0.85);
    col *= 1.0 - 0.18 * (1.0 - smoothstep(0.0, 0.12, k));          // damp shadow line at the kerb foot
    gRough = mix(gRough, 0.95, gut);
    // root heave: a soft bulge of the asphalt near the trunks
    gH = nC.r * 0.003 - cr * 0.008 + 0.03 * (1.0 - smoothstep(0.0, 2.2, dT)) * (0.6 + 0.4 * nB.g);
    ${e?`if (fw < 0.1) {
      // gutter drains (caditoie) every ~22 m along the kerbs, round manholes
      vec2 dq = q / 22.0; float di = floor(dq.x);
      float sd = (fract(dq.x) - 0.5) * 22.0;
      float grate = (1.0 - smoothstep(0.24, 0.24 + fw, abs(sd))) * (1.0 - smoothstep(0.17, 0.17 + fw, abs(k - 0.32))) * step(0.35, gHash(vec2(di, 4.0)));
      float slots = smoothstep(0.3, 0.5, abs(fract(sd / 0.06) - 0.5) * 2.0);
      col = mix(col, mix(vec3(0.012), vec3(0.04, 0.038, 0.034), mix(0.5, slots, gVis(0.06, fw))), grate * gVis(0.3, fw));
      gRough = mix(gRough, 0.55, grate);
      vec2 mc = (floor(q / 31.0) + 0.5) * 31.0 + (vec2(gHash(floor(q / 31.0)), gHash(floor(q / 31.0) + 7.0)) - 0.5) * 18.0;
      float mr = length(q - mc);
      float mh = (1.0 - smoothstep(0.31, 0.31 + fw, mr)) * step(1.6, k) * step(0.5, gHash(floor(q / 31.0) + 2.0));
      vec3 cover = vec3(0.045, 0.043, 0.04) * (0.8 + 0.35 * smoothstep(0.3, 0.5, abs(fract(mr / 0.07) - 0.5) * 2.0) * gVis(0.07, fw));
      cover *= 1.0 - 0.45 * (1.0 - smoothstep(0.0, 0.025 + fw, abs(mr - 0.29)));
      col = mix(col, cover, mh * gVis(0.3, fw));
      gRough = mix(gRough, 0.5, mh);
    }`:""}
  } else if (vKind > 0.5) {
    // ---------------- kerb face: granite, darker and dusty at the foot, chipped arrises
    base = ${Ee(ht.granite)};
    col = base * (0.8 + 0.4 * nC.r);
    col *= 0.62 + 0.38 * smoothstep(0.0, 0.13, vGW.y);
    col *= 1.0 - 0.3 * step(0.7, nB.r) * smoothstep(0.1, 0.14, vGW.y);
    gRough = 0.62;
  } else {
    // ---------------- raised top: pavers, forecourt slabs, granite kerb top, verges
    // where each surface shows: forecourt slabs, verges beyond the sidewalk (shade.png B: 1/3 gravel
    // and beaten earth, 2/3 soil and needles, 1 lawn), bare soil around the trunks there
    float sag = 0.0;   // (v8 pini: the stone forecourt of the old OSM pharmacy is gone; the real one is the pharmacy's)
    // v8 (pini): the north side of the pharmacy's block (local frame of the pharmacy)
    vec2 lq = vec2(dot(p - uD, uT), dot(p - uD, uN));
    float north = step(uNorth.x, lq.x) * step(lq.x, uNorth.y) * step(lq.y, uNorth.z);
    northK = north;
    // (the class exists only beyond the paved sidewalks: its soft, noisy edge is where the earth meets them)
    float cls = (sh.b + (nB.g - 0.5) * 0.18 * step(0.02, sh.b)) * (1.0 - north);
    float farK = smoothstep(0.06, 0.16, cls);
    float gravK = smoothstep(0.14, 0.26, cls);
    float soilK = max(smoothstep(0.42, 0.56, cls), (1.0 - smoothstep(1.0, 1.6, dT)) * farK);
    float lawnK = smoothstep(0.8, 0.92, cls);
    float soft = max(max(gravK, soilK), lawnK);
    float pit = (1.0 - smoothstep(0.78, 0.8 + fw, dT)) * (1.0 - soft) * (1.0 - sag);   // tree pits in the paving
    // needle litter (soil, pits, drifts over the paving)
    float nd = smoothstep(0.2, 0.8, nB.r * 0.35 + nA.g * 0.3 + nC.g * 0.35);
    vec3 pave = uPave;
    float hp = 0.0;
    if (soft < 0.999) {
      if (sag < 0.999 && north < 0.5) {
        // concrete pavers 24 x 12 cm in running bond along the street, some lifted by the roots
        vec2 pid; float pe;
        float j = gBond(q, vec2(0.24, 0.12), 0.004, fw, pid, pe);
        float h1 = gHash(pid + 13.0), h2 = gHash(pid * 1.7 + 4.0);
        pave = uPave * (0.84 + 0.3 * smoothstep(0.3, 0.7, nD.g));                  // dirt and wear
        pave *= mix(1.0, 0.9 + 0.2 * h1, near);                                    // batch to batch
        pave = mix(pave, pave * vec3(1.05, 0.93, 0.86), step(0.93, h2) * near);    // a few reddish units
        pave *= 0.86 + 0.28 * nC.r;
        float jv = j * near;
        pave = mix(pave, mix(uSoil, uNeedle, 0.5) * 0.7, jv * 0.85);               // sand, grit and needles in the joints
        pave = mix(pave, pave * 0.86, (1.0 - jv) * near * (1.0 - smoothstep(0.0, 0.012, pe)) * 0.6);
        // a few repairs in asphalt where the paving was dug up
        vec2 ri = floor(q / vec2(3.1, 1.7)), rf = fract(q / vec2(3.1, 1.7));
        float rep = step(0.88, gHash(ri + 41.0)) * step(0.15, rf.x) * step(rf.x, 0.75) * step(0.2, rf.y) * step(rf.y, 0.85);
        pave = mix(pave, uAsph * (0.85 + 0.25 * nB.g), rep * mid);
        float lift = (1.0 - smoothstep(0.9, 2.6, dT)) * step(0.4, gHash(pid + 31.0));
        gTilt = (vec2(h1, h2) - 0.5) * 0.12 * lift * (1.0 - rep);
        hp = smoothstep(0.0, 0.01, pe) * 0.004 * near * (1.0 - rep);
      }
      if (sag > 0.0) {
        // stone slabs on the pharmacy forecourt (0.6 x 0.9 m, running bond)
        vec2 sid; float se;
        float js = gBond(vec2(dot(p - uD, uT), dot(p - uD, uN)) + vec2(0.0, 0.17), vec2(0.9, 0.6), 0.003, fw, sid, se);
        float s1 = gHash(sid + 13.0), s2 = gHash(sid * 1.7 + 4.0);
        float sv = gVis(0.9, fw);
        vec3 slab = mix(uSlab, uSlab * vec3(0.88, 0.86, 0.83), s1 * sv) * (1.0 + (s2 - 0.5) * 0.2 * sv);
        slab *= 0.88 + 0.24 * smoothstep(0.3, 0.7, nB.r);
        slab *= 0.88 + 0.24 * nC.g;
        slab = mix(slab, slab * vec3(0.84, 0.82, 0.78), smoothstep(0.6, 0.76, nD.r) * 0.7);   // stains
        slab = mix(slab, slab * 0.8, smoothstep(0.55, 0.75, nA.b + nB.g * 0.4) * 0.4);       // grime from the trees
        // a few cracked slabs (the crack network of the noise inside the unit)
        slab *= 1.0 - 0.45 * nC.b * step(0.82, gHash(sid + 21.0)) * sv;
        slab *= 1.0 - 0.38 * js * sv;
        pave = mix(pave, slab, sag);
        hp = mix(hp, smoothstep(0.0, 0.008, se) * 0.004 * sv, sag);
        gTilt *= 1.0 - sag;
      }
    }
    col = pave;
    base = mix(uPave, uSlab, sag);
    float sectKerb = 0.17;
    if (north > 0.5) {
      // v8 (pini): the pharmacy's section along the block: grass-grid strip, flush kerb, hex pavers (the
      // pharmacy's textures in its own frame: u = local x, v = -local z, metres / tile size)
      vec2 tuv = vec2(lq.x, -lq.y);
      vec2 tdx = vec2(dot(pdx, uT), -dot(pdx, uN)), tdy = vec2(dot(pdy, uT), -dot(pdy, uN));
      vec3 hexC = textureGrad(uHex, tuv / uTileHex, tdx / uTileHex, tdy / uTileHex).rgb;
      vec3 grdC = textureGrad(uGrid, tuv / uTileGrid, tdx / uTileGrid, tdy / uTileGrid).rgb;
      float e = fw * 0.6;
      float stripK = smoothstep(uSect.x - e, uSect.x + e, A) * (1.0 - smoothstep(uSect.y - e, uSect.y + e, A));
      float flushK = smoothstep(uSect.y - e, uSect.y + e, A) * (1.0 - smoothstep(uSect.z - e, uSect.z + e, A));
      // a transverse kerb where the strip stops (the zebra to the west, the end of the block to the east)
      float endK = (1.0 - smoothstep(0.12 - e, 0.12 + e, min(lq.x - uNorth.x, uNorth.y - lq.x))) * (1.0 - smoothstep(uSect.z - e, uSect.z + e, A));
      col = mix(hexC, grdC, stripK);
      col = mix(col, ${Ee("#B2AFA7")} * (0.9 + 0.2 * nC.r), max(flushK, endK));
      col *= uNorthGain;
      base = col;
      hp = (dot(col, vec3(0.333)) - 0.2) * 0.012 * near;
      gTilt = vec2(0.0);
      sectKerb = uSect.x;
    }
    float root = 0.0, cone = 0.0;
    if (soft > 0.001 || pit > 0.001) {
      // soil: dark earth under a carpet of rusty needles; cones and roots near the trunks
      // (soft, several scales: no leopard spots)
      vec3 soil = mix(uSoil * (0.85 + 0.25 * nA.r), uNeedle * (0.85 + 0.3 * nC.r), smoothstep(0.15, 0.85, nd * 0.8 + 0.2 * (1.0 - smoothstep(0.5, 3.0, dT))));
      soil *= 0.8 + 0.4 * nC.g;
      // direction to the trunk: the gradient of the distance field (the texture has no mipmaps: safe here)
      float e = 0.3;
      vec2 gT = vec2(texture2D(uDetail, gShadeUv(p + vec2(e, 0.0))).g - texture2D(uDetail, gShadeUv(p - vec2(e, 0.0))).g,
                     texture2D(uDetail, gShadeUv(p + vec2(0.0, e))).g - texture2D(uDetail, gShadeUv(p - vec2(0.0, e))).g);
      float ang = atan(gT.y, gT.x + 1e-6);
      // roots: a few thick, short ones leaving the trunk, fading out within 1.6 m (and from afar)
      root = (1.0 - smoothstep(0.08, 0.16 + fw, abs(sin(ang * 2.5 + 1.2 * nB.g)) * dT * 0.55))
           * (1.0 - smoothstep(0.5, 1.6, dT)) * step(0.3, dT) * mid * (1.0 - smoothstep(10.0, 25.0, length(vGW - cameraPosition)));
      soil = mix(soil, vec3(0.16, 0.11, 0.075), root * 0.8);
      vec2 cc = floor(p / 0.55), cf = fract(p / 0.55) - 0.5 - (vec2(gHash(cc + 2.0), gHash(cc + 5.0)) - 0.5) * 0.6;
      // fallen cones: ~12 x 8 cm, lying at random angles, lighter scales on a dark core (v8: they were 25 cm discs)
      float ca = gHash(cc + 13.0) * 6.2832; vec2 cr = mat2(cos(ca), -sin(ca), sin(ca), cos(ca)) * cf * 0.55;
      float cd = length(cr * vec2(1.0, 1.55));
      cone = (1.0 - smoothstep(0.034, 0.034 + fw * 1.5, cd)) * step(0.86 - 0.4 * (1.0 - smoothstep(1.0, 3.0, dT)), gHash(cc + 9.0)) * gVis(0.08, fw);
      soil = mix(soil, mix(vec3(0.09, 0.055, 0.035), vec3(0.2, 0.13, 0.08), smoothstep(0.012, 0.03, cd) * (0.6 + 0.4 * nC.r)), cone);
      vec3 gravel = uGravel * (0.82 + 0.34 * nA.g) * (0.72 + 0.56 * nC.r);
      gravel *= 1.0 - 0.14 * (1.0 - smoothstep(0.2, 0.6, abs(fract(q.y * 0.45 + 0.3 * nB.g) - 0.5))) * mid;   // tyre ruts
      vec3 lawn = uGrass * (0.78 + 0.42 * nA.g) * (0.7 + 0.6 * nC.g);
      lawn = mix(lawn, lawn * vec3(1.15, 1.1, 0.8), smoothstep(0.55, 0.75, nB.g) * 0.6);
      lawn = mix(lawn, uNeedle * 0.9, nd * 0.5);
      col = mix(col, gravel, gravK);
      col = mix(col, soil, soilK);
      col = mix(col, lawn, lawnK);
      base = mix(mix(base, uGravel, gravK), uSoil, soilK);
      // the tree pit over the paving, its steel ring
      float ring = (1.0 - smoothstep(0.012, 0.012 + fw, abs(dT - 0.8))) * near * (1.0 - soft) * (1.0 - sag);
      col = mix(col, soil * 0.85, pit);
      col = mix(col, vec3(0.13, 0.12, 0.11), ring);
    }
    gRough = mix(0.86, 0.96, max(soft, pit));
    // needles drifting over the paving, grime along the kerb and at the foot of the facades
    float drift = smoothstep(0.62, 0.8, nD.r * 0.7 + nB.g * 0.3) * (1.0 - soft) * (1.0 - sag * 0.7) * (1.0 - 0.7 * north);
    col = mix(col, uNeedle * (0.7 + 0.5 * nC.r), drift * 0.55);
    col *= 1.0 - 0.1 * (1.0 - smoothstep(0.15, 0.9, A)) * (1.0 - 0.6 * north);
    col *= 1.0 - 0.2 * (1.0 - smoothstep(-0.2, 0.6, Bd));
    // granite kerb top with a worn chamfer and a gap to the paving
    float kerb = (1.0 - smoothstep(sectKerb - fw * 0.5, sectKerb + fw * 0.5, A)) * step(-0.05, A);
    vec3 granite = mix(${Ee(ht.granite)}, ${Ee("#B2AFA7")}, north) * (0.86 + 0.24 * nB.r) * (0.85 + 0.3 * nC.g);
    granite *= 1.0 - 0.35 * (1.0 - smoothstep(0.0, 0.02 + fw, A)) * near;
    float gap = (1.0 - smoothstep(0.0, 0.008 + fw * 0.6, abs(A - sectKerb - 0.005))) * near;
    col = mix(col, granite, kerb);
    base = mix(base, ${Ee(ht.granite)}, kerb);
    col *= 1.0 - 0.4 * gap;
    gRough = mix(gRough, 0.6, kerb);
    gH = hp * (1.0 - soft) * (1.0 - kerb) - pit * 0.02 + (root * 0.025 + cone * 0.02 + (nC.r - 0.5) * 0.004) * soilK;
  }
  // The photo where it shows this very ground (sunlit, no crowns, cars, marks or buildings): its colour
  // carries the material's own fine detail; from afar the street is the photo.
  float trust = vKind > 0.5 && vKind < 1.5 ? 0.0 : dt.r * orthoWeight.w * (1.0 - 0.85 * northK);
  if (trust > 0.004) {
    vec3 ph = gPhoto(p, pdx, pdy, fw, 0.45);
    vec3 rel = col / max(base, vec3(0.02));
    col = mix(col, ph * mix(vec3(1.0), rel, mix(0.35, 1.0, near)), trust);
  }
  diffuseColor.rgb = col;
  gAlpha = gFadeAt(vGW, smoothstep(0.0, -6.0, R));     // a soft 6 m edge into the photo
  gH *= gVis(0.3, fw);
}`,ca=`if (vKind < 0.5 || vKind > 1.5) {
  vec2 px = dFdx(vGW.xz), py = dFdy(vGW.xz);
  float hx = dFdx(gH), hy = dFdy(gH);
  float det = px.x * py.y - px.y * py.x;
  vec2 g = abs(det) > 1e-10 ? vec2(py.y * hx - px.y * hy, -py.x * hx + px.x * hy) / det : vec2(0.0);
  g = clamp(g, -1.5, 1.5) + gTilt;
  vec3 nw = normalize(vec3(-g.x, 1.0, -g.y));
  normal = normalize((viewMatrix * vec4(nw, 0.0)).xyz);
}`;function ua(e,o){const a=o==="high",t=new tt({color:16777215,roughness:.85,metalness:0});return t.blending=io,t.blendSrc=lo,t.blendDst=co,t.blendSrcAlpha=uo,t.blendDstAlpha=ho,ot(t,{key:"street"+o,uniforms:e,cal:!0,sunVis:!0,vHead:"attribute float aKind; attribute vec4 aDist; varying float vKind; varying vec4 vDist;",vMain:"vKind = aKind; vDist = aDist;",fHead:mo+ia,color:la(a),normal:ca,rough:"roughnessFactor = gRough;",out:"diffuseColor.a = gAlpha;"})}function ha(e){const o=new tt({color:16777215,roughness:.6,metalness:0,depthWrite:!1,polygonOffset:!0,polygonOffsetFactor:-2,polygonOffsetUnits:-2});return o.blending=io,o.blendSrc=lo,o.blendDst=co,o.blendSrcAlpha=uo,o.blendDstAlpha=ho,ot(o,{key:"marks",uniforms:e,cal:!0,sunVis:!0,fHead:mo+" float gAlpha = 1.0;",color:`{
      vec2 p = vGW.xz;
      float fw = max(length(fwidth(p)), 1e-4);
      vec4 sh = texture2D(uShade, gShadeUv(p));
      gSunVis = 1.0 - sh.g * 0.92 * gOutside(vGW);
      float wear = gFbm(p * 2.2, fw * 2.2, 3), chips = gFbm(p * 11.0, fw * 11.0, 2);
      diffuseColor.rgb = ${Ee("#D6D2C6")} * (0.88 + 0.14 * chips) * mix(1.0, 0.85 + 0.3 * gNoise(p * 40.0), gVis(0.03, fw));
      float a = 0.9 - 0.6 * smoothstep(0.5, 0.85, wear) - 0.3 * smoothstep(0.55, 0.8, chips) * gVis(0.1, fw);
      gAlpha = clamp(a, 0.0, 1.0) * gFadeAt(vGW, 1.0);
    }`,out:"diffuseColor.a = gAlpha;"})}function da(e,o,a){const t=e.surface,s=new ie(t.position,3),r=new ie(t.normal,3),l=new ie(t.kind,1),c=new ie(t.dist,4),p=new ie(t.index,1),f=ua(o,a),h=new Qe;h.name="ground-street";const M=e.tiles?.length?e.tiles:[[0,t.index.length,0,0,0,1e5]],m=[];for(const[z,T,S,R,B,F]of M){const L=new Ke;L.setAttribute("position",s),L.setAttribute("normal",r),L.setAttribute("aKind",l),L.setAttribute("aDist",c),L.setIndex(p),L.setDrawRange(z,T),L.boundingSphere=new ro(new de(S,R,B),F),L.boundingBox=new Io().setFromCenterAndSize(new de(S,R,B),new de(F*2,F*2,F*2));const D=new Et(L,f);D.name="ground-street-tile",D.renderOrder=2,D.receiveShadow=!0,D.matrixAutoUpdate=!1,h.add(D),m.push(L)}const u=e.marks,v=new Ke;v.setAttribute("position",new ie(u.position,3)),v.setAttribute("normal",new ie(new Float32Array(u.position.length).map((z,T)=>T%3===1?1:0),3)),v.setIndex(new ie(u.index,1)),v.computeBoundingSphere();const g=new Et(v,ha(o));return g.name="ground-marks",g.renderOrder=3,g.receiveShadow=!0,g.matrixAutoUpdate=!1,{street:h,marks:g,tiles:h.children,dispose(){m.forEach(z=>z.dispose()),f.dispose(),v.dispose(),g.material.dispose()}}}const De={h:17,r:7},Je={pine:[1,2],celtis:[.8,.8],pineD:.68},A=(e=0,o=0,a=0)=>new de(e,o,a);function gt(e,o){e=e.index?e.toNonIndexed():e;for(const t of Object.keys(e.attributes))t!=="position"&&t!=="normal"&&t!=="color"&&t!=="aUv"&&e.deleteAttribute(t);const a=e.attributes.position.count;return e.attributes.color||e.setAttribute("color",new ie(new Float32Array(a*3).fill(1),3)),e.attributes.aUv||e.setAttribute("aUv",new ie(new Float32Array(a*2),2)),e.setAttribute("aKind",new ie(new Float32Array(a).fill(o),1)),e}function Ce(e,o,a,t,s={}){const{uRep:r=1,vTile:l=2,seed:c=0,lobes:p=.04,footLobes:f=0,kind:h=0,ao:M=null}=s,m=new _o(e,!1,"centripetal"),u=m.computeFrenetFrames(t,!1),v=m.getLength(),g=[],z=[],T=[],S=[],R=[],B=A(),F=A();for(let D=0;D<=t;D++){const E=D/t;m.getPointAt(E,B);const Y=o(E,B.y),J=f*Math.exp(-Math.max(0,B.y)/.45);for(let y=0;y<=a;y++){const H=y/a*Math.PI*2,C=1+p*(.6*Math.sin(H*3+c*1.7+E*4)+.4*Math.sin(H*5+c))+J*Math.pow(Math.max(0,Math.cos(H*3+c)),3);F.copy(u.normals[D]).multiplyScalar(Math.cos(H)).addScaledVector(u.binormals[D],Math.sin(H)).normalize(),g.push(B.x+F.x*Y*C,B.y+F.y*Y*C,B.z+F.z*Y*C),z.push(F.x,F.y,F.z);const N=M?M(B.y):1;T.push(N,N,N),S.push(y/a*r,E*v/l)}}for(let D=0;D<t;D++)for(let E=0;E<a;E++){const Y=D*(a+1)+E,J=Y+1,y=Y+a+1,H=y+1;R.push(Y,y,J,J,y,H)}const L=new Ke;return L.setAttribute("position",new he(g,3)),L.setAttribute("normal",new he(z,3)),L.setAttribute("color",new he(T,3)),L.setAttribute("aUv",new he(S,2)),L.setIndex(R),gt(L,h)}function vo(e,o,a,t,s,r,l){const c=Ze(s*53+9),p=[],f=c()*Math.PI*2;for(let h=0;h<e;h++){const M=f+(h+.35*c())/e*Math.PI*2,m=Math.cos(M),u=Math.sin(M),v=a*(.7+.5*c()),g=[A(m*o*.45,.55,u*o*.45),A(m*(o+v*.3),.16,u*(o+v*.3)),A(m*(o+v*.7),0,u*(o+v*.7)),A(m*(o+v),-.12,u*(o+v))],z=t*(.75+.5*c());p.push(Ce(g,T=>z*(1-.75*T),r,4,{...l,lobes:.02,seed:s+h}))}return p}function zt(e,o,a,t,s=2){const r=[],l=[],c=[],p=[],f=e.length-1,h=A(),M=A(),m=A(),u=A();let v=0;for(let z=0;z<=f;z++){h.subVectors(e[Math.min(f,z+1)],e[Math.max(0,z-1)]).normalize(),M.set(Math.abs(h.y)<.9?0:1,Math.abs(h.y)<.9?1:0,0).cross(h).normalize(),m.crossVectors(h,M),z&&(v+=e[z].distanceTo(e[z-1]));const T=o+(a-o)*z/f,S=e[z];for(let R=0;R<=t;R++){const B=R/t*Math.PI*2;u.copy(M).multiplyScalar(Math.cos(B)).addScaledVector(m,Math.sin(B)),r.push(S.x+u.x*T,S.y+u.y*T,S.z+u.z*T),l.push(u.x,u.y,u.z),c.push(R/t,v/s)}}for(let z=0;z<f;z++)for(let T=0;T<t;T++){const S=z*(t+1)+T,R=S+1,B=S+t+1,F=B+1;p.push(S,B,R,R,B,F)}const g=new Ke;return g.setAttribute("position",new he(r,3)),g.setAttribute("normal",new he(l,3)),g.setAttribute("aUv",new he(c,2)),g.setIndex(p),gt(g,0)}function Ut(e,o,a,t){const s=Math.floor(e),r=Math.floor(o),l=Math.floor(a),c=e-s,p=o-r,f=a-l,h=c*c*(3-2*c),M=p*p*(3-2*p),m=f*f*(3-2*f),u=(g,z,T)=>Co(g*73856093^z*19349663^T*83492791^t*2654435761|0),v=(g,z,T)=>g+(z-g)*T;return v(v(v(u(s,r,l),u(s+1,r,l),h),v(u(s,r+1,l),u(s+1,r+1,l),h),M),v(v(u(s,r,l+1),u(s+1,r,l+1),h),v(u(s,r+1,l+1),u(s+1,r+1,l+1),h),M),m)}const kt=(e,o,a)=>a.set((o.x-e.x)/(e.r*e.r),(o.y-e.y)/(e.d*e.d),(o.z-e.z)/(e.r*e.r)).normalize(),Oe=(e,o,a,t)=>{const s=(a.y-(e.y-e.d))/(2*e.d),r=Math.min(1,Math.hypot(a.x-e.x,a.z-e.z)/e.r),l=o?Math.min(1,Math.max(0,(a.y-(o.y-o.d*.7))/(o.d*1.4))):1;return Math.min(1,Math.max(.13,(.14+.48*s+.2*r+.25*t)*(.32+.68*l)))},_t=new de,Ot=new de,We=(e,o,a,t,s,r)=>(kt(o||e,a,_t),kt(e,a,Ot),r.copy(_t).multiplyScalar(.62).addScaledVector(Ot,.38).multiplyScalar(1-s).addScaledVector(t,s).normalize()),wt=[];function fa(e){if(!wt[e]){let o=new Oo(1,e);o.deleteAttribute("uv"),o.deleteAttribute("normal"),o=Wo(o),wt[e]={pos:o.attributes.position.array,index:o.index.array}}return wt[e]}function Wt(e,o,a,t,s,r=1){const l=e.c,c=e.rx*o,p=e.ry*o,f=fa(a);let h=new Ke;h.setAttribute("position",new ie(Float32Array.from(f.pos),3)),h.setIndex(new ie(f.index,1));const M=h.attributes.position,m=A();for(let S=0;S<M.count;S++){m.fromBufferAttribute(M,S);const R=1+.4*(Ut(m.x*2.1+t,m.y*2.1,m.z*2.1,t)-.5)*2+.18*(Ut(m.x*4.7,m.y*4.7+t,m.z*4.7,t+3)-.5)*2,B=m.y<0?.85:1;M.setXYZ(S,l.x+m.x*c*R,l.y+m.y*p*R*B,l.z+m.z*c*R)}h.computeVertexNormals();const u=h.attributes.normal,v=new Float32Array(M.count*3),g=A(),z=A(),T=A();for(let S=0;S<M.count;S++){g.fromBufferAttribute(M,S),T.fromBufferAttribute(u,S),We(s,e.sub,g,T,.35,z),u.setXYZ(S,z.x,z.y,z.z);const R=Oe(s,e.sub,g,(g.y-l.y)/p)*r;v[S*3]=R,v[S*3+1]=R,v[S*3+2]=R}return h.setAttribute("color",new ie(v,3)),gt(h,1)}function $e(e,o,a,t,s,r,l,c){const p=r%2*.5,f=Math.floor(r/2)*.5,h=[[p,f+.5],[p+.5,f+.5],[p+.5,f],[p,f]];for(const M of[0,1,2,0,2,3]){const m=s[M];e.push(m.x,m.y,m.z),o.push(l.x,l.y,l.z),a.push(c,c,c),t.push(h[M][0],h[M][1])}}function Nt(e,o,a,t,s=2){const r=new Ke;return r.setAttribute("position",new he(e,3)),r.setAttribute("normal",new he(o,3)),r.setAttribute("color",new he(a,3)),r.setAttribute("aUv",new he(t,2)),gt(r,s)}const je=(e,o,a,t,s)=>[e.clone().addScaledVector(a,-t*.5*s),e.clone().addScaledVector(a,t*.5*s),e.clone().addScaledVector(a,t*.5*s).addScaledVector(o,t),e.clone().addScaledVector(a,-t*.5*s).addScaledVector(o,t)];function pa(e,o,a,t,s){const r=[],l=[],c=[],p=[],f=e.c,h=e.rx,M=e.ry,m=e.sub||s,u=A(),v=A(),g=A(),z=A(),T=A(),S=A();for(let R=0;R<o;R++){const B=1-1.55*Math.pow(t(),.85),F=t()*Math.PI*2,L=Math.sqrt(Math.max(0,1-B*B));u.set(L*Math.cos(F),B,L*Math.sin(F)).normalize();const D=A(f.x+u.x*h*.62,f.y+u.y*M*.5,f.z+u.z*h*.62);v.copy(u).add(T.set(t()-.5,t()*.6-.1,t()-.5).multiplyScalar(.7)).normalize(),v.y>.72&&(S.set(D.x-m.x,0,D.z-m.z),S.lengthSq()<.04&&S.set(Math.cos(F),0,Math.sin(F)),S.normalize(),v.set(S.x*.8,.6,S.z*.8).add(T.set(t()-.5,0,t()-.5).multiplyScalar(.5)).normalize()),g.crossVectors(v,T.set(t()-.5,t()-.5,t()-.5)).normalize(),g.lengthSq()<.1&&g.set(1,0,0);const E=a*(.75+.5*t()),Y=[0,1,3][Math.floor(t()*3)],J=D.clone().addScaledVector(v,E*.6);We(s,e.sub,J,u,.3,z),$e(r,l,c,p,je(D,v,g,E,t()<.5?1:-1),Y,z,Oe(s,e.sub,J,Math.max(0,u.y))*(.7+.4*t()))}for(let R=0;R<(e.under?4:3);R++){const B=t()*Math.PI*2,F=A(Math.cos(B),0,Math.sin(B)),L=.2+.5*t(),D=A(f.x+F.x*h*L,f.y-M*(.2+.3*t()),f.z+F.z*h*L);v.copy(F).applyAxisAngle(A(0,1,0),(t()-.5)*1.6).setY(-.15-.55*t()).normalize(),g.crossVectors(v,A(0,1,0)).normalize();const E=a*(.85+.35*t()),Y=D.clone().addScaledVector(v,E*.5);We(s,e.sub,Y,v,.3,z),$e(r,l,c,p,je(D,v,g,E,1),[0,1,3][Math.floor(t()*3)],z,Oe(s,e.sub,Y,0)*.8)}if(!e.under)for(let R=0;R<2;R++){const B=t()*Math.PI*2,F=A(Math.cos(B),0,Math.sin(B)),L=A(f.x-F.x*h*.5,f.y+M*.62,f.z-F.z*h*.5);v.copy(F).setY(.28+.2*t()).normalize(),g.crossVectors(v,A(0,1,0)).normalize();const D=a*(.95+.35*t()),E=L.clone().addScaledVector(v,D*.5);We(s,e.sub,E,A(0,1,0),.2,z),$e(r,l,c,p,je(L,v,g,D,1),[0,1,3][Math.floor(t()*3)],z,Oe(s,e.sub,E,1))}return Nt(r,l,c,p)}function ma(e,o,a){const t=[],s=[],r=[],l=[],c=e.c,p=e.rx,f=e.ry,h=e.sub||a,M=A(),m=A(c.x-h.x,0,c.z-h.z);m.lengthSq()<.04&&m.set(1,0,0),m.normalize();const u=o()*Math.PI;for(let v=0;v<2;v++){const g=u+v*Math.PI/2,z=A(Math.cos(g),0,Math.sin(g)),T=A(0,1,0).addScaledVector(m,.45).normalize(),S=p*2.1,R=c.clone().addScaledVector(T,-f*.9);We(a,e.sub,c,T,.2,M),$e(t,s,r,l,je(R,T,z,S,1),v?3:0,M,Oe(a,e.sub,c,.4))}{const v=m.clone().setY(.3).normalize(),g=A().crossVectors(v,A(0,1,0)).normalize(),z=p*2.2,T=c.clone().addScaledVector(v,-z*.45).add(A(0,f*.5,0));We(a,e.sub,c,A(0,1,0),.2,M),$e(t,s,r,l,je(T,v,g,z,1),1,M,Oe(a,e.sub,c.clone().setY(c.y+f),1))}return Nt(t,s,r,l)}const Le=(e,o,a)=>e+(o-e)*a,Te=e=>Math.min(1,Math.max(0,e));function va(e,o="hi",a="high"){const t=Ze(e*131+7),s=o==="hi",r=a==="high",l=De.h,c=De.r,p=Je.pine[1],f=l*(.55+.08*t()),h=l-.15,M={x:0,y:h-2.6,z:0,r:c,d:3},m=[],u=t()*Math.PI*2,v=[A(0,-.15,0),A(.14*Math.cos(u),f*.3,.14*Math.sin(u)),A(-.2*Math.cos(u+.6),f*.68,-.2*Math.sin(u+.6)),A(.12*Math.cos(u),f,.12*Math.sin(u))],g=(x,P)=>Le(Je.pineD/2,.245,Te((P-1.3)/(f-1.3)))*(1+.3*Math.exp(-Math.max(0,P)/.32)),z=x=>.58+.42*Te(x/.9);m.push(Ce(v,g,s?r?18:13:7,s?16:6,{uRep:2,vTile:p,seed:e,lobes:.035,footLobes:.12,ao:z})),m.push(...vo(s?6:4,Je.pineD/2,.75,.15,e,s?r?7:5:4,{uRep:1,vTile:p,ao:x=>.55+.3*Te(x/.5)}));const T=v[3],S=[],R=t()*Math.PI*2;S.push({x:(t()-.5)*.8,y:h-1.1,z:(t()-.5)*.8,r:2.5+.4*t(),d:1.35});for(let x=0;x<7;x++){const P=R+(x+.25*t())/7*Math.PI*2,K=c*(.6+.1*t());S.push({x:Math.cos(P)*K,y:h-1.45-1.5*Math.pow(K/c,2)-.35*t(),z:Math.sin(P)*K,r:2.3+.6*t(),d:1.2+.3*t()})}const B=[],F=s?1:1.15;for(const x of S){const P=s?7:5;for(let K=0;K<P;K++){const _=K===0?.15*t():.5+.75*t(),i=t()*Math.PI*2,d=A(x.x+Math.sin(_)*Math.cos(i)*x.r*.62,x.y+Math.cos(_)*x.d*.55,x.z+Math.sin(_)*Math.sin(i)*x.r*.62);B.push({c:d,rx:(.95+.4*t())*F,ry:(.55+.2*t())*F,sub:x})}}for(let x=0;x<6;x++){const P=R+(x+.6)/6*Math.PI*2+(t()-.5)*.5,K=c*(.5+.18*t()),_=A(Math.cos(P)*K,h-3.3-.5*t(),Math.sin(P)*K),i=S.reduce((d,b)=>Math.hypot(b.x-_.x,b.z-_.z)<Math.hypot(d.x-_.x,d.z-_.z)?b:d,S[0]);B.push({c:_,rx:1.3+.35*t(),ry:.55+.2*t(),under:!0,sub:i})}const L=Ze(e*211+17),D=x=>(x.attributes.aKind.array.fill(.05),x),E=3+(L()<.4?1:0),Y=L()*Math.PI*2,J=[];for(let x=0;x<E;x++){const P=Y+(x+.3*(L()-.5))/E*Math.PI*2,K=c*(.26+.1*L()),_=A(T.x+Math.cos(P)*K,h-3.5-.6*L(),T.z+Math.sin(P)*K),i=T.clone().add(A(0,-.45,0)),d=i.clone().lerp(_,.45).add(A(-Math.cos(P)*.25,.35,-Math.sin(P)*.25));m.push(D(Ce([i,d,_],b=>Le(.2,.125,b),s?r?10:8:5,s?6:3,{uRep:1,vTile:p,seed:e+x,lobes:.03}))),J.push({a:P,start:i,mid:d,end:_})}const y=(x,P)=>P<.5?x.start.clone().lerp(x.mid,P*2):x.mid.clone().lerp(x.end,(P-.5)*2),H=[];S.forEach((x,P)=>{const K=Math.atan2(x.z,x.x),_=P===0?J.reduce((k,G)=>G.end.distanceTo(A(x.x,G.end.y,x.z))<k.end.distanceTo(A(x.x,k.end.y,x.z))?G:k,J[0]):J.reduce((k,G)=>Math.abs(Math.atan2(Math.sin(G.a-K),Math.cos(G.a-K)))<Math.abs(Math.atan2(Math.sin(k.a-K),Math.cos(k.a-K)))?G:k,J[0]),i=A(x.x*.8,x.y-x.d*.7,x.z*.8),d=y(_,.72+.26*L()),b=d.clone().lerp(i,.5).add(A(0,.25+.3*L(),0));m.push(D(Ce([d,b,i],k=>Le(.11,.07,k),s?r?7:6:4,s?4:2,{uRep:1,vTile:p,seed:e+10+P,lobes:.02}))),H.push(i)});const C=x=>(x.attributes.aKind.array.fill(.25),x);for(const x of B){const P=H[S.indexOf(x.sub)],K=x.c.clone().add(A(0,-x.ry*.5,0));s?m.push(C(zt([P,P.clone().lerp(K,.5).add(A(0,.2,0)),K],.07,.03,4))):P.distanceTo(K)>2.2&&m.push(C(zt([P,K],.07,.035,3)))}const N=Ze(e*17+3);B.forEach((x,P)=>{const K=Math.hypot(x.c.x,x.c.z)/c;if(s){m.push(Wt(x,x.under?.42:.5,1,e*13+P,M,.85));const _=x.under?r?9:6:Math.round((r?12:8)+K*(r?6:4));m.push(pa(x,_,1.15,N,M))}else m.push(Wt(x,x.under?.45:.55,0,e*13+P,M,.85)),x.under||m.push(ma(x,N,M))});const te=qe(m,!1);return te.computeBoundingSphere(),te.userData={fork:f},te}const et={h:13,r:5.5};function ga(e,o="hi",a="high"){const t=Ze(e*97+5),s=o==="hi",r=a==="high",l=et.h,c=et.r,p=Je.celtis[1],f=l*(.3+.06*t()),h={x:0,y:l*.68,z:0,r:c,d:l*.34},M=[],m={vTile:p,kind:.015},u=[A(0,-.15,0),A(.06,f*.5,-.04),A(-.04,f,.06)],v=(C,N)=>Le(.24,.19,Te(N/f))*(1+.2*Math.exp(-Math.max(0,N)/.35));M.push(Ce(u,v,s?r?16:12:6,s?8:3,{...m,uRep:2,seed:e,lobes:.025,footLobes:.1,ao:C=>.62+.38*Te(C/.8)})),M.push(...vo(s?5:3,.24,.42,.1,e+3,s?6:4,{...m,uRep:1,ao:C=>.6+.3*Te(C/.5)}));const g=u[2],z=[],T=[],S=[],R=[],B=A(),F=A(),L=(C,N)=>A(-C.z,0,C.x).normalize().multiplyScalar(N),D=(C,N,te,x=.3)=>{const P=N.clone().sub(C).normalize();for(let K=0;K<te;K++){const _=x+(1-x)*(K+t())/te,i=C.clone().lerp(N,_),d=A(i.x,0,i.z);d.lengthSq()<.01&&d.set(1,0,0),d.normalize();const b=1-Te((i.y-f)/(l*.55)),k=P.clone().multiplyScalar(.8).add(d.clone().multiplyScalar(.5)).add(A(t()-.5,.25+t()*.5-b*.6,t()-.5).multiplyScalar(.9)).normalize(),G=A().crossVectors(k,A(t()-.5,t()-.5,t()-.5)).normalize();G.lengthSq()<.1&&G.set(1,0,0);const X=(1.45+.65*t())*(s?1:1.35),$=i.clone().addScaledVector(k,X*.5);kt(h,$,B);const V=Math.min(1,.5+.5*Te(($.y-f)/(l-f))*(.6+.4*Math.min(1,Math.hypot($.x,$.z)/c))),O=k.y<.25?3:[0,1,2][Math.floor(t()*3)];$e(z,T,S,R,je(i.clone().addScaledVector(k,-X*.12),k,G,X,t()<.5?1:-1),O,B.clone().lerp(F.copy(k),.3).normalize(),V)}},E=3+(t()<.5?1:0),Y=t()*Math.PI*2,J=s&&r?3:2,y=s?r?5:3:1;for(let C=0;C<E;C++){const N=Y+(C+.25*(t()-.5))/E*Math.PI*2,te=.35+.28*t(),x=A(Math.sin(te)*Math.cos(N),Math.cos(te),Math.sin(te)*Math.sin(N)),P=(l*.8-f)/Math.cos(te)*(.5+.1*t()),K=g.clone().add(A(0,-.3,0)),_=g.clone().addScaledVector(x,P),i=K.clone().lerp(_,.5).add(A(Math.cos(N)*.2,.15,Math.sin(N)*.2));M.push(Ce([K,i,_],d=>Le(.15,.095,d),s?r?9:7:4,s?5:2,{...m,uRep:1,seed:e+C,lobes:.02}));{const d=K.clone().lerp(_,.45+.2*t()),b=L(x,t()<.5?1:-1),k=A(Math.cos(N),0,Math.sin(N)).multiplyScalar(.8).addScaledVector(b,.4).add(A(0,.45,0)).normalize(),G=d.clone().addScaledVector(k,2.4+1*t());M.push(Ce([d,d.clone().lerp(G,.5).add(A(0,.15,0)),G],X=>Le(.055,.018,X),s?5:3,2,{...m,uRep:1,seed:e+20+C})),D(d,G,y,.25)}for(let d=0;d<2;d++){const b=N+(d?1:-1)*(.3+.3*t()),k=te+.08+.25*t(),G=A(Math.sin(k)*Math.cos(b),Math.cos(k),Math.sin(k)*Math.sin(b)),X=Math.max(1.5,(l*.95-_.y)/Math.cos(k)*(.85+.2*t())),$=_.clone().addScaledVector(G,X);M.push(Ce([_,_.clone().lerp($,.5).add(A(0,.1,0)),$],V=>Le(.09,.028,V),s?r?7:5:3,s?4:2,{...m,uRep:1,seed:e+30+C*2+d})),D(_.clone().lerp($,.45),$.clone().addScaledVector(G,.7),s?r?5:3:2,0);for(let V=0;V<J;V++){const O=.25+.65*(V+t())/J,Z=_.clone().lerp($,O),ne=L(G,V%2?1:-1),Q=G.clone().multiplyScalar(.45).addScaledVector(ne,.75).add(A(Math.cos(b),0,Math.sin(b)).multiplyScalar(.35)).add(A(0,.15,0)).normalize(),se=1.6+1.2*t(),ee=Z.clone().addScaledVector(Q,se);M.push(xa(zt(s?[Z,Z.clone().lerp(ee,.5).add(A(0,.1,0)),ee]:[Z,ee],.045,.014,s?4:3,p))),D(Z,ee,y,.2)}}}M.push(Nt(z,T,S,R,3));const H=qe(M,!1);return H.computeBoundingSphere(),H.userData={fork:f},H}const xa=e=>(e.attributes.aKind.array.fill(.015),e),go=`
  #ifdef USE_INSTANCING
  if (aKind < 0.005) {
    float tSx = length(instanceMatrix[0].xyz), tSy = instanceMatrix[1].y;
    float tH = fract(sin(dot(instanceMatrix[3].xz, vec2(12.9898, 78.233))) * 43758.5453);
    float tD = clamp(0.24 + 0.02 * tSy * ${De.h.toFixed(1)} + 0.01 * tSx * ${De.r.toFixed(1)} + 0.08 * (tH - 0.5), 0.45, 0.70);
    transformed.xz *= min(1.0, tD / (${Je.pineD.toFixed(3)} * tSx));
  }
  #endif`;function ya(e,o){const a=o==="high",t=new tt({vertexColors:!0,roughness:.82,metalness:0,side:Tt});return t.alphaToCoverage=!0,ot(t,{key:"pine"+o,uniforms:e,cal:!0,vHead:"attribute float aKind; attribute vec2 aUv; varying float vKind; varying vec2 vUvT; varying float vSeed; varying vec3 vLP; varying vec3 vLN; varying vec3 vWN; uniform float uTime;",vMain:`vKind = aKind; vUvT = aUv; vLP = transformed; vLN = objectNormal;
      ${go}
      #ifdef USE_INSTANCING
      { float ph = instanceMatrix[3].x * 0.37 + instanceMatrix[3].z * 0.23;
        vSeed = fract(sin(dot(instanceMatrix[3].xz, vec2(12.9898, 78.233))) * 43758.5453);
        float k = smoothstep(8.0, 16.0, transformed.y) * step(0.5, aKind);
        transformed.x += sin(uTime * 0.9 + ph + transformed.y * 0.15) * 0.06 * k;
        transformed.z += cos(uTime * 0.7 + ph * 1.3) * 0.05 * k; }
      vWN = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * objectNormal);
      #else
      vSeed = 0.5;
      vWN = normalize(mat3(modelMatrix) * objectNormal);
      #endif`,colorVertex:"vColor.xyz *= mix(vec3(1.0), instanceColor.xyz, step(0.5, aKind));",fHead:`uniform float uFade; uniform vec3 uSunDir; uniform sampler2D uNeedles, uNoise, uLeaves, uBarkP, uBarkPN, uBarkC, uBarkCN;
      uniform vec3 uNeedleMean; uniform float uLeavesSize, uLeafGain; uniform vec2 uBarkGain, uBarkNK;
      varying float vKind; varying vec2 vUvT; varying float vSeed; varying vec3 vLP; varying vec3 vLN; varying vec3 vWN;
      float gA = 1.0; float gH = 0.0; vec3 gNm = vec3(0.0, 0.0, 1.0); float gNmK = 0.0;`,color:`{
      vec3 lpx = dFdx(vLP), lpy = dFdy(vLP);
      vec2 uvx = dFdx(vUvT), uvy = dFdy(vUvT);
      if (vKind > 1.5) {
        // needle brush (2) or young-leaf spray (3) from their atlas; alpha grows with the mip level so far
        // crowns keep their density, cards seen edge-on fade out
        bool lv = vKind > 2.5;
        vec4 tx = lv ? textureGrad(uLeaves, vUvT, uvx, uvy) : textureGrad(uNeedles, vUvT, uvx, uvy);
        float ts = lv ? uLeavesSize : 512.0;
        vec2 ddx = uvx * ts, ddy = uvy * ts;
        float lod = max(0.0, 0.5 * log2(max(dot(ddx, ddx), dot(ddy, ddy))));
        vec3 gn = normalize(cross(dFdx(vGW), dFdy(vGW)));
        float facing = abs(dot(gn, normalize(cameraPosition - vGW)));
        float a = tx.a * (1.0 + min(lod, 4.0) * (lv ? 0.45 : 0.32)) * smoothstep(0.05, 0.3, facing);
        // sharpened to a one-pixel ramp: crisp needles, antialiased by the coverage (no dotted fringe)
        gA = clamp((a - 0.45) / max(fwidth(a), 1e-3) + 0.5, 0.0, 1.0);
        if (gA < 0.02) discard;
        diffuseColor.rgb *= lv ? tx.rgb * uLeafGain : tx.rgb / uNeedleMean;
        // seen from below, a brush shows its shaded underside
        diffuseColor.rgb *= mix(lv ? 0.85 : 0.8, 1.0, smoothstep(-2.0, 1.5, cameraPosition.y - vGW.y));
      } else if (vKind > 0.5) {
        // clump core: a tileable mass of needles (noise.png A) projected on three planes with soft
        // weights (smooth normals: no seams), over the dark inside of the clump
        vec3 w = pow(abs(normalize(vLN)), vec3(4.0)); w /= dot(w, vec3(1.0));
        const float S = 0.95;
        float mx = textureGrad(uNoise, vLP.zy * S + 0.13, lpx.zy * S, lpy.zy * S).a;
        float my = textureGrad(uNoise, vLP.xz * S + 0.37, lpx.xz * S, lpy.xz * S).a;
        float mz = textureGrad(uNoise, vLP.xy * S + 0.71, lpx.xy * S, lpy.xy * S).a;
        float mass = mx * w.x + my * w.y + mz * w.z;
        diffuseColor.rgb *= mix(vec3(0.36, 0.4, 0.33), vec3(1.15, 1.12, 0.96), smoothstep(0.06, 0.8, mass));
        gH = mass;
        // the core is a mass of needles with gaps, fraying at its outline: no smooth pod shape
        float facing = abs(dot(normalize(vNormal), normalize(vViewPosition)));
        float a = mass * 1.7 + smoothstep(0.2, 0.7, facing) * 0.35 - 0.12;
        gA = clamp((a - 0.5) / max(fwidth(a), 1e-3) + 0.5, 0.0, 1.0);
        if (gA < 0.02) discard;
      } else if (vKind > 0.1) {
        // inner twigs: plain dark bark
        diffuseColor.rgb *= vec3(0.16, 0.11, 0.08);
      } else {
        // bark at real scale (scripts/build-ground-bark.mjs): stone pine (0 trunk, collar and roots; 0.05 limbs,
        // thinner and redder) or hackberry (0.015: smooth grey, lichens). Colour and normal map, mipmapped:
        // no drawn outlines, the plates fade to their mean with distance by themselves.
        bool celtis = vKind > 0.01 && vKind < 0.03;
        vec3 bc = celtis ? textureGrad(uBarkC, vUvT, uvx, uvy).rgb : textureGrad(uBarkP, vUvT, uvx, uvy).rgb;
        gNm = (celtis ? textureGrad(uBarkCN, vUvT, uvx, uvy).xyz : textureGrad(uBarkPN, vUvT, uvx, uvy).xyz) * 2.0 - 1.0;
        gNmK = celtis ? uBarkNK.y : uBarkNK.x;
        bc *= 0.9 + 0.2 * vSeed;                                              // tree to tree
        if (vKind > 0.03) bc *= vec3(1.06, 0.95, 0.9);                       // pine limbs
        float foot = 1.0 - smoothstep(0.05, 0.7, vGW.y);
        bc *= mix(1.0, 0.72, foot);                                           // damp, soil splash at the foot
        // a green film of algae low on the north side of the hackberries
        if (celtis) bc = mix(bc, bc * vec3(0.82, 0.98, 0.74), 0.4 * smoothstep(0.0, 0.8, -vWN.z) * (1.0 - smoothstep(0.8, 4.5, vGW.y)));
        diffuseColor.rgb *= bc * (celtis ? uBarkGain.y : uBarkGain.x);
      }
    }`,normal:`{
      vec3 dpx = dFdx(-vViewPosition), dpy = dFdy(-vViewPosition);
      vec2 nux = dFdx(vUvT), nuy = dFdy(vUvT);
      float hx = dFdx(gH), hy = dFdy(gH);
      if (vKind > 1.5) {
        // cards: never facing away from the viewer (no grazing sky glare)
        vec3 n = normalize(vNormal), Vv = normalize(vViewPosition);
        float d = dot(n, Vv);
        if (d < 0.25) n = normalize(n + Vv * (0.25 - d));
        normal = n;
      } else if (gNmK > 0.0) {
        // bark normal map in the cotangent frame of the bark UVs (as three.js does without tangents)
        vec3 N = normal, q1p = cross(dpy, N), q0p = cross(N, dpx);
        vec3 T = q1p * nux.x + q0p * nuy.x, B = q1p * nux.y + q0p * nuy.y;
        float det = max(dot(T, T), dot(B, B)), sc = det == 0.0 ? 0.0 : inversesqrt(det);
        vec3 nm = gNm; nm.xy *= gNmK;
        normal = normalize(T * (nm.x * sc) + B * (nm.y * sc) + N * nm.z);
      } else {
        // bump from the clump needles (screen-space derivatives)
        vec3 r1 = cross(dpy, normal), r2 = cross(normal, dpx);
        float det = dot(dpx, r1);
        vec3 grad = sign(det) * (hx * r1 + hy * r2);
        normal = normalize(abs(det) * normal - grad * 0.04 * ${a?"1.0":"0.7"});
      }
    }`,emissive:`if (vKind > 0.5) {
      // light through the needles and the young leaves when looking towards the sun; from below, a little sky
      vec3 vd = normalize(vGW - cameraPosition);
      totalEmissiveRadiance += diffuseColor.rgb * vec3(0.8, 1.0, 0.5) * (pow(max(dot(vd, uSunDir), 0.0), 5.0) * (vKind > 2.5 ? 0.35 : 0.3) + smoothstep(0.2, 0.9, vd.y) * (vKind > 2.5 ? 0.12 : 0.1));
    }`,rough:"roughnessFactor = vKind > 0.5 ? 0.7 : 0.94;",out:"diffuseColor.a = gA * smoothstep(vSeed * 0.82, vSeed * 0.82 + 0.18, uFade) * smoothstep(1.0, 2.5, length(vGW - cameraPosition)); if (diffuseColor.a < 0.02) discard;"})}function ba(e,o){const a=new Eo({depthPacking:Uo});return a.onBeforeCompile=t=>{t.uniforms.uNeedles={value:e},t.uniforms.uLeaves={value:o||e},t.vertexShader=t.vertexShader.replace("#include <common>",`#include <common>
attribute float aKind; attribute vec2 aUv; varying float vKind; varying vec2 vUvT;`).replace("#include <begin_vertex>",`#include <begin_vertex>
vKind = aKind; vUvT = aUv;
${go}`),t.fragmentShader=t.fragmentShader.replace("#include <common>",`#include <common>
uniform sampler2D uNeedles, uLeaves; varying float vKind; varying vec2 vUvT;`).replace("#include <alphatest_fragment>","if ((vKind > 0.1 && vKind < 0.4) || (vKind > 1.5 && (vKind > 2.5 ? texture2D(uLeaves, vUvT).a : texture2D(uNeedles, vUvT).a) < 0.45)) discard;")},a.customProgramCacheKey=()=>"ground-pine-depth-v8",a}const Xe=(e,o)=>{const a=new _e(new Uint8Array(e),1,1);return a.colorSpace=o?Ae:Ct,a.needsUpdate=!0,a},wa=(e,o,a,t,s={})=>({uFade:{value:0},uSunDir:{value:To.dir.clone()},uTime:e,uCalK:{value:1},uNeedles:{value:o},uNeedleMean:{value:new Re(a||"#667840")},uNoise:{value:t},uLeaves:{value:s.leaves||Xe([132,150,74,0],!0)},uLeavesSize:{value:s.leavesSize||1024},uBarkP:{value:s.barkP||Xe([125,94,79,255],!0)},uBarkPN:{value:s.barkPN||Xe([128,128,255,255],!1)},uBarkC:{value:s.barkC||Xe([127,127,120,255],!0)},uBarkCN:{value:s.barkCN||Xe([128,128,255,255],!1)},uBarkGain:{value:new ke(1.85,.95)},uBarkNK:{value:new ke(1.25,2.2)},uLeafGain:{value:.98}}),$t=new Se,jt=new Se,qt=new Se,Yt=new Se;function Xt(e,o,a=De){const t=Math.tan(e.lean);return jt.set(1,Math.sin(e.dir)*t,0,0,0,1,0,0,0,Math.cos(e.dir)*t,1,0,0,0,0,1),qt.makeRotationY(e.rot),$t.makeScale(e.r/a.r,e.h/a.h,e.r/a.r),Yt.makeTranslation(e.x,e.y??0,e.z),o.copy(Yt).multiply(jt).multiply(qt).multiply($t)}const lt=[{L:4.05,W:1.76,wheels:[1.27,-1.3],wr:.31,yb:.3,roof:1.46,crown:.03,belt:[[-2.025,.93],[-1.95,.99],[-1.86,1],[.98,.93],[1.25,.88],[1.8,.8],[1.98,.74],[2.025,.66]],green:[[-1.86,1],[-1.62,1.43],[-1.45,1.46],[.1,1.46],[.98,.93]],pillars:{c:[-1.86,-1.38],b:[-.36,-.27]},seams:[.98,-.31,-1.38]},{L:4.62,W:1.8,wheels:[1.42,-1.45],wr:.32,yb:.31,roof:1.43,crown:.03,belt:[[-2.31,.84],[-2.26,.95],[-2,.98],[-1.62,.99],[1.2,.93],[1.5,.88],[2.05,.8],[2.25,.75],[2.31,.66]],green:[[-1.62,.99],[-1.02,1.39],[-.85,1.43],[.3,1.43],[1.2,.93]],pillars:{c:[-1.62,-.98],b:[-.32,-.23]},seams:[1.2,-.27,-1.3]},{L:4.38,W:1.84,wheels:[1.36,-1.36],wr:.35,yb:.38,roof:1.63,crown:.025,belt:[[-2.19,1.02],[-2.12,1.11],[-1.96,1.13],[1.22,1.06],[1.5,1],[2,.93],[2.15,.87],[2.19,.78]],green:[[-1.98,1.13],[-1.82,1.6],[-1.6,1.63],[.52,1.63],[1.22,1.06]],pillars:{c:[-1.98,-1.62],b:[-.52,-.42]},seams:[1.22,-.47,-1.5]}],dt=(e,o,a)=>e+(o-e)*a,Zt=(e,o,a)=>{const t=Math.min(1,Math.max(0,(a-e)/(o-e)));return t*t*(3-2*t)};function Qt(e,o){if(o<=e[0][0])return e[0][1];for(let a=0;a<e.length-1;a++)if(o<=e[a+1][0]){const t=(o-e[a][0])/(e[a+1][0]-e[a][0]);return dt(e[a][1],e[a+1][1],t)}return e[e.length-1][1]}const At={paint:["#FFFFFF",.42,0,1],glass:["#0C1114",.04,0,0],black:["#141516",.35,0,0],plastic:["#202122",.75,0,0],tyre:["#141414",.92,0,0],rim:["#B8BBBD",.32,.75,0],rimDark:["#2A2C2E",.5,.4,0],liner:["#0D0D0D",.95,0,0],head:["#D3D6D6",.28,0,0],tail:["#8E1B16",.15,0,0],plate:["#D9D8D0",.5,0,0],grille:["#18191A",.55,.2,0]},xo={};for(const e in At)xo[e]=new Re(At[e][0]);class Ma{constructor(){this.P=[],this.N=[],this.C=[],this.RM=[],this.PT=[],this.SM=[]}v(o,a,t,s=0){const r=xo[t],l=At[t];this.P.push(o[0],o[1],o[2]),this.N.push(a[0],a[1],a[2]),this.C.push(r.r,r.g,r.b),this.RM.push(l[1],l[2]),this.PT.push(l[3]),this.SM.push(s)}tri(o,a,t,s,r,l,c,p){this.v(o,s,c,p),this.v(a,r,c,p),this.v(t,l,c,p)}geometry(){const o=new Ke;return o.setAttribute("position",new he(this.P,3)),o.setAttribute("normal",new he(this.N,3)),o.setAttribute("color",new he(this.C,3)),o.setAttribute("aRM",new he(this.RM,2)),o.setAttribute("aPaint",new he(this.PT,1)),o.setAttribute("aSide",new he(this.SM,1)),o}}function ue(e,o,a){o=o.index?o.toNonIndexed():o,o.attributes.normal||o.computeVertexNormals();const t=o.attributes.position,s=o.attributes.normal;for(let r=0;r<t.count;r++)e.v([t.getX(r),t.getY(r),t.getZ(r)],[s.getX(r),s.getY(r),s.getZ(r)],a)}const ye=(e,o,a,t,s,r)=>new po(e,o,a).translate(t,s,r);function Sa(e,o="high"){const a=o==="high",t=e.L/2,s=e.W/2,[r,l]=e.wheels,c=e.wr+.065,p=e.wr+.02,f=e.green[0][0],h=e.green[e.green.length-1][0],M=e.green[2][0],m=e.green[e.green.length-2][0],u=new Set;(a?[0,.02,.06,.12,.2,.3,.42]:[0,.04,.12,.25,.42]).forEach(i=>{u.add(-t+i),u.add(t-i)});for(const i of[r,l]){const d=a?10:6;for(let b=0;b<=d;b++)u.add(i-c+2*c*b/d)}[f,h,M,m,e.pillars.c[0],e.pillars.c[1],e.pillars.b[0],e.pillars.b[1]].forEach(i=>u.add(i));for(let i=-t+.5;i<t-.5;i+=a?.32:.5)u.add(i);const g=[...u].map(i=>Math.round(i*1e3)/1e3).filter((i,d,b)=>b.indexOf(i)===d).sort((i,d)=>i-d),z=i=>{const d=t-Math.abs(i),b=i>0?.62:.5,k=i>0?.17:.13;return s*(d>b?1:1-k*Math.pow(1-d/b,2.2))},T=i=>{let d=e.yb+.1*Zt(t-.4,t,Math.abs(i));for(const b of[r,l]){const k=Math.abs(i-b);k<c&&(d=Math.max(d,p+Math.sqrt(c*c-k*k)))}return d},S=i=>Qt(e.belt,i),R=i=>i>f&&i<h?Math.max(S(i),Qt(e.green,i)):S(i),B=i=>{const d=z(i),b=T(i),k=S(i),G=R(i)-k,X=Zt(0,.14,G),$=d*.8,V=R(i),O=[[d*.8,k+.035],[d*.46,k+.06],[0,k+.07]],Z=[[dt(d*.9,$,.88),V-.07],[$*.92,V-.012],[0,V+e.crown]],ne=O.map((se,ee)=>[dt(se[0],Z[ee][0],X),dt(se[1],Z[ee][1],X)]),Q=k-b;return[[d*.93,b],[d*.99,b+Math.min(.1,Q*.2)],[d,b+Q*.48],[d*.985,k-.06],[d*.95,k],[d*.9,k+.022],...ne]},F=9,L=g.map(i=>B(i)),D=(i,d,b)=>{const[k,G]=L[i][d];return[g[i],G,b*k]},E=(i,d,b)=>{const k=D(Math.min(g.length-1,i+1),d,b),G=D(Math.max(0,i-1),d,b),X=D(i,Math.min(F-1,d+1),b),$=D(i,Math.max(0,d-1),b),V=[k[0]-G[0],k[1]-G[1],k[2]-G[2]],O=[X[0]-$[0],X[1]-$[1],X[2]-$[2]];let Z=[V[1]*O[2]-V[2]*O[1],V[2]*O[0]-V[0]*O[2],V[0]*O[1]-V[1]*O[0]];b<0&&(Z=Z.map(Q=>-Q));const ne=Math.hypot(...Z)||1;if(Z=Z.map(Q=>Q/ne),d===F-1){Z[2]=0;const Q=Math.hypot(Z[0],Z[1])||1;Z[0]/=Q,Z[1]/=Q}return Z},Y=i=>i>f+.001&&i<h-.001,J=(i,d,b)=>{const k=(i+d)/2;return b===0?"plastic":b<=3?"paint":b===4?Y(k)?"black":"paint":Y(k)?b===5?k>e.pillars.b[0]&&k<e.pillars.b[1]?"black":k>e.pillars.c[0]&&k<e.pillars.c[1]?"paint":"glass":b===6?"paint":k>m||k<M?"glass":"paint":"paint"},y=new Ma;for(const i of[1,-1])for(let d=0;d<g.length-1;d++)for(let b=0;b<F-1;b++){const k=J(g[d],g[d+1],b),G=D(d,b,i),X=D(d+1,b,i),$=D(d+1,b+1,i),V=D(d,b+1,i),O=E(d,b,i),Z=E(d+1,b,i),ne=E(d+1,b+1,i),Q=E(d,b+1,i),se=b>=1&&b<=3?1:0;i>0?(y.tri(G,X,$,O,Z,ne,k,se),y.tri(G,$,V,O,ne,Q,k,se)):(y.tri(G,$,X,O,ne,Z,k,se),y.tri(G,V,$,O,Q,ne,k,se))}for(const[i,d]of[[0,-1],[g.length-1,1]]){const b=[d,0,0];for(let k=0;k<F-1;k++){const G=D(i,k,1),X=D(i,k+1,1),$=D(i,k+1,-1),V=D(i,k,-1),O=k===0?"plastic":"paint";d>0?(y.tri(G,$,X,b,b,b,O),y.tri(G,V,$,b,b,b,O)):(y.tri(G,X,$,b,b,b,O),y.tri(G,$,V,b,b,b,O))}}const H=a?18:12;for(const i of[r,l])for(const d of[1,-1]){const b=d*(z(i)-.13),k=new Ne(e.wr,e.wr,.21,H,1,!1).rotateX(Math.PI/2).translate(i,e.wr,b);ue(y,k,"tyre");const G=new fo(e.wr-.045,.045,4,H).translate(i,e.wr,b+d*.1);ue(y,G,"tyre");const X=new jo(e.wr*.18,e.wr*.7,a?20:10,2),$=X.attributes.position,V=[0,0,d],O=X.index.array;for(let ee=0;ee<O.length;ee+=3){const xe=[O[ee],O[ee+1],O[ee+2]].map(be=>[$.getX(be),$.getY(be)]),Ge=(xe[0][0]+xe[1][0]+xe[2][0])/3,ve=(xe[0][1]+xe[1][1]+xe[2][1])/3,we=Math.hypot(Ge,ve),ge=Math.atan2(ve,Ge),Ye=we>e.wr*.38&&Math.cos(ge*5)<-.2,ze=xe.map(([be,at])=>[i+be,e.wr+at,b+d*.115]);d>0?y.tri(ze[0],ze[1],ze[2],V,V,V,Ye?"rimDark":"rim"):y.tri(ze[0],ze[2],ze[1],V,V,V,Ye?"rimDark":"rim")}ue(y,new Ne(e.wr*.16,e.wr*.2,.03,10).rotateX(Math.PI/2).translate(i,e.wr,b+d*.12),"rim");const Z=new Ne(c,c,.34,H,1,!0,Math.PI/2,Math.PI).rotateX(Math.PI/2).translate(i,p,d*(z(i)-.18));ue(y,Z,"liner");const ne=Z.toNonIndexed(),Q=ne.attributes.position;for(let ee=0;ee<Q.count;ee+=3){const xe=Q.getX(ee+1),Ge=Q.getY(ee+1),ve=Q.getZ(ee+1);Q.setXYZ(ee+1,Q.getX(ee+2),Q.getY(ee+2),Q.getZ(ee+2)),Q.setXYZ(ee+2,xe,Ge,ve)}ne.computeVertexNormals(),ue(y,ne,"liner");const se=new qo(c,H,0,Math.PI);d<0&&se.rotateY(Math.PI),se.translate(i,p,d*(z(i)-.34)),ue(y,se,"liner")}const C=S(t-.05),N=S(-t+.05),te=z(t-.05),x=z(-t+.05);for(const i of[1,-1]){ue(y,ye(.1,.1,.38,t-.035,C-.08,i*(te-.27)),"head"),ue(y,ye(.04,.05,.16,t+0,T(t)+.2,i*(te-.2)),"black"),ue(y,ye(.08,.13,.34,-t+.03,N-.11,i*(x-.22)),"tail");const d=m-.12,b=S(m)+.11,k=ye(.1,.11,.2,d,b,i*(z(d)+.07));ue(y,k,"paint"),ue(y,ye(.08,.04,.08,d,b-.03,i*(z(d)-.02)),"black");for(const G of[e.seams[1]+.32,e.seams[2]+.3])ue(y,ye(.16,.025,.02,G,S(G)-.1,i*(z(G)+.004)),"black")}ue(y,ye(.06,.13,e.W*.46,t-.012,C-.17,0),"grille"),ue(y,ye(.05,.08,e.W*.62,t-.01,T(t)+.06,0),"grille"),ue(y,ye(.02,.11,.52,t+.016,T(t)+.17,0),"plate"),ue(y,ye(.02,.11,.52,-t-.012,N-.3,0),"plate"),ue(y,ye(.04,.035,e.W*.7,-t+0,N-.2,0),"black");const P=y.geometry(),K=P.attributes.position.count,_=new Float32Array(K*3);for(let i=0;i<K;i++)_.set(e.seams,i*3);return P.setAttribute("aSeam",new ie(_,3)),P.computeBoundingSphere(),P}const za=[["#E6E6E1",.2],["#A8ABAD",.15],["#5A5E61",.14],["#1A1B1D",.14],["#1D2C48",.1],["#6E1717",.07],["#6B7C8A",.06],["#B0A285",.05],["#2D3B31",.05],["#3B3F44",.04]],Jt=["#1A1B1D","#1D2C48","#3B3F44","#2D3B31","#5A5E61"];function ka(e,o){const a=o==="high",t=a?new $o({vertexColors:!0,roughness:.45,metalness:0,clearcoat:.7,clearcoatRoughness:.14}):new tt({vertexColors:!0,roughness:.45,metalness:0});if(ot(t,{key:"car"+o,uniforms:e,vHead:"attribute vec2 aRM; attribute float aPaint; attribute float aSide; attribute vec3 aSeam; varying vec2 vRM; varying float vPaintK; varying float vSideK; varying vec3 vSeam; varying vec3 vLoc;",vMain:"vRM = aRM; vPaintK = aPaint; vSideK = aSide; vSeam = aSeam; vLoc = position;",colorVertex:"vColor.xyz *= mix(vec3(1.0), instanceColor.xyz, aPaint);",fHead:"varying vec2 vRM; varying float vPaintK; varying float vSideK; varying vec3 vSeam; varying vec3 vLoc;",color:`{
      // door shut lines on the painted sides
      float fwx = max(fwidth(vLoc.x), 1e-4);
      float sl = 0.0;
      vec3 dd = abs(vec3(vLoc.x) - vSeam);
      sl = 1.0 - smoothstep(0.004, 0.004 + fwx, min(dd.x, min(dd.y, dd.z)));
      sl *= vSideK * step(0.36, vLoc.y) * (1.0 - smoothstep(0.012, 0.045, fwx));
      diffuseColor.rgb *= 1.0 - 0.75 * sl;
      // road grime low on the body
      diffuseColor.rgb *= mix(0.82, 1.0, smoothstep(0.25, 0.55, vLoc.y));
    }`,rough:"roughnessFactor = vRM.x;",metal:"metalnessFactor = vRM.y;"}),t.shadowSide=Tt,a){const s=t.onBeforeCompile;t.onBeforeCompile=(r,l)=>{s(r,l),r.fragmentShader=r.fragmentShader.replace("#include <lights_physical_fragment>",no.lights_physical_fragment.replace("material.clearcoat = clearcoat;","material.clearcoat = clearcoat * vPaintK;"))}}return t}function oe(e,o,{r:a=.6,m:t=0,emit:s=0,paint:r=0}={}){e=e.index?e.toNonIndexed():e;for(const h of Object.keys(e.attributes))h!=="position"&&h!=="normal"&&e.deleteAttribute(h);const l=e.attributes.position.count,c=new Re(o),p=new Float32Array(l*3),f=new Float32Array(l*2);for(let h=0;h<l;h++)p[h*3]=c.r,p[h*3+1]=c.g,p[h*3+2]=c.b,f[h*2]=a,f[h*2+1]=t;return e.setAttribute("color",new ie(p,3)),e.setAttribute("aRM",new ie(f,2)),e.setAttribute("aEmit",new ie(new Float32Array(l).fill(s),1)),e.setAttribute("aPaint",new ie(new Float32Array(l).fill(r),1)),e}const Fe=(e,o,a,t,s,r)=>new po(e,o,a).translate(t,s,r),Pe=(e,o,a,t,s,r,l)=>new Ne(o,e,a,t).translate(s,r+a/2,l);function Aa(e){const o=new tt({vertexColors:!0,roughness:.6,metalness:0});return o.shadowSide=Tt,ot(o,{key:"prop"+e,vHead:"attribute vec2 aRM; attribute float aEmit; varying vec2 vRM; varying float vEmit;",vMain:"vRM = aRM; vEmit = aEmit;",fHead:"varying vec2 vRM; varying float vEmit;",rough:"roughnessFactor = vRM.x;",metal:"metalnessFactor = vRM.y;",emissive:"totalEmissiveRadiance += vColor.rgb * vEmit;"})}function Ta(e){const o="#2A302E",a=e?10:7,t=[oe(Pe(.2,.2,.06,a,0,-.04,0),o,{r:.6,m:.5}),oe(Pe(.15,.12,.6,a,0,-.05,0),o,{r:.5,m:.55}),oe(Pe(.085,.055,7.1,e?8:6,0,.55,0),o,{r:.42,m:.6})],s=new Zo(new de(0,7.45,0),new de(.05,8.05,0),new de(1.35,7.95,0));return t.push(oe(new Qo(s,e?10:6,.04,6,!1),o,{r:.42,m:.6})),t.push(oe(new Ne(.2,.3,.13,12).scale(1.5,1,1).translate(1.55,7.9,0),o,{r:.38,m:.65})),t.push(oe(new Ne(.26,.26,.02,12).scale(1.45,1,1).translate(1.55,7.83,0),"#D9D2C2",{r:.2})),qe(t,!1)}function Ca(){const e="#7E5E3E",o="#262B29",a=[];for(let t=0;t<4;t++)a.push(oe(Fe(1.8,.035,.09,0,.44,-.2+t*.12),t%2?e:"#7A5A3B",{r:.78}));for(let t=0;t<3;t++)a.push(oe(Fe(1.8,.09,.03,0,0,0).rotateX(-.22).translate(0,.6+t*.13,-.27-t*.03),e,{r:.78}));for(const t of[-.75,.75])a.push(oe(Fe(.06,.5,.06,t,.19,.12),o,{r:.5,m:.5})),a.push(oe(Fe(.06,.92,.06,t,.4,-.25),o,{r:.5,m:.5})),a.push(oe(Fe(.12,.02,.5,t,0,-.06),o,{r:.55,m:.45})),a.push(oe(Fe(.05,.05,.5,t,.42,-.04),o,{r:.5,m:.5})),a.push(oe(Fe(.05,.04,.42,t,.68,-.1),o,{r:.5,m:.5}));return qe(a,!1)}function Na(){const e="#2D4237";return qe([oe(Pe(.035,.035,1.01,6,0,-.06,-.26),"#2A2E2C",{r:.5,m:.5}),oe(Pe(.07,.07,.04,8,0,-.02,-.26),"#2A2E2C",{r:.55,m:.45}),oe(new Ne(.21,.19,.62,12,1,!0).translate(0,.62,-.02),e,{r:.45,m:.4}),oe(new Ne(.19,.19,.02,12).translate(0,.32,-.02),e,{r:.45,m:.4}),oe(new fo(.21,.018,5,14).rotateX(Math.PI/2).translate(0,.93,-.02),"#3A3F3C",{r:.4,m:.6})],!1)}function Da(){return qe([oe(Pe(.085,.07,.86,10,0,-.02,0),"#1E3229",{r:.42,m:.55}),oe(new Xo(.075,10,6,0,Math.PI*2,0,Math.PI/2).translate(0,.84,0),"#1E3229",{r:.42,m:.55}),oe(Pe(.09,.09,.035,10,0,.66,0),"#9C8455",{r:.35,m:.85}),oe(Pe(.11,.11,.05,10,0,-.02,0),"#1E3229",{r:.5,m:.5})],!1)}async function Pa({list:e,cars:o,quality:a,keep:t,origin:s=null,near:r=30,pause:l=()=>Promise.resolve()}){const c=a==="high",p=new Qe;p.name="ground-props";const f=new de(0,1,0),h=new Yo,M=new Se,m=new de(1,1,1),u=new de,v=[],g={},z=[],T=y=>s?Math.hypot(y.x-s.x,y.z-s.z):0,S=y=>y.slice().sort((H,C)=>T(H)-T(C)),R=(y,H)=>{y.userData.n=H.length,y.userData.nIn=H.filter(C=>T(C)<r).length},B={lamp:.25,bench:1,bin:.3,bollard:.12},F={lamp:8,bench:.9,bin:1,bollard:.9},L={lamp:()=>Ta(c),bench:Ca,bin:Na,bollard:Da},D=Aa(a);for(const y of Object.keys(L)){const H=S(e.filter(N=>N.type===y&&t(N.x,N.z,B[y]+(y==="lamp"?1.2:0),F[y])));if(g[y]=H.length,!H.length)continue;const C=new pt(L[y](),D,H.length);H.forEach((N,te)=>{C.setMatrixAt(te,M.compose(u.set(N.x,N.y||0,N.z),h.setFromAxisAngle(f,N.a||0),m));const x=B[y]+.15,P=N.x,K=N.z;v.push({pts:[[P-x,K-x],[P+x,K-x],[P+x,K+x],[P-x,K+x]],h:F[y],kind:y})}),C.castShadow=!0,C.receiveShadow=!0,C.computeBoundingSphere(),C.name="ground-"+y,R(C,H),p.add(C),z.push(C)}const E=[[],[],[]];for(const y of S(o))t(y.x,y.z,2.4,1.6)&&E[y.v%3].push(y);const Y=ka({},a),J=new Re;for(const[y,H]of E.entries()){if(!H.length)continue;await l();const C=new pt(Sa(lt[y],a),Y,H.length);H.forEach((N,te)=>{C.setMatrixAt(te,M.compose(u.set(N.x,N.y||0,N.z),h.setFromAxisAngle(f,N.a),m)),C.setColorAt(te,J.set(Math.hypot(N.x,N.z)<25?Jt[Math.floor(N.c*Jt.length)]:No(za,N.c)));const x=lt[y].L/2+.2,P=lt[y].W/2+.2,K=Math.cos(N.a),_=Math.sin(N.a);v.push({pts:[[-x,-P],[x,-P],[x,P],[-x,P]].map(([i,d])=>[+(N.x+i*K+d*_).toFixed(2),+(N.z-i*_+d*K).toFixed(2)]),h:lt[y].roof,kind:"car"})}),C.castShadow=!0,C.receiveShadow=!0,C.computeBoundingSphere(),C.name="ground-cars",R(C,H),p.add(C),z.push(C)}return g.cars=E.reduce((y,H)=>y+H.length,0),{group:p,meshes:z,colliders:v,info:g,dispose(){p.traverse(y=>{y.isInstancedMesh&&(y.geometry.dispose(),y.dispose())}),D.dispose(),Y.dispose()}}}const Ra=40;function Ba(e,o=3e3){const a=[],t=new de,s=new de,r=ft.camera.roofs,l=ft.camera.threshold,c=Ro(e);for(const p of[0,1]){let f;try{f=ko(Bo({frame:e,room:c},p))}catch{return eo(e)}for(let h=0;h<=o;h++)f.at(r+(l-r)*h/o,t,s),t.y<Ra&&Number.isFinite(t.x)&&a.push(t.clone())}return a.length?a:eo(e)}function eo(e){const o=(Fo||[]).map(t=>e.local(...t)),a=[];for(let t=0;t<o.length-1;t++)for(let s=0;s<20;s++)a.push(o[t].clone().lerp(o[t+1],s/20));return o.length&&a.push(o[o.length-1]),a}function Fa(e){const o=e.local,a=o(...Do),t=o(0,1.3,.3),s=[];for(const r of Po.filter(l=>l.pos[1]<10)){const l=o(...r.pos);s.push([l,r.look==="cross"?a:o(...r.look)],[l,a],[l,t])}return s}function La(e,o=[]){const t=new Map,s=(l,c)=>l*100003+c;for(const l of e){const c=s(Math.floor(l.x/10),Math.floor(l.z/10));t.has(c)||t.set(c,[]),t.get(c).push(l)}function r(l,c,p,f){const h=Math.floor((l-p)/10),M=Math.floor((l+p)/10),m=Math.floor((c-p)/10),u=Math.floor((c+p)/10);for(let v=h;v<=M;v++)for(let g=m;g<=u;g++)for(const z of t.get(s(v,g))||[])f(z)}return{pts:e,lines:o,hits(l,c,p,f,h=1.2){let M=!1;return r(l,c,p+h,m=>{!M&&m.y<=f&&Math.hypot(m.x-l,m.z-c)<p+h&&(M=!0)}),M},hitsBand(l,c,p,f,h,M=1.2){let m=!1;return r(l,c,p+M,u=>{!m&&u.y>=f&&u.y<=h&&Math.hypot(u.x-l,u.z-c)<p+M&&(m=!0)}),m},onSight(l,c,p){return o.some(([f,h])=>{const M=h.x-f.x,m=h.z-f.z,u=M*M+m*m||1,v=Math.max(0,Math.min(1,((l-f.x)*M+(c-f.z)*m)/u));return Math.hypot(l-f.x-v*M,c-f.z-v*m)<1.6+p})},gap(l,c,p,f,h=30){const M={d:1/0,ux:0,uz:0};return r(l,c,h,m=>{if(m.y<p||m.y>f)return;const u=l-m.x,v=c-m.z,g=Math.hypot(u,v);g<M.d&&Object.assign(M,{d:g,ux:u/(g||1),uz:v/(g||1)})}),M}}}function Ka(){const e=Ko(),o=so.veranda;return[e.all,e.ramp,Lo(),[Ue(o.s[0],o.p[0]),Ue(o.s[1],o.p[0]),Ue(o.s[1],o.p[1]),Ue(o.s[0],o.p[1])]]}const Ga={realign:[{a:[-36.1,1.5],b:[123.2,41.8],width:7,centre:[[-8,11.4],[24,11.4],[60,9.58]],edgeLines:!0}]},Mt=e=>new URL(`./assets/${e}`,document.baseURI).href,to=[120,270],Ha=170,oo=3;function yo(){const e=new Worker(new URL(""+new URL("ground-worker-2PZlvfHQ.js",import.meta.url).href,import.meta.url),{type:"module"}),o=new Promise((u,v)=>{e.onmessage=g=>{e.terminate(),g.data?.error?v(new Error(g.data.error)):u(g.data)},e.onerror=g=>{e.terminate(),v(new Error(g.message||"ground worker"))}}),a=Mt("geo/parma-model.json"),t=typeof window<"u"?window.__geoText:null;t?t.then(u=>e.postMessage({text:u}),()=>e.postMessage({url:a})):e.postMessage({url:a});const s=fetch(Mt("ground/ground.json")).then(u=>{if(!u.ok)throw new Error(`ground.json ${u.status}`);return u.json()}),r=(u,v="ground")=>fetch(Mt(`${v}/${u}`)).then(g=>{if(!g.ok)throw new Error(`${u} ${g.status}`);return g.blob()}).then(g=>createImageBitmap(g,{premultiplyAlpha:"none",colorSpaceConversion:"none"})),l=r("shade.png"),c=r("detail.png"),p=r("needles.png"),f=r("noise.png"),h=Vo()==="high"?"":"-m",M=Object.fromEntries(["bark-pine","bark-pine-n","bark-celtis","bark-celtis-n","leaves-celtis"].map(u=>[u,r(`${u}${u.endsWith("-n")?"-m":h}.webp`)])),m={hex:r(`hex${h}.webp`,"pharmacy"),grass:r(`grass${h}.webp`,"pharmacy")};return[o,s,l,c,p,f,...Object.values(M),...Object.values(m)].forEach(u=>u.catch(()=>{})),{street:o,manifest:s,shade:l,detail:c,needles:p,noise:f,trees:M,section:m}}let vt=null;try{typeof document<"u"&&typeof Worker<"u"&&(vt=yo())}catch{vt=null}const ao=6;function Va(e,o){const a=Ga.realign?.[0];if(!a)return e;const t=[a.a,...a.centre.map(([u,v])=>Ue(u,v)),a.b],[s,r]=a.a,[l,c]=a.b,p=Math.hypot(l-s,c-r),f=(l-s)/p,h=(c-r)/p,M=(u,v)=>{let g=null;for(let z=0;z<t.length-1;z++){const[T,S]=t[z],[R,B]=t[z+1],F=Math.hypot(R-T,B-S),L=(R-T)/F,D=(B-S)/F,E=Math.max(0,Math.min(F,(u-T)*L+(v-S)*D)),Y=T+L*E,J=S+D*E,y=Math.hypot(u-Y,v-J);(!g||y<g.d)&&(g={d:y,x:Y,z:J,ux:L,uz:D})}return g},m=(u,v)=>o.every(g=>Math.hypot(g.x-u,g.z-v)>1.3);return e.flatMap(u=>{const v=(u.x-s)*f+(u.z-r)*h,g=-(u.x-s)*h+(u.z-r)*f;if(v<0||v>p||Math.abs(g)>ao/2+7)return[u];const z=(Math.sign(g)||1)*(a.width/2+Math.max(.3,Math.abs(g)-ao/2)),T=M(u.x,u.z);for(const S of[0,1,-1,2,-2,3,-3]){const R=T.x+T.ux*S-T.uz*z,B=T.z+T.uz*S+T.ux*z;if(m(R,B))return[{...u,x:R,z:B}]}return[]})}function St(e,o){const a=e?new ut(e):new _e(new Uint8Array(o),1,1);return a.flipY=!1,a.colorSpace=Ct,a.minFilter=mt,a.magFilter=mt,a.generateMipmaps=!1,a.needsUpdate=!0,a}async function Wa(e){const{frame:o,quality:a}=e,t=a==="high",s=performance.now(),r={},l=n=>{r[n]=Math.round(performance.now()-s)},c=vt||yo();vt=null;const p=new Qe;p.name="ground";const f=()=>new Promise(n=>setTimeout(n,0)),[h,M,m,u,v]=await Promise.all([c.manifest,c.shade.catch(()=>null),c.detail.catch(()=>null),c.needles.catch(()=>null),c.noise.catch(()=>null)]);l("data");const g=St(M,[0,0,0,255]),z=St(m,[0,255,0,255]),T=St(v,[128,128,0,255]);T.wrapS=T.wrapT=bt,T.minFilter=it,T.generateMipmaps=!!v,T.anisotropy=4;const S=u?new ut(u):new _e(new Uint8Array([102,120,64,255]),1,1);S.flipY=!1,S.colorSpace=Ae,S.minFilter=it,S.magFilter=mt,S.generateMipmaps=!!u,S.anisotropy=4,S.needsUpdate=!0;const R=Object.fromEntries(await Promise.all(Object.entries(c.trees||{}).map(([n,w])=>w.then(U=>[n,U],()=>[n,null])))),B=(n,w,U)=>{const W=R[n];if(!W)return null;const I=new ut(W);return I.name=`ground-${n}`,I.flipY=!1,I.colorSpace=w?Ae:Ct,U&&(I.wrapS=I.wrapT=bt),I.minFilter=it,I.magFilter=mt,I.generateMipmaps=!0,I.anisotropy=t?8:4,I.needsUpdate=!0,I},F={barkP:B("bark-pine",!0,!0),barkPN:B("bark-pine-n",!1,!0),barkC:B("bark-celtis",!0,!0),barkCN:B("bark-celtis-n",!1,!0),leaves:B("leaves-celtis",!0,!1)};F.leavesSize=R["leaves-celtis"]?.width||1024;for(const n of[F.barkP,F.barkPN,F.barkC,F.barkCN,F.leaves])n&&e.renderer?.initTexture?.(n);const L=Object.fromEntries(await Promise.all(Object.entries(c.section||{}).map(([n,w])=>w.then(U=>[n,U],()=>[n,null])))),D=n=>{if(!n)return null;const w=new ut(n);return w.flipY=!1,w.colorSpace=Ae,w.wrapS=w.wrapT=bt,w.minFilter=it,w.generateMipmaps=!0,w.anisotropy=t?8:4,w.needsUpdate=!0,w},E={hex:D(L.hex),grass:D(L.grass),size:{hex:[1,1.03923],grass:[1.2,1.2]}};for(const n of[E.hex,E.grass])n&&e.renderer?.initTexture?.(n);const Y=h.shade,J=new ct(Y.x0,Y.z0,1/(Y.width*Y.mpp),1/(Y.height*Y.mpp)),y={value:0},H=Go(e,{shadeTex:g,shadeRect:J}),C=Ho(e);p.add(H.mesh,C.mesh),l("terrain"),await f();const N=La(Ba(o),Fa(o));l("path");const te=t?4:3,x=t?55:34,P=wa(y,S,h.needles?.mean,T,F),K=ya(P,a),_=ba(S,P.uLeaves.value),i=[],d=[];let b=0;const k=Ka(),G=(n,w,U=0)=>!k.some(W=>It(n,w,W))&&!k.some(W=>U>0&&[[U,0],[-U,0],[0,U],[0,-U]].some(([I,re])=>It(n+I,w+re,W)));h.trees=h.trees.filter(n=>G(n.x,n.z,.6)).concat(so.street.trees.map((n,w)=>{const[U,W]=Ue(n.s,n.p);return{x:U,z:W,h:16.5-w*1.2,r:5.4-w*.3,lean:.03,dir:3.3+w,rot:1.1+w*2.1,v:.5,tint:"#7E7A62",kind:"leaf",photo:0,real:!0}})),h.props=Va(h.props||[],h.trees).filter(n=>G(n.x,n.z,.3));for(const n of h.trees){const w=n.kind==="leaf",U=w?et:De,W=n.h*(w?.33:.6),I=Math.tan(n.lean),re=Math.sin(n.dir),j=Math.cos(n.dir);let le=!1;for(let Me=0;Me<=W&&!le;Me+=1.5)le=N.hitsBand(n.x+re*I*Me,n.z+j*I*Me,.45,Me-1,Me+1.6);if(le){d.push([n.x,n.z]);continue}const me=n.h*.85,fe=w?1:1+1/U.r,ae=N.gap(n.x,n.z,n.h*(w?.3:.6)-1.5,n.h+1.5);let{r:q,lean:pe,dir:ce}=n;const st=Math.sin(ce)*Math.tan(pe)*me,nt=Math.cos(ce)*Math.tan(pe)*me,Lt=ae.d+st*ae.ux+nt*ae.uz-q*fe;if(Lt<oo&&!n.real){const Me=oo-Lt,Kt=Math.min(Me/fe,q*.3),Gt=Me-Kt*fe,Ht=st+ae.ux*Gt,Vt=nt+ae.uz*Gt;pe=Math.atan(Math.hypot(Ht,Vt)/me),ce=Math.atan2(Ht,Vt),q-=Kt,b++}i.push({...n,r:q,lean:pe,dir:ce,leaf:w,canon:U,variant:w?0:Math.min(te-1,Math.floor(n.v*te))})}const X=i.filter(n=>!n.leaf),$=new Re,V={},O={h:0,s:0,l:0};for(const n of X)$.set(n.tint).getHSL(V,Ae),O.h+=V.h/X.length,O.s+=V.s/X.length,O.l+=V.l/X.length;function Z(n,w){if(n.leaf)return w.setRGB(1,1,1);w.set(n.tint).getHSL(V,Ae);const U=O.h+(V.h-O.h)*.35,W=O.s+(V.s-O.s)*.35,I=O.l+(V.l-O.l)*.5;return w.setHSL(U+(.2-U)*.25,Math.min(.36,W*1.05+.03),I*.98,Ae)}const ne=new Qe;ne.name="ground-pines";const Q=new Qe;Q.name="ground-pine-casters";const se=[],ee=new Se,xe=[...Array.from({length:te},(n,w)=>({leaf:!1,v:w,seed:11+w*7})),{leaf:!0,v:0,seed:5}];for(const n of xe){const w=i.filter(q=>q.leaf===n.leaf&&q.variant===n.v);if(!w.length)continue;const U=n.leaf?ga:va,W=n.leaf?et:De,I=n.leaf?`leaf-${n.v}`:`${n.v}`;await f();const re=U(n.seed,"hi",a);await f();const j=U(n.seed,"lo",a),le=(q,pe)=>{const ce=new pt(q,K,w.length);return ce.name=pe,ce.castShadow=!1,ce.receiveShadow=!0,ce.renderOrder=1,ce.frustumCulled=!1,ce.count=0,w.forEach((st,nt)=>ce.setColorAt(nt,Z(st,$))),ne.add(ce),ce},me=le(re,`ground-pines-${I}`),fe=le(j,`ground-pines-${I}-far`),ae=new pt(re,K,w.length);ae.name=`ground-pines-${I}-shadow`,ae.castShadow=!0,ae.customDepthMaterial=_,ae.frustumCulled=!1,w.forEach((q,pe)=>ae.setMatrixAt(pe,Xt(q,ee,W))),ae.userData.n=w.length,ae.onBeforeRender=()=>{ae.count=0},ae.onBeforeShadow=()=>{ae.count=ae.userData.n},Q.add(ae),w.forEach((q,pe)=>{q.i=pe,q.matrix=Xt(q,new Se,W),q.color=Z(q,new Re);const ce=Math.tan(q.lean)*q.h*.85;q.ox=Math.sin(q.dir)*ce,q.oz=Math.cos(q.dir)*ce,q.bound=Math.hypot(q.r*1.25,q.h*.52)+1}),se.push({list:w,near:me,far:fe,cast:ae,nearList:[],farList:[]})}Q.visible=!1,p.add(ne,Q),l("pines"),await f();const Ge=(n,w,U,W)=>!N.hits(n,w,U,W+.5)&&!N.onSight(n,w,U),ve=await Pa({list:h.props||[],cars:h.cars||[],quality:a,keep:Ge,origin:o.D,pause:f});for(const n of ve.meshes)n.userData.cam=n.count,n.onBeforeRender=()=>{n.count=n.userData.cam},n.onBeforeShadow=()=>{n.count=n.userData.n};p.add(ve.group),l("props");const we=ra({shadeTex:g,shadeRect:J,detailTex:z,noiseTex:T,frame:o,ortho:e.ortho,tiles:E});let ge=null,Ye=null;const ze=c.street.then(n=>{ge=da(n,we,a),ge.street.visible=ge.marks.visible=!1,p.add(ge.street,ge.marks),Ye=n.stats}).catch(n=>console.warn("[ground] superfici stradali non disponibili",n));let be=null,at=-1;function bo(){const n=e.scene;!n||n.children.length===at||(at=n.children.length,be=null,n.traverse(w=>{!be&&w.isDirectionalLight&&w.castShadow&&(be=w)}))}const Dt=new Jo,Pt=new Se,He=new ro,Ve=o.fp.reduce((n,[w,U])=>[n[0]+w/o.fp.length,n[1]+U/o.fp.length],[0,0]),Rt=[o.N.z,-o.N.x],Bt=(n,w,U)=>Math.max((n-Ve[0])*o.N.x+(w-Ve[1])*o.N.z,(n-Ve[0])*Rt[0]+(w-Ve[1])*Rt[1])>4-U&&Math.hypot(n-Ve[0],w-Ve[1])<70+U;let xt="",yt=!1;function wo(n){const w=n.position;n.updateMatrixWorld(),Pt.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),Dt.setFromProjectionMatrix(Pt);let U=yt?"s":"";for(const W of se){W.nearList.length=0,W.farList.length=0;let I=0,re=0;for(const j of W.list)He.center.set(j.x+j.ox,j.h*.62,j.z+j.oz),He.radius=j.bound,!(!Dt.intersectsSphere(He)||yt&&!Bt(He.center.x,He.center.z,He.radius))&&(j.d=Math.hypot(j.x-w.x,j.z-w.z,w.y*.5),j.d<x?(W.nearList.push(j),I=Math.imul(I^j.i+1,2654435761)+j.i|0):(W.farList.push(j),re=Math.imul(re^j.i+1,2246822507)+j.i|0));U+=W.nearList.length+","+W.farList.length+","+I+","+re+";"}if(U!==xt){xt=U;for(const W of se)for(const[I,re]of[[W.near,W.nearList],[W.far,W.farList]])re.sort((j,le)=>j.d-le.d),re.forEach((j,le)=>{I.setMatrixAt(le,j.matrix),I.setColorAt(le,j.color)}),I.count=re.length,re.length&&(I.instanceMatrix.needsUpdate=!0,I.instanceColor.needsUpdate=!0)}}function Mo(){for(const n of se)for(const w of[n.near,n.far])w.setMatrixAt(0,n.list[0].matrix),w.setColorAt(0,n.list[0].color),w.count=1,w.instanceMatrix.needsUpdate=!0,w.instanceColor.needsUpdate=!0;xt=""}function So(n){const w=n.camera||e.camera,U=w.position,W=n.p??0,I=Math.max(0,U.y);y.value=n.elapsed??0,C.uniforms.uTime.value=y.value,bo();const re=be?.shadow?.map;we.uSMOn.value=re&&e.renderer?.shadowMap?.enabled?1:0,we.uSMOn.value&&we.uSMMat.value.copy(be.shadow.matrix),C.uniforms.uHalf.value=ea.clamp(I*.0042,3.5,19),C.mesh.visible=C.uniforms.uOpacity.value>.002&&I>40;const j=Ao([ft.camera.threshold,ft.camera.inside],W)>.99,le=1-rt(to[0],to[1],I);P.uFade.value=le,we.uFade.value=rt(.45,.95,le),H.uniforms.uTreeFade.value=rt(.55,.95,le);const me=le>.001,fe=!!e.warming;if(ne.visible=me||fe,yt=j,me?wo(w):fe&&Mo(),ge){ge.street.visible=me||fe,ge.marks.visible=me&&!j||fe;for(const q of ge.tiles){const pe=q.geometry.boundingSphere;q.visible=!j||Bt(pe.center.x,pe.center.z,pe.radius)}}const ae=I<Ha;for(const q of ve.meshes)q.userData.cam=j?q.userData.nIn:q.userData.n;ve.group.visible=ae||fe,H.uniforms.uCheap.value=j?1:0,H.uniforms.uLow.value=1-rt(25,45,I)}const Ft=i.filter(n=>Math.hypot(n.x-o.D.x,n.z-o.D.z)<250).map(n=>{const w=(n.leaf?.25*n.r/et.r:.37*n.r/De.r)*1.12+.1,U=Math.tan(n.lean)*3.5,W=Math.sin(n.dir),I=Math.cos(n.dir),re=-I,j=W;return{pts:[[-w,-w],[U+w,-w],[U+w,w],[-w,w]].map(([me,fe])=>[+(n.x+W*me+re*fe).toFixed(2),+(n.z+I*me+j*fe).toFixed(2)]),h:+(n.h*(n.leaf?.33:.58)).toFixed(1),kind:"pine"}}).concat(ve.colliders),zo={get street(){return Ye},trees:{data:h.trees.length,kept:i.length,pines:X.length,deciduous:i.length-X.length,onPath:d.length,pruned:b,variants:se.length,rejected:d},path:{samples:N.pts.length,sightLines:N.lines.length},props:ve.info,colliders:Ft.length,timing:r};return l("build"),{object3d:p,ready:ze,update:So,colliders:Ft,info:zo,setRouteOpacity(n){C.uniforms.uOpacity.value=Math.max(0,Math.min(1,n))},dispose(){H.dispose(),C.dispose(),ve.dispose();for(const n of se)n.near.geometry.dispose(),n.far.geometry.dispose(),n.near.dispose(),n.far.dispose(),n.cast.dispose();K.dispose(),_.dispose(),ge?.dispose(),g.dispose(),M?.close?.(),z.dispose(),m?.close?.(),T.dispose(),v?.close?.(),S.dispose(),u?.close?.();for(const n of["uLeaves","uBarkP","uBarkPN","uBarkC","uBarkCN"])P[n].value.dispose();Object.values(R).forEach(n=>n?.close?.()),we.uHex.value.dispose(),we.uGrid.value.dispose(),Object.values(L).forEach(n=>n?.close?.()),p.removeFromParent()}}}export{Wa as build};
