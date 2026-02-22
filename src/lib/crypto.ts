export async function sha256(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function truncateHash(hash: string, chars: number = 8): string {
  if (hash.length <= chars * 2 + 3) return hash;
  return `${hash.slice(0, chars)}...${hash.slice(-chars)}`;
}

export function formatTimestamp(): string {
  return new Date().toISOString().replace("T", " ").slice(0, 19) + " UTC";
}

export function generateCoordinates(): { lat: string; lng: string } {
  return {
    lat: "53.3498° N",
    lng: "6.2603° W",
  };
}
