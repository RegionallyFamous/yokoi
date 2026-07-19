export type TranslationDocument = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: "Manual" | "Guide" | "Reference";
  language: "English";
  sourceLanguage: string;
  sourcePages: number;
  year: number;
  edition: string;
  credits: string;
  fileUrl: string;
  fileSize: string;
  status: "Technical translation" | "Reviewed";
  searchTerms: string[];
};

export const translationCatalog: TranslationDocument[] = [
  {
    id: "wwtm-en",
    title: "Wonder Witch Technical Manual",
    subtitle: "Technical English translation",
    description:
      "A compact translation of the complete 2002 interim manual, covering the WonderWitch memory model, FreyaBIOS services, FreyaOS, filesystems, and the original development ABI.",
    category: "Manual",
    language: "English",
    sourceLanguage: "Japanese",
    sourcePages: 81,
    year: 2002,
    edition: "First edition / interim publication",
    credits: "Original by Atsushi Watanabe; technical translation prepared for Yokoi",
    fileUrl: "/translations/wonder-witch-technical-manual-en.pdf",
    fileSize: "45 KB",
    status: "Technical translation",
    searchTerms: [
      "WonderWitch",
      "WWTM",
      "FreyaBIOS",
      "FreyaOS",
      "Digitalis",
      "SDK",
      "assembly",
    ],
  },
];
