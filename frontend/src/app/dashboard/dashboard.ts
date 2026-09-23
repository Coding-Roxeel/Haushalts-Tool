import { Component, inject, signal } from "@angular/core";
import { PersonService } from "../person.service";
import { datumText } from "./datum";
import { PersonKarte } from "./person-karte/person-karte";

  @Component({
    imports: [PersonKarte],
    selector: "app-dashboard",
    styleUrl: "./dashboard.css",
    templateUrl: "./dashboard.html",
  })
  export class Dashboard {
    protected personService = inject(PersonService);
    protected readonly tagOffset = signal(0);
    protected readonly richtung = signal<"nach-r" | "nach-l" | null>(null);

    tagWechseln(neu: number): void {
      if (neu === this.tagOffset()) {
        return;
      }
      this.richtung.set(neu > this.tagOffset() ? "nach-r" : "nach-l");
      this.tagOffset.set(neu);
    }

    angezeigterTag(): string {
      const tag = new Date();
      tag.setDate(tag.getDate() + this.tagOffset());
      return datumText(tag);
    }

    angezeigterTagText(): string {
      const [jahr, monat, tag] = this.angezeigterTag().split("-");
      return `${tag}.${monat}.${jahr}`;
    }
  }

