import { inject, Service } from "@angular/core";
import { HttpClient, httpResource } from "@angular/common/http";
import { firstValueFrom } from "rxjs";
import { EreignisFarbe } from "./farben";


const VORLAGEN_URL = "http://127.0.0.1:8000/schicht-vorlagen";


export interface SchichtVorlage {
    id: number;
    name: string;
    start: string;
    ende: string;
    kuerzel: string | null;
    farbe: string;
}

export interface NeueSchichtVorlage {
    name: string;
    start: string;
    ende: string;
    kuerzel: string | null;
    farbe: EreignisFarbe;
}

@Service()
export class SchichtVorlageService {
    private readonly http = inject(HttpClient);

    schichtVorlagen = httpResource<SchichtVorlage[]>(() => VORLAGEN_URL, { defaultValue: [] });

    async anlegen(neu:NeueSchichtVorlage): Promise<SchichtVorlage> {
        const angelegt = await firstValueFrom(this.http.post<SchichtVorlage>(VORLAGEN_URL, neu));
        this.schichtVorlagen.reload();
        return angelegt;
    }

    async aendern(id: number, neu: NeueSchichtVorlage): Promise<SchichtVorlage> {
        const geaendert = await firstValueFrom(this.http.put<SchichtVorlage>(`${VORLAGEN_URL}/${id}`, neu));
        this.schichtVorlagen.reload();
        return geaendert;
    }

    async loeschen(id: number): Promise<void> {
        await firstValueFrom(this.http.delete(`${VORLAGEN_URL}/${id}`));
        this.schichtVorlagen.reload();
    }
}