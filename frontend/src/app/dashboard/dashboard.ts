import { Component, inject } from "@angular/core";
import { PersonService } from "../person.service";
import { SchichtService } from "../schicht.service";
import { TerminService } from "../termin.service";

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
  imports: [],
  selector: "app-dashboard",
  styleUrl: "./dashboard.css",
  templateUrl: "./dashboard.html",
})
export class Dashboard {
  protected personService = inject(PersonService);
  protected schichtService = inject(SchichtService);
  protected terminService = inject(TerminService);

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

  ueberlappen(
    a: { startMinuten: number; endeMinuten: number },
    b: { startMinuten: number; endeMinuten: number },
  ): boolean {
    const aEnde = Math.max(a.endeMinuten, a.startMinuten + KARTEN_HOEHE);
    const bEnde = Math.max(b.endeMinuten, b.startMinuten + KARTEN_HOEHE);
    return a.startMinuten < bEnde && b.startMinuten < aEnde;
  } 

  ereignisseFuerPerson(personId: number): Ereignis[] {
    const schichtEreignisse = this.schichtService.schichten
    .value()
    .filter((s) => s.person_id === personId)
    .map((s) =>({
      titel: "Schicht",
      startMinuten: this.zeitZuMinuten(s.start),
      endeMinuten: this.zeitZuMinuten(s.ende),
      startText: this.minutenZuText(this.zeitZuMinuten(s.start)),
      endeText: this.minutenZuText(this.zeitZuMinuten(s.ende)),
    }));

    const terminEreignisse = this.terminService.termine
      .value()
      .filter((t) => t.person_id === personId)
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