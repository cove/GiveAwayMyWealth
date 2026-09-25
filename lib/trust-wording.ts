export function trustClauses(noLicense: boolean) {
  return [
    { title: "Declaration", text: "The participant assigns the interests described in Schedule A to GiveAwayMyWealth as trustee for the term stated below." },
    { title: "Term", text: "The trusteeship begins upon checkout and expires 24 hours later, whereupon every scheduled interest returns to the participant." },
    { title: "Stewardship", text: "Subject to clause 6, the trustee assumes responsibility for the listed interests’ liability exposure, maintenance and preservation of value during the term." },
    { title: "Use", text: noLicense ? "No listed interest is licensed back during the term. Preexisting automatic payments may continue." : "The trustee immediately licenses every listed interest back to the participant for normal use throughout the term." },
    { title: "Others", text: "This document includes only the participant’s entries. Any companion must independently choose to participate and sign their own instrument." },
    { title: "Legal effect", text: "This document is nonbinding. No title, money, possession, access, liability or duty changes hands." },
  ];
}
