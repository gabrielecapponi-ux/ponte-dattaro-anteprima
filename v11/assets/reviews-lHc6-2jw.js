import{S as a,e as t,i as u,U}from"./texts-DTYXJfVM.js";const R=6,k=e=>/^https?:\/\//i.test(String(e||"").trim())?String(e).trim():"";function I(e){const s=e.texts||{},i=s.reviews&&typeof s.reviews=="object"?s.reviews:{};return{kicker:a(i.kicker,s.reviewsKicker,s["reviews.kicker"],"Recensioni Google"),title:a(i.title,s.reviewsTitle,s["reviews.title"]),accent:a(i.titleAccent,s.reviewsTitleAccent,s["reviews.titleAccent"]),subtitle:a(i.subtitle,i.text,s.reviewsSubtitle,s["reviews.subtitle"],"Le opinioni di chi viene in farmacia sono su Google. Leggile, oppure racconta com’è andata: ci aiuta a fare meglio."),note:a(i.note,s.reviewsNote,s["reviews.note"],"Anteprima del layout. Le schede qui sotto sono segnaposto: qui compariranno le recensioni reali da Google, mai testi inventati."),compactNote:a(i.compactNote,s.reviewsCompactNote,"Mostriamo solo recensioni reali: le trovi su Google, con il nome di chi le ha scritte.")}}function M(e,s){const{main:i,accent:r}=e?U(e,s):{main:"Cosa dicono",accent:"di noi."};return r?`${t(i)} <span>${t(r)}</span>`:t(i)}const $=e=>Number(e).toLocaleString("it-IT",{minimumFractionDigits:1,maximumFractionDigits:1});function C(e){const s=/^(\d{4})-(\d{2})(?:-(\d{2}))?/.exec(String(e||""));return s?{text:new Date(+s[1],+s[2]-1,+(s[3]||1)).toLocaleDateString("it-IT",{month:"long",year:"numeric"}),iso:s[0]}:{text:a(String(e||"")),iso:""}}function N(e){const s=Array.from({length:5},()=>u("stella",{size:20})).join(""),i=Math.max(0,Math.min(100,Number(e)/5*100));return`<span class="pd-reviews__stars" aria-hidden="true"><span class="pd-reviews__stars-base">${s}</span><span class="pd-reviews__stars-fill" style="width:${i.toFixed(1)}%">${s}</span></span>`}function y({href:e,label:s,cls:i,note:r}){return e?`<a class="pd-reviews__btn ${i}" href="${t(e)}" target="_blank" rel="noopener noreferrer">${t(s)}<span class="pd-reviews__sr"> (${t(r)})</span>${u("esterno",{size:20})}</a>`:""}function F(e){return`<li class="pd-reviews__card pd-reviews__card--example">
    <div class="pd-reviews__card-top"><span class="pd-reviews__badge">Esempio</span><span class="pd-reviews__source">Valutazione da Google</span></div>
    <p class="pd-reviews__text">${t(e||"Qui comparirà una recensione reale da Google.")}</p>
    <p class="pd-reviews__meta"><span class="pd-reviews__avatar" aria-hidden="true">${u("recensione",{size:20})}</span><span>Nome e data dalla recensione originale</span></p>
  </li>`}function j(e,s){const i=e.example===!0,r=a(e.author,e.name)||(i?"Autore di esempio":"Cliente su Google"),o=a(e.text),c=C(e.date),l=Number.isFinite(Number(e.rating))&&Number(e.rating)>0,m=`pd-review-${s}`;return`<li class="pd-reviews__card${i?" pd-reviews__card--example":""}">
    <article aria-labelledby="${m}">
      <div class="pd-reviews__card-top">${i?'<span class="pd-reviews__badge">Esempio</span>':""}${l?`${N(e.rating)}<span class="pd-reviews__sr">Valutazione ${$(e.rating)} su 5</span>`:""}</div>
      ${o?`<blockquote class="pd-reviews__text"><p>${t(o)}</p></blockquote>`:""}
      <p class="pd-reviews__meta"><span class="pd-reviews__avatar" aria-hidden="true">${t(r.charAt(0).toUpperCase())}</span><span><strong id="${m}">${t(r)}</strong>${c.text?` · <time${c.iso?` datetime="${c.iso}"`:""}>${t(c.text)}</time>`:""}<br>${i?"Testo di esempio, non una recensione reale":"Recensione su Google"}</span></p>
    </article>
  </li>`}function D(e,s){const i=s.reviews||{},r=s.pharmacy||{},o=I(s),c=(Array.isArray(i.items)?i.items:[]).filter(n=>n&&a(n.text,n.author,n.name)),l=i.mode==="widget"&&c.length>0,m=c.filter(n=>n.example!==!0),p=Number(i.rating),_=Number(i.count),w=/^\d{4}-\d{2}-\d{2}$/.test(String(i.verifiedAt||""))?String(i.verifiedAt):"",h=Number.isFinite(p)&&p>0&&p<=5&&Number.isFinite(_)&&_>0&&!!w,v=l||i.showPreview===!0,b=k(a(r.googleReviewsUrl,r.mapsUrl)),g=k(a(r.googleWriteReviewUrl,i.writeUrl))||(a(r.googlePlaceId)?`https://search.google.com/local/writereview?placeid=${encodeURIComponent(a(r.googlePlaceId))}`:""),f=w?w.split("-").reverse().join("/"):"",A=h?`<div class="pd-reviews__summary">
      <span class="pd-reviews__score">${$(p)}</span>
      <span class="pd-reviews__summary-side">${N(p)}<span>su Google · ${_.toLocaleString("it-IT")} recensioni<br><small>controllato il ${t(f)}</small></span></span>
      <span class="pd-reviews__sr">Valutazione media ${$(p)} su 5 su Google, ${_} recensioni, controllata il ${t(f)}</span>
    </div>`:"",G=l?"Recensioni da Google":"Anteprima del layout: schede di esempio, non recensioni reali",S=c.filter(n=>n.example===!0).map(n=>a(n.text)),L=v?l?c.slice(0,R).map(j).join(""):[0,1,2].map(n=>F(S[n])).join(""):"",T=v&&(!l||m.length===0)?`<p class="pd-reviews__note">${u("info",{size:20})}<span>${t(o.note)}</span></p>`:"",z=!v&&!h?`<p class="pd-reviews__honest">${t(o.compactNote)}</p>`:"";e.innerHTML=`
    <div class="pd-reviews__head">
      <div class="pd-reviews__head-main">
        <p class="pd-reviews__kicker">${u("recensione",{size:20})}${t(o.kicker)}</p>
        <h2 class="pd-reviews__title" id="reviews-title">${M(o.title,o.accent)}</h2>
      </div>
      <div class="pd-reviews__head-side">
        <p class="pd-reviews__subtitle">${t(o.subtitle)}</p>
        ${A}
        ${z}
        <div class="pd-reviews__actions">
          ${y({href:b,label:"Leggi le recensioni su Google",cls:"pd-reviews__btn--primary",note:"si apre Google in una nuova scheda"})}
          ${g&&g!==b?y({href:g,label:"Lascia una recensione",cls:"pd-reviews__btn--ghost",note:"su Google, in una nuova scheda"}):""}
        </div>
      </div>
    </div>
    ${T}
    ${v?`<ul class="pd-reviews__list${l?"":" pd-reviews__list--preview"}" aria-label="${t(G)}">${L}</ul>`:""}`,e.dataset.reviewsMode=l?"widget":"placeholder",e.classList.toggle("pd-reviews--compact",!v),e.hidden=!1;const d=e.querySelector(".pd-reviews__list");if(!d)return;const x=()=>{d.scrollWidth>d.clientWidth+2?d.setAttribute("tabindex","0"):d.removeAttribute("tabindex")};x(),"ResizeObserver"in window&&new ResizeObserver(x).observe(d)}export{D as mount};
