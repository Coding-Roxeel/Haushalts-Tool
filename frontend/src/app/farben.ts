export const EREIGNIS_FARBEN = [
    { schluessel: "blau", name: "Blau" },
    { schluessel: "tuerkis", name: "Türkis" },
    { schluessel: "gruen", name: "Grün" },
    { schluessel: "orange", name: "Orange" },
    { schluessel: "rot", name: "Rot" },
    { schluessel: "rosa", name: "Rosa" },
    { schluessel: "violett", name: "Violett" },
    { schluessel: "grau", name: "Grau" },
] as const;

export type EreignisFarbe = (typeof EREIGNIS_FARBEN)[number]["schluessel"];

export function farbeVar(schluessel: string): string {
    return `var(--ereignis-${schluessel})`;
}

