import { Component, computed, inject, input, linkedSignal, signal } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { form, FormField, FormRoot, maxLength, required, validate } from "@angular/forms/signals";
import { EREIGNIS_FARBEN, EreignisFarbe, farbeVar } from "../../farben";
import { PersonService } from "../../person.service";
import { SchichtVorlageService } from "../../schicht-vorlage.service";
import { NeueSchicht, SchichtService } from "../../schicht.service";

interface SchichtModell {
    person: string;
    datum: string;
    vorlage: string;
    titel: string;
    start: string;
    ende: string;
    kuerzel: string;
    farbe: string;
}


const LEERES_MODELL: SchichtModell = { person: "", datum: "", vorlage: "", titel: "", start: "", ende: "", kuerzel: "", farbe: "" };

@Component({
    selector: "app-schicht-formular",
    imports: [FormField, FormRoot, RouterLink],
    templateUrl: "./schicht-formular.html",
    styleUrl: "../formular.css",
})
export class SchichtFormular {
    readonly id = input<string>();

    private readonly router = inject(Router);
    private readonly schichtService = inject(SchichtService);
    protected readonly personService = inject(PersonService);
    protected readonly vorlagenService = inject(SchichtVorlageService);
    protected readonly farben = EREIGNIS_FARBEN;
    protected readonly farbeVar = farbeVar;
    protected readonly serverFehler = signal<string | null>(null);
    protected readonly loeschenFrage = signal(false);

    protected readonly istBearbeiten = computed(() => this.id() !== undefined);
    protected readonly bearbeiteteSchicht = computed(() => {
        const id = this.id();
        return id === undefined ? undefined : this.schichtService.schichten.value().find((s) => s.id === Number(id));
    });
    protected readonly nichtGefunden = computed(
        () => this.istBearbeiten() && !this.bearbeiteteSchicht() && !this.schichtService.schichten.isLoading(),
    );

    private readonly modell = linkedSignal<SchichtModell>(() => {
        const s = this.bearbeiteteSchicht();
        if (!s) {
            return { ...LEERES_MODELL };
        }
        return {
            person: String(s.person_id),
            datum: s.datum,
            vorlage: s.vorlage_id === null ? "" : String(s.vorlage_id),
            titel: s.titel,
            start: s.start.slice(0, 5),
            ende: s.ende.slice(0, 5),
            kuerzel: s.kuerzel ?? "",
            farbe: s.farbe,
        };
    });

    protected readonly endetAmFolgetag = computed(() => {
        const m = this.modell();
        return m.start !== "" && m.ende !== "" && m.ende < m.start;
    });

    protected readonly formular = form(
        this.modell,
        (pfad) => {
            required(pfad.person, { message: "Bitte wähle eine Person aus." });
            required(pfad.datum, { message: "Bitte gib ein Datum an." });
            required(pfad.titel, { message: "Bitte gib der Schicht einen Titel." });
            required(pfad.start, { message: "Bitte gib einen Beginn an." });
            required(pfad.ende, { message: "Bitte gib ein Ende an." });
            required(pfad.farbe, { message: "Bitte wähle eine Farbe aus." });
            maxLength(pfad.kuerzel, 3, { message: "Das Kürzel darf höchstens 3 Zeichen lang sein." });
            validate(pfad.ende, ({ value, valueOf }) => {
                if (value() !== "" && value() === valueOf(pfad.start)) {
                    return { kind: "ende-gleich-beginn", message : "Beginn und Ende dürfen nicht gleich sein." };
                }
                return undefined;
            });
        },
        {
            submission: {
                action: async () => {
                    this.serverFehler.set(null);
                    const m = this.modell();
                    const daten: NeueSchicht = {
                        person_id: Number(m.person),
                        datum: m.datum,
                        start: m.start,
                        ende: m.ende,
                        titel: m.titel.trim(),
                        kuerzel: m.kuerzel.trim() === "" ? null : m. kuerzel.trim(),
                        farbe: m.farbe as EreignisFarbe,
                        vorlage_id: m.vorlage === "" ? null : Number(m.vorlage),
                    };
                    const id = this.id();
                    try {
                        if (id === undefined) {
                            await this.schichtService.anlegen(daten);
                        } else {
                            await this.schichtService.aendern(Number(id), daten);
                        }
                        await this.router.navigateByUrl("/");
                    } catch {
                        this.serverFehler.set("Die Schicht konnte nicht gespeichert werden. Versuche es bitte gleich noch einmal.");
                    }
                },
            },
        },
    );

    protected vorlageGewaehlt(): void {
        const vorlage = this.vorlagenService.schichtVorlagen.value().find((v) => String(v.id) === this.modell().vorlage);
        if (!vorlage) {
            return;
        }
        this.modell.update((m) => ({
            ...m,
            titel:vorlage.name,
            start: vorlage.start.slice(0, 5),
            ende: vorlage.ende.slice(0, 5),
            kuerzel:vorlage.kuerzel ?? "",
            farbe: vorlage.farbe,
        }));
    }

    protected async loeschen(): Promise<void> {
        const id = this.id();
        if (id === undefined) {
            return;
        }
        try {
            await this.schichtService.loeschen(Number(id));
            await this.router.navigateByUrl("/");
        } catch {
            this.loeschenFrage.set(false);
            this.serverFehler.set("Die Schicht konnte nicht gelöscht werden. Versuch es bitte gleich noch einmal.");
        }
    }
}