import { Component, inject, signal } from "@angular/core";
import { PersonService } from "../person.service";
import { SchichtService } from "../schicht.service";
import { TerminService } from "../termin.service";
import { ScrollZiel } from "./scroll-ziel.directive";


const KARTEN_HOEHE = 30;
export interface Ereignis {
  titel: string;
  startMinuten: number;
  endeMinuten: number;
  startText: string;
  endeText:string;
  stapelPosition: number;
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

  angezeigterTag(): string {
    const tag = new Date();
    tag.setDate(tag.getDate() + this.tagOffset());
    const monat = String(tag.getMonth() + 1).padStart(2, "0");
    const tagImMonat = String(tag.getDate()).padStart(2, "0");
    return `${tag.getFullYear()}-${monat}-${tagImMonat}`;
  }

  angezeigterTagText(): string {
    const [jahr, monat, tag] = this.angezeigterTag().split("-");
    return `${tag}.${monat}.${jahr}`;
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
  

  ereignisseFuerPerson(personId: number): Ereignis[] {
    const tag = this.angezeigterTag();
    const schichtEreignisse = this.schichtService.schichten
    .value()
    .filter((s) => s.person_id === personId && s.datum === tag)
    .map((s) =>({
      titel: "Schicht",
      startMinuten: this.zeitZuMinuten(s.start),
      endeMinuten: this.zeitZuMinuten(s.ende),
      startText: this.minutenZuText(this.zeitZuMinuten(s.start)),
      endeText: this.minutenZuText(this.zeitZuMinuten(s.ende)),
    }));

    const terminEreignisse = this.terminService.termine
      .value()
      .filter((t) => t.person_id === personId && t.datum_zeit.startsWith(tag))
      .map((t) => {
        const startMinuten = this.datumZeitZuMinuten(t.datum_zeit);
        const endeMinuten = this.datumZeitZuMinuten(t.ende_zeit);
        return {
          titel: t.titel,
          startMinuten,
          endeMinuten,
          startText: this.minutenZuText(startMinuten),
          endeText: this.minutenZuText(endeMinuten),
        };
      });

    const alle = [...schichtEreignisse, ...terminEreignisse];

    const sortiert = [...alle].sort((a, b) => a.startMinuten - b.startMinuten);
    const positionen: number[] = [];

    for (let i = 0; i < sortiert.length; i++) {
      const belegt: number[] = [];
      for (let j = 0; j < i; j++) {
        if (this.ueberlappen(sortiert[j],sortiert[i])) {
          belegt.push(positionen[j]);
        }
      }
      let position = 0;
      while (belegt.includes(position)) {
        position++;
      }
      positionen.push(position);
    }

    return sortiert.map((ereignis, i) => ({ ...ereignis, stapelPosition: positionen[i] }))
  }
}