import{ak as a}from"./three-DC_DBYxh.js";const c={toe:.12,saturation:1.05,vibrance:.22,shadowTint:[.985,1,1.02],highlightTint:[1.03,1,.958],contrast:1.06,curveToe:.05,curveShoulder:.12},o=e=>Number(e).toFixed(4),t=e=>`vec3( ${e.map(o).join(", ")} )`,r=`
float atmoLum( vec3 c ) { return dot( c, vec3( 0.2126, 0.7152, 0.0722 ) ); }
vec3 atmoNeutral( vec3 c ) {
  c = max( c, 0.0 );
  float x = min( c.r, min( c.g, c.b ) );
  c -= ${o(c.toe)} * ( x < 0.08 ? x - 6.25 * x * x : 0.04 );
  float peak = max( c.r, max( c.g, c.b ) );
  if ( peak < 0.76 ) return c;
  float np = 1.0 - 0.0576 / ( peak - 0.52 );
  c *= np / peak;
  return mix( c, vec3( np ), 1.0 - 1.0 / ( 0.15 * ( peak - np ) + 1.0 ) );
}
// display-referred linear in and out
vec3 atmoColour( vec3 c ) {
  float l = atmoLum( c );
  float chroma = max( c.r, max( c.g, c.b ) ) - min( c.r, min( c.g, c.b ) );
  c = max( mix( vec3( l ), c, ${o(c.saturation)} + ${o(c.vibrance)} * ( 1.0 - clamp( chroma * 2.2, 0.0, 1.0 ) ) ), 0.0 );
  return c * mix( ${t(c.shadowTint)}, ${t(c.highlightTint)}, smoothstep( 0.25, 0.9, l ) );
}
vec3 atmoToSRGB( vec3 c ) { return mix( c * 12.92, 1.055 * pow( c, vec3( 0.41666 ) ) - 0.055, step( 0.0031308, c ) ); }
// encoded (sRGB) in and out
vec3 atmoSCurve( vec3 s, float contrast ) {
  s = clamp( ( s - 0.46 ) * contrast + 0.46, 0.0, 1.0 );
  vec3 k = mix( vec3( ${o(c.curveToe)} ), vec3( ${o(c.curveShoulder)} ), step( 0.5, s ) );   // continuous at 0.5
  return mix( s, s * s * ( 3.0 - 2.0 * s ), k );
}`;function m(){const e=a;e.tonemapping_pars_fragment.includes("atmoNeutral")||(e.tonemapping_pars_fragment=e.tonemapping_pars_fragment.replace("vec3 CustomToneMapping( vec3 color ) { return color; }",`${r}
vec3 CustomToneMapping( vec3 color ) {
  vec3 s = atmoSCurve( atmoToSRGB( atmoColour( atmoNeutral( color * toneMappingExposure ) ) ), ${o(c.contrast)} );
  return mix( s / 12.92, pow( ( s + 0.055 ) / 1.055, vec3( 2.4 ) ), step( 0.04045, s ) );
}`))}export{c as T,r as a,m as p};
