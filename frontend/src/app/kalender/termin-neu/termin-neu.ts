import { Component, inject, signal } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { form, FormField, FormRoot, required, validate } from "@angular/forms/signals";
import { EREIGNIS_FARBEN, EreignisFarbe, farbeVar } from "../../farben";
import { PersonService } from "../../person.service";
import { TerminService } from "../../termin.service";

@Component({
    selector: "app-termin-neu",
    imports: [FormField, FormRoot, RouterLink],
    templateUrl: "./termin-neu.html",
    styleUrl: "./termin-neu.css",
})
export class TerminNeu {
    private readonly router = inject(Router);
    private readonly terminService = inject(TerminService);
    protected readonly personService = inject(PersonService);
    protected readonly farben = EREIGNIS_FARBEN;
    protected readonly farbeVar = farbeVar;
    protected readonly serverFehler = signal<string | null>(null);

    private readonly modell = signal({
        person: "",
        titel: "",
        beginn: "",
        ende: "",
        farbe: "",
    });

    protected readonly formular = form(
        this.modell,
        (pfad) => {
            required(pfad.person, {message: "Bitte wähle eine Person aus." });
            required(pfad.titel, { message: "Bitte gib dem Termin einen Titel." });
            required(pfad.beginn, {message: "Bitte gib einen Beginn an." });
            required(pfad.ende, { message: "Bitte gib ein Ende an." });
            required(pfad.farbe, {message: "Bitte wähle eine Farbe aus." });
            validate(pfad.ende, ({ value, valueOf }) => {
                const beginn = valueOf(pfad.beginn);
                const ende = value();
                if (beginn && ende && ende <= beginn) {
                    return { kind: "ende-vor-beginn", message: "Das Ende muss nach dem Beginn liegen." };
                }
                return undefined;
            });
        },
        {
            submission: {
                action: async () => {
                    this.serverFehler.set(null);
                    const m = this.modell();
                    try {
                        await this.terminService.anlegen({
                            person_id: Number(m.person),
                            titel: m.titel.trim(),
                            datum_zeit: m.beginn,
                            ende_zeit:m.ende,
                            farbe: m.farbe as EreignisFarbe,
                        });
                        await this.router.navigateByUrl("/");
                    } catch {
                        this.serverFehler.set("Der Termin konnte nicht gespeichert werden. Versuch es bitte gleich noch einmal.");
                    }
                },
            },
        },
    );
}