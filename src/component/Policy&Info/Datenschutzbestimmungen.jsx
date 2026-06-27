// import React from 'react'

import { useEffect } from "react";

const Datenschutzbestimmungen = () => {
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
    <div className="datenschutzbestimmungen container">
      <h1>Datenschutzbestimmungen</h1>
      <section>
        <h2>Wer sind wir?</h2>
        <p>
          Diese Webseite und deren Inhalt wird durch eine private Person zur
          Verfügung gestellt. Verantwortliche Stelle im Sinne der
          Datenschutzgesetze, insbesondere der EU-Datenschutzgrundverordnung
          (DSGVO), lautet:
        </p>
        <p>
        Wangen Pizza Kebab GmbH
          <br />
          Zürcherstrasse 3<br />
          8855 Wangen
          <br />
          Schweiz
        </p>
        <p>
          E-Mail: <a href="mailto:info@pizzawangen.ch">info@pizzawangen.ch</a>
          <br />
          Website:{" "}
          <a href="https://www.pizzawangen.ch" target="_blank">
            www.pizzawangen.ch
          </a>
        </p>
      </section>

      <section>
        <h2>
          Welche personenbezogenen Daten wir sammeln und warum wir sie sammeln.
        </h2>
        <p>
          Wenn Sie auf diese Website zugreifen, werden automatisch Informationen
          allgemeiner Natur erfasst. Diese Informationen werden im
          Server-Logfile erfasst und beinhalten die Art des Webbrowsers, das
          verwendete Betriebssystem, den Domainnamen Ihres
          Internet-Service-Providers, Ihre IP-Adresse und ähnliches.
        </p>
        <p>Dies aus folgendem Grund:</p>
        <ul>
          <li>
            Sicherstellung eines problemlosen Verbindungsaufbaus der Website
          </li>
          <li>Sicherstellung einer reibungslosen Nutzung unserer Website</li>
          <li>Auswertung der Systemsicherheit und -stabilität sowie</li>
          <li>zu weiteren administrativen Zwecken.</li>
        </ul>
        <p>
          Ihre Daten werden nicht verwendet, um Rückschlüsse auf Ihre Person zu
          ziehen. Informationen dieser Art werden lediglich statistisch
          ausgewertet, um unseren Internetauftritt und die dahinterstehende
          Technik zu optimieren.
        </p>
      </section>

      <section>
        <h2>Speicherdauer</h2>
        <p>
          Die Daten werden gelöscht, sobald diese für den Zweck der Erhebung
          nicht mehr erforderlich sind. Dies ist für die Daten, die der
          Bereitstellung der Website dienen, grundsätzlich der Fall, wenn die
          jeweilige Sitzung beendet ist.
        </p>
      </section>

      <section>
        <h2>Kommentare</h2>
        <p>
          Wenn Besucher Kommentare auf der Website schreiben, sammeln wir die
          Daten, die im Kommentar-Formular angezeigt werden, ausserdem die
          IP-Adresse des Besuchers und den User-Agent-String (damit wird der
          Browser identifiziert), um die Erkennung von Spam zu unterstützen.
        </p>
        <p>
          Aus Ihrer E-Mail-Adresse kann eine anonymisierte Zeichenfolge erstellt
          (auch Hash genannt) und dem Gravatar-Dienst übergeben werden, um zu
          prüfen, ob Sie diesen benutzt. Die Datenschutzerklärung des
          Gravatar-Dienstes finden Sie hier:{" "}
          <a href="https://automattic.com/privacy/" target="_blank">
            https://automattic.com/privacy/
          </a>
          . Nachdem Ihr Kommentar freigegeben wurde, ist Ihr Profilbild
          öffentlich im Kontext Ihres Kommentars sichtbar.
        </p>
      </section>

      <section>
        <h2>Medien</h2>
        <p>
          Wenn Sie ein registrierter Benutzer sind und Fotos auf diese Website
          laden, sollten Sie vermeiden, Fotos mit einem EXIF-GPS-Standort
          hochzuladen. Besucher dieser Website könnten Fotos, die auf dieser
          Website gespeichert sind, downloaden und deren Standort-Informationen
          extrahieren.
        </p>
      </section>

      <section>
        <h2>Kontaktformulare</h2>
        <p>
          Die von Ihnen eingegebenen Daten werden zum Zweck der individuellen
          Kommunikation mit Ihnen gespeichert. Hierfür ist die Angabe einer
          validen E-Mail-Adresse sowie Ihres Namens erforderlich. Diese dient
          der Zuordnung der Anfrage und der anschließenden Beantwortung
          derselben. Die Angabe weiterer Daten ist optional.
        </p>
      </section>

      <section>
        <h2>Cookies</h2>
        <p>
          Wenn Sie einen Kommentar auf unserer Website schreiben, kann das eine
          Einwilligung sein, Ihren Namen, E-Mail-Adresse und Website in Cookies
          zu speichern. Dies ist eine Komfortfunktion, damit Sie nicht, wenn Sie
          einen weiteren Kommentar schreiben, all diese Daten erneut eingeben
          müssen. Diese Cookies werden ein Jahr lang gespeichert.
        </p>
        <p>
          Falls Sie ein Konto haben und Sie sich auf dieser Website anmelden,
          werden wir ein temporäres Cookie setzen, um festzustellen, ob Ihr
          Browser Cookies akzeptiert. Dieses Cookie enthält keine
          personenbezogenen Daten und wird verworfen, wenn Sie Ihren Browser
          schließen.
        </p>
        <p>
          Wenn Sie sich anmelden, werden wir einige Cookies einrichten, um Ihre
          Anmeldeinformationen und Anzeigeoptionen zu speichern. Anmelde-Cookies
          verfallen nach zwei Tagen und Cookies für die Anzeigeoptionen nach
          einem Jahr. Falls Sie bei der Anmeldung „Angemeldet bleiben“
          auswählen, wird Ihre Anmeldung zwei Wochen lang aufrechterhalten. Mit
          der Abmeldung aus Ihrem Konto werden die Anmelde-Cookies gelöscht.
        </p>
        <p>
          Wenn Sie einen Artikel bearbeiten oder veröffentlichen, wird ein
          zusätzlicher Cookie in Ihrem Browser gespeichert. Dieser Cookie
          enthält keine personenbezogenen Daten und verweist nur auf die
          Beitrags-ID des Artikels, den Sie gerade bearbeitet haben. Der Cookie
          verfällt nach einem Tag.
        </p>
      </section>

      <section>
        <h2>Verwendung von Scriptbibliotheken (Google Webfonts)</h2>
        <p>
          Um unsere Inhalte browserübergreifend korrekt und grafisch ansprechend
          darzustellen, verwenden wir auf dieser Website „Google Web Fonts“ der
          Google LLC (1600 Amphitheatre Parkway, Mountain View, CA 94043, USA;
          nachfolgend „Google“) zur Darstellung von Schriften. Die
          Datenschutzrichtlinie des Bibliothekbetreibers Google finden Sie hier:{" "}
          <a href="https://www.google.com/policies/privacy/" target="_blank">
            https://www.google.com/policies/privacy/
          </a>
          .
        </p>
      </section>

      <section>
        <h2>Eingebettete Inhalte von anderen Websites</h2>
        <p>
          Beiträge auf dieser Website können eingebettete Inhalte beinhalten (z.
          B. Videos, Bilder, Beiträge etc.). Eingebettete Inhalte von anderen
          Websites verhalten sich exakt so, als ob der Besucher die andere
          Website besucht hätte. Diese Websites können Daten über Sie sammeln,
          Cookies benutzen, zusätzliche Tracking-Dienste von Dritten einbetten
          und Ihre Interaktion mit diesem eingebetteten Inhalt aufzeichnen,
          inklusive Ihrer Interaktion mit dem eingebetteten Inhalt, falls Sie
          ein Konto haben und auf dieser Website angemeldet sind.
        </p>
      </section>

      <section>
        <h2>Verwendung von Google Analytics</h2>
        <p>
          Diese Website benutzt Google Analytics, einen Webanalysedienst der
          Google LLC, 1600 Amphitheatre Parkway, Mountain View, CA 94043 USA
          (nachfolgend: „Google“). Google Analytics verwendet sog. „Cookies“,
          also Textdateien, die auf Ihrem Computer gespeichert werden und die
          eine Analyse der Benutzung der Webseite durch Sie ermöglichen. Die
          durch das Cookie erzeugten Informationen über Ihre Benutzung dieser
          Webseite werden in der Regel an einen Server von Google in den USA
          übertragen und dort gespeichert. Aufgrund der Aktivierung der
          IP-Anonymisierung auf diesen Webseiten, wird Ihre IP-Adresse von
          Google jedoch innerhalb von Mitgliedstaaten der Europäischen Union
          oder in anderen Vertragsstaaten des Abkommens über den Europäischen
          Wirtschaftsraum zuvor gekürzt. Nur in Ausnahmefällen wird die volle
          IP-Adresse an einen Server von Google in den USA übertragen und dort
          gekürzt. Im Auftrag des Betreibers dieser Website wird Google diese
          Informationen benutzen, um Ihre Nutzung der Webseite auszuwerten, um
          Reports über die Webseitenaktivitäten zusammenzustellen und um weitere
          mit der Websitenutzung und der Internetnutzung verbundene
          Dienstleistungen gegenüber dem Webseitenbetreiber zu erbringen. Die im
          Rahmen von Google Analytics von Ihrem Browser übermittelte IP-Adresse
          wird nicht mit anderen Daten von Google zusammengeführt.
        </p>
        <p>
          Die Zwecke der Datenverarbeitung liegen in der Auswertung der Nutzung
          der Website und in der Zusammenstellung von Reports über Aktivitäten
          auf der Website. Auf Grundlage der Nutzung der Website und des
          Internets sollen dann weitere verbundene Dienstleistungen erbracht
          werden.
        </p>
      </section>

      <section>
        <h2>Datenschutzerklärung für die Nutzung von Twitter</h2>
        <p>
          Auf unseren Seiten sind Funktionen des Dienstes Twitter eingebunden.
          Diese Funktionen werden angeboten durch die Twitter Inc., 795 Folsom
          St., Suite 600, San Francisco, CA 94107, USA. Durch das Benutzen von
          Twitter und der Funktion „Re-Tweet“ werden die von Ihnen besuchten
          Webseiten mit Ihrem Twitter-Account verknüpft und anderen Nutzern
          bekannt gegeben. Dabei werden u.a. Daten wie IP-Adresse, Browsertyp,
          aufgerufene Domains, besuchte Seiten, Mobilfunkanbieter, Geräte- und
          Applikations-IDs und Suchbegriffe an Twitter übertragen.
        </p>
        <p>
          Wir weisen darauf hin, dass wir als Anbieter der Seiten keine Kenntnis
          vom Inhalt der übermittelten Daten sowie deren Nutzung durch Twitter
          erhalten. Aufgrund laufender Aktualisierung der Datenschutzerklärung
          von Twitter, weisen wir auf die aktuellste Version unter{" "}
          <a href="https://twitter.com/privacy" target="_blank">
            http://twitter.com/privacy
          </a>{" "}
          hin.
        </p>
        <p>
          Ihre Datenschutzeinstellungen bei Twitter können Sie in den
          Konto-Einstellungen unter{" "}
          <a href="https://twitter.com/account/settings" target="_blank">
            http://twitter.com/account/settings
          </a>{" "}
          ändern.
        </p>
      </section>

      <section>
        <h2>Änderung unserer Datenschutzbestimmungen</h2>
        <p>
          Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie
          stets den aktuellen rechtlichen Anforderungen entspricht oder um
          Änderungen unserer Leistungen in der Datenschutzerklärung umzusetzen,
          z.B. bei der Einführung neuer Services. Für Ihren erneuten Besuch gilt
          dann die neue Datenschutzerklärung.
        </p>
      </section>

      <section>
        <h2>Fragen zum Datenschutz</h2>
        <p>
          Wenn Sie Fragen zum Datenschutz haben, schreiben Sie uns bitte eine
          E-Mail oder wenden Sie sich direkt an die für den Datenschutz
          verantwortliche Person in unserer Organisation:
        </p>
        <p>
          Mohammad Adnan Saifeddin
          <br />
          Zürcherstrasse 3<br />
          8855 Wangen
          <br />
          Schweiz
        </p>
        <p>
          E-Mail: <a href="mailto:info@pizzawangen.ch">info@pizzawangen.ch</a>
        </p>
      </section>
    </div>
  );
}

export default Datenschutzbestimmungen