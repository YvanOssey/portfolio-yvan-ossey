import { Fragment } from "react";

/** « 1er », « 2er »… : le suffixe passe en exposant (le mot entier doit être un nombre suivi de « er ») */
const ORDINAL = /\b(\d+)er\b/;

/**
 * Texte enrichi minimal pour le contenu modifiable : **gras**, et « 1er » mis en exposant.
 * Aucun HTML n'est interprété : le texte de l'admin ne peut pas injecter de balise.
 */
export function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*)/).map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) return <b key={i}>{part.slice(2, -2)}</b>;
        return (
          <Fragment key={i}>
            {part.split(ORDINAL).map((p, j) => (j % 2 ? <Fragment key={j}>{p}<sup>er</sup></Fragment> : p))}
          </Fragment>
        );
      })}
    </>
  );
}
