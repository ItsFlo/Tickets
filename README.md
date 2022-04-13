# Setup
## SSL Certificate
```
openssl genrsa -out ssl/key.pem
openssl req -new -key ssl/key.pem -out ssl/csr.pem
openssl x509 -req -days 9999 -in ssl/csr.pem -signkey ssl/key.pem -out ssl/cert.pem
rm ssl/csr.pem
```

## Config
In der Datei [config.json](config.json) können einige Einstellungen angepasst werden.

Die Standardeinstellungen sind für die meisten Anwendungsfälle aber ausreichend.

### server
Hier können die Ports für http/https geändert werden.

Die Weiterleitung von http auf https kann auch bei `server.http.enable` ausgeschaltet werden, wenn sie nicht benötigt wird.

### database
Über `file` wird angegeben, welche Datei für die sqlite Datenbank verwendet wird.\
Diese Datei wird erstellt, wenn sie nicht existiert.

Wenn dieser Pfad relativ angegeben wird, wird er relativ zum Projektverzeichnis interpretiert.

## Node.js
Npm die benötigten Pakete aus [package.json](package.json) installieren lassen.
```
npm install
```

# Starten
```
node server.js
```

Die Adminseite ist dann über [/admin](https://localhost/admin) erreichbar.

Verfügbare Seiten:
* [/](https://localhost): Abholanzeige für Gäste
* [/menu](https://localhost/menu): Menü für die Gäste
* [/admin](https://localhost/admin): Verwaltung
* [/checkout](https://localhost/checkout): Kasse
* [/kitchen](https://localhost/kitchen): Küche
* [/stats](https://localhost/stats): Statistik über abgeschlossene Bestellungen

Unterseiten, auf denen eine Veranstaltung ausgewählt werden muss, kann auch der URL der am Ende der Name der Veranstaltung angefügt werden.
(z.B. https://localhost/checkout/event)\
Alternativ kann die Veranstaltungs-ID auch als GET-Argument `venue` übergeben werden.
(z.B. https://localhost/checkout?venue=1)
