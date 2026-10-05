import{sectionText as u,resultMarkup as G,hasWhatsApp as O,createPickup as Z,showError as z,clearError as P,fillResult as w,missingSummary as W}from"./ordina-D7YC9zT7.js";import{s as B,i as l,e as v}from"./texts-DTYXJfVM.js";const i="ric",I=5,f=15,T=o=>String(o||"").toUpperCase().replace(/[\s.\-_/]/g,""),F=/^[A-Z]{6}[0-9LMNPQRSTUV]{2}[A-Z][0-9LMNPQRSTUV]{2}[A-Z][0-9LMNPQRSTUV]{3}[A-Z]$/;function K(o,s,_){return o?F.test(o)?"Questo sembra un codice fiscale: non serve. Scrivi solo il codice NRE.":/^[A-Z0-9]+$/.test(o)?o.length!==f?`Il codice NRE ha ${f} caratteri: ne hai scritti ${o.length}.`:_.indexOf(o)!==s?"Questo codice è già inserito.":"":"Usa solo lettere e numeri.":s===0?"Scrivi il codice NRE della ricetta.":"Scrivi il codice oppure togli questa riga."}function J(o,s=B){const _=u(s,"ricetta","kicker","Invio ricetta"),U=u(s,"ricetta","title","Hai una ricetta elettronica?"),D=u(s,"ricetta","lead",u(s,"ricetta","subtitle","Mandaci il codice NRE del promemoria: prepariamo i farmaci e ti diciamo quando passare.")),H=u(s,"ricetta","note","Modulo dimostrativo: procedura e privacy vanno definite con la farmacia.");o.classList.add("pd-req-section"),o.innerHTML=`
    <div class="pd-req__inner">
      <div class="pd-req__intro">
        <div class="pd-req__tags">
          <p class="pd-req__kicker">${l("ricetta",{size:20})}<span>${v(_)}</span></p>
          <p class="pd-demo-badge">Modulo dimostrativo</p>
        </div>
        <h2 class="pd-req__title" id="ricetta-title">${v(U)}</h2>
        <p class="pd-req__lead">${v(D)}</p>
        <ol class="pd-req__steps">
          <li><span class="pd-req__step-icon">${l("documento",{size:24})}<b aria-hidden="true">1</b></span>
            <span><strong>Trova il codice NRE</strong>È sul promemoria della ricetta elettronica, vicino al codice a barre, o nel messaggio del medico. Ha 15 caratteri.</span></li>
          <li><span class="pd-req__step-icon">${l("whatsapp",{size:24})}<b aria-hidden="true">2</b></span>
            <span><strong>Mandaci il codice</strong>La farmacia controlla la ricetta e prepara i farmaci. Se qualcosa va ordinato, te lo dice.</span></li>
          <li><span class="pd-req__step-icon">${l("ordina",{size:24})}<b aria-hidden="true">3</b></span>
            <span><strong>Ritira con la tessera sanitaria</strong>Portala con te in farmacia. Qui non ti chiediamo il codice fiscale.</span></li>
        </ol>
        <p class="pd-req__concept">${l("info",{size:18})}<span>${v(H)}</span></p>
      </div>

      <form class="pd-req" id="${i}-form" novalidate aria-labelledby="${i}-form-title">
        <h3 class="pd-req__form-title" id="${i}-form-title">Invia il codice della ricetta</h3>

        <div class="pd-privacy" role="note" aria-labelledby="${i}-privacy-title">
          <p class="pd-privacy__title" id="${i}-privacy-title">${l("info",{size:20})}<span>Dati sanitari: leggi prima di inviare</span></p>
          <ul>
            <li>Il codice della ricetta è un dato sulla salute. Invialo solo tramite i canali indicati dalla farmacia.</li>
            <li>Il sito non salva e non trasmette nulla: il codice va solo nel messaggio che invii tu, dal tuo WhatsApp.</li>
            <li>Non scrivere il codice fiscale, diagnosi o altri dati sulla salute.</li>
            <li>Modulo dimostrativo: nel sito definitivo l’invio userà un canale conforme al GDPR, scelto con la farmacia.</li>
          </ul>
        </div>

        <fieldset class="pd-req__group">
          <legend class="pd-req__legend">Codice NRE <span class="pd-req__optional" data-count>· 1 ricetta</span></legend>
          <p class="pd-req__hint pd-req__hint--top" id="${i}-nre-hint">15 caratteri tra lettere e numeri. Gli spazi non contano. Una riga per ogni ricetta.</p>
          <ol class="pd-req__rows" data-rows></ol>
          <button type="button" class="pd-req__add" data-add><span aria-hidden="true">+</span> Aggiungi un’altra ricetta</button>
        </fieldset>

        <div data-pickup></div>

        <div class="pd-consent">
          <label for="${i}-consent">
            <input type="checkbox" id="${i}-consent" name="consenso" aria-describedby="${i}-consent-err">
            <span>Ho letto l’avviso. Scelgo di inviare alla farmacia il codice della ricetta con WhatsApp.</span>
          </label>
          <p class="pd-req__error" id="${i}-consent-err" hidden></p>
        </div>

        <button type="submit" class="pd-req__submit">${l("whatsapp",{size:22})}<span>Prepara il messaggio</span></button>
        <p class="pd-req__status" data-status role="status" aria-live="polite"></p>
        ${G(i,O(s))}
      </form>
    </div>`;const r=o.querySelector("form"),c=r.querySelector("[data-rows]"),$=r.querySelector("[data-add]"),Q=r.querySelector("[data-count]"),d=r.querySelector(`#${i}-consent`),y=r.querySelector(`#${i}-consent-err`),S=r.querySelector("[data-status]"),m=r.querySelector("[data-result]");let E=!1,g=!1,V=0;function R(e){if(c.children.length>=I)return;const t=++V,a=document.createElement("li");a.className="pd-req__row pd-req__row--code",a.innerHTML=`
      <div class="pd-req__field pd-req__product">
        <div class="pd-req__labelrow">
          <label class="pd-req__label" for="${i}-n${t}" data-label>Codice NRE</label>
          <span class="pd-req__count" data-chars aria-hidden="true">0/${f}</span>
        </div>
        <input class="pd-req__input pd-req__input--code" id="${i}-n${t}" type="text" autocomplete="off" autocapitalize="characters"
          autocorrect="off" spellcheck="false" maxlength="24" enterkeyhint="next" data-code aria-describedby="${i}-nre-hint ${i}-n${t}-err">
        <p class="pd-req__error" id="${i}-n${t}-err" data-err hidden></p>
      </div>
      <button type="button" class="pd-req__remove" data-remove>${l("chiudi",{size:20})}<span class="sr-only">Rimuovi</span></button>`,c.append(a),k(),e&&a.querySelector("[data-code]").focus()}function k(){const e=[...c.children];e.forEach((t,a)=>{t.querySelector("[data-label]").textContent=e.length>1?`Codice NRE · ricetta ${a+1}`:"Codice NRE",t.querySelector("[data-remove] .sr-only").textContent=`Rimuovi la ricetta ${a+1}`,t.querySelector("[data-remove]").hidden=e.length===1}),$.hidden=e.length>=I,Q.textContent=`· ${e.length} ${e.length===1?"ricetta":"ricette"}`}c.addEventListener("click",e=>{const t=e.target.closest("[data-remove]");if(!t)return;const a=t.closest("li"),n=a.previousElementSibling||a.nextElementSibling;a.remove(),k(),n?.querySelector("[data-code]")?.focus(),p()}),c.addEventListener("input",e=>{if(!e.target.matches("[data-code]"))return;const t=T(e.target.value).length,a=e.target.closest("li").querySelector("[data-chars]");a.textContent=`${t}/${f}`,a.classList.toggle("is-ok",t===f)}),c.addEventListener("focusout",e=>{!e.target.matches("[data-code]")||!e.target.value.trim()||C(!0,e.target)}),c.addEventListener("keydown",e=>{if(e.key!=="Enter"||!e.target.matches("[data-code]"))return;e.preventDefault();const t=e.target.closest("li").nextElementSibling;t?t.querySelector("[data-code]").focus():r.querySelector(`input[name="${i}-day"]:checked, input[name="${i}-day"]:not(:disabled)`)?.focus()}),$.addEventListener("click",()=>{R(!0),p()});const N=Z(r.querySelector("[data-pickup]"),{prefix:i,site:s,onChange:()=>p()}),L=()=>[...c.querySelectorAll("[data-code]")].map(e=>T(e.value));function C(e,t){const a=L();let n=null;return[...c.children].forEach((b,A)=>{const h=b.querySelector("[data-code]");if(t&&h!==t)return;const M=K(a[A],A,a);M?(e&&z(h,b.querySelector("[data-err]"),M),n=n||h):e&&P(h,b.querySelector("[data-err]"))}),n}function q(e){const t=[],a=C(e);a&&t.push(a);const n=N.validate(e);return n&&t.push(n),d.checked?e&&P(d,y):(e&&z(d,y,"Per preparare il messaggio serve il tuo consenso."),t.push(d)),t[0]||null}function x(){const e=L(),t=N.value(),a=["Buongiorno! Vorrei far preparare i farmaci della ricetta elettronica."];return e.length===1?a.push(`Codice NRE: ${e[0]}`):(a.push(`Codici NRE (${e.length} ricette):`),e.forEach(n=>a.push(`• ${n}`))),a.push("",`Ritiro: ${t.when}, ${t.bandPhrase}.`,"Al ritiro porto la tessera sanitaria.","","Mi confermate quando è pronto? Grazie!"),a.join(`
`)}function p(){if(E&&q(!0),!!g){if(q(!1)){m.hidden=!0;return}w(r,x()),m.hidden=!1}}r.addEventListener("input",p),r.addEventListener("change",e=>{e.target===d&&p()}),r.addEventListener("submit",e=>{e.preventDefault(),E=!0;const t=q(!0);if(t){S.textContent=W(r),m.hidden=!0,g=!1,t.focus();return}S.textContent="",g=!0,w(r,x()),m.hidden=!1;const a=r.querySelector(`#${i}-result-title`);let n=!1;try{n=matchMedia("(prefers-reduced-motion: reduce)").matches}catch{}a.scrollIntoView({behavior:n?"auto":"smooth",block:"center"}),a.focus({preventScroll:!0})}),R(!1),location.hash==="#ricetta"&&requestAnimationFrame(()=>o.scrollIntoView({block:"start"}))}const Y=["La farmacia accetta il codice NRE via WhatsApp (o indica un altro canale, conforme al GDPR).","Il solo NRE basta per preparare: il codice fiscale si verifica al ritiro con la tessera sanitaria.","Formato NRE: controllo indicativo a 15 caratteri alfanumerici.",'Tempi di preparazione e avviso di "pronto" gestiti dalla farmacia.'];export{Y as ASSUMPTIONS,J as mount};
