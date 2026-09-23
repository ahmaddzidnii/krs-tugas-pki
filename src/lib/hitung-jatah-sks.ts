export function hitungJatahSKS(ipsLalu: number): number {
    if (ipsLalu >= 3.5) return 24;
    if (ipsLalu >= 3.0) return 22;
    if (ipsLalu >= 2.5) return 20;
    if (ipsLalu >= 2.0) return 18;

    return 15;
}