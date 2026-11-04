# leaderboard

 - Made with ❤️ for friends, teachers and youth groups trying to motivate and engage their classes 🧑‍🏫.
 - Φτιαγμένο με ❤️ για τάξεις, ομάδες, σχολεία και κατηχητικά.
 - Ενοποιημένη αυτόνομη έκδοση: Πίνακας Κατάταξης (Leaderboard) & Κάρτες Μυστηρίου (Mystery Cards) μαζί σε μία εφαρμογή!
 - Λειτουργεί άμεσα σε οποιονδήποτε σύγχρονο browser, **online & offline**, χωρίς καμία ανάγκη εγκατάστασης προγραμμάτων:
   - Ανοίξτε απευθείας το αρχείο `leaderboard-standalone.html`

![overview](/README/overview.gif)

✔️ Δημιουργήστε πίνακα κατάταξης προσθέτοντας ονόματα & σκορ σε λίγα δευτερόλεπτα  
✔️ Αλλάξτε το σκορ προσθέτοντας ή αφαιρώντας πόντους (+/-) με τα αντίστοιχα κουμπιά  
✔️ Ζωντανές ανακατατάξεις θέσεων σε πραγματικό χρόνο, βάθρο νικητών (Top 3) και εφέ γιορτής / κομφετί  
✔️ Εναλλαγή βαθμών ανάμεσα σε παίκτες (Score Swap) με πλήρη υποστήριξη Undo / Redo  
✔️ Όλες οι αλλαγές αποθηκεύονται αυτόματα στο `local storage` του browser και στο αρχείο `data.js`  

# leaderboard-cards

![how to use cards](/README/cards.gif)

✔️ Προσθέστε κάρτες μυστηρίου με πόντους μπόνους (+), παγίδες (-) ή δοκιμασίες / δράσεις  
✔️ Τυχαία τοποθέτηση και ανακάτεμα των καρτών με το πάτημα ενός κουμπιού (Shuffle)  
✔️ Όταν χρειάζεται, ζητήστε από τον μαθητή ή παίκτη να διαλέξει μία κάρτα  
✔️ Επαναφορά όλων των καλυμμάτων (Reset Covers) για νέο συναρπαστικό γύρο  
✔️ Μυστικά πλήκτρα host: κρατήστε πατημένο το <kbd>+</kbd> ή <kbd>-</kbd> κατά το κλικ σε κάρτα για προκαθορισμένο αποτέλεσμα (+10 / -10)  

<br>
<br>
<br>

# Instructions 

## ❔ How to add new names / Πώς να προσθέσετε νέα ονόματα

Use the <kbd>➕</kbd> button (or the **«Επεξεργασία»** mode), select an avatar or emoji, then type the name / score and hit <kbd>ΠΡΟΣΘΗΚΗ</kbd>.

Χρησιμοποιήστε το κουμπί <kbd>➕</kbd> (ή τη λειτουργία **«Επεξεργασία»**), επιλέξτε avatar ή emoji, πληκτρολογήστε το όνομα και το αρχικό σκορ και πατήστε <kbd>ΠΡΟΣΘΗΚΗ</kbd>.

![how to add new names](/README/add_names.gif)

### 👉 use every emoji & avatar you like / Επιλέξτε όποιο emoji ή avatar θέλετε

There is a predefined list of animals that are randomly chosen whenever you add a new name:

Υπάρχει μια προκαθορισμένη λίστα από ζώα που επιλέγονται τυχαία όταν προσθέτετε ένα νέο όνομα:

