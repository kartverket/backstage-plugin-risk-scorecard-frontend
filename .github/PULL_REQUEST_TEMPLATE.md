# Prosess for PR

Alle PR'er skal først sees på og godkjennes av en i RoS-teamet. Deretter, bruk "Request Review" og assign en fra team SKVIS for å signalisere at PR'en er ferdig med intern review. Beskriv så under hva du mener SKVIS'er skal gjøre.

## Hei SKIVS'er :wave:

<!-- Fjern alternativene som ikke er relevant -->

Kan du...:

:eyes: se kjapt over?

:monocle_face: ta en nøye gjennomgang?

:test_tube: teste lokalt?

:white_check_mark: godkjenne og merge?

## 📝 Beskrivelse

<!-- Beskriv kort hva som er endret og gjerne legg ved link til Notion oppgave. -->
<!-- PS: Legg gjerne lenken til PR'en i Notion kortet også :) -->

---

## 📸 Skjermbilder (valgfritt)

<!-- Legg til skjermbilder eller GIF-er som viser endringene visuelt (spesielt ved UI-endringer). -->

---

## ✅ Sjekkliste

### Generelt

- [ ] Branchen er rebaset på `main` eller main er merget inn.
- [ ] Versjon i [package.json](../plugins/ros/package.json) er bumpet (bugfix: patch, ny feature/signifikant endring: minor, stor endring: major\*).
  - [ ] OBS: ved endringer som ikke omfatter selve pluginet, som endring i README, PR-template eller annen dokumentasjon, skal ikke versjon bumpes.
  - [ ] OBSOBS: pass på at du løser versjonskonflikter rett\*\*
- [ ] [Test-sjekklisten](#test-sjekkliste) er gjennomført hensiktsmessig.

\* Ved bump av major-verjson bør hele teamet + SKVIS være enige i at endringene kvalifiserer som en ny major.
\*\* Om noen har merget på main siden du branchet ut, vil du få merge conflicts på versjonslinjen i package.json. Bruk den siste versjonen fra main som utgangspunkt når du bumper basert på dine endringer.

### Test-sjekkliste

Testes lokalt av author og evt reviewer(e) etter forespørsel eller eget skjønn.

NB: Det er lov å bruke skjønn her! Har du gjort en veldig liten endring som åpenbart ikke påvirker funksjonalitet, trenger du ikke teste.

<!-- Fjern gjerne denne linjen hvis du har fulgt sjekklisten til punkt og prikke -->

Hvis du har avviket fra sjekklisten, beskriv kort hvilke vurderinger du har gjort og hva du evt har testet:

- Introduserte endringer funker som forventet.
- Sjekk at man kan hoppe mellom RoS'er
- Sjekk at RoS kan opprettes
  - Initiell RoS
  - Kan velge kryptonøkkel
- Sjekk at RoS kan oppdateres, både i table og drawer (trykk refresh på et tiltak f.eks).
- Sjekk eventuelle nye/endrede UI-elementer i både dark- og lightmode.
- Verifiser endringer med designer(e) eller minst ett annet teammedlem hvis teamet er uten designer

---
