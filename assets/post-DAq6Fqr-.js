import{q as S,aX as $,ad as j,aY as O,E as Q,_ as H,$ as J,H as Y,r as Z,w as ee,p as te}from"./three-DC_DBYxh.js";import{s as re,r as oe,P as ne}from"./sito-CCMHQ30Q.js";import{T as ae,a as se}from"./post-tone-BI-idYMK.js";import"./common-BJAAWmJM.js";const R={contrast:ae.contrast,contrastInside:1,vignette:.12,grain:{high:.009,medium:.011,low:0},bloom:{threshold:1.25,knee:.35,strength:.42,from:320,to:220}},d={high:{samples:4,scale:1,bloom:!0,grain:R.grain.high},medium:{samples:2,scale:1,bloom:!0,grain:R.grain.medium},low:{samples:0,scale:.8,bloom:!1,grain:R.grain.low}},g=4,le=`
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4( position.xy, 0.0, 1.0 ); }`,ue=`
uniform sampler2D tSrc;
uniform vec2 uTexel;
uniform float uThreshold, uKnee;
varying vec2 vUv;
float bright( vec3 c ) { return max( c.r, max( c.g, c.b ) ); }
void main() {
  vec3 a = texture2D( tSrc, vUv + uTexel * vec2( -1.0, -1.0 ) ).rgb;
  vec3 b = texture2D( tSrc, vUv + uTexel * vec2( 1.0, -1.0 ) ).rgb;
  vec3 c = texture2D( tSrc, vUv + uTexel * vec2( -1.0, 1.0 ) ).rgb;
  vec3 d = texture2D( tSrc, vUv + uTexel * vec2( 1.0, 1.0 ) ).rgb;
  float wa = 1.0 / ( 1.0 + bright( a ) ), wb = 1.0 / ( 1.0 + bright( b ) ), wc = 1.0 / ( 1.0 + bright( c ) ), wd = 1.0 / ( 1.0 + bright( d ) );
  vec3 s = ( a * wa + b * wb + c * wc + d * wd ) / ( wa + wb + wc + wd );
  float br = bright( s );
  float q = clamp( br - uThreshold + uKnee, 0.0, 2.0 * uKnee );
  q = q * q / ( 4.0 * uKnee + 1e-4 );
  gl_FragColor = vec4( s * max( q, br - uThreshold ) / max( br, 1e-4 ), 1.0 );
}`,ie=`
uniform sampler2D tSrc;
uniform vec2 uTexel;
varying vec2 vUv;
void main() {
  vec3 s = texture2D( tSrc, vUv ).rgb * 4.0;
  s += texture2D( tSrc, vUv - uTexel ).rgb;
  s += texture2D( tSrc, vUv + uTexel ).rgb;
  s += texture2D( tSrc, vUv + vec2( uTexel.x, - uTexel.y ) ).rgb;
  s += texture2D( tSrc, vUv - vec2( uTexel.x, - uTexel.y ) ).rgb;
  gl_FragColor = vec4( s * 0.125, 1.0 );
}`,ce=`
uniform sampler2D tSrc, tAdd;
uniform vec2 uTexel;
varying vec2 vUv;
void main() {
  vec2 h = uTexel * 0.5;
  vec3 s = texture2D( tSrc, vUv + vec2( -2.0 * h.x, 0.0 ) ).rgb + texture2D( tSrc, vUv + vec2( 2.0 * h.x, 0.0 ) ).rgb
         + texture2D( tSrc, vUv + vec2( 0.0, -2.0 * h.y ) ).rgb + texture2D( tSrc, vUv + vec2( 0.0, 2.0 * h.y ) ).rgb;
  s += 2.0 * ( texture2D( tSrc, vUv + vec2( -h.x, h.y ) ).rgb + texture2D( tSrc, vUv + vec2( h.x, h.y ) ).rgb
             + texture2D( tSrc, vUv + vec2( h.x, -h.y ) ).rgb + texture2D( tSrc, vUv + vec2( -h.x, -h.y ) ).rgb );
  gl_FragColor = vec4( s / 12.0 + texture2D( tAdd, vUv ).rgb, 1.0 );
}`,ve=`
uniform float uAspect;
varying vec2 vUv, vVig;
void main() {
  vUv = uv;
  vVig = ( uv - 0.5 ) * vec2( uAspect, 1.0 ) * inversesqrt( 0.25 * ( uAspect * uAspect + 1.0 ) );
  gl_Position = vec4( position.xy, 0.0, 1.0 );
}`,me=`
uniform sampler2D tScene, tBloom;
uniform float uBloom, uExposure, uContrast, uVignette, uGrain, uFrame;
varying vec2 vUv, vVig;
${se}
// interleaved gradient noise (Jimenez 2014): two decorrelated samples, cheaper than a hash
float ign( vec2 p ) { return fract( 52.9829189 * fract( dot( p, vec2( 0.06711056, 0.00583715 ) ) ) ); }
void main() {
  vec3 c = texture2D( tScene, vUv ).rgb;
  if ( uBloom > 0.0 ) c += texture2D( tBloom, vUv ).rgb * uBloom;
  // Optical vignette (scene-referred).
  float r2 = dot( vVig, vVig );
  c *= uExposure * ( 1.0 - uVignette * r2 * sqrt( r2 ) );
  vec3 s = atmoSCurve( atmoToSRGB( atmoColour( atmoNeutral( c ) ) ), uContrast );
  // Fine grain (24 fps, deterministic) plus a triangular dither against banding.
  vec2 px = floor( gl_FragCoord.xy );
  float n = ign( px + uFrame * vec2( 47.0, 17.0 ) ) + ign( px.yx + uFrame * vec2( 23.0, 61.0 ) + 7.0 ) - 1.0;
  s += n * ( uGrain * ( 1.0 - 0.6 * atmoLum( s ) ) + 0.5 / 255.0 );
  gl_FragColor = vec4( s, 1.0 );
}`,y=(p,r,v,U=le)=>new Z({name:p,uniforms:v,vertexShader:U,fragmentShader:r,depthTest:!1,depthWrite:!1,toneMapped:!1});async function xe(p){const{renderer:r}=p;let v=d[p.quality]?p.quality:"high";const U=d[v].samples,h=r.getContext(),B=typeof WebGL2RenderingContext<"u"&&h instanceof WebGL2RenderingContext,D=B&&(r.extensions.has("EXT_color_buffer_float")||r.extensions.has("EXT_color_buffer_half_float"));D||console.warn("[post] WebGL2 float targets unavailable: direct rendering");let E=1,M=1,_=r.getPixelRatio(),C=!1;const P=new S,x={calls:0,triangles:0,points:0,lines:0},c=R;let e=null;const F={bloomPasses:0},A=(()=>{if(!B||!r.extensions.has("EXT_color_buffer_float"))return!1;try{const t=h.getInternalformatParameter(h.RENDERBUFFER,h.R11F_G11F_B10F,h.SAMPLES);return!!t&&t.length>0&&Math.max(...t)>=4}catch{return!1}})()&&!0,z=A?{type:J,format:H}:{type:Y};function K(){const t=(m={})=>new Q(1,1,{...z,depthBuffer:!1,stencilBuffer:!1,...m}),n=t({samples:U,depthBuffer:!0});n.resolveDepthBuffer=!1,n.texture.name="post.scene";const l=Array.from({length:g},(m,b)=>{const T=t();return T.texture.name=`post.bloom${b}`,T}),o=Array.from({length:g-1},(m,b)=>{const T=t();return T.texture.name=`post.bloomUp${b}`,T}),i=y("PostBloomPrefilter",ue,{tSrc:{value:n.texture},uTexel:{value:new S},uThreshold:{value:c.bloom.threshold},uKnee:{value:c.bloom.knee}}),u=y("PostBloomDown",ie,{tSrc:{value:null},uTexel:{value:new S}}),s=y("PostBloomUp",ce,{tSrc:{value:null},tAdd:{value:null},uTexel:{value:new S}}),f=y("PostGrade",me,{tScene:{value:n.texture},tBloom:{value:o[0].texture},uBloom:{value:0},uExposure:{value:1},uContrast:{value:c.contrast},uVignette:{value:c.vignette},uGrain:{value:d[v].grain},uFrame:{value:0},uAspect:{value:1}},ve),a=new $(i);e={sceneRT:n,down:l,up:o,prefilter:i,downMat:u,upMat:s,grade:f,quad:a}}function G(){if(!e)return;const t=d[v],n=Math.max(1,Math.round(E*_*t.scale)),l=Math.max(1,Math.round(M*_*t.scale));e.sceneRT.setSize(n,l);for(let o=0;o<g;o++){const i=4<<o,u=Math.max(1,Math.round(n/i)),s=Math.max(1,Math.round(l/i));e.down[o].setSize(u,s),o<g-1&&e.up[o].setSize(u,s)}e.grade.uniforms.uAspect.value=E/Math.max(1,M)}function L(){e&&(e.grade.uniforms.uGrain.value=d[v].grain,G())}function q(){e&&([e.prefilter,e.downMat,e.upMat,e.grade].forEach(t=>t.dispose()),e.quad.dispose(),[e.sceneRT,...e.down,...e.up].forEach(t=>t.dispose()),e=null)}if(D)try{K(),L()}catch(t){console.warn("[post] chain unavailable, direct rendering",t),q()}function V(t,n,l=r.getPixelRatio()){E=Math.max(1,t),M=Math.max(1,n),_=l,C=!0,G()}function k(t){!d[t]||t===v||(v=t,L())}function w(t,n){e.quad.material=t,r.setRenderTarget(n),e.quad.render(r)}function I(t,n=1){const{sceneRT:l,down:o,up:i,prefilter:u,downMat:s,upMat:f}=e;u.uniforms.uTexel.value.set(1/l.width,1/l.height),u.uniforms.uThreshold.value=c.bloom.threshold/n,u.uniforms.uKnee.value=c.bloom.knee/n,w(u,o[0]);for(let a=1;a<g;a++)s.uniforms.tSrc.value=o[a-1].texture,s.uniforms.uTexel.value.set(1/o[a-1].width,1/o[a-1].height),w(s,o[a]);for(let a=g-2;a>=0;a--){const m=a===g-2?o[a+1]:i[a+1];f.uniforms.tSrc.value=m.texture,f.uniforms.tAdd.value=o[a].texture,f.uniforms.uTexel.value.set(1/m.width,1/m.height),w(f,i[a])}return F.bloomPasses=2*g-1,t/g}function W(t,n,l={}){if(!e){r.setRenderTarget(null),r.render(t,n);return}C||(r.getSize(P),V(P.x,P.y,r.getPixelRatio()));const{sceneRT:o,grade:i}=e,u=r.autoClear;r.autoClear=!0,r.setRenderTarget(o),r.render(t,n),Object.assign(x,r.info.render);const s=i.uniforms,f=n.position.y,a=d[v].bloom?1-re(c.bloom.to,c.bloom.from,f):0;F.bloomPasses=0;const m=r.toneMappingExposure||1;s.uBloom.value=a>.001?I(c.bloom.strength*a,m):0;const b=l.p??0;s.uExposure.value=m,s.uFrame.value=Math.floor((l.elapsed??0)*24)%977,s.uContrast.value=c.contrast+(c.contrastInside-c.contrast)*oe(ne.softContrast,b),w(i,null),r.autoClear=u,Object.assign(r.info.render,{calls:x.calls,triangles:x.triangles,points:x.points,lines:x.lines})}function N(){q()}function X(){if(!e||!r.compileAsync)return Promise.resolve();const t=new j(2,2),n=i=>{const u=new ee;return i.forEach(s=>u.add(new te(t,s))),u},l=r.getRenderTarget(),o=[];try{r.setRenderTarget(e.down[0]),o.push(r.compileAsync(n([e.prefilter,e.downMat,e.upMat]),new O)),r.setRenderTarget(null),o.push(r.compileAsync(n([e.grade]),new O))}finally{r.setRenderTarget(l)}return Promise.all(o).finally(()=>t.dispose())}return{render:W,setSize:V,setQuality:k,dispose:N,compile:X,get active(){return!!e},get info(){return{supported:D,quality:v,samples:e?e.sceneRT.samples:0,format:A?"R11G11B10F":"RGBA16F",buffer:e?[e.sceneRT.width,e.sceneRT.height]:null,bloomPasses:F.bloomPasses}}}}export{R as POST_LOOK,xe as createPost};
