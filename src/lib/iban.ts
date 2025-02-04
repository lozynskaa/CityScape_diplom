export function parseIban(iban: string) {
  if (!iban.startsWith("UA")) {
    throw new Error("IBAN має бути українським (починатися з 'UA')");
  }

  const mfo = iban.slice(4, 10); // МФО з IBAN
  const account = iban.slice(10); // Номер рахунку з IBAN

  return { mfo, account };
}
