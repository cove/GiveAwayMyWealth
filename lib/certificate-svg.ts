type CertificateDetails = {
  mode: "self" | "gift";
  recipient: string;
  signature: string;
  billingName: string;
  giftNote: string;
  assets: { name: string; category: string }[];
  estimated: number;
  noLicense: boolean;
  receipt: { number: string; started: Date };
};

const xml = (text: string) => text.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[character] ?? character);
const money = (amount: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);

export function assetIconPath(category: string, name: string) {
  if (name === "Home" || category === "Real estate") return "M3 10 12 3l9 7 M5 9v12h14V9 M9 21v-7h6v7";
  if (name === "Bank account" || category === "Bank accounts") return "M3 9h18 M5 9v10 M10 9v10 M14 9v10 M19 9v10 M3 20h18 M12 3 2 8h20L12 3Z";
  if (name === "Portfolio" || category === "Investments") return "M3 21h18 M5 17v-5h4v5 M11 17V8h4v9 M17 17V4h4v13";
  if (name === "Business" || category === "Business interests") return "M3 21V8h10v13 M13 21V3h8v18 M6 11h3 M6 15h3 M16 7h2 M16 11h2 M16 15h2";
  if (name === "Car") return "M5 16 7 9h10l2 7 M4 16h16v4H4v-4Z M7 20v2 M17 20v2 M7 17h1 M16 17h1";
  if (name === "Boat" || category === "Vehicles & vessels") return "M3 15h18l-3 6H7l-4-6Z M12 3v12 M12 4 19 13h-7 M4 23c3-2 5-2 8 0 3-2 5-2 8 0";
  if (name === "Art") return "M12 3a9 9 0 1 0 0 18h2a2 2 0 0 0 1-4c-1-2 0-3 2-3h2a5 5 0 0 0 2-4A9 9 0 0 0 12 3Z M7 11h.01 M9 7h.01 M14 7h.01 M18 10h.01";
  if (name === "Jewelry" || category === "Art & collectibles") return "M5 4h14l4 6-11 11L1 10l4-6Z M1 10h22 M9 4l-3 6 6 11 6-11-3-6";
  return "M12 2 15 9l7 3-7 3-3 7-3-7-7-3 7-3 3-7Z";
}