```
🐶 🐱 🐭 🐹 🐰 🦊 🐻 🐼 🐨 🐯 🦁 🐮 🐷 🐽 🐸 🐵 🙈 🙉 🙊 🐒 🐔 🐧 🐦 🐤 🐣 🐥 🦆 🦅 🦉 🦇 🐺 🐗 🐴 🦄 🐝 🐛
🦋 🐌 🐞 🐜 🦟 🦗 🕷 🕸 🦂 🐢 🐍 🦎 🦖 🦕 🐙 🦑 🦐 🦞 🦀 🐡 🐠 🐟 🐬 🐳 🐋 🦈 🐊 🐅 🐆 🦓 🦍 🦧 🐘 🦛 🦏 🐪
🐫 🦒 🦘 🐃 🐂 🐄 🐎 🐖 🐏 🐑 🦙 🐐 🦌 🐕 🐩 🦮 🐕‍🦺 🐈 🐓 🦃 🦚 🦜 🦢 🦩 🐇 🦝 🦨 🦡 🦦 🦥 🐁 🐀 🦔
```

but you can use whatever emoji you prefer with the built-in Emoji Picker, or custom vector avatars (`hawk`, `abram`, `kianna`, `bytex`, `voyager`, `alfonso`, `lion`, `trophy`, `fire`, `star`, etc.):

Μπορείτε επίσης να χρησιμοποιήσετε οποιοδήποτε emoji μέσω του ενσωματωμένου Emoji Picker ή επώνυμα vector avatars (`hawk`, `abram`, `kianna`, `bytex`, `voyager`, `alfonso`, `lion`, `trophy`, `fire`, `star`, κ.ά.):

![how to use custom emoji](/README/custom_emoji.gif)

## ❔ How to add many, edit, delete... / Μαζική εισαγωγή, επεξεργασία & διαγραφή

Use the <kbd>➕</kbd> button (in the **«Μαζικά (Λίστα)»** tab) or the <kbd>✏️ Επεξεργασία</kbd> button directly on the board. Make sure that every line has 3 comma-separated entries of the format `<emoji/avatar>,<nickname>,<score>`:

Χρησιμοποιήστε το κουμπί <kbd>➕</kbd> (στην καρτέλα **«Μαζικά (Λίστα)»**) ή το κουμπί <kbd>✏️ Επεξεργασία</kbd> απευθείας στον πίνακα. Βεβαιωθείτε ότι κάθε γραμμή έχει τη μορφή `<emoji/avatar>,<nickname>,<score>`, για παράδειγμα:

```
🐒,Green Monkey,14
🦎,Orange Iguana,13
🦜,Purple Parrot,12
🐟,Blue Barracuda,10
🐆,Red Jaguar,9
🐍,Silver Snake,8
```

![how to add many names, edit & delete](/README/add-many_edit_delete.gif)

## ❔ How to swap scores / Εναλλαγή βαθμών ανάμεσα σε παίκτες

Click the <kbd>🔁</kbd> button or press <kbd>S</kbd> to enter swap mode, then click on the scores of two players to swap them. You can also click directly on any player's score to initiate a swap.

Πατήστε το κουμπί <kbd>🔁</kbd> ή το πλήκτρο <kbd>S</kbd> και επιλέξτε διαδοχικά δύο παίκτες για να ανταλλάξουν τα σκορ τους (ή κάντε απευθείας κλικ στους βαθμούς ενός παίκτη και μετά στους βαθμούς ενός δεύτερου).
* Εμφανίζεται παράθυρο επιβεβαίωσης για την εναλλαγή.
* **Έγινε λάθος;** Πατήστε <kbd>Cmd</kbd> + <kbd>Z</kbd> (σε Mac) ή <kbd>Ctrl</kbd> + <kbd>Z</kbd> (σε Windows) για άμεση **Αναίρεση (Undo)**!

## ❔ How to share & sync / Κοινοποίηση & μεταφορά σε άλλο υπολογιστή

Use the <kbd>🔗</kbd> button (on the right toolbar). You have 3 easy transfer options:

Πατήστε το κουμπί <kbd>🔗</kbd> (δεξιά στη γραμμή εργαλείων). Έχετε 3 πανεύκολους τρόπους μεταφοράς σε άλλο PC / tablet / κινητό:

