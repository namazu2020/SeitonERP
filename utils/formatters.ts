
export function round(value: number, decimals: number = 2): number {
    return Number(Math.round(Number(value + "e" + decimals)) + "e-" + decimals);
}

export function formatCurrencyARS(amount: number) {
    return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        minimumFractionDigits: 2
    }).format(amount);
}

export function formatDate(date: Date | string) {
    const d = new Date(date);
    return new Intl.DateTimeFormat("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    }).format(d);
}

export function getArgentinaDate() {
    // Returns a Date object that represents "Now" in Argentina, but as a standard Date
    return new Date(new Date().toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" }));
}

export function getArgentinaDayBounds(dateInput?: Date) {
    const now = dateInput || new Date();
    const arDateStr = now.toLocaleDateString("sv-SE", { timeZone: "America/Argentina/Buenos_Aires" }); // Returns YYYY-MM-DD

    const start = new Date(`${arDateStr}T00:00:00.000-03:00`);
    const end = new Date(`${arDateStr}T23:59:59.999-03:00`);

    return { start, end };
}
