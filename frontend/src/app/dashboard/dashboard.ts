import { Component, inject } from "@angular/core";
import { PersonService } from "../person.service";
import { SchichtService } from "../schicht.service";
import { TerminService } from "../termin.service";

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
}