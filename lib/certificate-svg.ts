type CertificateDetails = {
  mode: "self" | "gift";
  recipient: string;
  signature: string;
  billingName: string;
  giftNote: string;
  trustName: string;
  receipt: { number: string; started: Date };
};

const xml = (text: string) => text.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[character] ?? character);

export function certificateSvg(details: CertificateDetails) {
  const gift = details.mode === "gift";
  const name = xml(gift ? details.recipient : details.signature);
  const subtitle = gift ? "THE GIFT OF A DAY OFF" : "A DAY WITHOUT THE WEIGHT OF IT ALL";
  const trustLabel = details.trustName.trim().length > 60 ? details.trustName.trim().slice(0, 59) + "…" : details.trustName.trim();
  const mainLine = gift ? "An invitation to imagine a day away from serving as trustee." : "For one day, " + trustLabel + " is in other hands, in imagination.";
  const secondLine = gift ? "The recipient decides whether to participate." : "The trust and its beneficial ownership remain unchanged.";
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
    note +
    '<path d="M115 711H1085" stroke="#c0a371" stroke-width="2"/>' +
    '<text x="135" y="753" font-family="Arial,sans-serif" font-size="14" font-weight="700" letter-spacing="2" fill="#7c664b">' + (gift ? "PRESENTED BY" : "SIGNED BY") + "</text>" +
    '<text x="135" y="792" font-family="Georgia,serif" font-size="27" font-style="italic" fill="#354650">' + xml(gift ? details.billingName : details.signature) + "</text>" +
    '<text x="1065" y="753" text-anchor="end" font-family="Arial,sans-serif" font-size="14" letter-spacing="2" fill="#7c664b">ISSUED</text>' +
    '<text x="1065" y="792" text-anchor="end" font-family="Georgia,serif" font-size="22" fill="#354650">' + xml(date) + "</text>" +
    '<path d="M115 813H1085" stroke="#d0bd97" stroke-width="1"/>' +
    '<text x="135" y="838" font-family="Arial,sans-serif" font-size="13" letter-spacing="2" fill="#705e47">NO. ' + xml(details.receipt.number) + "</text>" +
    '<text x="1065" y="838" text-anchor="end" font-family="Arial,sans-serif" font-size="12" letter-spacing="2" fill="#705e47">COMMEMORATIVE · NONBINDING · NO TRUSTEE APPOINTED</text></svg>';
}
