export function datumText(datum: Date): string {
    const monat = String(datum.getMonth() + 1).padStart(2, "0");
    const tagImMonat = String(datum.getDate()).padStart(2, "0");
    return `${datum.getFullYear()}-${monat}-${tagImMonat}`;
}
