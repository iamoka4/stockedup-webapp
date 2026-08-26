export interface AreaCoordinate {
  label: string;
  latitude: number;
  longitude: number;
}

export interface AreaGroup {
  group: string;
  areas: AreaCoordinate[];
}

/**
 * Mirrors CITY_COORDS in the mobile checkout screen exactly — same names,
 * same coordinates. Keep these in sync: a customer picking "Ifite" here
 * should resolve to the same delivery coordinate as picking "Ifite" on
 * mobile. If mobile's list changes, update both.
 */
export const AREA_GROUPS: AreaGroup[] = [
  {
    group: "Awka & environs",
    areas: [
      { label: "Awka", latitude: 6.2104, longitude: 7.0676 },
      { label: "Ifite", latitude: 6.218, longitude: 7.073 },
      { label: "Okpuno", latitude: 6.2309, longitude: 7.074 },
      { label: "Amawbia", latitude: 6.195, longitude: 7.062 },
      { label: "Nibo", latitude: 6.17, longitude: 7.05 },
      { label: "Nise", latitude: 6.16, longitude: 7.04 },
      { label: "Mbaukwu", latitude: 6.1833, longitude: 7.05 },
      { label: "Umuawulu", latitude: 6.165, longitude: 7.045 },
      { label: "Arthur Eze Avenue", latitude: 6.215, longitude: 7.071 },
      { label: "Amansea", latitude: 6.26, longitude: 7.09 },
      { label: "Unizik junction", latitude: 6.228, longitude: 7.072 },
      { label: "Unizik junction/tempsite", latitude: 6.228, longitude: 7.072 },
      { label: "Tempsite", latitude: 6.228, longitude: 7.072 },
      { label: "Unizik school gate", latitude: 6.22, longitude: 7.07 },
      { label: "Unizik school gate (express)", latitude: 6.22, longitude: 7.07 },
      { label: "Mgbakwu", latitude: 6.25, longitude: 7.085 },
      { label: "Isuaniocha", latitude: 6.245, longitude: 7.08 },
      { label: "Amenyi", latitude: 6.21, longitude: 7.068 },
      { label: "Ichide", latitude: 6.205, longitude: 7.065 },
      { label: "Nodu", latitude: 6.2309, longitude: 7.074 },
    ],
  },
  {
    group: "Nnewi & environs",
    areas: [
      { label: "Nnewi", latitude: 6.0148, longitude: 6.9979 },
      { label: "Otolo", latitude: 6.02, longitude: 6.995 },
      { label: "Uruagu", latitude: 6.01, longitude: 6.99 },
      { label: "Umudim", latitude: 6.005, longitude: 6.985 },
      { label: "Nnewichi", latitude: 6.025, longitude: 7.0 },
    ],
  },
  {
    group: "Onitsha & environs",
    areas: [
      { label: "Onitsha", latitude: 6.1425, longitude: 6.7873 },
      { label: "Fegge", latitude: 6.135, longitude: 6.78 },
      { label: "Woliwo", latitude: 6.14, longitude: 6.782 },
      { label: "Odoakpu", latitude: 6.15, longitude: 6.79 },
      { label: "Awada", latitude: 6.16, longitude: 6.795 },
      { label: "Inland Town", latitude: 6.145, longitude: 6.787 },
      { label: "GRA", latitude: 6.155, longitude: 6.792 },
      { label: "Ogbunike", latitude: 6.145, longitude: 6.982 },
      { label: "Nkpor", latitude: 6.142, longitude: 6.798 },
      { label: "Obosi", latitude: 6.16, longitude: 6.81 },
    ],
  },
  {
    group: "Oko / Aguata axis",
    areas: [
      { label: "Oko", latitude: 6.0667, longitude: 7.0667 },
      { label: "Ezioko", latitude: 6.07, longitude: 7.07 },
      { label: "Eziabor", latitude: 6.06, longitude: 7.06 },
      { label: "Okeani", latitude: 6.065, longitude: 7.065 },
      { label: "Ihengwu", latitude: 6.055, longitude: 7.055 },
      { label: "Amaokpala", latitude: 6.08, longitude: 7.075 },
    ],
  },
  {
    group: "Ekwulobia & environs",
    areas: [
      { label: "Ekwulobia", latitude: 5.9833, longitude: 7.15 },
      { label: "Umuchiana", latitude: 5.98, longitude: 7.145 },
      { label: "Agba", latitude: 5.975, longitude: 7.14 },
      { label: "Ula", latitude: 5.97, longitude: 7.135 },
      { label: "Okpo", latitude: 5.965, longitude: 7.13 },
      { label: "Eziagulu", latitude: 5.99, longitude: 7.155 },
      { label: "Nkpologwu", latitude: 5.995, longitude: 7.16 },
      { label: "Umuchu", latitude: 5.96, longitude: 7.125 },
      { label: "Umunze", latitude: 5.95, longitude: 7.12 },
      { label: "Nanka", latitude: 6.0, longitude: 7.165 },
      { label: "Igboukwu", latitude: 5.945, longitude: 7.115 },
      { label: "Aguluezechukwu", latitude: 5.94, longitude: 7.11 },
      { label: "Ezinifite", latitude: 5.935, longitude: 7.105 },
    ],
  },
  {
    group: "Other cities",
    areas: [
      { label: "Port Harcourt", latitude: 4.8156, longitude: 7.0498 },
      { label: "Lagos", latitude: 6.5244, longitude: 3.3792 },
      { label: "Abuja", latitude: 9.0579, longitude: 7.4951 },
      { label: "Enugu", latitude: 6.4483, longitude: 7.5464 },
      { label: "Benin", latitude: 6.335, longitude: 5.627 },
    ],
  },
];