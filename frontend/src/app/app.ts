import { Component } from "@angular/core";
import {RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";

interface MenuePunkt {
  titel: string;
  pfad?: string;
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
    { titel: "Kalender" },
    { titel: "Haushaltsplan" },
    { titel: "Essen" },
    { titel: "Einkaufszettel" },
  ];
}