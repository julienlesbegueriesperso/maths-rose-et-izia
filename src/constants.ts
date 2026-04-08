import type { Profile, Module, ProfileKey, ModuleKey } from "./types";

export const TOTAL_QUESTIONS = 8;

export const LEGO_COLORS = [
  "#D01012",
  "#00852B",
  "#0057A8",
  "#FE8A18",
  "#F5CD2F",
  "#F785B1",
  "#1A9E8F",
  "#8B5E3C",
];

export const PROFILES: Record<ProfileKey, Profile> = {
  lea: {
    name: "Izia",
    age: 6,
    color: "var(--pink)",
    colorHex: "#F785B1",
    shadowHex: "#D06090",
    icon: "fa-wand-magic-sparkles",
  },
  emma: {
    name: "Rose",
    age: 8,
    color: "var(--teal)",
    colorHex: "#1A9E8F",
    shadowHex: "#127A6E",
    icon: "fa-bolt",
  },
};

export const MODULES: Record<ModuleKey, Module> = {
  addition: {
    label: "Additions",
    icon: "fa-plus",
    color: "var(--red)",
    btnClass: "btn-red",
    desc: "Compter les briques",
  },
  multiplication: {
    label: "Multiplications",
    icon: "fa-xmark",
    color: "var(--green)",
    btnClass: "btn-green",
    desc: "Des rangées de briques",
  },
  fraction: {
    label: "Fractions",
    icon: "fa-chart-pie",
    color: "var(--orange)",
    btnClass: "btn-orange",
    desc: "Des parts de plaque",
  },
  division: {
    label: "Divisions",
    icon: "fa-arrows-split-up-and-left",
    color: "var(--blue)",
    btnClass: "btn-blue",
    desc: "Partager les briques",
  },
};
