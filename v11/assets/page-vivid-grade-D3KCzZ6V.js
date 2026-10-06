import{t as c}from"./three-C6MGLOvV.js";const t={saturation:1.08,vibrance:.24,contrast:1.1,toe:.18,shadowTint:[.97,1,1.04],highlightTint:[1.035,1,.955]};let e=!1;function n(){if(e)return;e=!0;const o=t,r=a=>Number(a).toFixed(4);c.tonemapping_pars_fragment=c.tonemapping_pars_fragment.replace("vec3 CustomToneMapping( vec3 color ) { return color; }",`vec3 CustomToneMapping( vec3 color ) {
      color = NeutralToneMapping( color );
      float luma = dot( color, vec3( 0.2126, 0.7152, 0.0722 ) );
      float peak = max( color.r, max( color.g, color.b ) );
      float chroma = peak - min( color.r, min( color.g, color.b ) );
      float lift = ${r(o.saturation)} + ${r(o.vibrance)} * ( 1.0 - clamp( chroma * 2.2, 0.0, 1.0 ) );
      color = max( vec3( 0.0 ), mix( vec3( luma ), color, lift ) );
      vec3 curved = pow( color, vec3( 1.0 / 2.2 ) );
      curved = clamp( ( curved - 0.5 ) * ${r(o.contrast)} + 0.5, 0.0, 1.0 );
      curved = mix( curved, curved * curved * ( 3.0 - 2.0 * curved ), ${r(o.toe)} );
      color = pow( curved, vec3( 2.2 ) );
      float hl = smoothstep( 0.25, 0.9, luma );
      color *= mix( vec3( ${o.shadowTint.map(r).join(",")} ), vec3( ${o.highlightTint.map(r).join(",")} ), hl );
      return clamp( color, 0.0, 1.0 );
    }`)}export{n as i};
