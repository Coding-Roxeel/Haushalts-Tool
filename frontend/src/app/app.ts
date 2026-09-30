import { Component, signal } from "@angular/core";
import {RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";

interface MenuePunkt {
  titel: string;
  pfad?: string;
  kinder?: MenuePunkt[];
}

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  host: { "(document:keydown.escape)": "menueSchliessen()" },
  selector: "app-root",
  styleUrl: "./app.css",
  templateUrl: "./app.html",
})
export class App {
  protected readonly menueOffen = signal(false);

  protected menueUmschalten(): void {
    this.menueOffen.update((offen) => !offen);
  }

  protected menueSchliessen(): void {
    this.menueOffen.set(false);
  }
  protected readonly menue: MenuePunkt[] = [
    { titel: "Dashboard", pfad: "/" },
    { titel: "Kalender", pfad: "/kalender", kinder: [{ titel:"Termin anlegen", pfad: "/kalender/termin-neu" }, { titel: "Schicht anlegen", pfad: "/kalender/schicht-neu" }, { titel: "Schicht-Vorlagen", pfad: "/kalender/vorlagen"}] },
    { titel: "Haushaltsplan" },
    { titel: "Essen" },
    { titel: "Einkaufszettel" },
  ];
}