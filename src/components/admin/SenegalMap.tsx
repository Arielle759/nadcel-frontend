// Carte du Sénégal en points (style « carte pointillée ») avec un repère par
// ville où il y a des salons en ligne. Contour simplifié (longitude, latitude),
// Gambie exclue : suffisant à l'échelle d'une carte de tableau de bord.
const OUTLINE: [number, number][] = [
  [-16.53, 16.06], [-16.3, 16.5], [-15.6, 16.5], [-15.0, 16.6], [-14.4, 16.65], [-13.8, 16.15],
  [-13.4, 16.05], [-12.9, 15.6], [-12.4, 14.95], [-12.2, 14.6], [-12.1, 14.3], [-11.9, 13.9],
  [-11.6, 13.4], [-11.4, 12.9], [-11.5, 12.4], [-12.2, 12.4], [-13.0, 12.47], [-13.7, 12.6],
  [-14.4, 12.65], [-15.2, 12.68], [-16.0, 12.6], [-16.7, 12.35], [-16.8, 12.5], [-16.75, 13.0],
  [-16.7, 13.15], [-15.8, 13.15], [-15.0, 13.25], [-14.3, 13.25], [-13.8, 13.4], [-13.8, 13.6],
  [-14.3, 13.55], [-15.0, 13.6], [-15.8, 13.6], [-16.55, 13.6], [-16.75, 13.85], [-16.95, 14.2],
  [-17.2, 14.6], [-17.55, 14.66], [-17.55, 14.82], [-17.1, 14.92], [-16.85, 15.3], [-16.6, 15.8],
];

// Principales villes (clé sans accents, en minuscules).
const CITY_COORDS: Record<string, [number, number]> = {
  // Presqu'île du Cap-Vert : repères placés juste à l'intérieur des terres
  // pour rester sur la carte (la pointe est plus fine que la trame de points).
  dakar: [-17.3, 14.72],
  pikine: [-17.27, 14.76],
  guediawaye: [-17.27, 14.79],
  rufisque: [-17.2, 14.73],
  thies: [-16.93, 14.79],
  mbour: [-16.96, 14.42],
  saly: [-17.0, 14.45],
  "saint-louis": [-16.49, 16.03],
  louga: [-16.22, 15.62],
  touba: [-15.88, 14.85],
  diourbel: [-16.23, 14.65],
  fatick: [-16.41, 14.34],
  kaolack: [-16.07, 14.15],
  ziguinchor: [-16.27, 12.58],
  kolda: [-14.95, 12.89],
  tambacounda: [-13.67, 13.77],
  kedougou: [-12.18, 12.56],
  matam: [-13.25, 15.66],
};

const LON_MIN = -17.6;
const LON_MAX = -11.3;
const LAT_MIN = 12.25;
const LAT_MAX = 16.75;
const W = 300;
const H = Math.round((W * (LAT_MAX - LAT_MIN)) / ((LON_MAX - LON_MIN) * Math.cos((14.5 * Math.PI) / 180)));
const STEP = 0.11;

const x = (lon: number) => ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * W;
const y = (lat: number) => ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * H;

function inside(lon: number, lat: number): boolean {
  let hit = false;
  for (let i = 0, j = OUTLINE.length - 1; i < OUTLINE.length; j = i++) {
    const [xi, yi] = OUTLINE[i];
    const [xj, yj] = OUTLINE[j];
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

// Calculés une seule fois au chargement du module.
const DOTS: [number, number][] = [];
for (let lat = LAT_MAX; lat >= LAT_MIN; lat -= STEP) {
  for (let lon = LON_MIN; lon <= LON_MAX; lon += STEP * 1.03) {
    if (inside(lon, lat)) DOTS.push([x(lon), y(lat)]);
  }
}

export const cityKey = (city: string) =>
  city
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");

export default function SenegalMap({ cities }: { cities: { city: string; count: number }[] }) {
  const max = Math.max(1, ...cities.map((c) => c.count));
  const markers = cities.flatMap((c) => {
    const coords = CITY_COORDS[cityKey(c.city)];
    return coords ? [{ ...c, cx: x(coords[0]), cy: y(coords[1]) }] : [];
  });

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      className="absolute inset-0 h-full w-full"
      role="img"
      aria-label={`Carte du Sénégal : ${cities.map((c) => `${c.city} ${c.count} salon${c.count > 1 ? "s" : ""}`).join(", ")}`}
    >
      {DOTS.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={1.25} className="fill-anthracite/20" />
      ))}
      {markers.map((m) => {
        const r = 4 + (m.count / max) * 3;
        return (
          <g key={m.city}>
            <circle cx={m.cx} cy={m.cy} r={r * 2.4} fill="var(--color-sauge-mid)" opacity={0.22} />
            <ellipse cx={m.cx} cy={m.cy} rx={r} ry={r * 0.72} fill="var(--color-sauge-mid)" />
          </g>
        );
      })}
    </svg>
  );
}
