// Champs de formulaire réutilisables de l'espace admin.
import { useId, type ReactNode } from "react";

interface FieldProps { label: string; hint?: ReactNode; children: (id: string) => ReactNode }

export function Field({ label, hint, children }: FieldProps) {
  const id = useId();
  return (
    <div className="ad-field">
      <label htmlFor={id}>{label}</label>
      {children(id)}
      {hint && <p className="ad-hint">{hint}</p>}
    </div>
  );
}

export function Text({ label, value, onChange, hint, placeholder, required }: {
  label: string; value: string | undefined; onChange: (v: string) => void; hint?: ReactNode; placeholder?: string; required?: boolean;
}) {
  return (
    <Field label={label + (required ? " *" : "")} hint={hint}>
      {(id) => <input id={id} value={value ?? ""} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />}
    </Field>
  );
}

export function Area({ label, value, onChange, hint, rows = 3, required }: {
  label: string; value: string | undefined; onChange: (v: string) => void; hint?: ReactNode; rows?: number; required?: boolean;
}) {
  return (
    <Field label={label + (required ? " *" : "")} hint={hint}>
      {(id) => <textarea id={id} rows={rows} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />}
    </Field>
  );
}

/* Listes saisies une ligne par élément : plus rapide qu'une suite de petits champs */

export const toLines = (list: string[]) => list.join("\n");
export const fromLines = (text: string) => text.split("\n").map((l) => l.trim()).filter(Boolean);

export const toPairs = (list: [string, string][]) => list.map(([k, v]) => `${k} : ${v}`).join("\n");
export function fromPairs(text: string): [string, string][] {
  return fromLines(text).map((line) => {
    const i = line.indexOf(":");
    return i < 0 ? [line, ""] : [line.slice(0, i).trim(), line.slice(i + 1).trim()];
  });
}

export const toCsv = (list: string[]) => list.join(", ");
export const fromCsv = (text: string) => text.split(",").map((s) => s.trim()).filter(Boolean);

/** Garde la saisie brute tant qu'on tape (sinon « React, » perdrait sa virgule) */
export function ListArea({ label, value, onChange, hint, rows = 4, mode }: {
  label: string; value: string[] | [string, string][]; onChange: (v: never) => void; hint?: ReactNode; rows?: number; mode: "lines" | "pairs" | "csv";
}) {
  const text = mode === "pairs" ? toPairs(value as [string, string][]) : mode === "csv" ? toCsv(value as string[]) : toLines(value as string[]);
  const parse = mode === "pairs" ? fromPairs : mode === "csv" ? fromCsv : fromLines;
  return (
    <Field label={label} hint={hint}>
      {(id) => mode === "csv"
        ? <input id={id} defaultValue={text} key={text} onBlur={(e) => onChange(parse(e.target.value) as never)} />
        : <textarea id={id} rows={rows} defaultValue={text} key={text} onBlur={(e) => onChange(parse(e.target.value) as never)} />}
    </Field>
  );
}
