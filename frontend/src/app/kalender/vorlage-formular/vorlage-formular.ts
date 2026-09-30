import { Component, computed, inject, input, linkedSignal, signal } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { form, FormField, FormRoot, maxLength, required, validate } from "@angular/forms/signals";
import { EREIGNIS_FARBEN, EreignisFarbe, farbeVar } from "../../farben";
import { NeueSchichtVorlage, SchichtVorlageService } from "../../schicht-vorlage.service";
import { PersonService } from "../../person.service";


interface VorlageModell {
    name: string;
    start: string;
    ende: string;
    kuerzel: string;
    farbe: string;
    person: string;
}

const LEERES_MODELL: VorlageModell = { name: "", start: "", ende: "", kuerzel: "", farbe: "", person: "" };

@Component({
    selector: "app-vorlage-formular",
    imports: [FormField, FormRoot, RouterLink],
    templateUrl: "./vorlage-formular.html",
    styleUrl: "../formular.css",
})
export class VorlageFormular {
    readonly id = input<string>();

    private readonly router = inject(Router);
    private readonly vorlagenService = inject(SchichtVorlageService);
    protected readonly personService = inject(PersonService);
    protected readonly farben = EREIGNIS_FARBEN;
    protected readonly farbeVar = farbeVar;
    protected readonly serverFehler = signal<string | null>(null);
    protected readonly loeschenFrage = signal(false);

    protected readonly istBearbeiten = computed(() => this.id() !== undefined);
    protected readonly bearbeiteteVorlage = computed(() => {
        const id = this.id();
        return id === undefined ? undefined : this.vorlagenService.schichtVorlagen.value().find((v) => v.id === Number(id));
    });
    protected readonly nichtGefunden = computed(
        () => this.istBearbeiten() && !this.bearbeiteteVorlage() && !this. vorlagenService.schichtVorlagen.isLoading(),
    );

    private readonly modell = linkedSignal<VorlageModell>(() => {
        const v = this.bearbeiteteVorlage();
        if (!v) {
            return { ...LEERES_MODELL };
        }
        return {
            name: v.name,
            start: v.start.slice(0, 5),
            ende: v.ende.slice(0, 5),
            kuerzel: v.kuerzel ?? "",
            farbe: v.farbe,
            person: v.person_id === null ? "" : String(v.person_id)
        };
    });

    protected readonly endetAmFolgetag = computed(() => {
        const m = this.modell();
        return m.start !== "" && m.ende !== "" && m.ende <m.start;
    });

    protected readonly formular = form(
        this.modell,
        (pfad) => {
            required(pfad.name, { message: "Bitte gib der Vorlage einen Namen." });
            required(pfad.start, { message: "Bitte gib einen Beginn an." });
            required(pfad.ende, { message: "Bitte gib ein Ende an." });
            required(pfad.farbe, { message: "Bitte wähle eine Farbe aus." });
            maxLength(pfad.kuerzel, 3, { message: "Das Kürzel darf höchstens 3 Zeichen lang sein." });
            validate(pfad.ende, ({ value, valueOf }) => {
                if (value() !== "" && value() === valueOf(pfad.start)) {
                    return { kind: "ende-gleich-beginn", message:"Beginn und Ende dürfen nicht gleich sein." };
                }
                return undefined;
            });
        },
        {
            submission: {
                action: async () => {
                    this.serverFehler.set(null);
                    const m = this.modell();
                    const daten: NeueSchichtVorlage = {
                        name: m.name.trim(),
                        start: m.start,
                        ende: m.ende,
                        kuerzel: m.kuerzel.trim() === "" ? null : m.kuerzel.trim(),
                        farbe: m.farbe as EreignisFarbe,
                        person_id: m.person === "" ? null : Number(m.person),
                    };
                    const id = this.id();
                    try {
                        if(id === undefined) {
                            await this.vorlagenService.anlegen(daten);
                        } else {
                            await this.vorlagenService.aendern(Number(id), daten);
                        }
                        await this.router.navigateByUrl("/kalender/vorlagen");
                    } catch {
                        this.serverFehler.set("Die Vorlage konnte nicht gespeichert werden. Versuche es bitte gleich noch einmal.");
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
            await this.vorlagenService.loeschen(Number(id));
            await this.router.navigateByUrl("/kalender/vorlagen");
        } catch {
            this.loeschenFrage.set(false);
            this.serverFehler.set("Die Vorlage konnte nicht gelöscht werden. Versuch es bitte gleich noch einmal.");
        }
    }
}