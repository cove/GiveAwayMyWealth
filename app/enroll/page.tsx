"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Building2, CarFront, ChartNoAxesCombined, Gem, House, Landmark, Palette, Sailboat } from "lucide-react";
import { trustClauses } from "@/lib/trust-wording";
import { certificateSvg } from "@/lib/certificate-svg";
import "./enroll.css";

type Mode = "self" | "gift";
type Asset = { id: string; category: string; name: string; value: string; holding: string; location: string; share: string; liability: string; notes: string; details: Record<string, string>; reference?: string; standard?: boolean };
type Receipt = { number: string; started: Date };
const categories = ["Real estate", "Bank accounts", "Investments", "Business interests", "Vehicles & vessels", "Art & collectibles", "Household property", "Digital assets", "Receivables", "Other interests"];
const standardAssets = [
  { name: "Home", category: "Real estate", icon: House },
  { name: "Bank account", category: "Bank accounts", icon: Landmark },
  { name: "Portfolio", category: "Investments", icon: ChartNoAxesCombined },
  { name: "Business", category: "Business interests", icon: Building2 },
  { name: "Car", category: "Vehicles & vessels", icon: CarFront },
  { name: "Boat", category: "Vehicles & vessels", icon: Sailboat },
  { name: "Art", category: "Art & collectibles", icon: Palette },
  { name: "Jewelry", category: "Art & collectibles", icon: Gem },
];
const luxuryCars = ["Aston Martin", "Bentley", "Bugatti", "Ferrari", "Lamborghini", "Maserati", "McLaren", "Mercedes-Maybach", "Porsche", "Rolls-Royce"];
const otherCars = ["Acura", "Audi", "BMW", "Cadillac", "Chevrolet", "Ford", "Genesis", "Honda", "Hyundai", "Jaguar", "Jeep", "Land Rover", "Lexus", "Lucid", "Mercedes-Benz", "Rivian", "Subaru", "Tesla", "Toyota", "Volkswagen", "Volvo", "Other"];
const luxuryBoats = ["Azimut", "Benetti", "Feadship", "Ferretti", "Lürssen", "Princess", "Riva", "Sunseeker", "Wally", "Westport"];
const otherBoats = ["Bayliner", "Beneteau", "Boston Whaler", "Catalina", "Chaparral", "Grady-White", "Jeanneau", "Sea Ray", "Yamaha", "Other"];
type DetailField = { key: string; label: string; placeholder?: string; options?: string[]; required?: boolean };
const field = (key: string, label: string, placeholder?: string, required = false): DetailField => ({ key, label, placeholder, required });
const detailFields: Record<string, DetailField[]> = {
  Home: [field("propertyType", "Property type", "Residence, rental, land"), field("propertyLocation", "City, state / county", "e.g. Marin County, CA", true), field("parcel", "Parcel or deed reference (optional)", "Do not enter a full street address")],
  "Bank account": [field("institution", "Bank or credit union", "e.g. First Republic", true), { key: "accountType", label: "Account type", options: ["Checking", "Savings", "Money market", "Certificate of deposit", "Other"], required: true }],
  Portfolio: [field("custodian", "Brokerage or custodian", "e.g. Fidelity", true), { key: "accountType", label: "Account type", options: ["Taxable brokerage", "Retirement account", "Managed account", "Directly held securities", "Other"], required: true }, field("holdings", "Principal holdings / asset class", "e.g. index funds, bonds, private shares")],
  Business: [field("entity", "Entity / business name", "e.g. Harbor Holdings LLC", true), { key: "entityType", label: "Entity type", options: ["LLC", "Corporation", "Partnership", "Sole proprietorship", "Other"] }, field("jurisdiction", "State / jurisdiction", "e.g. Delaware"), field("interest", "Class or units of interest", "e.g. 200 Class A units")],
  Car: [{ key: "make", label: "Make", options: [...luxuryCars, ...otherCars], required: true }, field("model", "Model", "e.g. Phantom", true), field("year", "Year", "e.g. 2024", true), field("identifier", "VIN or plate ending (optional)", "Last few characters only")],
  Boat: [{ key: "make", label: "Builder / make", options: [...luxuryBoats, ...otherBoats], required: true }, field("model", "Model / vessel name", "e.g. 68 Predator", true), field("year", "Year", "e.g. 2022"), field("identifier", "HIN or registration ending (optional)", "Last few characters only"), field("mooring", "Home port / mooring", "e.g. Sausalito")],
  Art: [field("creator", "Artist / maker", "e.g. the artist's name", true), field("work", "Title / object", "e.g. Untitled, 2018", true), field("medium", "Medium / edition", "e.g. oil on canvas; edition 3 of 10"), field("provenance", "Provenance / appraisal", "e.g. gallery and appraisal year")],
  Jewelry: [field("maker", "Maker / brand", "e.g. Cartier"), field("work", "Description", "e.g. platinum diamond ring", true), field("markings", "Materials / identifying marks", "e.g. 18k gold, maker's mark"), field("appraisal", "Appraisal year / reference", "e.g. 2025 appraisal")],
  "Household property": [field("contents", "Contents or collection", "e.g. dining-room furnishings", true), field("propertyLocation", "General location", "e.g. main residence")],
  "Digital assets": [field("platform", "Platform / custodian", "e.g. exchange or self-custody", true), field("assetType", "Asset type", "e.g. domain, crypto, royalties"), field("identifier", "Public reference (optional)", "Never enter keys or passwords")],
  Receivables: [field("debtor", "Debtor / obligor", "Name of person or entity", true), field("instrument", "Note / contract description", "e.g. promissory note dated June 2025"), field("maturity", "Due date (if any)", "e.g. December 2027")],
  "Vehicles & vessels": [field("vehicleType", "Vehicle / vessel type", "e.g. motorcycle, aircraft, sailboat"), field("maker", "Maker / builder", "e.g. Cessna"), field("model", "Model / name", "e.g. 182 Skylane"), field("year", "Year", "e.g. 2020"), field("identifier", "VIN, HIN or registration ending", "Last few characters only")],
  "Other interests": [field("identifier", "Distinguishing reference", "e.g. contract date or collection name")],
};
const customFieldTypes: Record<string, string> = { "Real estate": "Home", "Bank accounts": "Bank account", Investments: "Portfolio", "Business interests": "Business", "Art & collectibles": "Art" };
const fieldsFor = (asset: Asset): DetailField[] => detailFields[asset.standard ? asset.name : customFieldTypes[asset.category] || asset.category] ?? [];
const demoAccountNumber = () => "DEMO-ACCT-" + String(Math.floor(Math.random() * 1000000)).padStart(6, "0");
const blankAsset = (): Asset => ({ id: Math.random().toString(36).slice(2), category: "Real estate", name: "", value: "", holding: "", location: "", share: "100", liability: "", notes: "", details: {} });
const scheduleDetails = (asset: Asset) => fieldsFor(asset).map(({ key, label }) => asset.details[key]?.trim() && label.replace(/ \(.*\)/, "") + ": " + (key === "make" && asset.details.make === "Other" ? asset.details.otherMake || "Other" : asset.details[key].trim())).filter(Boolean);
const assetTitle = (asset: Asset) => asset.name === "Car" || asset.name === "Boat" ? [asset.details.year, asset.details.make === "Other" ? asset.details.otherMake : asset.details.make, asset.details.model].filter(Boolean).join(" ") || asset.name : asset.name === "Business" ? asset.details.entity || asset.name : asset.name === "Art" ? asset.details.work || asset.name : asset.name === "Jewelry" ? asset.details.work || asset.name : asset.name;
const currency = (amount: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);

