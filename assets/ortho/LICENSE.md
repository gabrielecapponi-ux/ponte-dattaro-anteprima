# Ortofoto: licenza e attribuzione

**Ortofoto RER 2025-26 RGB © Regione Emilia-Romagna, CC BY 4.0, dati elaborati**

- Dataset: Ortofoto RER 2025-26 RGB (RER2025_26_C1_PAR_RGBI_RDN32), Regione Emilia-Romagna.
- Licenza: Creative Commons Attribuzione 4.0 Internazionale (CC BY 4.0), https://creativecommons.org/licenses/by/4.0/deed.it
- Servizio: https://servizigis.regione.emilia-romagna.it/arcgis/rest/services/public/RER2025_26_RGB/ImageServer
- Volo sulla zona della farmacia: 2025-04-05 (tavola 32_60404959, servizio WMS metadati_raster).
- Accesso: 2026-10-02.

"Dati elaborati": le immagini sono state riproiettate nel sistema locale del progetto
(equirettangolare con origine nella farmacia), ricampionate a 4 / 2 / 0,5 / 0,2 m per pixel,
divise in due metà e compresse in KTX2 (Basis ETC1S). Le immagini dei livelli non sono state
alterate nei contenuti: la correzione colore "vivida" della pagina (saturazione e contrasto moderati,
vegetazione più viva, ombre blu-viola neutralizzate) è applicata solo in visualizzazione, nello shader
(`orthoGrade` in `src/world/ortho.js`); i pixel dei file restano quelli della Regione.

`mask.ktx2` (maschera degli edifici vicino alla farmacia) è un'elaborazione: in RGB l'ortofoto con il
suolo ricostruito sotto gli edifici fotografati, in alfa le impronte © OpenStreetMap contributors (ODbL)
spostate della parallasse misurata e allargate per le gronde, con altezze in parte dal DBTR
Unità volumetriche © Regione Emilia-Romagna, CC BY 4.0.

Richieste, estensioni e impronte sha256: `research/ortho-rer2025-viaggio/provenance.json`
(fuori dalla cartella pubblicata).
