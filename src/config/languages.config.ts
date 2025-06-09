import en from "@/assets/flags/en.svg";
import it from "@/assets/flags/it.svg";
import fr from "@/assets/flags/fr.svg";
import de from "@/assets/flags/de.svg";
import es from "@/assets/flags/es.svg";
import pt from "@/assets/flags/pt.svg";
import ru from "@/assets/flags/ru.svg";
import pl from "@/assets/flags/pl.svg";
import nl from "@/assets/flags/nl.svg";
import tr from "@/assets/flags/tr.svg";
import ro from "@/assets/flags/ro.svg";
import se from "@/assets/flags/se.svg";
import gr from "@/assets/flags/gr.svg";
import hu from "@/assets/flags/hu.svg";
import cz from "@/assets/flags/cz.svg";

export enum LANGUAGE {
    en = 'en', // English
    de = 'de', // German
    fr = 'fr', // French
    it = 'it', // Italian
    es = 'es', // Spanish
    pt = 'pt', // Portuguese
    ru = 'ru', // Russian
    pl = 'pl', // Polish
    nl = 'nl', // Dutch
    tr = 'tr', // Turkish
    ro = 'ro', // Romanian
    sv = 'sv', // Swedish
    gr = 'gr', // Greek
    hu = 'hu', // Hungarian
    cz = 'cz', // Czech
}

export const LANGUAGE_LABELS: Record<LANGUAGE, string> = {
    [LANGUAGE.en]: 'English',
    [LANGUAGE.de]: 'German',
    [LANGUAGE.fr]: 'French',
    [LANGUAGE.it]: 'Italian',
    [LANGUAGE.es]: 'Spanish',
    [LANGUAGE.pt]: 'Portuguese',
    [LANGUAGE.ru]: 'Russian',
    [LANGUAGE.pl]: 'Polish',
    [LANGUAGE.nl]: 'Dutch',
    [LANGUAGE.tr]: 'Turkish',
    [LANGUAGE.ro]: 'Romanian',
    [LANGUAGE.sv]: 'Swedish',
    [LANGUAGE.gr]: 'Greek',
    [LANGUAGE.hu]: 'Hungarian',
    [LANGUAGE.cz]: 'Czech',
};

export const LANGUAGE_FLAGS: Record<LANGUAGE, string> = {
    [LANGUAGE.en]: en,
    [LANGUAGE.it]: it,
    [LANGUAGE.fr]: fr,
    [LANGUAGE.de]: de,
    [LANGUAGE.es]: es,
    [LANGUAGE.pt]: pt,
    [LANGUAGE.ru]: ru,
    [LANGUAGE.pl]: pl,
    [LANGUAGE.nl]: nl,
    [LANGUAGE.tr]: tr,
    [LANGUAGE.ro]: ro,
    [LANGUAGE.sv]: se,
    [LANGUAGE.gr]: gr,
    [LANGUAGE.hu]: hu,
    [LANGUAGE.cz]: cz,
};
