import { Component, computed,inject, input,linkedSignal, signal } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { form, FormField,FormRoot,required,validate } from "@angular/forms/signals";
import { EREIGNIS_FARBEN, EreignisFarbe,farbeVar } from "../../farben";
import { PersonService } from "../../person.service";
import { NeuerTermin, TerminService } from "../../termin.service";

interface FormularModell {
    person: string;
    titel: string;
    beginn: string;
    ende: string;
    farbe: string;
}


const LEERES_MODELL: FormularModell = {person: "", titel: "", beginn: "", ende: "", farbe: "" };

@Component({
    selector: "app-termin-formular",
    imports: [FormField, FormRoot, RouterLink],
    templateUrl: "./termin-formular.html",
    styleUrl: "./termin-formular.css",
})
export class TerminFormular {
    readonly id = input<string>();

    private readonly router = inject(Router);
    private readonly terminService = inject(TerminService);
    protected readonly personService = inject(PersonService);
    protected readonly farben = EREIGNIS_FARBEN;
    protected readonly farbeVar = farbeVar;
    protected readonly serverFehler = signal<string | null>(null);
    protected readonly loeschenFrage = signal(false);

    protected readonly istBearbeiten = computed(() => this.id() !== undefined);
    protected readonly bearbeiteterTermin = computed(() => {
        const id = this.id();
        return id === undefined ? undefined : this.terminService.termine.value().find((t) => t.id === Number(id));
    });
    protected readonly nichtGefunden = computed(
        () => this.istBearbeiten() && !this.bearbeiteterTermin() && !this.terminService.termine.isLoading(),
    );

    private readonly modell = linkedSignal<FormularModell>(() => {
        const t = this.bearbeiteterTermin();
        if (!t) {
            return { ...LEERES_MODELL };
        }
        return {
            person: String(t.person_id),
            titel: t.titel,
            beginn: t.datum_zeit.slice(0, 16),
            ende: t.ende_zeit.slice(0, 16),
            farbe: t.farbe,
        };
    });

    protected readonly formular = form(
        this.modell,
        (pfad) => {
            required(pfad.person, { message: "Bitte wähle eine Person aus." });
            required(pfad.titel, { message: "Bitte gib dem Termin einen Titel." });
            required(pfad.beginn, { message: "Bitte gib einen Beginn an." });
            required(pfad.ende, { message: "Bitte gib ein Ende an." });
            required(pfad.farbe, { message: "Bitte wähle eine Farbe aus." });
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
                    const daten: NeuerTermin = {
                        person_id: Number(m.person),
                        titel: m.titel.trim(),
                        datum_zeit: m.beginn,
                        ende_zeit: m.ende,
                        farbe: m.farbe as EreignisFarbe,
                    };
                    const id = this.id();
                    try {
                        if (id === undefined) {
                            await this.terminService.anlegen(daten);
                        } else {
                            await this.terminService.aendern(Number(id), daten);
                        } 
                        await this.router.navigateByUrl("/");
                    } catch {
                        this.serverFehler.set("Der Termin konnte nicht gespeichert werden. Versuche es bitte gleich noch einmal.");
                    }
                },
            },
        },
    );
        
    protected async loeschen(): Promise<void> {
        const id = this.id();
        if (id === undefined) {
            return;
        }
        try {
            await this.terminService.loeschen(Number(id));
            await this.router.navigateByUrl("/");
        } catch {
            this.loeschenFrage.set(false);
            this.serverFehler.set("Der Termin konnte nicht gelöscht werden. Versuche es bitte gleich noch einmal.");
        }
    }
}