import{s as ae,i as v,e as C,l as oe,m as se,W as le,I as de,k as ce,z as pe,f as ue,x as me,h as he,J as Z}from"./texts-DTYXJfVM.js";function B(t,e,r,m){const y=t?.texts||{},h=y[`${e}.${r}`]??y[e]?.[r]??y[`${e}${r[0].toUpperCase()}${r.slice(1)}`];return typeof h=="string"&&h.trim()?h.trim():m}const G=780,J=30,X=(t,e)=>{const r=new Date(`${t}T12:00:00Z`);return r.setUTCDate(r.getUTCDate()+e),r.toISOString().slice(0,10)},ne=(t,e)=>new Intl.DateTimeFormat("it-IT",{timeZone:"UTC",...e}).format(new Date(`${t}T12:00:00Z`)),fe=t=>ne(t,{weekday:"short",day:"numeric",month:"short"}),H=t=>ne(t,{weekday:"long",day:"numeric",month:"long"});function V(t="Europe/Rome"){try{const e=Object.fromEntries(new Intl.DateTimeFormat("en-CA",{timeZone:t,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).formatToParts(new Date).map(r=>[r.type,r.value]));return{iso:`${e.year}-${e.month}-${e.day}`,minute:Number(e.hour)*60+Number(e.minute)}}catch{const e=new Date;return{iso:`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}-${String(e.getDate()).padStart(2,"0")}`,minute:e.getHours()*60+e.getMinutes()}}}const Q=new WeakMap;function ge(t){if(!t||typeof t!="object")return null;if(!Q.has(t)){let e=null;try{e=he(t)}catch{e=null}Q.set(t,e&&Object.values(e.weekly).some(r=>r.length)?e:null)}return Q.get(t)}const be=(t,e)=>t.length===e.length&&t.every((r,m)=>r[0]===e[m][0]&&r[1]===e[m][1]);function Y(t,e,r=V(t?.hours?.timezone)){const m=ge(t),y=e===r.iso;if(!m){const _=(g,I)=>({id:g,label:I,hours:"",available:!0,note:""});return{iso:e,known:!1,bands:[_("am","Mattina"),_("pm","Pomeriggio")],available:!0,reason:"",flag:""}}const h=oe(e,m),q=m.weekly[se(e)]||[];let d=h.intervals||[],p="",S="",E=!1;h.kind==="unknown"?(d=q,S="da confermare"):h.kind==="holiday"?p="festivo":h.kind==="turn"&&!be(d,q)&&(S="di turno");const f=le(de(m,r),e,p?[]:d);f?.mode==="closed"?(d=f.intervals,S="",d.length||(p=y?"chiuso oggi":"chiuso")):f?.mode==="open"&&(d=f.intervals,p="",S="da confermare",E=!!f.untimed),!p&&!d.length&&!E&&(p="chiuso");const D=(_,g,I,O)=>{if(E){const b=y&&O-r.minute<J;return{id:_,label:g,hours:"",available:!b,note:b?"orario passato":""}}const P=d.map(([b,w])=>[Math.max(b,I),Math.min(w,O)]).filter(([b,w])=>w-b>=30),z=P.length>0,A=z&&y&&Math.max(...P.map(b=>b[1]))-r.minute<J;return{id:_,label:g,hours:P.map(([b,w])=>`${Z(b)}–${Z(w)}`).join(" / "),available:z&&!A,note:z?A?"orario passato":"":"chiuso"}},k=[D("am","Mattina",0,G),D("pm","Pomeriggio",G,1440)],$=k.some(_=>_.available);return!p&&!$&&(p=y?"orario finito":"chiuso"),{iso:e,known:!0,bands:k,available:$,reason:p,flag:$?S:"",kind:f?`override-${f.mode}`:h.kind}}function j(t,e,r){if(!e)return;e.textContent=r,e.hidden=!1,(t?t.length!==void 0&&!t.tagName?[...t]:[t]:[]).forEach(y=>y.setAttribute("aria-invalid","true"))}function N(t,e){e&&(e.textContent="",e.hidden=!0),(t?t.length!==void 0&&!t.tagName?[...t]:[t]:[]).forEach(m=>m.removeAttribute("aria-invalid"))}function ye(t,{prefix:e,site:r=ae,onChange:m=()=>{}}){const y=r?.hours?.timezone||"Europe/Rome",h=V(y),q={today:Y(r,h.iso,h),tomorrow:Y(r,X(h.iso,1),h)},d=h.iso,p=X(h.iso,30),S=i=>i<d?"past":i>p?"far":"",E=i=>[fe(i.iso),i.available?i.flag:i.reason],f=(i,u,a,n,o,s)=>{const[l,M]=Array.isArray(n)?n:[n,""];return`
    <label class="pd-chip${o?" is-disabled":""}">
      <input type="radio" name="${e}-${i}" value="${u}"${o?" disabled":""} aria-describedby="${s}">
      <span class="pd-chip__text"><span class="pd-chip__main">${a}</span><span class="pd-chip__sub">${C(l)}</span>${M?`<span class="pd-chip__flag">${C(M)}</span>`:""}</span>
    </label>`},D=r?.hours?.note||"Gli orari possono cambiare: la farmacia ti conferma il ritiro.";t.innerHTML=`
    <fieldset class="pd-req__group">
      <legend class="pd-req__legend">Giorno di ritiro</legend>
      <div class="pd-req__chips pd-req__chips--days">
        ${f("day","today","Oggi",E(q.today),!q.today.available,`${e}-day-err`)}
        ${f("day","tomorrow","Domani",E(q.tomorrow),!q.tomorrow.available,`${e}-day-err`)}
        ${f("day","other","Altro giorno","scegli la data",!1,`${e}-day-err`)}
      </div>
      <div class="pd-req__field pd-req__other" data-other hidden>
        <label class="pd-req__label" for="${e}-date">Scegli il giorno</label>
        <input class="pd-req__input pd-req__input--date" id="${e}-date" type="date" min="${d}" max="${p}" aria-describedby="${e}-day-err">
      </div>
      <p class="pd-req__error" id="${e}-day-err" hidden></p>
    </fieldset>
    <fieldset class="pd-req__group">
      <legend class="pd-req__legend">Fascia oraria</legend>
      <div class="pd-req__chips pd-req__chips--bands" data-bands></div>
      <p class="pd-req__error" id="${e}-band-err" hidden></p>
    </fieldset>
    <p class="pd-req__hint pd-req__hint--icon">${v("orari",{size:18})}<span>${C(D)}</span></p>`;const k=()=>t.querySelectorAll(`input[name="${e}-day"]`),$=()=>t.querySelectorAll(`input[name="${e}-band"]`),_=t.querySelector("[data-other]"),g=t.querySelector(`#${e}-date`),I=t.querySelector("[data-bands]"),O=t.querySelector(`#${e}-day-err`),P=t.querySelector(`#${e}-band-err`),z=()=>[...k()].find(i=>i.checked)?.value||"",A=()=>{const i=z();return i==="today"?q.today.iso:i==="tomorrow"?q.tomorrow.iso:i==="other"&&/^\d{4}-\d{2}-\d{2}$/.test(g.value)?g.value:""},b=()=>{const i=A();return i&&!S(i)?Y(r,i,V(y)):null};function w(){const i=[...$()].find(l=>l.checked)?.value||"",u=b(),a=A(),n=!!a&&!!S(a),o=u?u.bands:[{id:"am",label:"Mattina",hours:"",available:!0},{id:"pm",label:"Pomeriggio",hours:"",available:!0}];I.innerHTML=o.map(l=>f("band",l.id,l.label,u?l.available?l.hours:l.note:n?"scegli un’altra data":"scegli prima il giorno",u?!l.available:n,`${e}-band-err`)).join("");const s=[...$()].find(l=>l.value===i&&!l.disabled);s&&(s.checked=!0)}const x=q.today.available?"today":q.tomorrow.available?"tomorrow":"other",T=[...k()].find(i=>i.value===x);T&&(T.checked=!0),_.hidden=x!=="other",w(),t.addEventListener("change",i=>{i.target.name===`${e}-day`?(_.hidden=z()!=="other",!_.hidden&&!g.value&&g.focus({preventScroll:!0}),w()):i.target===g&&w(),m()}),g.addEventListener("input",()=>{w(),m()});function W(i){let u=null;const a=z(),n=b();let o="";a?a==="other"&&!A()?o="Scegli la data del ritiro.":a==="other"&&S(g.value)==="past"?o="Questa data è già passata: scegline un’altra.":a==="other"&&S(g.value)==="far"?o="Puoi scegliere al massimo 30 giorni in anticipo.":n&&!n.available&&(o=n.reason==="festivo"?"È un giorno festivo: scegli un altro giorno o chiama la farmacia per i turni.":n.reason==="orario finito"?"Per oggi l’orario di ritiro è finito: scegli un altro giorno.":"Quel giorno la farmacia è chiusa: scegli un altro giorno."):o="Scegli il giorno in cui passi a ritirare.";const s=a==="other"?g:[...k()].find(L=>L.checked)||[...k()].find(L=>!L.disabled);o?(i&&j(a==="other"?g:k(),O,o),u=s):i&&(N(k(),O),N(g,null));const l=[...$()].find(L=>L.checked),M=n&&l?n.bands.find(L=>L.id===l.value):null;let U="";return l?M&&!M.available&&(U="Questa fascia non è più disponibile: scegline un’altra."):U="Scegli mattina o pomeriggio.",U&&!o?(i&&j($(),P,U),u=u||[...$()].find(L=>!L.disabled)||null):i&&N($(),P),u}function R(){const i=A(),u=b(),a=[...$()].find(M=>M.checked);if(!i||!u||!a)return null;const n=u.bands.find(M=>M.id===a.value),o=z(),s=o==="today"?`oggi, ${H(i)}`:o==="tomorrow"?`domani, ${H(i)}`:H(i),l=`${n.id==="am"?"di mattina":"di pomeriggio"}${n.hours?` (${n.hours})`:""}`;return{iso:i,when:s,bandPhrase:l}}return{validate:W,value:R,focus:()=>k()[0]?.focus()}}function _e(t){const e=[...t.querySelectorAll(".pd-req__error")].filter(r=>!r.hidden&&r.textContent.trim()).map(r=>r.textContent.trim().replace(/[.!]+$/,""));return e.length?e.length===1?`Da sistemare: ${e[0].charAt(0).toLowerCase()}${e[0].slice(1)}.`:`Da sistemare (${e.length}): ${e.map(r=>r.charAt(0).toLowerCase()+r.slice(1)).join("; ")}. Trovi la spiegazione sotto ogni campo.`:"Manca qualcosa: trovi la spiegazione sotto ogni campo da completare."}function ve(t,e=!0){const r=e?ue():"";return`
    <div class="pd-req__result" data-result hidden>
      <h4 class="pd-req__result-title" id="${t}-result-title" tabindex="-1">Il messaggio è pronto</h4>
      <p class="pd-req__result-help">${r?"Controllalo: è il messaggio che arriverebbe alla farmacia.":"Controllalo. Poi apri WhatsApp e premi <strong>invia</strong>."}</p>
      <div class="pd-req__bubble" role="group" aria-label="Anteprima del messaggio"><p data-preview></p></div>
      ${r?`<p class="pd-preview-note" role="note">${v("info",{size:20})}<span>${C(r)}</span></p>`:""}
      ${e?`<a class="pd-req__wa" data-wa href="#" target="_blank" rel="noopener noreferrer">
        ${v("whatsapp",{size:24})}<span>${r?"Apri WhatsApp":"Apri WhatsApp e invia"}</span>${v("esterno",{size:20})}<span class="sr-only"> (si apre in una nuova finestra)</span>
      </a>`:""}
      <p class="pd-req__fine">${e?"Si apre WhatsApp con il testo già scritto: lo invii tu. Il sito non salva nulla.":"Copia il messaggio e mandalo alla farmacia. Il sito non salva nulla."}
        Non usi WhatsApp? ${re("Chiama la farmacia")}.</p>
    </div>`}function ee(t,e){t.querySelector("[data-preview]").textContent=e;const r=t.querySelector("[data-wa]");r&&(r.href=ce(e))}const qe=t=>!!t?.pharmacy?.whatsapp?.number,te=()=>{try{return C(me())}catch{return""}},re=t=>te()?`<a href="${te()}">${t}</a>`:t,F=t=>String(t||"").replace(/\s+/g," ").trim(),ie=()=>{try{return matchMedia("(prefers-reduced-motion: reduce)").matches}catch{return!1}};function $e(t,e,{instant:r=!1}={}){const m=e?.closest("form"),y=e?e.getBoundingClientRect().top-t.getBoundingClientRect().top:0,h=m&&y>window.innerHeight*.55?m:t,q=window.__journey?.state==="playing";h.scrollIntoView({behavior:r||q?"instant":ie()?"auto":"smooth",block:"start"}),e&&e.focus({preventScroll:!0})}const K=10,c="ord";function we(t,e=ae){const r=B(e,"ordina","kicker","Ordina e ritira"),m=B(e,"ordina","title","Ordina, poi passi a ritirare."),y=B(e,"ordina","lead",B(e,"ordina","subtitle","Scrivi cosa ti serve. Ti confermiamo disponibilità e prezzo su WhatsApp, poi passi in farmacia a ritirare.")),h=B(e,"ordina","note","Servizio dimostrativo: prodotti ordinabili e tempi di conferma sono da definire con la farmacia."),q=pe("ricetta")&&document.getElementById("ricetta")?'Farmaci con ricetta: qui non si ordinano. Usa <a href="#ricetta">l’invio della ricetta</a> oppure portala in farmacia.':`Farmaci con ricetta: qui non si ordinano. Porta la ricetta in farmacia o ${re("chiamaci")}.`;t.classList.add("pd-req-section"),t.innerHTML=`
    <div class="pd-req__inner">
      <div class="pd-req__intro">
        <p class="pd-req__kicker">${v("ordina",{size:20})}<span>${C(r)}</span></p>
        <h2 class="pd-req__title" id="ordina-title">${C(m)}</h2>
        <p class="pd-req__lead">${C(y)}</p>
        <ol class="pd-req__steps">
          <li><span class="pd-req__step-icon">${v("documento",{size:24})}<b aria-hidden="true">1</b></span>
            <span><strong>Scrivi cosa ti serve</strong>Prodotti da banco, integratori, cosmetici: nome e quantità.</span></li>
          <li><span class="pd-req__step-icon">${v("whatsapp",{size:24})}<b aria-hidden="true">2</b></span>
            <span><strong>La farmacia ti conferma</strong>Disponibilità e prezzo, con un messaggio su WhatsApp.</span></li>
          <li><span class="pd-req__step-icon">${v("ordina",{size:24})}<b aria-hidden="true">3</b></span>
            <span><strong>Ritiri in farmacia</strong>Passi nella fascia che hai scelto e paghi al banco.</span></li>
        </ol>
        <button type="button" class="pd-req__open" data-order-open aria-expanded="false" aria-controls="${c}-form">${v("ordina",{size:22})}<span>Prepara la richiesta</span></button>
        <p class="pd-req__concept">${v("info",{size:18})}<span>${C(h)}</span></p>
      </div>

      <form class="pd-req" id="${c}-form" novalidate aria-labelledby="${c}-form-title">
        <h3 class="pd-req__form-title" id="${c}-form-title">La tua richiesta</h3>
        <fieldset class="pd-req__group">
          <legend class="pd-req__legend">Cosa ti serve</legend>
          <ol class="pd-req__rows" data-rows></ol>
          <p class="pd-req__error pd-req__error--rows" id="${c}-items-err" hidden></p>
          <button type="button" class="pd-req__add" data-add><span aria-hidden="true">+</span> Aggiungi un prodotto</button>
        </fieldset>

        <div data-pickup></div>

        <div class="pd-req__field">
          <label class="pd-req__label" for="${c}-name">Il tuo nome</label>
          <input class="pd-req__input" id="${c}-name" name="nome" type="text" autocomplete="name" maxlength="60" required aria-describedby="${c}-name-hint ${c}-name-err">
          <p class="pd-req__hint" id="${c}-name-hint">Così prepariamo il ritiro a tuo nome.</p>
          <p class="pd-req__error" id="${c}-name-err" hidden></p>
        </div>
        <div class="pd-req__field">
          <label class="pd-req__label" for="${c}-note">Note <span class="pd-req__optional">(facoltativo)</span></label>
          <textarea class="pd-req__input pd-req__textarea" id="${c}-note" name="note" rows="2" maxlength="300" aria-describedby="${c}-note-hint"></textarea>
          <p class="pd-req__hint" id="${c}-note-hint">Per esempio: va bene anche un prodotto equivalente.</p>
        </div>

        <ul class="pd-req__notices" aria-label="Da sapere prima di inviare">
          <li>${v("ricetta",{size:20})}<span>${q}</span></li>
          <li>${v("euro",{size:20})}<span>Nessun pagamento online: paghi al ritiro.</span></li>
          <li>${v("check",{size:20})}<span>È una richiesta: la farmacia ti conferma disponibilità, prezzo e quando è pronto.</span></li>
          <li>${v("info",{size:20})}<span>Il sito non salva i tuoi dati: il messaggio parte dal tuo WhatsApp.</span></li>
        </ul>

        <button type="submit" class="pd-req__submit">${v("whatsapp",{size:22})}<span>Prepara il messaggio</span></button>
        <p class="pd-req__status" data-status role="status" aria-live="polite"></p>
        ${ve(c,qe(e))}
      </form>
    </div>`;const d=t.querySelector("form"),p=d.querySelector("[data-rows]"),S=d.querySelector("[data-add]"),E=d.querySelector(`#${c}-items-err`),f=d.querySelector(`#${c}-name`),D=d.querySelector(`#${c}-name-err`),k=d.querySelector(`#${c}-note`),$=d.querySelector("[data-status]"),_=d.querySelector("[data-result]");let g=!1,I=!1,O=0;const P=t.querySelector(".pd-req__inner"),z=t.querySelector("[data-order-open]"),A=a=>{d.hidden=!a,z.hidden=a,z.setAttribute("aria-expanded",String(a)),P.classList.toggle("is-collapsed",!a)};t.pdOpenOrder=()=>{d.hidden&&A(!0)},A(location.hash==="#ordina"),addEventListener("hashchange",()=>{location.hash==="#ordina"&&t.pdOpenOrder()}),z.addEventListener("click",()=>{A(!0),p.querySelector("[data-product]")?.focus()});function b(a){if(p.children.length>=K)return;const n=++O,o=document.createElement("li");o.className="pd-req__row",o.innerHTML=`
      <div class="pd-req__field pd-req__product">
        <label class="pd-req__label" for="${c}-p${n}" data-label-product>Prodotto</label>
        <input class="pd-req__input" id="${c}-p${n}" type="text" maxlength="80" autocomplete="off" enterkeyhint="next"
          placeholder="es. crema solare SPF 50" data-product aria-describedby="${c}-items-err">
      </div>
      <div class="pd-req__field pd-req__qty">
        <label class="pd-req__label" for="${c}-q${n}">Quantità<span class="sr-only" data-label-qty></span></label>
        <div class="pd-stepper">
          <button type="button" data-step="-1" aria-label="Uno in meno">−</button>
          <input class="pd-req__input" id="${c}-q${n}" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="2" value="1" data-qty>
          <button type="button" data-step="1" aria-label="Uno in più">+</button>
        </div>
      </div>
      <button type="button" class="pd-req__remove" data-remove>${v("chiudi",{size:20})}<span class="sr-only">Rimuovi</span></button>`,p.append(o),w(),a&&o.querySelector("[data-product]").focus()}function w(){const a=[...p.children];a.forEach((n,o)=>{const s=o+1;n.querySelector("[data-label-product]").textContent=`Prodotto ${s}`,n.querySelector("[data-label-qty]").textContent=` del prodotto ${s}`,n.querySelector('[data-step="-1"]').setAttribute("aria-label",`Uno in meno, prodotto ${s}`),n.querySelector('[data-step="1"]').setAttribute("aria-label",`Uno in più, prodotto ${s}`),n.querySelector("[data-remove] .sr-only").textContent=`Rimuovi il prodotto ${s}`,n.querySelector("[data-remove]").hidden=a.length===1}),S.hidden=a.length>=K}const x=a=>{const n=Math.min(99,Math.max(1,parseInt(String(a.value).replace(/\D/g,""),10)||1));return a.value=String(n),n};p.addEventListener("click",a=>{const n=a.target.closest("[data-step]");if(n){const s=n.parentElement.querySelector("[data-qty]");s.value=String(Math.min(99,Math.max(1,(parseInt(s.value,10)||1)+Number(n.dataset.step)))),u();return}const o=a.target.closest("[data-remove]");if(o){const s=o.closest("li"),l=s.previousElementSibling||s.nextElementSibling;s.remove(),w(),l?.querySelector("[data-product]")?.focus(),u()}}),p.addEventListener("change",a=>{a.target.matches("[data-qty]")&&(x(a.target),u())}),p.addEventListener("keydown",a=>{if(a.key!=="Enter"||!a.target.matches("[data-product]"))return;a.preventDefault();const n=a.target.closest("li").nextElementSibling;n?n.querySelector("[data-product]").focus():a.target.value.trim()&&p.children.length<K?b(!0):f.focus()}),S.addEventListener("click",()=>{b(!0),u()});const T=ye(d.querySelector("[data-pickup]"),{prefix:c,site:e,onChange:()=>u()});function W(){return[...p.children].map(a=>({name:F(a.querySelector("[data-product]").value),qty:Math.min(99,Math.max(1,parseInt(a.querySelector("[data-qty]").value,10)||1))})).filter(a=>a.name)}function R(a){const n=[],o=p.querySelector("[data-product]");W().length?a&&N(p.querySelectorAll("[data-product]"),E):(a&&j(o,E,"Scrivi almeno un prodotto."),n.push(o));const s=T.validate(a);s&&n.push(s);const l=F(f.value);return l.length<2?(a&&j(f,D,l?"Scrivi il nome per intero (almeno 2 lettere).":"Scrivi il tuo nome."),n.push(f)):a&&N(f,D),n[0]||null}function i(){const a=W(),n=T.value(),o=F(k.value),s=[`Buongiorno! Sono ${F(f.value)}.`,"Vorrei ordinare questi prodotti, da ritirare in farmacia:",...a.map(l=>`• ${l.qty} × ${l.name}`),"",`Ritiro: ${n.when}, ${n.bandPhrase}.`];return o&&s.push(`Note: ${o}`),s.push("","Mi confermate disponibilità e prezzo? Grazie!","(Richiesta da «Ordina e ritira» sul sito: pago al ritiro.)"),s.join(`
`)}function u(){if(g&&R(!0),!!I){if(R(!1)){_.hidden=!0;return}ee(d,i()),_.hidden=!1}}if(d.addEventListener("input",a=>{a.target.matches("[data-qty]")||u()}),d.addEventListener("submit",a=>{a.preventDefault(),g=!0,p.querySelectorAll("[data-qty]").forEach(x);const n=R(!0);if(n){$.textContent=_e(d),_.hidden=!0,I=!1,n.focus();return}$.textContent="",I=!0,ee(d,i()),_.hidden=!1;const o=d.querySelector(`#${c}-result-title`);o.scrollIntoView({behavior:ie()?"auto":"smooth",block:"center"}),o.focus({preventScroll:!0})}),b(!1),!document.documentElement.dataset.orderBound){document.documentElement.dataset.orderBound="1";let a=location.hash;document.addEventListener("click",n=>{if(!n.target.closest?.("[data-order]")||n.defaultPrevented||n.button>0||n.metaKey||n.ctrlKey||n.shiftKey||n.altKey)return;const s=document.getElementById("ordina");s?.pdOpenOrder?.();const l=s?.querySelector("[data-product]");if(!(!s||!l)){if(n.preventDefault(),location.hash!=="#ordina")try{history.replaceState({...history.state||{},pdY:Math.round(scrollY)},""),history.pushState({pdOrder:!0},"",`${location.pathname}${location.search}#ordina`),a="#ordina"}catch{}$e(s,l,{instant:!0})}}),addEventListener("popstate",n=>{const o=a;a=location.hash,o==="#ordina"&&location.hash!=="#ordina"&&typeof n.state?.pdY=="number"&&window.scrollTo({top:n.state.pdY,behavior:"instant"})}),addEventListener("hashchange",()=>{a=location.hash})}location.hash==="#ordina"&&requestAnimationFrame(()=>t.scrollIntoView({block:"start"}))}export{N as clearError,ye as createPickup,Y as dayPlan,ee as fillResult,qe as hasWhatsApp,H as longDay,_e as missingSummary,we as mount,V as nowIn,ve as resultMarkup,te as safeTel,$e as scrollToSection,B as sectionText,fe as shortDay,j as showError};
