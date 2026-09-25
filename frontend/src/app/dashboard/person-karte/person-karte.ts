import { Component, computed, inject, input, linkedSignal, signal } from "@angular/core";
import { Person } from "../../person.service";
import { SchichtService } from "../../schicht.service";
import { TerminService } from "../../termin.service";
import { ScrollZiel } from "../scroll-ziel.directive";
import { datumText } from "../datum";
import { farbeVar } from "../../farben";
import { RouterLink } from "@angular/router";

const KARTEN_HOEHE = 30;
const LINIEN_MIN = 4;
const SPUR_ABSTAND = 6;
const KARTEN_RAND = 8;
const KARTEN_VERSATZ = 25;
const STICKY_OBEN = 2;
const MINUTEN_PRO_TAG = 1440;

type Zeitspanne = { startMinuten: number; endeMinuten: number };
export interface Ereignis {
  titel: string;
  startMinuten: number;
  endeMinuten: number;
  startText: string;
  endeText:string;
  farbe: string;
  stapelPosition: number;
  linieLinks: number;
  karteLinks: number;
  bereichHoehe: number;
  id: number;
  art: "termin" | "schicht";
}

@Component({
    imports: [ScrollZiel, RouterLink],
    selector: "app-person-karte",
    styleUrl: "./person-karte.css",
    templateUrl: "./person-karte.html",
})
export class PersonKarte {
    readonly person = input.required<Person>();
    readonly tag = input.required<string>();
    protected readonly farbeVar = farbeVar;

    private readonly schichtService = inject(SchichtService);
    private readonly terminService = inject(TerminService);

    protected readonly stunden = Array.from({ length: 24 }, (_, i) => i);
    protected readonly scrollOben = signal(0);
    protected readonly offen = linkedSignal<string | null>(() => {
        this.tag();
        return null;
    });
    protected readonly loeschenFrage = linkedSignal<boolean>(() => {
      this.offen();
      return false;
    });
    protected readonly loeschFehler = linkedSignal<string | null>(() => {
      this.offen();
      return null;
    });
    protected readonly tagText= computed(() => {
        const [jahr, monat, tag] = this.tag().split("-");
        return `${tag}.${monat}.${jahr}`;
    });
    protected readonly ereignisse = computed(() => 
        this.ereignisseFuerPerson(this.person().id, this.scrollOben()),
    );
    protected readonly offenesEreignis = computed(() => {
        const schluessel = this.offen();
        return schluessel ? this.ereignisse().find((e) => this.schluessel(e) === schluessel) : undefined;
    });

    scrollGeandert(ereignis: Event): void {
        this.scrollOben.set((ereignis.target as HTMLElement). scrollTop);
    }

    istOffen(e:Ereignis): boolean {
        return this.offen() === this.schluessel(e);
    }

    karteUmschalten(e:Ereignis): void {
        const schluessel = this.schluessel(e);
        this.offen.update((alt) => (alt === schluessel ? null : schluessel));
    }

    schliessen(): void {
        this.offen.set(null);
    }

    async loeschen(e: Ereignis): Promise<void> {
      try {
        await this.terminService.loeschen(e.id);
        this.offen.set(null);
      } catch {
        this.loeschFehler.set("Der Termin konnte nicht gelöscht werden. Versuch es bitte gleich noch einmal.");
      }
    }

    schluessel(e: Ereignis): string {
        return `${e.titel}|${e.startMinuten}`;
    }

    zeitZuMinuten(zeit: string): number {
    const [stunden, minuten] = zeit.split(":").map(Number);
    return stunden * 60 + minuten;
    }

     datumZeitZuMinuten(datumZeit: string): number {
    const datum = new Date(datumZeit);
    return datum.getHours() * 60 + datum.getMinutes();
    }

    minutenZuText(minuten: number): string {
    const stunden = Math.floor(minuten / 60);
    const rest = minuten % 60;
    return `${stunden.toString().padStart(2, "0")}:${rest.toString().padStart(2, "0")}`;
    }

    tagVerschoben(tag: string, tage:number): string {
    const [jahr, monat, tagImMonat] = tag.split("-").map(Number);
    return datumText(new Date(jahr, monat - 1, tagImMonat + tage));
    } 

    ausschnittFuerTag(
        tag: string,
        startDatum: string,
        startMinuten: number,
        endeDatum: string,
        endeMinuten: number,
    ): Zeitspanne | null {
        if (tag < startDatum || tag > endeDatum) {
            return null;
        }
        return {
            startMinuten: tag === startDatum ? startMinuten : 0,
            endeMinuten: tag === endeDatum ? endeMinuten :MINUTEN_PRO_TAG,
        };
    }   

    lauftextMessen(ereignis: MouseEvent): void{
        const kasten = (ereignis.currentTarget as HTMLElement).closest(".ereignis");
        const text = kasten?.querySelector<HTMLElement>(".ereignis-text");
        if (!text) {
          return;
        }
        const zuviel = Math.max(0, text.scrollWidth - text.clientWidth);
        text.style.setProperty("--lauf", `${zuviel}px`);
        text.style.setProperty("--lauf-dauer", `${Math.max(2, zuviel / 30)}s`);
      }
    
