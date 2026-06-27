// import React from 'react'

import { useEffect } from "react";

const AGB = () => {
     const scrollToTop = () => {
       window.scrollTo({
         top: 0,
         behavior: "smooth",
       });
     };
     useEffect(() => {
       scrollToTop();
     }, []);
  return (
    <div className="agb container">
      <h1>Allgemeine Geschäftsbedingungen</h1>
      <h2>Wangen Pizza Kebab und Kurier</h2>

      <section>
        <h2>Grundlegendes</h2>
        <p>
          Diese Allgemeinen Geschäftsbedingungen (AGB) regeln die
          Rechtsbeziehung zwischen der Wangen Pizza Kebab und Kurier und deren
          Gäste.
        </p>
        <p>
          Der Einfachheit halber wird in diesen AGB – egal in Bezug auf welche
          Leistung – immer von Vertrag gesprochen.
        </p>
        <p>
          Es gelten ausschliesslich die bei Vertragsschluss gültigen
          Geschäftsbedingungen der Wangen Pizza Kebab und Kurier GmbH.
        </p>
        <p>
          Allgemeine Geschäftsbedingungen des Gastes kommen nur zur Anwendung,
          wenn dies vor Vertragsannahme ausdrücklich und schriftlich vereinbart
          wurde.
        </p>
      </section>

      <section>
        <h2>Salvatorische Klausel</h2>
        <p>
          Sollten einzelne Bestimmungen dieser AGB unwirksam oder nichtig sein
          oder werden, so wird dadurch die Wirksamkeit des Vertrages und der
          übrigen AGB-Bestimmungen nicht beeinträchtigt. Die unwirksamen
          Bestimmungen werden durch solche Vereinbarungen ersetzt, die in
          zulässiger Weise dem rechtlichen und wirtschaftlichen Inhalt der
          getroffenen Abrede entsprechen.
        </p>
      </section>

      <section>
        <h2>Gerichtsstand / Anwendbares Recht</h2>
        <p>
          Für allfällige Streitigkeiten aus diesem Vertrag ist Schwyz
          Gerichtsstand, sofern kein anderer gesetzlich zwingender Gerichtsstand
          besteht.
        </p>
        <p>
          Es kommt auf allen Vertrags-, Reserverations-, allfälligen
          Zusatzvereinbarungen und allgemeinen Bedingungen ausschliesslich
          schweizerisches Recht zur Anwendung. Erfüllungs- und Zahlungsort ist
          der Sitz der Wangen Pizza Kebab und Kurier GmbH.
        </p>
      </section>

      <section>
        <h2>Gültigkeit</h2>
        <p>
          Diese AGB gelten ab dem 1. Juni 2024. Mit der Herausgabe einer neuen
          Dokumentation verliert diese ihre Gültigkeit. Schriftliche
          Bestätigungen: Als schriftliche Bestätigungen gelten E-Mail, SMS und
          WhatsApp-Nachrichten. Vertragspartner sind der Gast und die Wangen
          Pizza Kebab und Kurier GmbH.
        </p>
      </section>

      <section>
        <h2>Vertragsgegenstand / Geltungsbereich</h2>
        <p>
          Der Vertrag über die Reservation von Plätzen an Tischen oder Bereichen
          des Restaurants sowie den Bezug von sonstigen Lieferungen und
          Leistungen kommt mit der schriftlichen Bestätigung durch die Wangen
          Pizza Kebab und Kurier zustande. Vertragsänderungen werden für die
          Wangen Pizza Kebab und Kurier erst durch eine (schriftliche)
          Rückbestätigung verbindlich. Einseitige Änderungen oder Ergänzungen
          des Vertrags durch den Gast sind unwirksam.
        </p>
      </section>

      <section>
        <h2>Leistungsumfang</h2>
        <p>
          Der Leistungsumfang des Vertrags bestimmt sich gemäss individuell
          vorgenommener Reservation des Gastes. Reservationen können nur über
          das Reservationssystem auf{" "}
          <a href="https://www.pizzawangen.ch" target="_blank">
            www.pizzawangen.ch
          </a>{" "}
          gemacht werden. Reservationen bis und mit 6 Personen können über den
          im Bestätigungsmail versendeten Link vom Gast bis 15 Minuten vor der
          Reservation selbst angepasst oder storniert werden.
        </p>
        <p>
          Bei Gruppen-Reservierungen von 7 bis 14 Gäste gelten folgende Regeln:
        </p>
        <ul>
          <li>
            Der/die Reservierende ist die Ansprechperson und verantwortlich für
            die Einhaltung der nachfolgenden Punkte.
          </li>
          <li>
            Wichtig ist, dass die Gruppe über die Regeln und das Konzept
            informiert wird.
          </li>
          <li>
            Pro reservierten Platz wird eine Mindestkonsumation von
            durchschnittlich CHF 50.00 erwartet (November und Dezember CHF
            55.00).
          </li>
          <li>
            Für eine Reservierung muss im Voraus eine Anzahlung von CHF 50.00
            pro reservierten Platz geleistet werden. Dieser Betrag wird dem Gast
            bei der Reservation direkt über „PostFinance“ verrechnet.
          </li>
          <li>
            Änderungen werden bis 12.00 Uhr am Vortag der Reservation per Mail
            entgegengenommen. Komplettabsagen sind bis 7 Tage vor der
            Reservation über den Link im Bestätigungsmail möglich. Ansonsten
            wird die Anzahl der reservierten Plätze verrechnet, auch wenn
            weniger Gäste erscheinen. Der/die Reservierende ist Aufgrund der
            Anzahlung für die Bezahlung verantwortlich. Bei Gruppen ist ein
            Einzelinkasso nicht möglich.
          </li>
          <li>
            Allfällige Besonderheiten können über das Nachrichtenfeld
            eingetragen werden oder frühzeitig (mindestens 24h vor der
            Reservation) per Mail geschickt werden.
          </li>
          <li>
            Der Gast hat – andere vertragliche Vereinbarungen vorbehalten –
            keinen Anspruch auf einen bestimmten Tisch.
          </li>
          <li>
            Sollten unangemeldet mehr oder weniger Gäste zur vereinbarten
            Reservation hinzukommen/wegfallen, so kann die Wangen Pizza Kebab
            und Kurier diese Gäste frei umplatzieren und/oder auf mehrere Tische
            verteilen.
          </li>
        </ul>
      </section>

      <section>
        <h2>Optionen/Anfragen</h2>
        <p>
          Optionsdaten sind für beide Parteien unverbindlich. Während der
          Optionsfrist kann die Wangen Pizza Kebab und Kurier über sämtliche
          Tische/Bereiche verfügen. Tische/Bereiche werden erst bei erfolgter
          Anzahlung reserviert.
        </p>
      </section>

      <section>
        <h2>Preise / Zahlungspflicht / Zahlungskonditionen</h2>
        <p>
          Die Preise verstehen sich in Schweizer Franken (CHF) und schliessen
          die gesetzliche Mehrwertsteuer mit ein.
        </p>
        <p>
          Der Gast ist verpflichtet, für die von ihm in Anspruch genommenen
          Leistungen die vereinbarten bzw. geltenden Preise der Wangen Pizza
          Kebab und Kurier zu zahlen. Dies gilt auch für vom Gast, seinen
          Begleitern und Besuchern veranlasste Leistungen und Auslagen der
          Wangen Pizza Kebab und Kurier an Dritte.
        </p>
        <p>
          Eine Erhöhung gesetzlicher Abgaben nach Vertragsabschluss geht zu
          Lasten des Gastes. Preisangaben in Fremdwährungen sind Richtwerte und
          werden zum jeweiligen Tageskurs verrechnet. Alle publizierten Preise
          können jederzeit ohne Mitteilung an den Gast angepasst werden.
          Gültigkeit haben jeweils diejenigen Preise, die von der Wangen Pizza
          Kebab und Kurier bestätigt werden.
        </p>
        <p>
          Je nach Vereinbarung kann die Wangen Pizza Kebab und Kurier eine
          Anzahlung von 50-100 % des gesamten Buchungsbetrags verlangen. Die
          Anzahlung ist als Teilzahlung auf das vereinbarte Entgelt zu
          verstehen. Eine Vorauszahlung ist innerhalb von 5 Tagen nach Erhalt
          der Reservationsbestätigung zu überweisen. Erfolgt die Reservation
          kurzfristiger, so verlangt die Wangen Pizza Kebab und Kurier eine
          Kreditkartengarantie über den gesamten Buchungsbetrag.
        </p>
        <p>
          Bei nicht fristgerechter Anzahlung oder Leistung der
          Kreditkartengarantie kann die Wangen Pizza Kebab und Kurier den
          Vertrag unverzüglich (ohne Mahnung) auflösen, bzw. von den gemachten
          Leistungsversprechungen zurücktreten und die unter Ziffer 9 genannten
          Stornierungskosten verlangen.
        </p>
        <p>
          Der Wangen Pizza Kebab und Kurier steht das Recht auf jederzeitige
          Abrechnung bzw. Zwischenabrechnung seiner Leistungen zu.
        </p>
        <p>
          Die Schlussrechnung umfasst den vereinbarten Preis zuzüglich
          allfälliger Mehrbeträge, die aufgrund gesonderter Leistungen der
          Wangen Pizza Kebab und Kurier für den Gast und/oder die ihn
          begleitenden Personen entstanden sind. Die Schlussrechnung ist –
          vorbehaltlich anderer Vereinbarungen – spätestens am Ende der
          Reservation, in Schweizer Franken oder mit einer akzeptierten
          Kreditkarte, zu bezahlen.
        </p>
        <p>
          Falls der offene Betrag per Rechnung beglichen wird, gilt eine
          Zahlungsfrist von 30 Tagen. Wir behalten uns vor, andere
          Zahlungsfristen inkl. Vorauszahlungen schriftlich zu vereinbaren.
          Kommissionen werden keine gewährt. Druckfehler und Änderungen, wie
          Jahrgangswechsel bei Weinen, bleiben ausdrücklich vorbehalten.
        </p>
        <p>
          Ab dem 30. Tag nach Rechnungsdatum ist die Wangen Pizza Kebab und
          Kurier berechtigt, Verzugszinsen in Höhe von 5% zu verlangen, es sei
          denn, dass die Wangen Pizza Kebab und Kurier höhere Verzugszinsen oder
          der Gast eine geringere Belastung von der Wangen Pizza Kebab und
          Kurier nachweist. Schecks werden nicht angenommen. Etwaige Spesen
          gehen zu Lasten des Gastes. Eine Aufrechnung ist nur mit
          unbestrittenen oder gerichtlich rechtskräftig festgestellten
          Forderungen zulässig. Ein Zurückbehaltungsrecht kann der Gast nur dann
          geltend machen, soweit es auf demselben Vertragsverhältnis beruht. Für
          jede Mahnung kann die Wangen Pizza Kebab und Kurier eine Mahngebühr
          von CHF 20.00 erheben.
        </p>
      </section>

      <section>
        <h2>Abbestellung der Reservation/Annullierungskosten</h2>
        <p>
          Eine kostenfreie Annullierung der Reservation ist bis 7 Tage vor dem
          Datum der Reservation möglich. Bei einer späteren Annullierung wird
          die Anzahlung zurückbehalten bzw. eine No-Show-Rechnung in Höhe der
          Anzahlung erstellt. Ausgenommen davon sind Reservationen in der Zeit
          vom 1. Dezember bis 31. Dezember, hier ist eine kostenfreie
          Annullierung nur bis 14 Tage vor der Reservation möglich. Bei einer
          Annullierung zu einem späteren Zeitpunkt wird die Anzahlung
          zurückbehalten bzw. eine No-Show-Rechnung in Höhe der Anzahlung
          erstellt.
        </p>
        <p>
          Die Rückerstattung der Anzahlung bei einer fristgerechten Annullierung
          erfolgt über dasselbe Zahlungsmittel, über das die Anzahlung getätigt
          wurde.
        </p>
      </section>

      <section>
        <h2>Haftung</h2>
        <p>
          Der Gast haftet gegenüber der Wangen Pizza Kebab und Kurier für alle
          Schäden und Verluste, die durch ihn, seine Mitarbeiter, seine
          Veranstaltungsteilnehmer oder seine sonstigen Hilfspersonen sowie
          seine Veranstaltungsgäste verursacht werden, ohne dass die Wangen
          Pizza Kebab und Kurier dem Gast ein Verschulden nachweisen muss.
        </p>
        <p>
          Die Wangen Pizza Kebab und Kurier lehnt jede Haftung für Diebstahl und
          Beschädigung von durch den Gast eingebrachten Materialien und Sachen
          ab. Die Versicherung von mitgebrachten Gegenständen obliegt dem Gast.
        </p>
        <p>
          Der Gast haftet für alle Bestellungen und Auslagen, die seine
          Begleitpersonen oder Veranstaltungsgäste verursachen.
        </p>
        <p>
          Wird die Wangen Pizza Kebab und Kurier durch höhere Gewalt (Feuer,
          Streik, etc.) in der Erfüllung ihrer Leistungen behindert, so kann
          hieraus keine Schadenersatzpflicht abgeleitet werden.
        </p>
      </section>

      <section>
        <h2>Verlängerung der Öffnungszeiten</h2>
        <p>
          Veranstaltungen/Bankette, die über 23.30 Uhr hinausgehen, müssen
          spätestens 10 Tage vorher angemeldet werden. Zusätzliche Stunden
          werden mit CHF 150.00 pro angebrochener Stunde verrechnet. Bei
          Veranstaltungen/Banketten, die bis nach 23.30 Uhr dauern, wird das
          Nachtzuschlag-Honorar von mindestens CHF 150.00 pro angefangener
          Stunde und Servicemitarbeiter in Rechnung gestellt.
        </p>
      </section>
    </div>
  );
}

export default AGB