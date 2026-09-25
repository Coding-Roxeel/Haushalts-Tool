import { Component } from "@angular/core";
import {RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";

interface MenuePunkt {
  titel: string;
  pfad?: string;
  kinder?: MenuePunkt[];
}

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  selector: "app-root",
  styleUrl: "./app.css",
  templateUrl: "./app.html",
})
export class App {
  protected readonly menue: MenuePunkt[] = [
    { titel: "Dashboard", pfad: "/" },
    { titel: "Kalender", kinder: [{ titel:"Termin anlegen", pfad: "/kalender/termin-neu" }, { titel: "Schicht anlegen", pfad: "/kalender/schicht-neu" }] },
    { titel: "Haushaltsplan" },
    { titel: "Essen" },
    { titel: "Einkaufszettel" },
  ];
}