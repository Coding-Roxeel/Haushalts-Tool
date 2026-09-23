import { Component, inject, signal } from "@angular/core";
import { PersonService } from "../person.service";
import { SchichtService } from "../schicht.service";
import { TerminService } from "../termin.service";
import { ScrollZiel } from "./scroll-ziel.directive";


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
}

@Component({
  imports: [ScrollZiel],
  selector: "app-dashboard",
  styleUrl: "./dashboard.css",
  templateUrl: "./dashboard.html",
})
export class Dashboard {
  protected personService = inject(PersonService);
  protected schichtService = inject(SchichtService);
  protected terminService = inject(TerminService);
  protected readonly stunden = Array.from({ length: 24 },(_, i) => i);
  protected readonly tagOffset = signal(0);
  protected readonly scrollPositionen = signal<Record<number, number>>({});
  protected readonly richtung = signal<"nach-r" | "nach-l" | null>(null);
  protected readonly offen = signal<Record<number, string | null>>({});

  tagWechseln(neu: number): void {
    if (neu === this.tagOffset()) {
      return;
    }
    this.richtung.set(neu > this.tagOffset() ? "nach-r" : "nach-l");
    this.offen.set({});
    this.tagOffset.set(neu);
  }

  schluessel(e: Ereignis): string {
    return `${e.titel}|${e.startMinuten}`;
  }

  istOffen(personId: number, e: Ereignis): boolean {
    return this.offen()[personId] === this.schluessel(e);
  }

  karteUmschalten(personId: number, e: Ereignis): void {
    const schluessel =  this.schluessel(e);
    this.offen.update((alt) => ({
      ...alt,
      [personId]: alt[personId] === schluessel ? null : schluessel,
    }));
  }

  schliessen(personId: number): void {
    this.offen.update((alt) => ({ ...alt, [personId]: null }));
  }

  offenesEreignis(personId: number, ereignisse: Ereignis[]): Ereignis | undefined {
    const schluessel = this.offen()[personId];
    if(!schluessel) {
      return undefined;
    }
    return ereignisse.find((e) => this.schluessel(e) === schluessel);
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

  datumText(datum: Date): string {
    const monat = String(datum.getMonth() +1).padStart(2, "0");
    const tagImMonat = String(datum.getDate()).padStart(2, "0");
    return `${datum.getFullYear()}-${monat}-${tagImMonat}`;
  }

  angezeigterTag(): string {
    const tag = new Date();
    tag.setDate(tag.getDate() + this.tagOffset());
    return this.datumText(tag);
  }

  tagVerschoben(tag: string, tage:number): string {
    const [jahr, monat, tagImMonat] = tag.split("-").map(Number);
    return this.datumText(new Date(jahr, monat - 1, tagImMonat + tage));
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

  angezeigterTagText(): string {
    const [jahr, monat, tag] = this.angezeigterTag().split("-");
    return `${tag}.${monat}.${jahr}`;
  }

  scrollPositionFuer(personId: number): number {
    return this.scrollPositionen()[personId] ?? 0;
  }

  scrollGeandert(personId:number, ereignis: Event): void {
    const oben = (ereignis.target as HTMLElement).scrollTop;
    this.scrollPositionen.update((alt) => ({ ...alt, [personId]: oben }));
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
    const tag = this.angezeigterTag();
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