      bereichHoehe(e: Zeitspanne): number {
        return Math.max(e.endeMinuten - e.startMinuten, KARTEN_HOEHE);
      }
    
      kartenY(e: Zeitspanne,scrollOben: number): number {
        const klebt = Math.max(e.startMinuten, scrollOben + STICKY_OBEN);
        const unten = e.startMinuten + this.bereichHoehe(e) - KARTEN_HOEHE;
        return Math.min(klebt, unten);
      }
    
      scrollZielFuer(ereignisse: Ereignis[]): number {
        if (ereignisse.length === 0) {
          return 0;
        }
        const fruehester = Math.min(...ereignisse.map((e) => e.startMinuten));
        return Math.max(0, fruehester - 30);
      }
    
      ueberlappen(a: { startMinuten: number; }, b: { startMinuten: number }): boolean {
          return a.startMinuten < b.startMinuten + KARTEN_HOEHE && b.startMinuten < a.startMinuten + KARTEN_HOEHE;
        }
      
    dauerUeberlappt(a: Zeitspanne, b: Zeitspanne): boolean {
      const aEnde = Math.max(a.endeMinuten, a.startMinuten + LINIEN_MIN);
      const bEnde = Math.max(b.endeMinuten, b.startMinuten + LINIEN_MIN);
      return a.startMinuten < bEnde && b.startMinuten < aEnde;
    }
    
    freiePositionen(
      sortiert: Zeitspanne[],
      kollidieren: (a: Zeitspanne,b: Zeitspanne) => boolean,
    ): number[] {
      const positionen: number[] = [];
      for (let i = 0; i < sortiert.length; i++) {
        const belegt: number[] = [];
        for (let j = 0; j < i; j++) {
          if (kollidieren(sortiert[j], sortiert[i])) {
            belegt.push(positionen[j]);
          }
        }
        let position = 0;
        while (belegt.includes(position)) {
          position++;
        }
        positionen.push(position);
      }
      return positionen;
    }
    
      ereignisseFuerPerson(personId: number, scrollOben: number): Ereignis[] {
        const tag = this.tag();
        const schichtEreignisse = this.schichtService.schichten
        .value()
        .filter((s) => s.person_id ===personId)
        .flatMap((s) => {
          const start = this.zeitZuMinuten(s.start);
          const ende = this.zeitZuMinuten(s.ende);
          const endeDatum = ende < start ? this.tagVerschoben(s.datum, 1) : s.datum;
          const teil = this.ausschnittFuerTag(tag, s.datum, start, endeDatum, ende);
          if (!teil) {
            return [];
          }
          return [
            {
              titel: s.titel,
              id: s.id,
              art: "schicht" as const,
              farbe: s.farbe,
              startMinuten: teil.startMinuten,
              endeMinuten: teil.endeMinuten,
              startText: this.minutenZuText(start),
              endeText: this.minutenZuText(ende),
            },
          ];
        });
      
        const terminEreignisse = this.terminService.termine
        .value()
        .filter((t) => t.person_id === personId)
        .flatMap((t) => {
          const start = this.datumZeitZuMinuten(t.datum_zeit);
          const ende = this.datumZeitZuMinuten(t.ende_zeit);
          const teil = this.ausschnittFuerTag(tag, t.datum_zeit.slice(0, 10), start, t.ende_zeit.slice(0, 10), ende);
          if (!teil) {
            return [];
          }
          return [
            {
              titel: t.titel,
              id: t.id,
              art: "termin" as const,
              farbe: t.farbe,
              startMinuten: teil.startMinuten,
              endeMinuten: teil.endeMinuten,
              startText: this.minutenZuText(start),
              endeText: this.minutenZuText(ende),
            },
          ];
        });
    
        const alle = [...schichtEreignisse, ...terminEreignisse];
        const sortiert = [...alle].sort((a, b) => a.startMinuten - b.startMinuten);
        const spuren = this.freiePositionen(sortiert, (a, b) => this.dauerUeberlappt(a, b));
        const spurenBreite = (spuren.length === 0 ? 0 : Math.max(...spuren) + 1) * SPUR_ABSTAND;
    
        const karten = sortiert
          .map((ereignis, index) => {
            const y = this.kartenY(ereignis,scrollOben);
            return { startMinuten: y, endeMinuten: y + KARTEN_HOEHE, index };
          })
          .sort((a, b) => a.startMinuten - b.startMinuten || a.index - b.index);
        const kartenSpalten = this.freiePositionen(karten, (a, b) => this.ueberlappen(a, b));
        const spalteVon: number[] = [];
        for (let j = 0; j < karten.length; j++) {
          spalteVon[karten[j].index] = kartenSpalten[j];
        }
    
        return sortiert.map((ereignis, i) => ({
          ...ereignis,
          stapelPosition: spalteVon[i],
          linieLinks: spuren[i] * SPUR_ABSTAND,
          karteLinks: spurenBreite + KARTEN_RAND + spalteVon[i] * KARTEN_VERSATZ,
          bereichHoehe: this.bereichHoehe(ereignis),
        }));
      }
}