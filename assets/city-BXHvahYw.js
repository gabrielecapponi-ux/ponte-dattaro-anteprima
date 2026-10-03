import{S as Fe,P as He}from"./journey-scene-Y1zu0Tze.js";import"./sito-CCMHQ30Q.js";import"./common-BJAAWmJM.js";import"./three-DC_DBYxh.js";const Ne=`
float cityHash(vec2 p) { p = fract(p * vec2(0.1031, 0.1030)); p += dot(p, p.yx + 33.33); return fract((p.x + p.y) * p.x); }
float cityNoise(vec2 p) {
  vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(cityHash(i), cityHash(i + vec2(1, 0)), f.x), mix(cityHash(i + vec2(0, 1)), cityHash(i + 1.0), f.x), f.y);
}
// Box-filtered pulse: coverage of [a, b] by a pixel of width w centred on x.
float cityBand(float x, float a, float b, float w) { return clamp((min(x + 0.5 * w, b) - max(x - 0.5 * w, a)) / w, 0.0, 1.0); }
vec3 cityLin(vec3 c) { return c * c * (0.3 + 0.7 * c); }   // cheap sRGB -> linear (within ~2%)
`,Te=`
attribute float aU;
attribute vec4 aF;
attribute vec4 aC;
varying float vU;
varying vec4 vF;
varying vec4 vC;
varying vec3 vCityPos;
varying vec3 vCityN;
`,ze=`
vU = aU; vF = aF; vC = aC;
vCityPos = (modelMatrix * vec4(transformed, 1.0)).xyz;
vCityN = normalize(mat3(modelMatrix) * objectNormal);
`,qe=`
varying float vU;
varying vec4 vF;
varying vec4 vC;
varying vec3 vCityPos;
varying vec3 vCityN;
uniform vec3 uCitySun;      // towards the sun (SUN.dir)
uniform float uCityGain;    // wall albedo calibration against the photo
uniform float uCitySat;     // plaster saturation (the photo is greyer than paint chips)
uniform float uCityDetail;  // quality tier: 1 high, < 1 the facade patterns fade sooner
uniform sampler2D uCitySigns;   // lettering of the real neighbours' shop signs, one row each
uniform float uCitySignRows;
${Ne}
vec3 cityEmit = vec3(0.0);   // light of the shop interiors and their reflections (emissive)
// An opening b = (x0, y0, x1, y1) (facade metres) seen at p on the wall plane, along the view ray
// that moves sl metres across the facade per metre of depth: where the ray meets the back plane at
// depth dep, or the reveal it hits first. Returns the hit point (xy), the part (z: 0 back plane,
// 1 jamb at x0, 2 jamb at x1, 3 bottom (inner sill), 4 top (lintel)) and its depth (w).
vec4 cityRecess(vec2 p, vec2 sl, vec4 b, float dep) {
  vec2 g = p + sl * dep;
  float t = 1.0, side = 0.0, k;
  if (g.x < b.x) { k = (b.x - p.x) / min(sl.x * dep, -1e-5); if (k < t) { t = k; side = 1.0; } }
  if (g.x > b.z) { k = (b.z - p.x) / max(sl.x * dep, 1e-5); if (k < t) { t = k; side = 2.0; } }
  if (g.y < b.y) { k = (b.y - p.y) / min(sl.y * dep, -1e-5); if (k < t) { t = k; side = 3.0; } }
  if (g.y > b.w) { k = (b.w - p.y) / max(sl.y * dep, 1e-5); if (k < t) { t = k; side = 4.0; } }
  t = clamp(t, 0.0, 1.0);
  return vec4(p + sl * (dep * t), side, dep * t);
}
// Shading of an opening seen in depth (cityRecess): the colour, direct-sun factor and occlusion of
// the reveal it hits (jambs and lintel in the wall's reveal colour, the bottom in the sill colour)
// mixed with the back plane by its coverage (box-filtered: no stair steps along the reveal edge).
// back: albedo of the back plane at the hit point; bSun: its own sun factor (1 = like the wall).
// depS: the real depth of the back plane, for its shadow and occlusion (dep, the depth seen, fades
// out with distance; the shadow stays).
void cityReveal(vec4 r, vec2 g, vec4 b, float dep, float depS, vec3 back, float bSun, vec3 revC, vec3 sillC,
                float sN, float sT, float sY, float rise, float run, float lit, float wu, float wy,
                out vec3 col, out float sunF, out float occ, out float cov) {
  cov = cityBand(g.x, b.x, b.z, wu) * cityBand(g.y, b.y, b.w, wy);
  // the back plane: shaded by the lintel and the sun-side jamb (the sun ray from it must leave
  // through the opening)
  float shB = 1.0 - cityBand(g.x + depS * run, b.x, b.z, wu) * cityBand(g.y + depS * rise, b.y - 9.0, b.w, wy);
  float sunB = bSun * (1.0 - lit * shB);
  float occB = mix(1.0, 0.72, smoothstep(0.0, 0.3, depS));
  // the reveal (point r.xy at depth r.w)
  vec3 rc = revC; float rs = 0.0, ro = mix(0.96, 0.7, r.w / max(dep, 1e-3));
  float inLight = cityBand(r.y + r.w * rise, b.y - 9.0, b.w, wy) * cityBand(r.x + r.w * run, b.x - 0.01, b.z + 0.01, wu);
  if (r.z < 2.5) rs = (r.z < 1.5 ? max(sT, 0.0) : max(-sT, 0.0)) / max(sN, 0.15) * inLight;
  else if (r.z < 3.5) { rc = sillC; rs = sY / max(sN, 0.15) * inLight; ro = min(1.0, ro + 0.1); }
  else { rc = revC * 0.92; ro *= 0.8; }
  rs = min(rs, 2.5) * lit;
  col = mix(rc, back, cov); sunF = mix(rs, sunB, cov); occ = mix(ro, occB, cov);
}

// Facade at (u, y): albedo (linear), roughness, ambient occlusion and the
// fraction of direct sun not blocked by reveals, sills, balconies and eaves.
void cityFacade(out vec3 albedo, out float rough, out float ao, out float sunK) {
  float u = vU, y = vCityPos.y;
  float wu = max(fwidth(u), 1e-4) / uCityDetail, wy = max(fwidth(y), 1e-4) / uCityDetail;
  float cw = vF.x * 0.01, gH = vF.y * 0.01, fh = max(vF.z * 0.01, 0.5);
  float bits = vF.w;
  float nF = mod(bits, 32.0); bits = floor(bits / 32.0);
  float style = mod(bits, 16.0); bits = floor(bits / 16.0);
  float ground = mod(bits, 4.0); bits = floor(bits / 4.0);
  float shut = mod(bits, 4.0); bits = floor(bits / 4.0);
  float balc = mod(bits, 2.0); bits = floor(bits / 2.0);
  float flatTop = mod(bits, 2.0); bits = floor(bits / 2.0);
  float realBalc = mod(bits, 2.0);
  float bseed = vC.a;
  vec3 N = normalize(vCityN);
  albedo = cityLin(vC.rgb); rough = 0.93; ao = 1.0; sunK = 1.0;

  /* near detail parts (city-worker.js: own index stream, drawn from close by) */
  if (style > 10.5) {
    float wv = max(wu, wy);
    if (style < 11.5) {
      // window sill: marble / stone, a faint vein, the underside in its own shadow
      float vein = cityNoise(vec2(u * 7.0 + y * 3.0, y * 25.0) + bseed * 9.0);
      albedo *= 0.95 + 0.08 * mix(vein, 0.5, smoothstep(0.02, 0.06, wv));
      rough = 0.55; ao = N.y < -0.5 ? 0.55 : 0.95;
      return;
    }
    if (style < 12.5) {
      // downpipe or gutter: sheet metal or copper, darker inside the gutter, streaks of oxide
      float copper = smoothstep(0.08, 0.16, vC.r - vC.b);
      float streak = mix(cityNoise(vec2(u * 9.0, y * 0.6) + bseed * 5.0), 0.5, smoothstep(0.02, 0.08, wv));
      albedo *= 0.88 + 0.16 * streak;
      albedo = mix(albedo, albedo * vec3(0.78, 0.95, 0.9), copper * 0.35 * smoothstep(0.55, 0.8, streak));
      rough = mix(0.45, 0.6, copper);
      if (N.y > 0.5) { albedo *= 0.35; ao = 0.5; }
      return;
    }
    // shop sign panel: lettering on its front face (vU 0..1 left to right), plain edges
    rough = 0.5;
    if (vU > -0.5) {
      float v = clamp((y - gH) / fh, 0.0, 1.0);
      vec2 st = vec2(clamp(vU, 0.0, 1.0), 1.0 - (floor(cw + 0.5) + 1.0 - v) / uCitySignRows);
      albedo = texture2D(uCitySigns, st).rgb;   // sRGB texture: linear already
      rough = 0.35;
      ao = 0.85 + 0.15 * smoothstep(0.0, 0.12, v);
    }
    return;
  }

  vec3 wall = albedo;
  // plasters are greyed towards the photo; a colour chosen vivid on purpose (a real neighbour's
  // orange) keeps more of its saturation
  float chroma = max(vC.r, max(vC.g, vC.b)) - min(vC.r, min(vC.g, vC.b));
  wall = mix(vec3(dot(wall, vec3(0.2126, 0.7152, 0.0722))), wall, mix(uCitySat, 0.8, smoothstep(0.48, 0.62, chroma))) * uCityGain;
  vec3 T = vec3(-N.z, 0.0, N.x);                          // along u
  float sN = dot(uCitySun, N), sT = dot(uCitySun, T), sY = uCitySun.y;
  float lit = step(0.02, sN);
  // faces away from the sun: the sky fill greys and lifts the warm plasters a little (else they
  // read as brown boxes from the drone)
  float shadeF = 1.0 - smoothstep(-0.05, 0.15, sN);
  wall = mix(wall, vec3(dot(wall, vec3(0.2126, 0.7152, 0.0722))), 0.3 * shadeF) * (1.0 + 0.07 * shadeF);
  float rise = sY / max(sN, 0.12);                        // shadow drop per metre of overhang
  float run = sT / max(sN, 0.12);                         // sideways shadow drift per metre of depth
  albedo = wall; rough = 0.93; ao = 1.0; sunK = 1.0;
  // the view ray, in facade metres across (u, y) per metre of depth into the wall
  vec3 vd = normalize(vCityPos - cameraPosition);
  vec2 sl = vec2(dot(vd, T), vd.y) / max(-dot(vd, N), 0.08);

  float pn = cityNoise(vec2(u * 0.21, y * 0.13) + bseed * 61.0);
  // balconies built in 3D: concrete slab, plaster parapet or metal railing
  if (style > 7.5) {
    float yb = fract((y - gH) / fh) * fh;                 // height above the balcony floor
    if (style < 8.5) {
      // slab: concrete, a drip groove under the front edge, darker and stained underneath
      albedo = cityLin(vec3(0.74, 0.72, 0.68)) * (0.92 + 0.08 * pn);
      float under = step(N.y, -0.5);
      albedo *= mix(1.0, 0.9 + 0.1 * cityNoise(vec2(u * 1.3, vCityPos.x * 0.7 + vCityPos.z * 0.7)), under);
      rough = 0.85; ao = under > 0.5 ? 0.85 : 0.9;   // the underside sees the sunlit street
      return;
    }
    if (style < 9.5) {
      albedo = wall * (0.95 + 0.05 * pn);
      // coping on top, rain streaks down the front from its corners
      float streaks = cityNoise(vec2(u * 3.1 + bseed * 17.0, y * 0.5)) * (1.0 - smoothstep(0.0, 0.9, yb));
      albedo *= 1.0 - 0.1 * streaks * (1.0 - smoothstep(0.02, 0.06, wu));
      albedo = mix(albedo, cityLin(vec3(0.78, 0.76, 0.72)), step(0.5, vCityN.y) + cityBand(yb, 0.94, 1.2, wy));
      ao = 0.85 + 0.15 * smoothstep(0.0, 0.6, yb);
      return;
    }
    // railing: vertical bars on a handrail and a foot rail, the shaded balcony behind
    vec3 metal = cityLin(vec3(0.13, 0.13, 0.12)) * (0.9 + 0.2 * bseed);
    float bar = mix(cityBand(fract(u / 0.11) * 0.11, 0.0, 0.022, wu), 0.2, smoothstep(0.015, 0.05, wu));
    float rails = max(cityBand(yb, 0.92, 1.2, wy), cityBand(yb, -0.2, 0.07, wy));
    vec3 behind = wall * 0.42;
    albedo = mix(behind, metal, max(max(bar, rails), step(0.5, abs(vCityN.y))));
    rough = 0.5; ao = 0.8;
    return;
  }
  // eave underside (wood on old houses, plaster elsewhere) and gutter board
  if (style > 4.5 && style < 5.5) {
    albedo = flatTop > 0.5 ? cityLin(vec3(0.40, 0.29, 0.21)) * (0.9 + 0.2 * cityBand(fract(u / 0.6) * 0.6, 0.0, 0.12, wu)) : wall * 0.88;
    rough = 0.9; ao = 0.8; return;
  }
  if (style > 5.5 && style < 6.5) { albedo = cityLin(vec3(0.42, 0.29, 0.21)); rough = 0.55; return; }

  /* plaster: patches at several scales, sand grain, rising damp, run-off; all fade with distance */
  float fineFade = 1.0 - smoothstep(0.05, 0.25, max(wu, wy));
  float grainFade = 1.0 - smoothstep(0.012, 0.04, max(wu, wy));
  float pn2 = cityNoise(vec2(u * 1.7, y * 1.3) + bseed * 13.0);
  float pn3 = cityNoise(vec2(u * 0.55, y * 0.45) + bseed * 29.0);   // blotches of 1-3 m (old paint, washes)
  albedo *= 0.9 + 0.15 * pn + (0.09 * (pn2 - 0.5) + 0.1 * (pn3 - 0.5)) * fineFade;
  // sand grain of the intonaco and trowel marks (a few cm), only up close
#ifndef CITY_LITE
  if (grainFade > 0.0) {
    float gr = cityNoise(vec2(u, y) * 23.0 + bseed * 7.0) + 0.5 * cityNoise(vec2(u * 2.3, y * 0.9) * 9.0);
    albedo *= 1.0 + 0.05 * (gr - 0.75) * grainFade;
  }
#endif
  // washes: long vertical stains of rain water and dust (darker), and paler sun-faded patches
  float washFade = 1.0 - smoothstep(0.04, 0.12, max(wu, wy));   // within ~100 m
  if (washFade > 0.0) {
    float wash = cityNoise(vec2(u * 1.6 + bseed * 23.0, y * 0.16));
    albedo *= 1.0 - 0.09 * smoothstep(0.58, 0.86, wash) * washFade + 0.05 * (smoothstep(0.55, 0.8, pn3) - 0.2) * washFade;
  }
  // soot and dust along the top of the ground floor (traffic) and at the corners
  albedo *= 1.0 - 0.06 * cityBand(y, gH - 0.6, gH + 0.9, wy * 4.0) * step(0.5, nF) * fineFade;
  // plaster is never one flat coat: a slightly different tone per floor, and here and there a
  // repaired patch (about 4 x 1 floor) a few percent lighter or darker; both fade with distance
  float flr0 = floor(max(y - gH, -0.5) / fh);
  float tone = cityHash(vec2(flr0 + 3.0, bseed * 91.0)) - 0.5;
  vec2 pc = vec2(floor(u / 4.3 + bseed * 7.0), flr0);
  float patchK = step(0.84, cityHash(pc + 13.0 * bseed)) * (cityHash(pc.yx + 5.0) - 0.45);
  albedo *= 1.0 + (0.04 * tone + 0.15 * patchK) * fineFade;
  // weathering: rising damp at the base (greener in the shade), rain run-off below the eaves
  float streaks = cityNoise(vec2(u * 2.3 + bseed * 40.0, y * 0.08));
  float damp = (1.0 - smoothstep(0.35, 1.1 + 0.5 * cityNoise(vec2(u * 0.6, 3.0 + bseed)), y));
  albedo = mix(albedo, albedo * mix(vec3(0.8, 0.8, 0.78), vec3(0.74, 0.78, 0.7), shadeF), damp * 0.6);
  float top = gH + nF * fh + 0.55;                        // wall top (eaves or parapet)
  float runoff = (1.0 - smoothstep(0.0, 2.4, top - y)) * (0.4 + 0.6 * streaks);
  albedo *= 1.0 - 0.13 * runoff;
  if (style > 6.5 && style < 7.5) {
    // fair-faced brick (mattoni a vista): stretcher bond, 25 x 6.5 cm, a tone per brick, a few
    // darker burnt ones, recessed light mortar with its top edge in shadow; fades to the mean
    float ch = 0.075, row = floor(y / ch);
    float bu = u + 0.125 * mod(row, 2.0), bx = fract(bu / 0.25), by = fract(y / ch);
    float jw = 0.012 / 0.25, jh = 0.011 / ch;
    float mort = max(1.0 - smoothstep(0.0, jh, by), max(1.0 - smoothstep(0.0, jw, bx), smoothstep(1.0 - jw, 1.0, bx)));
    float hb = cityHash(vec2(floor(bu / 0.25), row) + bseed * 3.0);
    vec3 brickC = albedo * (0.86 + 0.26 * hb) * mix(vec3(1.0), vec3(0.78, 0.72, 0.7), step(0.93, hb));
    vec3 mortC = cityLin(vec3(0.70, 0.67, 0.61)) * (1.0 - 0.25 * (1.0 - smoothstep(0.0, 0.35, by)) * step(by, 0.4));
    float k = smoothstep(0.012, 0.03, max(wu, wy));
    albedo = mix(mix(brickC, mortC, mort * 0.85), mix(albedo, mortC, 0.2), k);
  }

  // contact occlusion at the base, and less sky seen from low in the street canyon
  ao *= (0.55 + 0.45 * smoothstep(0.0, 1.6, y)) * (0.78 + 0.22 * smoothstep(0.0, 14.0, y));
  // top of the wall: eave shadow (pitched roofs) or a parapet coping (flat)
  if (flatTop < 0.5) {
    ao *= 0.7 + 0.3 * smoothstep(0.0, 0.9, top - y);
    sunK *= 1.0 - lit * smoothstep(top - 0.55 * rise - 0.05, top - 0.55 * rise + 0.05, y);
  } else {
    float cop = cityBand(y, top - 0.38, top + 1.0, wy);
    albedo = mix(albedo, albedo * 1.12 + 0.02, cop);
    sunK *= 1.0 - 0.8 * lit * cityBand(y, top - 0.38 - 0.08 * rise, top - 0.38, wy);
  }
  // plinth (zoccolo): stone slabs on old houses, a darker painted band elsewhere
  float plinthH = style < 0.5 ? 0.95 : 0.6;
  float pl = cityBand(y, -1.0, plinthH, wy);
  vec3 stone = cityLin(vec3(0.62, 0.59, 0.54)) * (0.9 + 0.1 * pn) * (1.0 + 0.06 * (cityHash(vec2(floor(u / 0.9), 1.0 + bseed)) - 0.5) * fineFade);
  albedo = mix(albedo, style > 1.5 && style < 2.5 ? albedo * 0.86 : stone, pl);

  if (style > 2.5 && style < 4.5) return;                 // sheds, blank party walls and gables
  if (cw <= 0.0) return;

  // all the openings fade out when a window is a few pixels wide; their depth a little sooner
  float detail = 1.0 - smoothstep(0.22, 0.55, wu);
  float depK = 1.0 - smoothstep(0.06, 0.18, max(wu, wy));
  float cu = u / cw, col = floor(cu);
  float x = (fract(cu) - 0.5) * cw;
  float hist = 1.0 - step(0.5, style);
  float modern = step(1.5, style) * step(style, 2.5);
  float condo = 1.0 - hist - modern;                      // condominiums and brick blocks (1960s-80s)

  // string course between ground floor and first floor; modern blocks: a concrete band at each
  // floor slab
  if (style < 1.5 || (style > 6.5 && style < 7.5)) {
    float sc = cityBand(y, gH - 0.06, gH + 0.22, wy);
    albedo = mix(albedo, albedo * 1.1 + 0.015, sc * (0.6 + 0.4 * hist));
    sunK *= 1.0 - 0.7 * lit * cityBand(y, gH - 0.06 - 0.1 * rise, gH - 0.06, wy);
  }

  /* upper floors */
  float fy = (y - gH) / fh, fl = floor(fy), yy = (fy - fl) * fh;
  bool upper = y > gH && fl < nF;
  if (modern > 0.5 && y > gH) {
    // modern blocks: a concrete band at each floor slab (half of them), the joints of the
    // panels (prefabricated blocks, wide bays) and grey streaks of rain dirt under the slabs
    float band = cityBand(yy, -0.05, 0.22, wy) * step(0.5, bseed);
    albedo = mix(albedo, albedo * 0.93, band);
    float joint = (cityBand(abs(x), 0.5 * cw - 0.012, 0.5 * cw + 1.0, wu) + cityBand(yy, -0.012, 0.012, wy)) * step(0.66, fract(bseed * 11.0)) * fineFade;
#ifdef CITY_LITE
    float drip = 0.0;
#else
    float drip = grainFade > 0.0 ? cityNoise(vec2(u * 3.3 + bseed * 9.0, yy * 0.4 + fl * 7.0)) * (1.0 - smoothstep(0.0, 1.6, yy)) * grainFade : 0.0;
#endif
    albedo *= (1.0 - 0.18 * min(joint, 1.0)) * (1.0 - 0.1 * smoothstep(0.45, 0.85, drip));
  }
  // window size per style (modern blocks: 1.2-1.7 m wide, per building)
  float ww = hist > 0.5 ? 1.15 : modern > 0.5 ? min(cw - 0.8, 1.2 + 0.5 * bseed) : 1.3;
  float sill = hist > 0.5 ? 0.85 : modern > 0.5 ? 0.95 : 0.9;
  float wh = hist > 0.5 ? min(1.95, fh - 1.25) : modern > 0.5 ? min(1.5, fh - 1.2) : min(1.45, fh - 1.35);
  float h1 = cityHash(vec2(col, fl + 17.0 * bseed));
  float h2 = cityHash(vec2(col * 1.7 + 3.1, fl * 2.3 + 51.0 * bseed));
  // balconies: a French door and a slab on alternate bays (condominiums), or a ribbon along the
  // whole floor (modern blocks)
  bool ribbon = balc > 0.5 && modern > 0.5;
  bool balcony = balc > 0.5 && (ribbon || mod(col, 2.0) < 0.5) && cw > 2.6;
  if (balcony) { sill = 0.05; wh = min(2.25, fh - 0.55); ww = ribbon ? min(cw - 0.9, 1.6) : 1.0; }
  vec3 avgWin = cityLin(vec3(0.24, 0.245, 0.25));
  float frac = clamp(ww * wh / (cw * fh), 0.0, 0.6);
  // per building: frames (old houses dark wood; 60s-80s white, sage, anodised bronze or wood;
  // modern white or dark grey aluminium) and the reveal plaster
  float fsel = fract(bseed * 7.31);
  vec3 frameC = hist > 0.5 ? cityLin(vec3(0.36, 0.26, 0.18))
              : modern > 0.5 ? (fsel < 0.55 ? cityLin(vec3(0.84, 0.84, 0.82)) : cityLin(vec3(0.2, 0.2, 0.21)))
              : fsel < 0.35 ? cityLin(vec3(0.84, 0.83, 0.8)) : fsel < 0.55 ? cityLin(vec3(0.64, 0.68, 0.63))
              : fsel < 0.8 ? cityLin(vec3(0.3, 0.24, 0.19)) : cityLin(vec3(0.42, 0.29, 0.19));
  vec3 revC = albedo * 1.04;
  vec3 sillC = hist > 0.5 ? cityLin(vec3(0.76, 0.72, 0.65)) : cityLin(vec3(0.85, 0.83, 0.78));

  if (upper) {
    if (detail > 0.01) {
      float x0 = -0.5 * ww, x1 = 0.5 * ww, y0 = sill, y1 = sill + wh;
      float inX = cityBand(x, x0, x1, wu), inY = cityBand(yy, y0, y1, wy);
      float open = inX * inY;
      // shutter colours: green or brown persiane, roller shutters grey, beige, brown or green
      float tsel = fract(bseed * 3.7);
      vec3 shC = shut < 0.5 ? cityLin(vec3(0.24, 0.33, 0.25)) * (0.85 + 0.3 * bseed)
               : shut < 1.5 ? cityLin(vec3(0.36, 0.25, 0.17))
               : tsel < 0.4 ? cityLin(vec3(0.62, 0.60, 0.56)) : tsel < 0.7 ? cityLin(vec3(0.66, 0.6, 0.5))
               : tsel < 0.88 ? cityLin(vec3(0.42, 0.31, 0.22)) : cityLin(vec3(0.32, 0.4, 0.33));
      // persiane: closed, half closed (one leaf), or open with the leaves folded on the wall, all
      // on the wall plane; louvres lit on top
      float louvre = 0.72 + 0.28 * smoothstep(0.3, 0.7, fract(yy / 0.055));
      louvre = mix(louvre, 0.86, smoothstep(0.012, 0.04, wy));
      float covered = 0.0, leaves = 0.0;
      if (shut < 1.5) {
        float left = cityBand(x, -ww, -0.5 * ww, wu), right = cityBand(x, 0.5 * ww, ww, wu);
        if (h1 < 0.3) covered = 1.0;
        else if (h1 < 0.42) { covered = cityBand(x, 0.0, 0.5 * ww, wu); leaves = left * inY; }
        else leaves = (left + right) * inY;
        float stile = cityBand(abs(x), 0.5 * ww - 0.05, 0.5 * ww + 0.0, wu) + cityBand(abs(x), ww - 0.05, ww, wu);
        louvre *= 1.0 - 0.25 * stile;
      }
      // ---- the opening seen in depth: reveals (mazzette) and the frame plane (only where an
      // opening shows: the wall pixels skip it)
      vec3 inC = albedo; float inSun = 1.0, inOcc = 1.0, inCov = 1.0, winRough = 0.9;
      if (open > 0.0) {
      float depS = hist > 0.5 ? 0.27 : modern > 0.5 ? 0.13 : 0.2, dep = depS * depK;
      vec4 b = vec4(x0, y0, x1, y1);
      vec2 g = vec2(x, yy) + sl * dep;
      vec4 r = dep > 0.0 ? cityRecess(vec2(x, yy), sl, b, dep) : vec4(g, 0.0, 0.0);
      vec2 q = g;                                         // back plane coordinates
      // roller box (cassonetto) panel at the top of the opening on 1960s-80s windows
      float boxH = condo > 0.5 && !balcony ? 0.2 : 0.0;
      float wTop = y1 - boxH;
      // glass: curtains or blinds, the sky reflected (lighter towards the top), or a dark room
      float wy01 = clamp((q.y - y0) / max(wTop - y0, 0.1), 0.0, 1.0);
      vec3 glass = h2 < 0.25 ? cityLin(vec3(0.5, 0.48, 0.45) + 0.1 * h1) * (0.9 + 0.1 * cityBand(fract(q.x / 0.09) * 0.09, 0.0, 0.03, wu))
                 : h2 < 0.58 ? mix(cityLin(vec3(0.1, 0.11, 0.12)), cityLin(vec3(0.58, 0.64, 0.7)), 0.3 + 0.3 * wy01 + 0.15 * h1)
                 : cityLin(vec3(0.06, 0.065, 0.07) + 0.05 * h1);
      float frameW = 0.065;
      float fr = 1.0 - cityBand(q.x, x0 + frameW, x1 - frameW, wu) * cityBand(q.y, y0 + frameW, wTop - frameW * 0.6, wy);
      fr = max(fr, cityBand(q.x, -0.035, 0.035, wu) * (1.0 - step(1.7, ww)));
      // modern ribbon / wide windows: a transom
      fr = max(fr, modern * cityBand(q.y, y0 + 0.62 * (wTop - y0), y0 + 0.62 * (wTop - y0) + 0.05, wy) * step(1.6, ww));
      vec3 win = mix(glass, frameC, fr);
      winRough = mix(0.08, 0.7, max(fr, h2 < 0.25 ? 0.6 : 0.0));
      // roller shutters (tapparelle) on the frame plane, lowered by h1; slats with dark joints
      if (shut > 1.5 && shut < 2.5) {
        float down = h1 < 0.2 ? 1.0 : h1 < 0.45 ? 0.55 : h1 < 0.65 ? 0.25 : 0.04;
        float cover = cityBand(q.y, wTop - (wTop - y0) * down, wTop + 1.0, wy);
        float slat = 0.8 + 0.2 * smoothstep(0.2, 0.75, fract(q.y / 0.05));
        slat = mix(slat, 0.9, smoothstep(0.01, 0.035, wy));
        float holes = h1 < 0.2 ? 0.0 : (1.0 - smoothstep(0.01, 0.03, wy)) * cityBand(fract(q.y / 0.05), 0.0, 0.18, wy / 0.05) * cityBand(fract(q.x / 0.04), 0.0, 0.45, wu / 0.04);
        vec3 tap = shC * slat * (1.0 - 0.6 * holes) * (0.94 + 0.12 * cityHash(vec2(col, fl + 5.0)));
        win = mix(win, tap, cover);
        winRough = mix(winRough, 0.7, cover);
      }
      // the roller box panel and the guides on both sides
      win = mix(win, frameC * 1.05, cityBand(q.y, wTop, y1 + 1.0, wy) * step(0.01, boxH));
      // reveals and frame plane together
      if (dep > 0.0) cityReveal(r, g, b, dep, depS, win, 1.0, revC, sillC, sN, sT, sY, rise, run, lit, wu, wy, inC, inSun, inOcc, inCov);
      else {
        // far away: no reveal to see, only the shadow of the lintel and of the sun-side jamb
        inC = win; inCov = 1.0; inOcc = 0.8;
        inSun = 1.0 - lit * (1.0 - cityBand(x + depS * run, x0, x1, wu) * cityBand(yy + depS * rise, y0 - 9.0, y1, wy));
      }
      }
      // on the wall plane: sill, stone surround and lintel cornice (old houses), a flat frame
      // band (modern blocks), the leaves of the persiane, rain streaks under the sills
      float sillM = cityBand(x, x0 - 0.09, x1 + 0.09, wu) * cityBand(yy, y0 - 0.07, y0, wy) * (balcony ? 0.0 : 1.0);
      float under = lit * cityBand(x, x0 - 0.09, x1 + 0.09, wu) * cityBand(yy, y0 - 0.07 - 0.06 * rise, y0 - 0.07, wy) * (balcony ? 0.0 : 1.0);
      float surround = hist * cityBand(x, x0 - 0.15, x1 + 0.15, wu) * cityBand(yy, y0 - 0.07, y1 + 0.16, wy) * (1.0 - open);
      surround = max(surround, modern * cityBand(x, x0 - 0.12, x1 + 0.12, wu) * cityBand(yy, y0 - 0.07, y1 + 0.12, wy) * (1.0 - open));
      float lintel = hist * cityBand(x, x0 - 0.24, x1 + 0.24, wu) * cityBand(yy, y1 + 0.16, y1 + 0.3, wy);
      float lintelSh = hist * lit * cityBand(x, x0 - 0.24, x1 + 0.24, wu) * cityBand(yy, y1 + 0.16 - 0.08 * rise, y1 + 0.16, wy);
      float streak = cityBand(x, x0, x1, wu) * (1.0 - smoothstep(0.0, 1.4, y0 - yy)) * step(yy, y0 - 0.07) * fineFade;
      streak *= 0.6 + 0.4 * cityNoise(vec2(u * 9.0, y * 0.7));
      vec3 a = albedo * (1.0 - (0.09 + 0.06 * modern) * streak);
      a = mix(a, a * 1.13 + 0.02, max(surround, lintel));
      a = mix(a, shC * louvre, leaves);
      a = mix(a, sillC, sillM);
      float seen = open * (1.0 - covered), shut0 = open * covered;
      a = mix(a, inC, seen);
      a = mix(a, shC * louvre, shut0);
      // balcony (painted, far from the pharmacy): slab at the floor, railing or parapet, shadow below
      if (balcony && realBalc < 0.5) {
        float bw = ribbon ? 1.0 : cityBand(x, -0.5 * cw + 0.25, 0.5 * cw - 0.25, wu);
        float slab = bw * cityBand(yy, -0.02, 0.17, wy);
        float rail = bw * cityBand(yy, 0.17, 1.05, wy);
        float bars = mix(smoothstep(0.35, 0.5, abs(fract(u / 0.12) - 0.5) * 2.0), 0.4, smoothstep(0.015, 0.05, wu));
        vec3 railC = cityLin(vec3(0.16, 0.16, 0.15));
        float solid = ribbon ? 1.0 : step(0.5, bseed);
        a = mix(a, mix(railC, albedo * (ribbon ? 1.05 : 0.97), solid), rail * mix(1.0 - bars * 0.85, 1.0, solid));
        a = mix(a, cityLin(vec3(0.78, 0.76, 0.72)), slab);
        float sh = lit * bw * cityBand(yy, fh - 1.15 * rise, fh + 0.02, wy) * step(fl + 1.0, nF - 0.5);
        sunK *= 1.0 - 0.85 * sh;
        ao *= 1.0 - 0.25 * bw * cityBand(yy, fh - 0.5, fh, wy) * step(fl + 1.0, nF - 0.5);
      }
      sunK *= mix(1.0, inSun, seen) * (1.0 - 0.85 * (under + lintelSh));
      ao *= mix(1.0, inOcc, seen);
      vec3 avg = mix(albedo, avgWin, frac);
      albedo = mix(avg, a, detail);
      rough = mix(rough, mix(0.9, winRough, inCov), seen * detail);
      rough = mix(rough, 0.75, shut0 * detail);
    } else {
      albedo = mix(albedo, avgWin, frac);
    }
  } else if (y < gH && y > -0.5) {
    /* ground floor: one opening per bay (shop window, garage door, entrance or barred window),
       seen in depth like the windows above (one recess for all four: a smaller program) */
    if (detail > 0.01) {
      vec3 a = albedo;
      float g1 = cityHash(vec2(col * 3.1, 7.0 + 23.0 * bseed));
      bool shop = ground > 0.5 && ground < 1.5, garage = ground > 1.5;
      bool isDoor = !shop && !garage && g1 < 0.18, closed = shop && g1 > 0.82;
      float sw = 0.5 * cw - 0.32;                                       // shop window half width
      float dwG = min(1.25, 0.5 * cw - 0.3), dsel = step(g1, 0.75);     // garage door (or a window)
      float dw = 0.65, dh = min(2.6, gH - 0.4);                         // entrance
      float wwg = 0.95, gs = max(1.05, gH - 2.45), gwh = min(1.35, gH - gs - 0.45);   // barred window
      vec4 b = shop ? vec4(-sw, 0.22, sw, gH - 0.95) : garage ? vec4(-dwG, 0.0, dwG, 2.3)
             : isDoor ? vec4(-dw, 0.0, dw, dh) : vec4(-0.5 * wwg, gs, 0.5 * wwg, gs + gwh);
      float openM = cityBand(x, b.x, b.z, wu) * cityBand(y, b.y, b.w, wy) * (garage ? dsel : 1.0);
      float depS = shop ? 0.15 : garage ? 0.12 : isDoor ? 0.25 : 0.2;
      vec3 aluC = mix(cityLin(vec3(0.17, 0.16, 0.15)), cityLin(vec3(0.62, 0.62, 0.6)), step(0.55, fract(bseed * 5.3 + col * 0.37)));
      vec3 openC = cityLin(vec3(0.55, 0.56, 0.56)) * (0.82 + 0.18 * smoothstep(0.3, 0.7, fract(y / 0.09)));   // a shop's roller shutter
      float oSun = 1.0, oOcc = 1.0, oRough = 0.55;
      if (openM > 0.0 && !closed) {
        float dep = depS * depK;
        vec2 gq = vec2(x, y) + sl * dep;
        vec4 r = dep > 0.0 ? cityRecess(vec2(x, y), sl, b, dep) : vec4(gq, 0.0, 0.0);
        vec3 back, revK = albedo * 1.03, botK = sillC, emit = vec3(0.0);
        float bRough = 0.6;
        if (shop) {
          // the lit room behind the glass (shelves of goods), posters on the glass, aluminium
          // mullions, a transom and a glass door on one side; the street reflected in the glass
          float shelves = cityBand(fract(gq.y / 0.45) * 0.45, 0.0, 0.05, wy) * step(0.9, gq.y) * step(gq.y, 2.2);
          float goods = cityNoise(vec2(gq.x * 5.0 + col * 7.0, floor(gq.y / 0.45) * 3.1)) * step(0.5, gq.y) * step(gq.y, 2.2) * fineFade;
          vec3 inside = cityLin(vec3(0.62, 0.6, 0.55)) * (0.55 + 0.45 * smoothstep(0.3, 2.4, gq.y));
          inside = mix(inside, cityLin(mix(vec3(0.5, 0.3, 0.25), vec3(0.3, 0.45, 0.55), fract(g1 * 7.0))), 0.45 * goods);
          inside = mix(inside, cityLin(vec3(0.35, 0.32, 0.28)), 0.6 * shelves * fineFade);
          vec2 cid = vec2(floor(gq.x / 0.45) + col * 3.0, 9.0 + floor(gq.y / 0.6));
          float card = step(0.8, cityHash(cid)) * cityBand(fract(gq.x / 0.45) * 0.45, 0.06, 0.39, wu) * cityBand(fract(gq.y / 0.6) * 0.6, 0.05, 0.5, wy) * cityBand(gq.y, 1.0, 2.2, wy) * fineFade;
          float door = cityBand(gq.x, sw - 1.0, sw - 0.06, wu) * step(0.5, fract(g1 * 13.0));
          float mull = max(cityBand(abs(fract(gq.x / max(sw, 0.5)) - 0.5), 0.47, 0.5, wu / max(sw, 0.5)) * step(1.6, sw), cityBand(gq.y, gH - 1.35, gH - 1.29, wy));
          float doorFr = max(door * max(cityBand(gq.x, sw - 1.0, sw - 0.92, wu), cityBand(gq.y, 1.0, 1.06, wy)), mull);
          vec3 cardC = cityLin(mix(vec3(0.85, 0.82, 0.74), vec3(0.55, 0.7, 0.75), cityHash(cid + 3.0))) * (0.75 + 0.25 * g1);
          back = mix(mix(inside * 0.3, cardC, card * 0.7), aluC, doorFr);
          vec3 rf = reflect(vd, N);
          float fres = 0.3 + 0.55 * pow(1.0 - clamp(-dot(vd, N), 0.0, 1.0), 3.0);
#ifdef CITY_LITE
          float across = cityNoise(vec2((u + rf.x * 6.0) * 0.6, 3.0)) * 0.6, trunks = 0.0;
#else
          // across the street: facades (blocks of light and shade) and dark trunks, the sky above
          float across = cityNoise(vec2((u + rf.x * 6.0) * 0.6, 3.0)) * cityNoise(vec2((u + rf.z * 6.0) * 2.1, 7.0));
          float trunks = smoothstep(0.7, 0.85, cityNoise(vec2((u - rf.x * 3.0) * 1.7, 11.0)));
#endif
          vec3 refl = mix(vec3(0.09, 0.09, 0.085), mix((vec3(0.2, 0.18, 0.15) + 0.2 * across) * (1.0 - 0.7 * trunks), vec3(0.42, 0.5, 0.6), smoothstep(0.12, 0.45, rf.y)), smoothstep(-0.12, 0.02, rf.y));
          refl *= 1.0 - 0.6 * card;
          float lamps = cityBand(gq.y, gH - 1.55, gH - 1.45, wy) * cityBand(fract(gq.x / 1.2) * 1.2, 0.0, 0.5, wu);
          emit = ((inside * 0.1 + vec3(0.22, 0.21, 0.18) * lamps) * (1.0 - fres) + refl * fres) * (1.0 - doorFr);
          revK = botK = aluC; bRough = 0.06;
        } else if (garage) {
          // ribbed tilting door, dirtier at the bottom
          back = cityLin(mix(vec3(0.5, 0.5, 0.49), vec3(0.45, 0.36, 0.28), step(0.6, bseed))) * (0.85 + 0.15 * smoothstep(0.2, 0.8, fract(gq.y / 0.1)));
          back *= 1.0 - 0.15 * (1.0 - smoothstep(0.0, 0.5, gq.y));
          revK = albedo * 1.02; botK = stone; bRough = 0.5;
        } else if (isDoor) {
          // entrance: wooden leaf with panels, or an aluminium and glass door (60s-80s)
          vec3 wood = mix(cityLin(vec3(0.3, 0.2, 0.13)), cityLin(vec3(0.22, 0.24, 0.2)), step(0.5, bseed));
          float panel = cityBand(fract(gq.x / 0.3) * 0.3, 0.0, 0.03, wu) + cityBand(fract(gq.y / 0.5) * 0.5, 0.0, 0.03, wy);
          vec3 leaf = wood * (0.9 + 0.1 * smoothstep(0.4, 0.6, fract(gq.x / 0.3))) * (1.0 - 0.2 * min(panel, 1.0) * fineFade);
          vec3 alu = mix(cityLin(vec3(0.08, 0.09, 0.1)), cityLin(vec3(0.5, 0.55, 0.6)), 0.25 + 0.2 * smoothstep(0.0, 2.4, gq.y));
          float aluFr = max(1.0 - cityBand(gq.x, -dw + 0.08, dw - 0.08, wu) * cityBand(gq.y, 0.12, dh - 0.08, wy), cityBand(gq.x, -0.03, 0.03, wu));
          back = step(0.5, fract(g1 * 31.0)) * condo > 0.5 ? mix(alu, cityLin(vec3(0.62, 0.6, 0.55)), aluFr) : leaf;
          revK = stone * 1.05; botK = stone; bRough = 0.7;
        } else {
          // window: frame and glass (some curtains) 0.2 m in
          float gfr = 1.0 - cityBand(gq.x, -0.5 * wwg + 0.06, 0.5 * wwg - 0.06, wu) * cityBand(gq.y, gs + 0.06, gs + gwh - 0.06, wy);
          float curtain = step(cityHash(vec2(col * 2.3, 91.0 + bseed * 7.0)), 0.4);
          back = mix(mix(cityLin(vec3(0.05, 0.055, 0.06)), cityLin(vec3(0.52, 0.5, 0.47)), 0.5 * curtain), frameC, gfr);
          bRough = mix(0.08, 0.6, max(gfr, 0.6 * curtain));
        }
        vec3 inC; float inSun, inOcc, inCov;
        cityReveal(r, gq, b, dep, depS, back, 1.0, revK, botK, sN, sT, sY, rise, run, lit, wu, wy, inC, inSun, inOcc, inCov);
        openC = inC; oSun = inSun; oOcc = inOcc; oRough = mix(0.9, bRough, inCov);
        if (shop) { oSun = mix(inSun, 0.25 * inSun, inCov); cityEmit = emit * inCov * openM * detail; }
        if (!shop && !garage && !isDoor) {
          // the iron grate on the wall plane, over the recess
          float bars = mix(smoothstep(0.72, 0.92, abs(fract(x / 0.12) * 2.0 - 1.0)), 0.22, smoothstep(0.012, 0.04, wu));
          bars = max(bars, cityBand(y, gs + 0.5 * gwh - 0.02, gs + 0.5 * gwh + 0.02, wy));
          openC = mix(openC, cityLin(vec3(0.09, 0.09, 0.085)), bars * 0.92);
          oSun = mix(oSun, 1.0, bars * 0.9); oRough = mix(oRough, 0.6, bars);
        }
      }
      // on the wall plane: the shop's frame, sign band and lettering; a garage bay's small window;
      // the stone frame of an entrance; the sill of a window
      if (shop) {
        float frameM = cityBand(x, -sw - 0.07, sw + 0.07, wu) * cityBand(y, 0.12, gH - 0.85, wy);
        float signM = cityBand(x, -sw - 0.07, sw + 0.07, wu) * cityBand(y, gH - 0.78, gH - 0.28, wy);
        vec3 signC = g1 < 0.3 ? cityLin(vec3(0.3, 0.22, 0.15)) : g1 < 0.5 ? cityLin(vec3(0.16, 0.2, 0.3)) : g1 < 0.62 ? cityLin(vec3(0.4, 0.12, 0.12)) : g1 < 0.8 ? cityLin(vec3(0.22, 0.22, 0.22)) : albedo * 0.95;
        float letters = step(0.25, g1) * cityBand(y, gH - 0.62, gH - 0.44, wy) * cityBand(x, -0.55 * sw, 0.55 * sw, wu)
                      * step(0.35, cityHash(vec2(floor(u / 0.23), col))) * fineFade;
        a = mix(a, aluC, frameM);
        a = mix(a, mix(signC, cityLin(vec3(0.86, 0.84, 0.78)), letters * 0.85), signM);
        sunK *= 1.0 - 0.8 * lit * cityBand(y, gH - 0.28 - 0.25 * rise, gH - 0.28, wy) * cityBand(x, -sw - 0.07, sw + 0.07, wu);
      } else if (garage) {
        a = mix(a, cityLin(vec3(0.06, 0.06, 0.065)), cityBand(x, -0.5, 0.5, wu) * cityBand(y, 1.4, 2.15, wy) * (1.0 - dsel));
      } else if (isDoor) {
        a = mix(a, stone * 1.05, cityBand(x, -dw - 0.14, dw + 0.14, wu) * cityBand(y, 0.0, dh + 0.14, wy) * (1.0 - openM));
      } else {
        a = mix(a, sillC, cityBand(x, -0.5 * wwg - 0.08, 0.5 * wwg + 0.08, wu) * cityBand(y, gs - 0.07, gs, wy));
      }
      a = mix(a, openC, openM);
      sunK *= mix(1.0, oSun, openM * detail);
      ao *= mix(1.0, oOcc, openM * detail);
      float gfrac = ground > 0.5 && ground < 1.5 ? 0.55 : 0.18;
      vec3 avg = mix(albedo, avgWin, gfrac * smoothstep(0.6, 1.2, y));
      albedo = mix(avg, a, detail);
      rough = mix(rough, oRough, openM * detail);
    } else {
      float gfrac = ground > 0.5 && ground < 1.5 ? 0.55 : 0.18;
      albedo = mix(albedo, avgWin, gfrac * smoothstep(0.6, 1.2, y));
    }
  }
}
`,Oe=`
attribute vec2 aPhoto;
attribute vec2 aAxis;
varying vec2 vPhoto;
varying vec3 vRoofPos;
varying vec2 vRoofAxis;
`,Ee=`
vPhoto = aPhoto;
vRoofAxis = aAxis;
vRoofPos = (modelMatrix * vec4(transformed, 1.0)).xyz;
`,_e=`
varying vec2 vPhoto;
varying vec3 vRoofPos;
varying vec2 vRoofAxis;
uniform float uRoofGain;
uniform float uRoofTiles;   // detail strength (0 off; quality tier)
uniform vec3 uCitySun;      // towards the sun
float roofHash(vec2 p) { p = fract(p * vec2(0.1031, 0.1030)); p += dot(p, p.yx + 33.33); return fract((p.x + p.y) * p.x); }
float roofNoise(vec2 p) {
  vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(roofHash(i), roofHash(i + vec2(1, 0)), f.x), mix(roofHash(i + vec2(0, 1)), roofHash(i + 1.0), f.x), f.y);
}
float roofBand(float x, float a, float b, float w) { return clamp((min(x + 0.5 * w, b) - max(x - 0.5 * w, a)) / w, 0.0, 1.0); }
// a band [a, b] of period 1 at phase x, box-filtered, minus its mean: zero mean at any distance
float roofLine(float x, float a, float b, float w) { return roofBand(fract(x), a, b, w) - (b - a); }
// metres per texel of the finest photo level at xz
float roofMpp(vec2 xz) {
#ifdef CITY_ORTHO
  vec2 uv = (xz - orthoRect2.xy) * orthoRect2.zw;
  if (orthoWeight.w > 0.5 && uv.x > 0.02 && uv.y > 0.02 && uv.x < 0.98 && uv.y < 0.98) return orthoMpp.w;
  uv = (xz - orthoRect1.xy) * orthoRect1.zw;
  if (orthoWeight.z > 0.5 && uv.x > 0.02 && uv.y > 0.02 && uv.x < 0.98 && uv.y < 0.98) return orthoMpp.z;
  if (orthoWeightC > 0.5 && orthoMppC > 0.0) return orthoMppC;
  return max(orthoMpp.y, 0.5);
#else
  return 0.5;
#endif
}
vec3 roofDetail(vec3 c) {
  if (uRoofTiles <= 0.0) return c;
  vec3 dx = dFdx(vRoofPos), dy = dFdy(vRoofPos);
  vec3 n = cross(dx, dy);
  float nl = length(n);
  if (nl < 1e-10) return c;
  n /= nl;
  n *= sign(n.y);
  float fp = max(length(dx), length(dy));                 // pixel footprint (m)
  float mag = roofMpp(vRoofPos.xz) / max(fp, 1e-4);       // pixels per photo texel
  float k = uRoofTiles * smoothstep(1.2, 3.0, mag);
  if (k < 0.01) return c;
  float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
  float warm = smoothstep(0.18, 0.45, (c.r - c.b) / max(l, 0.01)) * smoothstep(0.02, 0.06, l);
  float sl = length(n.xz);                                // sine of the pitch
  if (sl > 0.7) return c;
  if (sl >= 0.15) {
    /* coppi on a clay slope (clay pixels only: not the grey chimneys, skylights and terraces) */
    vec2 down = n.xz / sl, acr = vec2(-down.y, down.x);
    float s = dot(vRoofPos.xz, down) / max(n.y, 0.5);     // metres down the slope
    float t = dot(vRoofPos.xz, acr);                      // metres across
    float wt = fwidth(t), ws = fwidth(s);
    float kk = k * warm * (1.0 - smoothstep(0.07, 0.18, max(wt, ws)));
    if (kk < 0.01) return c;
    const float PC = 0.34, PA = 0.40;                     // cover-to-cover spacing, exposed tile length
    t += 0.02 * sin(s * 0.9 + roofHash(vec2(floor(t / PC), 3.0)) * 6.0);   // rows never quite straight
    float ph = t / PC, col = floor(ph), x = (fract(ph) - 0.5) / 0.24;
    float wph = wt / PC;
    float cover = roofBand(fract(ph), 0.26, 0.74, wph);   // convex cover tile over the channel
    float sa = dot(uCitySun.xz, acr);                     // sun across the slope
    float sideLit = clamp(x, -1.0, 1.0) * sa;
    float prof = mix(0.85, 1.06 + 0.55 * sideLit, cover);
    float shadeSide = sa > 0.0 ? roofBand(fract(ph), 0.74, 0.74 + 0.1 * abs(sa), wph) : roofBand(fract(ph), 0.26 - 0.1 * abs(sa), 0.26, wph);
    prof *= 1.0 - 0.25 * shadeSide;
    // tile ends (overlaps): a thin shadow line, channels staggered by half a tile
    float sr = s / PA + 0.5 * (1.0 - step(0.5, cover));
    float joint = roofBand(fract(sr) * PA, 0.0, 0.035, ws);
    prof *= 1.0 - 0.32 * joint;
    // one tone per tile (old and replaced coppi), lichen patches (grey-green, yellow) on the old ones
    float h = roofHash(vec2(col * 2.0 + step(0.5, cover), floor(sr))) - 0.5;
    vec3 tone = vec3(1.0 + 0.16 * h) + vec3(0.05, -0.01, -0.04) * h;
#ifdef CITY_LITE
    float lich = 0.0;
#else
    float lich = smoothstep(0.62, 0.8, roofNoise(vRoofPos.xz * 1.3 + 7.0)) * (1.0 - smoothstep(0.03, 0.1, max(wt, ws)));
#endif
    tone = mix(tone, vec3(0.86, 0.9, 0.8), 0.35 * lich * step(0.0, h));
    // mean of prof over a tile period (cover 48 %, channel shadow, joints)
    float mean = (0.48 * 1.06 + 0.52 * 0.85 - 0.85 * 0.25 * 0.1 * abs(sa)) * (1.0 - 0.32 * 0.035 / PA);
    return c * mix(vec3(1.0), prof / mean * tone, kk);
  }
  /* flat roofs: terrace tiles or waterproofing membrane, along the building axis */
  vec2 ax = dot(vRoofAxis, vRoofAxis) > 0.25 ? normalize(vRoofAxis) : vec2(1.0, 0.0);
  float s = dot(vRoofPos.xz, ax), t = dot(vRoofPos.xz, vec2(-ax.y, ax.x));
  float w = fp;
  vec3 m = vec3(1.0);
  if (warm > 0.5 && l > 0.06) {
    // tiled terrace: 33 cm tiles, recessed grout (darker), a tone per tile
    const float TP = 0.33;
    float g = roofLine(s / TP, 0.0, 0.05, w / TP) + roofLine(t / TP, 0.0, 0.05, w / TP);
    float h = (roofHash(floor(vec2(s, t) / TP) + 11.0) - 0.5) * (1.0 - smoothstep(0.05, 0.15, w));
    m *= 1.0 - 0.35 * g + 0.1 * h;
  } else {
    // membrane strips 1 m wide (seams along s), staggered end laps every ~9 m, a tone per strip,
    // slow wrinkles, slate-chip grain on dark bitumen, painted membranes (light) quieter
    float strip = floor(t);
    float seam = roofLine(t, 0.0, 0.08, w);               // the lapped edge, a little lighter
    float seamSh = roofLine(t, 0.08, 0.11, w);            // its shadow line
    float lap = roofLine(s / 9.0 + roofHash(vec2(strip, 1.0)), 0.0, 0.012, w / 9.0);
    float h = (roofHash(vec2(strip, 5.0)) - 0.5) * (1.0 - smoothstep(0.3, 0.9, w));
    float wr = (roofNoise(vec2(s * 0.7, t * 2.3)) - 0.5) * (1.0 - smoothstep(0.08, 0.25, w));
    float quiet = mix(1.0, 0.5, smoothstep(0.3, 0.55, l));
#ifdef CITY_LITE
    float grain = 0.0;
#else
    float grain = (roofNoise(vRoofPos.xz * 40.0) - 0.5) * (1.0 - smoothstep(0.008, 0.03, w)) * (1.0 - smoothstep(0.15, 0.3, l));
#endif
    m *= 1.0 + quiet * (0.12 * seam - 0.25 * seamSh + 0.15 * lap + 0.1 * h + 0.08 * wr) + 0.12 * grain;
  }
  return c * mix(vec3(1.0), m, k);
}
`;function De(i,t){return i.onBeforeCompile=s=>{Object.assign(s.uniforms,t.uniforms,{orthoClean:{value:0}}),s.vertexShader=s.vertexShader.replace("#include <common>",`#include <common>
attribute vec2 aPhoto;
attribute float aA;
varying vec2 vPhoto;
varying float vA;`).replace("#include <begin_vertex>",`#include <begin_vertex>
vPhoto = aPhoto; vA = aA;`),s.fragmentShader=s.fragmentShader.replace("#include <common>",`#include <common>
varying vec2 vPhoto;
varying float vA;
${t.glslPars}${t.glslFn}`).replace("vec4 diffuseColor = vec4( diffuse, opacity );","vec4 diffuseColor = vec4( orthoColor( vPhoto ), opacity * vA );")},i.customProgramCacheKey=()=>"city-skirts-v2",i}function Ke(i,t){return i.onBeforeCompile=s=>{Object.assign(s.uniforms,t),s.vertexShader=s.vertexShader.replace("#include <common>",`#include <common>
${Te}`).replace("#include <begin_vertex>",`#include <begin_vertex>
${ze}`),s.fragmentShader=s.fragmentShader.replace("#include <common>",`#include <common>
${qe}`).replace("#include <color_fragment>",`#include <color_fragment>
        vec3 cityAlbedo; float cityRough, cityAO, citySunK;
        cityFacade(cityAlbedo, cityRough, cityAO, citySunK);
        diffuseColor.rgb = cityAlbedo;`).replace("#include <roughnessmap_fragment>",`#include <roughnessmap_fragment>
roughnessFactor = cityRough;`).replace("#include <emissivemap_fragment>",`#include <emissivemap_fragment>
totalEmissiveRadiance += cityEmit;`).replace("#include <lights_fragment_end>",`#include <lights_fragment_end>
        reflectedLight.directDiffuse *= citySunK;
        reflectedLight.directSpecular *= citySunK;
        reflectedLight.indirectDiffuse *= cityAO;
        reflectedLight.indirectSpecular *= cityAO;`)},i.customProgramCacheKey=()=>`city-walls-v4${i.defines?.CITY_LITE!==void 0?"-lite":""}`,i}function je(i,t,s){return i.onBeforeCompile=n=>{t&&Object.assign(n.uniforms,t.uniforms,{orthoClean:s.orthoClean}),n.uniforms.uRoofGain=s.uRoofGain,n.uniforms.uRoofTiles=s.uRoofTiles,n.uniforms.uCitySun=s.uCitySun,n.vertexShader=n.vertexShader.replace("#include <common>",`#include <common>
${Oe}`).replace("#include <begin_vertex>",`#include <begin_vertex>
${Ee}`),n.fragmentShader=n.fragmentShader.replace("#include <common>",`#include <common>
${t?`#define CITY_ORTHO
${t.glslPars}${t.glslFn}`:""}
${_e}`).replace("vec4 diffuseColor = vec4( diffuse, opacity );",t?"vec4 diffuseColor = vec4( roofDetail( orthoColor( vPhoto ) ) * uRoofGain, opacity );":"vec4 diffuseColor = vec4( roofDetail( diffuse ) * uRoofGain, opacity );")},i.customProgramCacheKey=()=>`city-roofs-v3-${t?"photo":"flat"}${i.defines?.CITY_LITE!==void 0?"-lite":""}`,i}function We(i){let t=0,s=0;for(const w of i.roads||[])for(let f=0;f<w.length;f++)t=(t+w[f]*(f%7+1))%1e9,s++;const n=i.pharmacy||{};return[s,t,JSON.stringify(n.footprint),JSON.stringify(n.door),n.height,JSON.stringify(i.center)].join("|")}const Ie=(()=>{const i=He.map(([s,n])=>[s,s==="#C98466"?n*.5:n]),t=i.reduce((s,[,n])=>s+n,0);return i.map(([s,n])=>[s,n/t])})(),Ue=[["#E9DFCC",.3],["#E2D7C4",.25],["#D8C7A9",.2],["#F0E3C9",.15],["#D2C6B2",.1]],Ge=[["#A9583C",.4],["#B4664A",.35],["#9E5038",.25]],Ye=[-.03,.24],Ce={high:{pool:28,lod:1.15,detail:1,skirts:!0,wallPx:2.5,near:190},medium:{pool:20,lod:1.5,detail:.8,skirts:!0,wallPx:4,near:130},low:{pool:12,lod:2.2,detail:.6,skirts:!1,wallPx:4,near:0}},oe=[{text:"CARNE EQUINA",ink:"#A4211B",panel:"#EEEAE0",font:'700 92px "Arial Narrow", "Helvetica Neue", Arial, sans-serif',track:10}],G=i=>new URL(`./assets/${i}`,document.baseURI).href;function $e(i,t){const s=t==="high"?1024:512,n=s/8,w=document.createElement("canvas");w.width=s,w.height=n*oe.length;const f=w.getContext("2d");oe.forEach((c,A)=>{f.fillStyle=c.panel,f.fillRect(0,A*n,s,n),f.fillStyle=c.ink,f.textAlign="center",f.textBaseline="middle",f.font=c.font.replace(/\d+px/,`${Math.round(n*.72)}px`),"letterSpacing"in f&&(f.letterSpacing=`${Math.round(c.track*s/1024)}px`),f.fillText(c.text,s/2,A*n+n*.54,s*.9),f.fillRect(s*.04,A*n+n*.9,s*.92,Math.max(1,n*.025))});const b=new i.CanvasTexture(w);return b.colorSpace=i.SRGBColorSpace,b.anisotropy=4,b.generateMipmaps=!0,b.minFilter=i.LinearMipmapLinearFilter,b.name="city-signs",b}function Y(i=null){const t=new Worker(new URL(""+new URL("city-worker-DxWOUcUP.js",import.meta.url).href,import.meta.url),{type:"module"}),s=new Promise((n,w)=>{t.onmessage=f=>{t.terminate(),f.data?.error?w(new Error(f.data.error)):n(f.data)},t.onerror=f=>{t.terminate(),w(new Error(f.message||"city worker"))}});return t.postMessage({urls:{buildings:G("geo/buildings-osm.bin"),roofs:G("city/roofs.bin"),ortho:G("ortho/ortho.json"),...i?{}:{meta:G("city/city-meta.json")}},model:i,opts:{walls:Ie,modern:Ue,brick:Ge,parallax:Ye,detailRadius:900,wantColliders:!1}}),s}const Be=i=>({roads:i.roads,pharmacy:i.pharmacy,center:i.center});let $=null;try{$=typeof Worker<"u"&&typeof document<"u"?Y():null}catch(i){$=Promise.reject(i)}$?.catch(()=>{});async function Ze(i){const{THREE:t,frame:s,room:n,scene:w,renderer:f}=i,b=performance.now();let c=await($||Y()),A=!1;c.stats.metaKey!==We(i.geo)&&(A=!0,c=await Y(Be(i.geo)));const ae=performance.now()-b,F=i.ortho||null,L=Ce[i.quality]||Ce.medium,V=L.pool,ke=L.lod,Se=L.wallPx,C=c.walls,O=c.roofs,B={position:new t.BufferAttribute(C.position,3),normal:new t.BufferAttribute(C.normal,4,!0),aU:new t.BufferAttribute(C.u,1),aF:new t.BufferAttribute(C.facade,4),aC:new t.BufferAttribute(C.color,4,!0)},ie=new t.BufferAttribute(C.index,1),H={position:new t.BufferAttribute(O.position,3),aPhoto:new t.BufferAttribute(O.photo,2),aAxis:new t.BufferAttribute(O.axis,2,!0)},se=new t.BufferAttribute(O.index,1),Le=new t.Sphere(new t.Vector3(s.D.x,0,s.D.z),8e3),X=(e,o)=>{const a=new t.BufferGeometry;for(const[r,h]of Object.entries(e))a.setAttribute(r,h);return a.setIndex(o),a.boundingSphere=Le.clone(),a.boundingBox=new t.Box3(new t.Vector3(-1e4,-10,-1e4),new t.Vector3(1e4,400,1e4)),a.setDrawRange(0,0),a},ne=$e(t,i.quality),re={uCitySigns:{value:ne},uCitySignRows:{value:oe.length},uCitySun:{value:Fe.dir.clone().normalize()},uCityGain:{value:.8},uCitySat:{value:.56},uRoofGain:{value:1},uRoofTiles:{value:L.detail},uCityDetail:{value:L.detail},orthoClean:{value:0}},J=F&&L.skirts?De(new t.MeshBasicMaterial({color:16777215,depthWrite:!1,name:"city-skirts",blending:t.CustomBlending,blendEquation:t.AddEquation,blendSrc:t.SrcAlphaFactor,blendDst:t.OneMinusSrcAlphaFactor,blendSrcAlpha:t.ZeroFactor,blendDstAlpha:t.OneFactor}),F):null,E=Ke(new t.MeshStandardMaterial({color:16777215,roughness:.93,metalness:0,name:"city-walls"}),re),Q=je(new t.MeshBasicMaterial({color:F?16777215:11038810,name:"city-roofs"}),F,re);if(i.quality!=="high")for(const e of[E,Q])e.defines={...e.defines||{},CITY_LITE:""};const x=new t.Group;x.name="city";const N=[];for(let e=0;e<V;e++){const o=new t.Mesh(X(B,ie),E),a=new t.Mesh(X(H,se),Q);o.name=`city-walls-${e}`,a.name=`city-roofs-${e}`;for(const r of[o,a])r.matrixAutoUpdate=!1,r.frustumCulled=!1,r.visible=!1,r.castShadow=!1,r.userData.shadowBake=!1;o.receiveShadow=!0,a.receiveShadow=!1,x.add(o,a),N.push({walls:o,roofs:a})}N[0].walls.visible=N[0].roofs.visible=!0;const M=c.stats.detail,le=new t.BufferAttribute(C.detail,1);let y=null;if(C.detail.length){const e=new t.BufferGeometry;for(const[o,a]of Object.entries(B))e.setAttribute(o,a);e.setIndex(le),e.boundingBox=new t.Box3(new t.Vector3(M.box[0],M.box[1],M.box[2]),new t.Vector3(M.box[3],M.box[4],M.box[5])),e.boundingSphere=e.boundingBox.getBoundingSphere(new t.Sphere),y=new t.Mesh(e,E),y.name="city-detail",y.matrixAutoUpdate=!1,y.castShadow=!1,y.receiveShadow=!0,y.renderOrder=.05,x.add(y)}const ce=new t.MeshBasicMaterial({colorWrite:!1,depthWrite:!1,name:"city-shadow-casters"}),fe=(e,o)=>{const a=X(e,new t.BufferAttribute(o,1));return a.setDrawRange(0,1/0),a},T=[fe(B,c.casters.walls),fe(H,c.casters.roofs)].map((e,o)=>{const a=new t.Mesh(e,ce);return a.name=o?"city-casters-roofs":"city-casters-walls",a.castShadow=!0,a.visible=!1,a.frustumCulled=!1,a.matrixAutoUpdate=!1,x.add(a),a});let u=null;if(J&&c.skirts.index.length){const e=new t.BufferGeometry;e.setAttribute("position",new t.BufferAttribute(c.skirts.position,3)),e.setAttribute("aPhoto",new t.BufferAttribute(c.skirts.photo,2)),e.setAttribute("aA",new t.BufferAttribute(c.skirts.alpha,1,!0)),e.setIndex(new t.BufferAttribute(c.skirts.index,1)),e.computeBoundingSphere(),u=new t.Mesh(e,J),u.name="city-skirts",u.renderOrder=-6.5,u.matrixAutoUpdate=!1,x.add(u)}const z=u?{position:u.geometry.attributes.position,aPhoto:u.geometry.attributes.aPhoto,aA:u.geometry.attributes.aA,index:u.geometry.index}:null,Z=()=>[[B.position,"walls","position"],[B.normal,"walls","normal"],[B.aU,"walls","u"],[B.aF,"walls","facade"],[B.aC,"walls","color"],[ie,"walls","index"],[le,"walls","detail"],[H.position,"roofs","position"],[H.aPhoto,"roofs","photo"],[H.aAxis,"roofs","axis"],[se,"roofs","index"],...z?[[z.position,"skirts","position"],[z.aPhoto,"skirts","photo"],[z.aA,"skirts","alpha"],[z.index,"skirts","index"]]:[],[T[0].geometry.index,"casters","walls"],[T[1].geometry.index,"casters","roofs"]];function Re(){this.array=null}for(const[e]of Z())e.onUpload(Re);const Ae=Z().reduce((e,[o])=>e+o.array.byteLength,0);c.walls=c.roofs=c.skirts=c.casters=null;const _=f.domElement;function de(){x.visible=!1,T.forEach(e=>{e.userData.shadowBake=!1})}function he(){Y(A?Be(i.geo):null).then(e=>{for(const[o,a,r]of Z())o.array=e[a][r],o.needsUpdate=!0;x.visible=!0,T.forEach(o=>{o.userData.shadowBake=!0}),w.userData.atmosphere?.refreshShadows?.()}).catch(e=>console.warn("[city] ricostruzione dopo la perdita del contesto",e))}_.addEventListener("webglcontextlost",de),_.addEventListener("webglcontextrestored",he);const g=c.cells,ye=[];for(let e=0;e<g.length;e+=13)ye.push({m:g[e],ws:g[e+1],we:g[e+2],rs:g[e+3],re:g[e+4],box:new t.Box3(new t.Vector3(g[e+5],-1,g[e+6]),new t.Vector3(g[e+7],g[e+9]+1,g[e+8])),size:0,children:null});let D=ye,ee=0;for(;D.length>1;){ee++;const e=new Map;for(const o of D){const a=Math.floor(o.m/4**ee);let r=e.get(a);r||e.set(a,r={m:a*4**ee,ws:o.ws,we:o.we,rs:o.rs,re:o.re,box:o.box.clone(),size:0,children:[]}),r.ws=Math.min(r.ws,o.ws),r.we=Math.max(r.we,o.we),r.rs=Math.min(r.rs,o.rs),r.re=Math.max(r.re,o.re),r.box.union(o.box),r.children.push(o)}D=[...e.values()].map(o=>o.children.length===1?o.children[0]:o)}const ue=e=>{e.size=Math.max(e.box.max.x-e.box.min.x,e.box.max.z-e.box.min.z),e.children?.forEach(ue)},K=D[0];K&&ue(K);const te=new t.Frustum,pe=new t.Matrix4,v=new t.Vector3,q=[],k=s.local,j=s.cornerX,W=[new t.Box3().setFromPoints([k(-230,0,-6),k(230,0,-6),k(-230,60,230),k(230,60,230)]),new t.Box3().setFromPoints([k(j-6,0,-230),k(j-6,0,230),k(j+230,60,-230),k(j+230,60,230)])];let P=!1;function me(e){if(!te.intersectsBox(e.box)||P&&!(e.box.intersectsBox(W[0])||e.box.intersectsBox(W[1])))return;const o=e.box.distanceToPoint(v);if(!e.children||e.size<o*ke){e.d=o,q.push(e);return}for(const a of e.children)me(a)}function we(e,o){const a=o==="w"?"ws":"rs",r=o==="w"?"we":"re",h=[];for(const d of e){const l=h[h.length-1];l&&l.e===d[a]?(l.e=d[r],l.d=Math.min(l.d,d.d)):d[r]>d[a]&&h.push({s:d[a],e:d[r],d:d.d})}for(;h.length>V;){let d=1;for(let m=2;m<h.length;m++)h[m].s-h[m-1].e<h[d].s-h[d-1].e&&(d=m);const l=h[d-1],p=h.splice(d,1)[0];l.e=p.e,l.d=Math.min(l.d,p.d)}return h.sort((d,l)=>d.d-l.d)}let ve={ranges:0,triangles:0};const I=[];let ge=1;const Me=(e,o)=>{o=Math.max(o,1);const a=Math.max(Math.abs(e.min.x-v.x),Math.abs(e.max.x-v.x)),r=Math.max(Math.abs(e.min.z-v.z),Math.abs(e.max.z-v.z));return e.max.y*Math.min(1,Math.sqrt(a*a+r*r)/o)*ge>Se*o};function be(e,o){if(Me(e.box,o)){if(!e.children){e.d=o,I.push(e);return}for(const a of e.children)!te.intersectsBox(a.box)||P&&!(a.box.intersectsBox(W[0])||a.box.intersectsBox(W[1]))||be(a,a.box.distanceToPoint(v))}}function Pe(e){const o=e?.camera||i.camera;o.updateMatrixWorld(),pe.multiplyMatrices(o.projectionMatrix,o.matrixWorldInverse),te.setFromProjectionMatrix(pe),o.getWorldPosition(v);const a=s.toLocal(v);P=v.y<4.2&&a.z<-.25&&a.z>-n.depth-1&&a.x>n.rx0-1&&a.x<n.rx1+1,q.length=0,K&&me(K),q.sort((l,p)=>l.ws-p.ws),ge=o.projectionMatrix.elements[5]*.5*f.domElement.height,I.length=0;for(const l of q)be(l,l.d);I.sort((l,p)=>l.ws-p.ws);const r=we(I,"w"),h=we(q,"r");let d=0;for(let l=0;l<V;l++){const p=N[l],m=r[l],R=h[l];p.walls.visible=!!m,p.roofs.visible=!!R,m&&(p.walls.geometry.setDrawRange(m.s,m.e-m.s),p.walls.renderOrder=.1+l*.01,d+=(m.e-m.s)/3),R&&(p.roofs.geometry.setDrawRange(R.s,R.e-R.s),p.roofs.renderOrder=.1+l*.01,d+=(R.e-R.s)/3)}if(u&&(u.visible=v.y>6&&!P),y){const l=y.geometry.boundingBox.distanceToPoint(v);y.visible=!P&&l<L.near&&v.y<140,y.visible&&(d+=y.geometry.index.count/3)}ve={ranges:r.length+h.length,wallRanges:r.length,roofRanges:h.length,triangles:Math.round(d),inside:P}}const S=c.colliders;let U=null;const xe={object3d:x,update:Pe,dispose(){_.removeEventListener("webglcontextlost",de),_.removeEventListener("webglcontextrestored",he);for(const e of N)e.walls.geometry.dispose(),e.roofs.geometry.dispose();E.dispose(),Q.dispose(),J?.dispose(),u?.geometry.dispose(),y?.geometry.dispose(),ne.dispose(),T.forEach(e=>e.geometry.dispose()),ce.dispose(),x.removeFromParent()},info:{...c.stats,workerWaitMs:Math.round(ae),mainMs:Math.round(performance.now()-b-ae),get frame(){return ve},quality:i.quality,photoRoofs:!!F,geometryMB:+(Ae/1048576).toFixed(1)}};return Object.defineProperty(xe,"colliders",{configurable:!0,enumerable:!0,get(){if(!U&&S){U=[];for(let e=0;e+1<S.offsets.length;e++){const o=[];for(let a=S.offsets[e];a<S.offsets[e+1];a++)o.push([S.points[a*2],S.points[a*2+1]]);U.push({pts:o,h:S.heights[e],kind:S.kinds?.[e]?"balcone":"edificio"})}}return U||[]}}),xe}export{Ze as build};