export function certificateSvg(details: CertificateDetails) {
  const gift = details.mode === "gift";
  const name = xml(gift ? details.recipient : details.signature);
  const subtitle = gift ? "THE GIFT OF HAVING NOTHING" : "A DAY WITHOUT THE WEIGHT OF IT ALL";
  const mainLine = gift ? "An invitation to enjoy twenty-four hours free from the cares of ownership." : "For one day, " + details.assets.length + " listed " + (details.assets.length === 1 ? "asset becomes" : "assets become") + " our trustee’s fictional concern.";
  const secondLine = gift ? "The recipient decides whether to participate." : (details.noLicense ? "No use license is issued." : "Their use remains yours.");
  const shown = details.assets.slice(0, 6);
  const assets = gift ? "" : shown.map((asset, index) => {
    const x = 600 + (index - (shown.length - 1) / 2) * 150;
    const label = asset.name.length > 15 ? asset.name.slice(0, 14) + "…" : asset.name;
    return '<g transform="translate(' + x + ',670)" text-anchor="middle" fill="none" stroke="#8c7147" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path transform="translate(-12,-12)" d="' + assetIconPath(asset.category, asset.name) + '"/></g>' +
      '<text x="' + x + '" y="700" text-anchor="middle" font-family="Arial,sans-serif" font-size="13" fill="#665844">' + xml(label) + "</text>";
  }).join("") + (details.assets.length > 6 ? '<text x="600" y="718" text-anchor="middle" font-family="Arial,sans-serif" font-size="13" fill="#665844">+ ' + (details.assets.length - 6) + ' more</text>' : "");
  const total = gift ? "" : '<text x="600" y="' + (details.assets.length > 6 ? "746" : "728") + '" text-anchor="middle" font-family="Georgia,serif" font-size="26" fill="#775b38">TOTAL GIVEN AWAY  ' + xml(money(details.estimated)) + "</text>";
  const date = details.receipt.started.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
  const giftNote = details.giftNote.trim().replace(/\s+/g, " ");
  const note = gift && giftNote ? '<text x="600" y="685" text-anchor="middle" font-family="Georgia,serif" font-size="20" font-style="italic" fill="#755a39">“' + xml(giftNote.length > 70 ? giftNote.slice(0, 69) + "…" : giftNote) + '”</text>' : "";
  const nameScale = name.length > 27 ? ' textLength="870" lengthAdjust="spacingAndGlyphs"' : "";

  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" width="1200" height="900" role="img" aria-label="Commemorative certificate">' +
    '<defs><linearGradient id="foil" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#7b562a"/><stop offset=".25" stop-color="#f9e5ad"/><stop offset=".52" stop-color="#ae8749"/><stop offset=".77" stop-color="#eed59a"/><stop offset="1" stop-color="#825e33"/></linearGradient>' +
    '<radialGradient id="paper"><stop stop-color="#fffdf4"/><stop offset=".7" stop-color="#faf2df"/><stop offset="1" stop-color="#e8d9bb"/></radialGradient>' +
    '<filter id="emboss"><feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur"/><feOffset in="blur" dx="3" dy="4" result="shadow"/><feMerge><feMergeNode in="shadow"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>' +
    '<rect width="1200" height="900" fill="url(#foil)"/><rect x="17" y="17" width="1166" height="866" fill="url(#paper)" stroke="#9d7841" stroke-width="3"/>' +
    '<rect x="34" y="34" width="1132" height="832" fill="none" stroke="#c3a36d" stroke-width="2"/><rect x="49" y="49" width="1102" height="802" fill="none" stroke="#dfc899" stroke-width="1"/>' +
    '<path d="M69 128V69H128 M1072 69H1131V128 M69 772V831H128 M1072 831H1131V772" fill="none" stroke="#ac8651" stroke-width="4"/>' +
    '<text x="600" y="114" text-anchor="middle" font-family="Arial,sans-serif" font-size="17" font-weight="700" letter-spacing="5" fill="#775b38">GIVEAWAYMYWEALTH · PRIVATE CLIENT OFFICE</text>' +
    '<circle cx="600" cy="236" r="76" fill="url(#foil)" stroke="#795a30" stroke-width="4" filter="url(#emboss)"/><circle cx="600" cy="236" r="64" fill="none" stroke="#f8e4af" stroke-width="4"/><circle cx="600" cy="236" r="54" fill="none" stroke="#7b5b31" stroke-width="2"/>' +
    '<text x="600" y="263" text-anchor="middle" font-family="Georgia,serif" font-size="83" font-style="italic" fill="#634724">G</text>' +
    '<text x="600" y="357" text-anchor="middle" font-family="Arial,sans-serif" font-size="17" letter-spacing="5" fill="#826541">CERTIFICATE OF ' + (gift ? "AN EXCEPTIONAL INVITATION" : "TEMPORARY RELIEF") + "</text>" +
    '<text x="600" y="422" text-anchor="middle" font-family="Georgia,serif" font-size="43" fill="#263b48">' + subtitle + "</text>" +
    '<text x="600" y="474" text-anchor="middle" font-family="Georgia,serif" font-size="21" fill="#746a5e">Presented with great ceremony to</text>' +
    '<text x="600" y="548" text-anchor="middle" font-family="Georgia,serif" font-size="61" fill="#906c3c" filter="url(#emboss)"' + nameScale + ">" + name + "</text>" +
    '<text x="600" y="589" text-anchor="middle" font-family="Georgia,serif" font-size="29" fill="#a57f49">✦</text>' +
    '<text x="600" y="619" text-anchor="middle" font-family="Georgia,serif" font-size="20" fill="#48555c">' + xml(mainLine) + "</text>" +
    '<text x="600" y="647" text-anchor="middle" font-family="Georgia,serif" font-size="20" fill="#48555c">' + xml(secondLine) + "</text>" +
    assets + total +
    note +
    '<path d="M115 ' + (gift ? 711 : details.assets.length > 6 ? 765 : 750) + 'H1085" stroke="#c0a371" stroke-width="2"/>' +
    '<text x="135" y="' + (gift ? 753 : details.assets.length > 6 ? 788 : 777) + '" font-family="Arial,sans-serif" font-size="14" font-weight="700" letter-spacing="2" fill="#7c664b">' + (gift ? "PRESENTED BY" : "SIGNED BY") + "</text>" +
    '<text x="135" y="' + (gift ? 792 : details.assets.length > 6 ? 812 : 806) + '" font-family="Georgia,serif" font-size="27" font-style="italic" fill="#354650">' + xml(gift ? details.billingName : details.signature) + "</text>" +
    '<text x="1065" y="' + (gift ? 753 : details.assets.length > 6 ? 788 : 777) + '" text-anchor="end" font-family="Arial,sans-serif" font-size="14" letter-spacing="2" fill="#7c664b">ISSUED</text>' +
    '<text x="1065" y="' + (gift ? 792 : details.assets.length > 6 ? 812 : 806) + '" text-anchor="end" font-family="Georgia,serif" font-size="22" fill="#354650">' + xml(date) + "</text>" +
    '<path d="M115 ' + (gift ? 813 : details.assets.length > 6 ? 827 : 823) + 'H1085" stroke="#d0bd97" stroke-width="1"/>' +
    '<text x="135" y="' + (gift ? 838 : details.assets.length > 6 ? 845 : 840) + '" font-family="Arial,sans-serif" font-size="13" letter-spacing="2" fill="#705e47">NO. ' + xml(details.receipt.number) + "</text>" +
    '<text x="1065" y="' + (gift ? 838 : details.assets.length > 6 ? 845 : 840) + '" text-anchor="end" font-family="Arial,sans-serif" font-size="12" letter-spacing="2" fill="#705e47">COMMEMORATIVE · NONBINDING · NO ASSETS TRANSFERRED</text></svg>';
}
