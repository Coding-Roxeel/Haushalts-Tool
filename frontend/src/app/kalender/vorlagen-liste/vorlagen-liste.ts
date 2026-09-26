import { Component, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import { farbeVar } from "../../farben";
import { SchichtVorlageService } from "../../schicht-vorlage.service";


@Component({
    selector: "app-vorlagen-liste",
    imports: [RouterLink],
    templateUrl: "./vorlagen-liste.html",
    styleUrl: "./vorlagen-liste.css",
})
export class VorlagenListe {
    protected readonly vorlagenService = inject(SchichtVorlageService);
    protected readonly farbeVar = farbeVar;
}