function TrustInstrument({ assets, noLicense, signature, receipt }: { assets: Asset[]; noLicense: boolean; signature: string; receipt?: Receipt }) {
  return <div className="deed trust-instrument"><div className="deed-top"><span className="brand-mark">G</span><span>CLIENT DOCUMENT · NONBINDING</span></div><h3 className="serif">The Twenty-Four Hour<br/>Relief Trust</h3><p className="deed-sub">Declaration and license · Schedule A attached{receipt && <> · {receipt.number}</>}</p><div className="deed-rule"/>{trustClauses(noLicense).map((clause, index) => <p key={clause.title}><b>{index + 1}. {clause.title}.</b> {clause.text}</p>)}<div className="deed-rule"/><span className="eyebrow">Schedule A · Listed assets</span><ol>{assets.map((asset) => <li key={asset.id}><b>{assetTitle(asset)}</b> · {asset.category} · Estimated whole-asset value {currency(Number(asset.value) || 0)} · {asset.share || "100"}% interest{asset.reference && " · Fictional account no.: " + asset.reference}{scheduleDetails(asset).map((detail) => " · " + detail)}{asset.holding && " · Held: " + asset.holding}{asset.location && " · Location/custodian: " + asset.location}{asset.liability && " · Obligation: " + asset.liability}{asset.notes && " · " + asset.notes}</li>)}</ol><p className="schedule-caveat">Account numbers are fabricated for this nonbinding schedule and do not identify accounts. Listing property here does not transfer title.</p><div className="deed-rule"/><div className="instrument-signature"><span className="eyebrow">Participant signature</span><div className="signature-preview" aria-label="Signature on instrument">{signature || "Sign here"}</div><small>{receipt ? `Applied ${receipt.started.toLocaleString()} · ${receipt.number}` : "Type your name below to preview your signature."}</small></div></div>;
}