1. **Ασύρματα με 6-ψήφιο PIN (Online):** Πατήστε «✨ Δημιουργία Κωδικού» (π.χ. `482 195`) ή σκανάρετε το offline QR Code. Στο άλλο PC γράφετε τον κωδικό και τα δεδομένα κατεβαίνουν αυτόματα σε 3 δευτερόλεπτα!
2. **Με Αρχείο / USB (100% Offline):** Πατήστε «💾 Λήψη Αντιγράφου (.json)» ή «💾 data.js» και απλά σύρετε το αρχείο (Drag & Drop) στο άλλο PC.
3. **Μέσω Συνδέσμου (URL):** Αντιγράψτε τον σύνδεσμο με το `?q=...` και ανοίξτε τον σε οποιονδήποτε browser. Τα δεδομένα αποθηκεύονται αμέσως τοπικά και το URL καθαρίζει αυτόματα.

Example:
```
leaderboard-standalone.html?q=JTVCJTdCJTIyaWNvbiUyMiUzQSUyMiVGMCU5RiU5MCU5MiUyMiUyQyUyMm5pY2tuYW1lJTIyJTNBJTIyR3JlZW4lMjBNb25rZXklMjIlMkMlMjJzY29yZSUyMiUzQSUyMjE0JTIyJTdEJTVE
```

## ❔ How to migrate from the old system / Αυτόματη μετάβαση από το παλιό σύστημα

If you were using the old system and have the old folder on your computer:

Αν χρησιμοποιούσατε το παλιό σύστημα και έχετε τον παλιό φάκελο στον υπολογιστή σας:
1. Πατήστε το κουμπί <kbd>📥</kbd> (*Μετάβαση από το Παλιό Σύστημα*).
2. Πατήστε **«📁 Επιλογή Φακέλου»** (ή σύρετε τον παλιό φάκελο `leaderboard` με Drag & Drop).
3. Το σύστημα διαβάζει **αυτόματα** τόσο το `leaderboard.html` (παίκτες & σκορ) όσο και το `leaderboard-cards.html` (κάρτες μυστηρίου) ταυτόχρονα!
4. Πατήστε **«🚀 Εφαρμογή & Ολοκλήρωση Μετάβασης»** και όλα περνάνε άμεσα και καθαρά στο νέο Leaderboard.

## ⌨️ Shortcuts / Συντομεύσεις Πληκτρολογίου

| Συντόμευση / Πλήκτρο | Λειτουργία |
|---|---|
| <kbd>/</kbd> | Άμεση εστίαση στην Αναζήτηση Παίκτη |
| <kbd>S</kbd> | Ενεργοποίηση/Ακύρωση Λειτουργίας Εναλλαγής Βαθμών (Swap) |
| <kbd>Cmd</kbd> + <kbd>Z</kbd> / <kbd>Ctrl</kbd> + <kbd>Z</kbd> | Αναίρεση (Undo) εναλλαγής βαθμών |
| <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>Z</kbd> / <kbd>Ctrl</kbd> + <kbd>Y</kbd> | Επανάληψη (Redo) εναλλαγής βαθμών |
| <kbd>Esc</kbd> | Κλείσιμο οποιουδήποτε ανοιχτού παραθύρου |
| Κρατημένο <kbd>+</kbd> κατά το κλικ σε κάρτα | **Μυστικό Host:** Η κάρτα μετατρέπεται σε `+10 πόντους` |
| Κρατημένο <kbd>-</kbd> κατά το κλικ σε κάρτα | **Μυστικό Host:** Η κάρτα μετατρέπεται σε `-10 πόντους` |
| Εικονίδιο 🔊 | Σίγαση ή ενεργοποίηση όλων των ηχητικών εφέ |

# Libraries used

 - jQuery: [jquery.com](https://jquery.com/)
 - isotope.js: [isotope.metafizzy.co](https://isotope.metafizzy.co/)
 - Canvas Confetti & Web Audio API: Dynamic particle celebration & audio engine
 - QRCode.js: Offline inline QR code generator
