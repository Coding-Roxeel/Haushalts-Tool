import { Component, computed, inject, signal } from "@angular/core";
import { farbeVar } from "../../farben";
import { datumText, tagPlus } from "../../dashboard/datum";
import { PersonService } from "../../person.service";
import { SchichtService } from "../../schicht.service";
import { TerminService } from "../../termin.service";

interface Eintrag {
    art: "schicht" | "termin";
    id: number;
    personName: string;
    wer: string;
    titel: string;
    kurz: string;
    farbe: string;
    zeit: string;
    fortsetzung: boolean;
}

interface Zelle {
    datum: string;
    tag: number;
    imMonat: boolean;
    heute: boolean;
    eintraege: Eintrag[];
}

const WOCHENTAGE = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const MAX_CHIPS = 3;

function ersterDesMonats(datum: Date): Date {
    return new Date(datum.getFullYear(), datum.getMonth(), 1);
}

@Component({
    selector: "app-kalender-seite",
    templateUrl: "./kalender-seite.html",
    styleUrl: "./kalender-seite.css",
})
export class KalenderSeite {
    protected readonly personService = inject(PersonService);
    private readonly schichtService = inject(SchichtService);
    private readonly terminService = inject(TerminService);

    protected readonly wochentage = WOCHENTAGE;
    protected readonly maxChips = MAX_CHIPS;
    protected readonly farbeVar = farbeVar;

    protected readonly monat = signal(ersterDesMonats(new Date()));
    protected readonly personFilter = signal("");

    protected readonly monatText = computed(() =>
        new Intl.DateTimeFormat("de-DE", { month: "long", year: "numeric" }).format(this.monat()),
    );
    
    private readonly eintraegeProTag = computed(() => {
        const filter = this.personFilter();
        const namen = new Map(this.personService.personen.value().map((p) => [p.id, p.name]));
        const karte = new Map<string, Eintrag[]>();
        const hinzu = (datum: string, eintrag: Eintrag) => {
            const liste = karte.get(datum) ?? [];
            liste.push(eintrag);
            karte.set(datum, liste);
        };
        const passt = (personId: number) => filter === "" || String(personId) === filter;

        for (const s of this.schichtService.schichten.value()) {
            if (!passt(s.person_id)) {
                continue;
            }
            const personName = namen.get(s.person_id) ?? "?";
            const basis = {
                art: "schicht" as const,
                id: s.id,
                personName,
                wer: personName.slice(0, 1),
                titel: s.titel,
                kurz: s.kuerzel ?? s.titel.slice(0, 1),
                farbe: s.farbe,
                zeit: `${s.start.slice(0, 5)}-${s.ende.slice(0, 5)}`,
            };
            hinzu(s.datum, { ...basis, fortsetzung: false });
            if (s.ende < s.start) {
                hinzu(tagPlus(s.datum, 1), { ...basis, fortsetzung: true });
            }
        }

        for (const t of this.terminService.termine.value()) {
            if (!passt(t.person_id)) {
                continue;
            }
            const personName = namen.get(t.person_id) ?? "?";
            const startTag = t.datum_zeit.slice(0, 10);
            const endeTag = t.ende_zeit.slice(0, 10);
            let tag = startTag;
            for (let n = 0; tag <= endeTag && n < 62; n++) {
                hinzu(tag, {
                    art: "termin",
                    id:t.id,
                    personName,
                    wer: personName.slice(0, 1),
                    titel: t.titel,
                    kurz: t.titel,
                    farbe: t.farbe,
                    zeit: `${t.datum_zeit.slice(11, 16)}-${t.ende_zeit.slice(11, 16)}`,
                    fortsetzung: tag !== startTag,
                });
                tag = tagPlus(tag, 1);
            }
        }

        for (const liste of karte.values()) {
            liste.sort((a,b) => a.zeit.localeCompare(b.zeit));
        }
        return karte;
    });

    protected readonly zellen = computed<Zelle[]>(() => {
        const erster = this.monat();
        const letzter = new Date(erster.getFullYear(), erster.getMonth() +1, 0);
        const versatz = (erster.getDay() + 6) % 7;
        const start = new Date(erster.getFullYear(),erster.getMonth(), 1 - versatz);
        const anzahl = Math.ceil((versatz + letzter.getDate()) / 7) * 7;
        const heute = datumText(new Date());
        const karte = this.eintraegeProTag();
        return Array.from({ length: anzahl }, (_, i) => {
            const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
            const datum = datumText(d);
            return {
                datum,
                tag: d.getDate(),
                imMonat: d.getMonth() === erster.getMonth(),
                heute: datum === heute,
                eintraege: karte.get(datum) ?? [],
            };
        });
    });

    protected monatWechseln(schritt: number): void {
        const m = this.monat();
        this.monat.set(new Date(m.getFullYear(), m.getMonth() + schritt, 1));
    }

    protected zuHeute(): void {
        this.monat.set(ersterDesMonats(new Date()));
    }
}