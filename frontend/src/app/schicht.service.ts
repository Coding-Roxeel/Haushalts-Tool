import { inject, Service } from "@angular/core";
import { HttpClient, httpResource } from "@angular/common/http";
import { firstValueFrom } from "rxjs";
import { EreignisFarbe } from "./farben";

const SCHICHTEN_URL = "http://127.0.0.1:8000/schichten";


export interface Schicht {
    id: number;
    person_id: number;
    datum: string;
    start: string;
    ende: string;
    titel: string;
    kuerzel: string | null;
    farbe: string;
    vorlage_id: number | null;
}

export interface NeueSchicht {
    person_id: number;
    datum: string;
    start: string;
    ende: string;
    titel: string;
    kuerzel: string | null;
    farbe: EreignisFarbe;
    vorlage_id: number | null;
}

@Service()
export class SchichtService {
    private readonly http = inject(HttpClient);


    schichten = httpResource<Schicht[]>(() => SCHICHTEN_URL, { defaultValue: [] });

    async anlegen(neu: NeueSchicht): Promise<Schicht> {
        const angelegt = await firstValueFrom(this.http.post<Schicht>(SCHICHTEN_URL,neu));
        this.schichten.reload();
        return angelegt;
    }

    async aendern(id: number, neu: NeueSchicht): Promise<Schicht> {
        const geaendert = await firstValueFrom(this.http.put<Schicht>(`${SCHICHTEN_URL}/${id}`, neu));
        this.schichten.reload();
        return geaendert;
    }

    async loeschen(id: number): Promise<void> {
        await firstValueFrom(this.http.delete(`${SCHICHTEN_URL}/${id}`));
        this.schichten.reload();
    }
}