function EmbossedCertificate({ mode, receipt, recipient, signature, billingName, giftNote, assets, estimated, noLicense }: { mode: Mode; receipt: Receipt; recipient: string; signature: string; billingName: string; giftNote: string; assets: Asset[]; estimated: number; noLicense: boolean }) {
  const isGift = mode === "gift";
  return <div className="certificate embossed-certificate" aria-label="Commemorative certificate">
    <div className="certificate-inner">
      <div className="certificate-masthead"><span>GIVEAWAYMYWEALTH</span><span>PRIVATE CLIENT OFFICE · EST. FOR ONE DAY</span></div>
      <div className="certificate-seal" aria-hidden="true"><span>G</span></div>
      <p className="certificate-kicker">Certificate of {isGift ? "an exceptional invitation" : "temporary relief"}</p>
      <h3 className="serif certificate-title">{isGift ? "The gift of having nothing." : "A day without the weight of it all."}</h3>
      <p className="certificate-presented">{isGift ? "Presented with exquisite restraint to" : "Presented with great ceremony to"}</p>
      <p className="serif certificate-name">{isGift ? recipient : signature}</p>
      <div className="certificate-flourish" aria-hidden="true">✦</div>
      <p className="certificate-description">{isGift ? "An invitation to enjoy twenty-four hours free from the cares of ownership. The recipient decides whether to participate." : <>For one day, {assets.length} listed {assets.length === 1 ? "asset" : "assets"} with a stated value of {currency(estimated)} {assets.length === 1 ? "is" : "are"} the trustee’s fictional concern. {noLicense ? "No use license is issued." : "Their use remains yours."}</>}</p>
      {isGift && giftNote && <p className="certificate-note">“{giftNote}”</p>}
      <div className="certificate-details"><div><small>{isGift ? "Presented by" : "Signed by"}</small><strong className="serif certificate-signature">{isGift ? billingName : signature}</strong></div><div><small>{isGift ? "Issued" : "Twenty-four-hour term"}</small><strong>{receipt.started.toLocaleString()} {isGift ? "" : "– " + new Date(receipt.started.getTime() + 86400000).toLocaleString()}</strong></div></div>
      <div className="certificate-bottom"><span>NO. {receipt.number}</span><span>COMMEMORATIVE · NONBINDING · NO ASSETS TRANSFERRED</span></div>
    </div>
  </div>;
}

export default function Enroll() {
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<Mode>("self");
  const [noLicense, setNoLicense] = useState(false);
  const [companion, setCompanion] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [complete, setComplete] = useState(false);
  const [signature, setSignature] = useState("");
  const [signAccepted, setSignAccepted] = useState(false);
  const [authorityAccepted, setAuthorityAccepted] = useState(false);
  const [billingName, setBillingName] = useState("");
  const [billingEmail, setBillingEmail] = useState("");
  const [billingZip, setBillingZip] = useState("");
  const [recipient, setRecipient] = useState("");
  const [companionName, setCompanionName] = useState("");
  const [giftNote, setGiftNote] = useState("");
  const [payment, setPayment] = useState("card");
  const [checkoutAccepted, setCheckoutAccepted] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("mode") === "gift") setMode("gift");
    if (params.get("addon") === "no-license") setNoLicense(true);
    if (params.get("addon") === "companion" && params.get("mode") !== "gift") setCompanion(true);
  }, []);
  useEffect(() => { window.scrollTo(0, 0); }, [step]);
  const total = 249 + (noLicense ? 99 : 0) + (mode === "self" && companion ? 149 : 0);
  const estimated = assets.reduce((sum, asset) => sum + (Number(asset.value) || 0) * (Number(asset.share) || 0) / 100, 0);
  const flow = mode === "gift" ? [{ id: 0, name: "Selection" }, { id: 3, name: "Checkout" }] : [{ id: 0, name: "Selection" }, { id: 1, name: "Inventory" }, { id: 2, name: "Signature" }, { id: 3, name: "Checkout" }];
  const currentIndex = flow.findIndex((item) => item.id === step);
  const certificateDownload = receipt ? "data:image/svg+xml;charset=utf-8," + encodeURIComponent(certificateSvg({ mode, recipient, signature, billingName, giftNote, assetsCount: assets.length, estimated, noLicense, receipt })) : "";
  const next = (destination: number) => { setError(""); setStep(destination); };
  const updateAsset = (id: string, field: keyof Asset, value: string) => setAssets((old) => old.map((asset) => asset.id === id ? { ...asset, [field]: value, ...(field === "category" ? { details: {}, reference: ["Bank accounts", "Investments"].includes(value) ? demoAccountNumber() : undefined } : {}) } : asset));
  const updateDetail = (id: string, key: string, value: string) => setAssets((old) => old.map((asset) => asset.id === id ? { ...asset, details: { ...asset.details, [key]: value } } : asset));
  const addStandardAsset = (name: string, category: string) => {
    const entry = { ...blankAsset(), name, category, standard: true, reference: ["Bank accounts", "Investments"].includes(category) ? demoAccountNumber() : undefined };
    setAssets((old) => [...old, entry]);
    requestAnimationFrame(() => document.getElementById("asset-detail-" + entry.id + "-" + (fieldsFor(entry)[0]?.key ?? "value"))?.focus());
  };
  const changeMode = (value: string) => { setMode(value as Mode); if (value === "gift") setCompanion(false); };
  const inventoryNext = () => {
    if (!assets.length) { setError("Add at least one asset to your schedule."); return; }
    if (assets.some((asset) => !asset.name.trim() || asset.value === "" || !Number.isFinite(Number(asset.value)) || Number(asset.value) < 0)) { setError("Please name and value each asset, or remove unfinished entries."); return; }
    if (assets.some((asset) => fieldsFor(asset).some((field) => field.required && !asset.details[field.key]?.trim()))) { setError("Add the identifying details marked * for each asset."); return; }
    if (assets.some((asset) => asset.details.make === "Other" && !asset.details.otherMake?.trim())) { setError("Specify the make or builder for each ‘Other’ selection."); return; }
    if (assets.some((asset) => !Number.isFinite(Number(asset.share)) || Number(asset.share) <= 0 || Number(asset.share) > 100)) { setError("Enter an ownership share between 1% and 100% for each asset."); return; }
    if (!complete) { setError("Please confirm that your schedule is complete."); return; }
    next(2);
  };
  const signNext = () => {
    if (!signature.trim() || !signAccepted || !authorityAccepted) { setError("Type your name and confirm both statements before continuing."); return; }
    setBillingName(signature.trim()); next(3);
  };
  const finish = () => {
    if (!billingName.trim() || !billingEmail.includes("@") || !/^\d{5}$/.test(billingZip)) { setError("Enter a name, email address and five-digit ZIP code."); return; }
    if (mode === "gift" && !recipient.trim()) { setError("Enter the name to place on the gift card."); return; }
    if (companion && !companionName.trim()) { setError("Enter the companion’s name for their invitation."); return; }
    if (!checkoutAccepted) { setError("Confirm the checkout terms before continuing."); return; }
    setReceipt({ number: "GMW-" + Math.random().toString(36).slice(2, 8).toUpperCase(), started: new Date() });
    next(4);
  };
  const copyInvite = async () => {
    const url = window.location.origin + "/enroll";
    const text = mode === "gift" ? "A private invitation for " + recipient + ": enjoy a 24-hour holiday from ownership at " + url + ". The invitation is personal; no property transfers through it." : "A private invitation for " + companionName + ": join me for a 24-hour wealth holiday at " + url + ". You decide whether to participate and sign only for yourself.";
    try { await navigator.clipboard.writeText(text); setCopied(true); } catch { setCopied(false); }
  };

  return <main className="enroll-page">
    <div className="enroll-top"><div className="wrap"><span className="eyebrow">Private client services / enrollment</span><h1 className="serif">{step === 4 ? "Your day, beautifully unburdened." : "Curate your freedom."}</h1><p>Describe your holdings, select your terms and complete the paperwork. Entries remain in this browser tab.</p></div></div>
    <div className="wrap enroll-shell">
      <div className="enroll-main">
        {step !== 4 && <div className="progress-list" aria-label="Enrollment progress">{flow.map((item, index) => <div className={"progress-item" + (index === currentIndex ? " current" : "") + (index < currentIndex ? " done" : "")} key={item.id}><span>{String(index + 1).padStart(2, "0")}</span>{item.name}</div>)}</div>}

        {step === 0 && <section className="panel" aria-labelledby="select-heading"><span className="eyebrow">01 / Select an experience</span><h2 id="select-heading" className="serif panel-title">Who is this day for?</h2><p className="panel-intro">Choose a day for yourself or present an invitation to someone else. The schedule of rates appears alongside your selection.</p>
          <RadioGroup value={mode} onValueChange={changeMode} className="mode-grid" aria-label="Experience recipient">
            <label className={"choice-card" + (mode === "self" ? " selected" : "")}><RadioGroupItem value="self" aria-label="For myself"/><span><strong className="serif">For myself</strong><small>A 24-hour trusteeship, with optional services.</small></span></label>
            <label className={"choice-card" + (mode === "gift" ? " selected" : "")}><RadioGroupItem value="gift" aria-label="As a gift"/><span><strong className="serif">As a gift</strong><small>An elegant private card; the recipient chooses whether to participate.</small></span></label>
          </RadioGroup>
          <div className="selected-product"><div><span className="eyebrow">The signature experience</span><h3 className="serif">The Wealth Holiday</h3><p>A 24-hour trusteeship for the risks and care of listed assets, with continued use.</p></div><strong>$249</strong></div>
          <h3 className="serif add-ons-title">Make it your own.</h3>
          <label className="addon-row"><Checkbox checked={noLicense} onCheckedChange={(value) => setNoLicense(Boolean(value))} aria-label="Add Nothing Licensed Back"/><span><strong>Nothing Licensed Back</strong><small>{mode === "gift" ? "Include the option in the recipient’s invitation; they decide whether to use it." : "Suspend the use license for 24 hours. Existing automatic payments continue."}</small></span><b>+$99</b></label>
          {mode === "self" && <label className="addon-row"><Checkbox checked={companion} onCheckedChange={(value) => setCompanion(Boolean(value))} aria-label="Add Companion Release"/><span><strong>The Companion Release</strong><small>Invite someone to list and release their own wealth. Their decision and signature are theirs alone.</small></span><b>+$149</b></label>}
          <div className="panel-actions"><button className="btn btn-dark" onClick={() => next(mode === "gift" ? 3 : 1)}>Continue to {mode === "gift" ? "checkout" : "inventory"}</button></div>
        </section>}

        {step === 1 && <section className="panel" aria-labelledby="inventory-heading"><span className="eyebrow">02 / Schedule A</span><h2 id="inventory-heading" className="serif panel-title">Itemize your empire.</h2><p className="panel-intro">Choose an asset and give it a recognizable description and approximate value. Add custom interests as needed. Skip full account numbers, street addresses, VINs and passwords; account references here are invented.</p>
          <h3 className="asset-picker-title serif">Select your assets</h3>
          <div className="asset-picker" aria-label="Standard assets">
            {standardAssets.map(({ name, category, icon: Icon }) => <button key={name} type="button" className="asset-tile" onClick={() => addStandardAsset(name, category)} aria-label={"Add " + name}><Icon size={30} strokeWidth={1.5} aria-hidden="true"/><span>{name}</span></button>)}
          </div>
          {assets.length === 0 && <p className="asset-empty">Your schedule is empty. Select an icon to begin.</p>}
          {assets.map((asset, index) => <div className={"asset-card" + (asset.standard ? " standard-asset" : "")} key={asset.id}>
            <div className="asset-header"><h3 className="serif">{asset.standard ? asset.name : "Custom asset " + String(index + 1).padStart(2, "0")}</h3><button type="button" className="text-button" onClick={() => setAssets((old) => old.filter((entry) => entry.id !== asset.id))} aria-label={"Remove " + (asset.name || "custom asset")}>Remove</button></div>
            <div className="field-grid">
              {!asset.standard && <><div className="field"><label htmlFor={"asset-category-" + asset.id}>Asset class</label><Select value={asset.category} onValueChange={(value) => updateAsset(asset.id, "category", value)}><SelectTrigger id={"asset-category-" + asset.id} className="field-control"><SelectValue/></SelectTrigger><SelectContent>{categories.map((cat) => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent></Select></div><div className="field"><label htmlFor={"asset-name-" + asset.id}>Description / title *</label><Input id={"asset-name-" + asset.id} className="field-control" value={asset.name} onChange={(e) => updateAsset(asset.id, "name", e.target.value)} placeholder="e.g. The coastal house"/></div></>}
              {fieldsFor(asset).map((detail) => <div className="field" key={detail.key}><label htmlFor={"asset-detail-" + asset.id + "-" + detail.key}>{detail.label}{detail.required ? " *" : ""}</label>{detail.options ? <Select value={asset.details[detail.key] || undefined} onValueChange={(value) => updateDetail(asset.id, detail.key, value)}><SelectTrigger id={"asset-detail-" + asset.id + "-" + detail.key} className="field-control"><SelectValue placeholder="Select one"/></SelectTrigger><SelectContent>{detail.key === "make" && <><SelectGroup><SelectLabel>{asset.name === "Car" ? "Luxury marques" : "Luxury builders"}</SelectLabel>{detail.options.slice(0, asset.name === "Car" ? luxuryCars.length : luxuryBoats.length).map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectGroup><SelectGroup><SelectLabel>Other makes</SelectLabel>{detail.options.slice(asset.name === "Car" ? luxuryCars.length : luxuryBoats.length).map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectGroup></>}{detail.key !== "make" && detail.options.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent></Select> : <Input id={"asset-detail-" + asset.id + "-" + detail.key} className="field-control" value={asset.details[detail.key] || ""} onChange={(e) => updateDetail(asset.id, detail.key, e.target.value)} placeholder={detail.placeholder}/>}</div>)}
              {asset.details.make === "Other" && <div className="field"><label htmlFor={"asset-other-make-" + asset.id}>Specify make / builder *</label><Input id={"asset-other-make-" + asset.id} className="field-control" value={asset.details.otherMake || ""} onChange={(e) => updateDetail(asset.id, "otherMake", e.target.value)} placeholder="Enter the maker"/></div>}
              {asset.reference && <div className="field"><span className="field-label">Fictional account number</span><div className="mock-reference">{asset.reference}</div><small>Generated for this keepsake; no real account is identified.</small></div>}
              <div className="field"><label htmlFor={"asset-value-" + asset.id}>Approximate value (USD) *</label><Input id={"asset-value-" + asset.id} className="field-control" type="number" min="0" value={asset.value} onChange={(e) => updateAsset(asset.id, "value", e.target.value)} placeholder="0"/></div>
              <div className="field"><label htmlFor={"asset-share-" + asset.id}>Ownership share (%) *</label><Input id={"asset-share-" + asset.id} className="field-control" type="number" min="1" max="100" value={asset.share} onChange={(e) => updateAsset(asset.id, "share", e.target.value)}/></div>
              <div className="field"><label htmlFor={"asset-holding-" + asset.id}>Title / how held</label><Input id={"asset-holding-" + asset.id} className="field-control" value={asset.holding} onChange={(e) => updateAsset(asset.id, "holding", e.target.value)} placeholder="e.g. Solely, jointly, through an LLC"/></div>
              <div className="field"><label htmlFor={"asset-location-" + asset.id}>Other location / custodian</label><Input id={"asset-location-" + asset.id} className="field-control" value={asset.location} onChange={(e) => updateAsset(asset.id, "location", e.target.value)} placeholder="e.g. stored in a gallery"/></div>
              <div className="field full"><label htmlFor={"asset-liability-" + asset.id}>Debt, lien or upkeep</label><Input id={"asset-liability-" + asset.id} className="field-control" value={asset.liability} onChange={(e) => updateAsset(asset.id, "liability", e.target.value)} placeholder="e.g. mortgage, loan, insurance, maintenance"/></div>
              <div className="field full"><label htmlFor={"asset-notes-" + asset.id}>Additional distinguishing details</label><Textarea id={"asset-notes-" + asset.id} className="field-control" value={asset.notes} onChange={(e) => updateAsset(asset.id, "notes", e.target.value)} placeholder="Condition or other facts affecting the description or value" rows={2}/></div>
            </div>
          </div>)}
          <button type="button" className="btn btn-outline add-asset" onClick={() => setAssets((old) => [...old, blankAsset()])}>+ Add custom asset</button>
          <div className="inventory-total"><span>Scheduled interest value</span><strong>{assets.length} {assets.length === 1 ? "entry" : "entries"} · {currency(estimated)}</strong></div>
          <label className="confirm-row"><Checkbox checked={complete} onCheckedChange={(value) => setComplete(Boolean(value))}/><span>This is the complete schedule I want to use for this engagement.</span></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="panel-actions"><button className="btn btn-outline" onClick={() => next(0)}>Back</button><button className="btn btn-dark" onClick={inventoryNext}>Review instrument</button></div>
        </section>}

        {step === 2 && <section className="panel" aria-labelledby="deed-heading"><span className="eyebrow">03 / Signing room</span><h2 id="deed-heading" className="serif panel-title">The fine print of freedom.</h2><p className="panel-intro">Review the trust instrument and its asset schedule before applying your signature.</p>
          <TrustInstrument assets={assets} noLicense={noLicense} signature={signature}/>
          <div className="signature-area"><span className="eyebrow">Apply your signature</span><div className="field"><label htmlFor="signature">Type your name</label><Input id="signature" className="field-control" value={signature} onChange={(e) => setSignature(e.target.value)} placeholder="Your signature"/></div><label className="confirm-row"><Checkbox checked={authorityAccepted} onCheckedChange={(value) => setAuthorityAccepted(Boolean(value))}/><span>I am participating only for myself; I am not signing for another person.</span></label><label className="confirm-row"><Checkbox checked={signAccepted} onCheckedChange={(value) => setSignAccepted(Boolean(value))}/><span>I understand this document is nonbinding and transfers no assets or liabilities.</span></label></div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="panel-actions"><button className="btn btn-outline" onClick={() => next(1)}>Back to inventory</button><button className="btn btn-dark" onClick={signNext}>Apply signature</button></div>
        </section>}

        {step === 3 && <section className="panel" aria-labelledby="checkout-heading"><span className="eyebrow">{mode === "gift" ? "02" : "04"} / Checkout</span><h2 id="checkout-heading" className="serif panel-title">The final formality.</h2><p className="panel-intro">Review your details and payment preference. No charge is processed and no order details leave this browser tab.</p>
          {mode === "gift" && <div className="checkout-block"><h3 className="serif">Personalize the gift</h3><div className="field-grid"><div className="field"><label htmlFor="recipient">Recipient name *</label><Input id="recipient" className="field-control" value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="For the person who has everything"/></div><div className="field"><label htmlFor="gift-from">From</label><Input id="gift-from" className="field-control" value={billingName} onChange={(e) => setBillingName(e.target.value)} placeholder="Your name"/></div><div className="field full"><label htmlFor="gift-note">A note to accompany the card</label><Textarea id="gift-note" className="field-control" value={giftNote} onChange={(e) => setGiftNote(e.target.value)} rows={3} placeholder="May your worries be as light as a tea bag."/></div></div></div>}
          {mode === "self" && companion && <div className="checkout-block"><h3 className="serif">Companion invitation</h3><p>We will prepare an invitation you can copy or print; the companion enrolls separately.</p><div className="field"><label htmlFor="companion-name">Companion name *</label><Input id="companion-name" className="field-control" value={companionName} onChange={(e) => setCompanionName(e.target.value)} placeholder="Their name"/></div></div>}
          <div className="checkout-block"><h3 className="serif">Contact & billing</h3><div className="field-grid"><div className="field"><label htmlFor="bill-name">Name *</label><Input id="bill-name" className="field-control" value={billingName} onChange={(e) => setBillingName(e.target.value)} placeholder="Your name"/></div><div className="field"><label htmlFor="bill-email">Email *</label><Input id="bill-email" className="field-control" type="email" value={billingEmail} onChange={(e) => setBillingEmail(e.target.value)} placeholder="example@example.com"/></div><div className="field"><label htmlFor="bill-zip">ZIP code *</label><Input id="bill-zip" className="field-control" inputMode="numeric" maxLength={5} value={billingZip} onChange={(e) => setBillingZip(e.target.value)} placeholder="00000"/></div></div><p className="input-note">These entries remain in this browser tab; no contact details are submitted.</p></div>
          <div className="checkout-block"><h3 className="serif">Payment preference</h3><RadioGroup value={payment} onValueChange={setPayment} aria-label="Payment preference"><label className="payment-option"><RadioGroupItem value="card"/><span><b>Reference card</b><small>•••• 4242 · no card information required</small></span></label><label className="payment-option"><RadioGroupItem value="invoice"/><span><b>Private client invoice</b><small>No invoice is issued</small></span></label></RadioGroup></div>
          <label className="confirm-row"><Checkbox checked={checkoutAccepted} onCheckedChange={(value) => setCheckoutAccepted(Boolean(value))}/><span>I understand that this checkout creates no trust or transfer of assets or liabilities, takes no payment, and does not restrict access.</span></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="panel-actions"><button className="btn btn-outline" onClick={() => next(mode === "gift" ? 0 : 2)}>Back</button><button className="btn btn-dark" onClick={finish}>Complete checkout</button></div>
        </section>}

        {step === 4 && receipt && <section className="panel confirmation" aria-labelledby="complete-heading"><span className="eyebrow">Client reference · {receipt.number}</span><h2 id="complete-heading" className="serif panel-title">{mode === "gift" ? "An extraordinary gift of nothing." : "For one day, it is somebody else’s problem."}</h2><p className="panel-intro">{mode === "gift" ? "Your gift card is ready to present. The recipient may choose to enroll and prepare their own schedule." : "Your 24-hour term begins with this confirmation and ends at the time shown below."}</p>
          <EmbossedCertificate mode={mode} receipt={receipt} recipient={recipient} signature={signature} billingName={billingName} giftNote={giftNote} assets={assets} estimated={estimated} noLicense={noLicense}/>
          {mode === "self" && <div className="completed-instrument"><h3 className="serif">Your signed instrument</h3><p className="input-note">A copy of the schedule and signature you reviewed. This remains a nonbinding mock document.</p><TrustInstrument assets={assets} noLicense={noLicense} signature={signature} receipt={receipt}/></div>}
          {(mode === "gift" || companion) && <div className="invitation-actions"><p>{mode === "gift" ? "Share the invitation with the recipient. They make their own choices and sign only for themselves." : "Share this separate invitation with " + companionName + ". No one else’s assets are included in your instrument."}</p><button className="btn btn-outline" onClick={copyInvite}>{copied ? "Invitation copied" : "Copy invitation text"}</button></div>}
          <div className="receipt-box"><div><span>Reference</span><b>{receipt.number}</b></div><div><span>Reference total</span><b>{currency(total)}</b></div><div><span>Amount charged</span><b>$0</b></div><div><span>Payment method</span><b>{payment === "card" ? "Reference card" : "Private client invoice"}</b></div></div>
          <p className="input-note">No purchase or asset transfer occurred. Your entries disappear when you leave or reload the tab.</p>
          <div className="panel-actions"><a className="btn btn-dark" href={certificateDownload} download={"GiveAwayMyWealth-" + receipt.number + ".svg"}>Download certificate</a><button className="btn btn-outline" onClick={() => window.print()}>Print / save PDF</button><Link href="/" className="btn btn-outline">Return to the estate</Link></div>
        </section>}
      </div>
      <aside className="summary" aria-label="Order summary"><span className="eyebrow">Your selection</span><h2 className="serif">Twenty-four hours,<br/>beautifully arranged.</h2><div className="summary-line"><span>{mode === "gift" ? "Wealth Holiday gift" : "Wealth Holiday"}</span><b>$249</b></div>{noLicense && <div className="summary-line"><span>Nothing Licensed Back</span><b>$99</b></div>}{mode === "self" && companion && <div className="summary-line"><span>Companion Release</span><b>$149</b></div>}<div className="summary-total"><span>Reference total</span><b>{currency(total)}</b></div><p>Reference prices. Actual amount charged: <strong>$0</strong>. All information stays in this browser tab.</p><Link href="/arrangement">Read the arrangement</Link></aside>
    </div>
  </main>;
}
