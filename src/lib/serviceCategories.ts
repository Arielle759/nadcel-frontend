// Catégories proposées aux gérants pour classer leurs services. La saisie reste
// libre (« Autre catégorie ») : un salon n'est pas obligé d'utiliser cette liste.
// Chaque catégorie a une photo par défaut, utilisée tant que le salon n'a pas
// ajouté sa propre photo au service.
export interface CategoryGroup {
  label: string;
  categories: { name: string; image: string }[];
}

const img = (file: string) => `/images/services/${file}`;

export const SERVICE_CATEGORY_GROUPS: CategoryGroup[] = [
  {
    label: "Coiffure",
    categories: [
      { name: "Coupes et coiffage", image: img("coiffure.jpg") },
      { name: "Tresses et coiffures africaines", image: img("coiffure.jpg") },
      { name: "Soins capillaires", image: img("soin.jpg") },
      { name: "Coloration et techniques chimiques", image: img("coloration.jpg") },
      { name: "Extensions et perruques", image: img("coiffure.jpg") },
      { name: "Coiffure masculine et barbier", image: img("coupe-homme.jpg") },
      { name: "Cheveux naturels et texturés", image: img("coiffure.jpg") },
      { name: "Coiffures pour événements", image: img("coiffure.jpg") },
    ],
  },
  {
    label: "Spa et bien-être",
    categories: [
      { name: "Massages et relaxation", image: img("massage.jpg") },
      { name: "Soins du visage", image: img("soin.jpg") },
      { name: "Soins du corps", image: img("soin.jpg") },
      { name: "Hammam, sauna et bains", image: img("massage.jpg") },
      { name: "Beauté des mains et des pieds", image: img("manicure.jpg") },
      { name: "Épilation et beauté du regard", image: img("epilation.jpg") },
      { name: "Soins de bien-être", image: img("massage.jpg") },
    ],
  },
  {
    label: "Autres",
    categories: [{ name: "Maquillage", image: "" }],
  },
];

export const SERVICE_CATEGORIES = SERVICE_CATEGORY_GROUPS.flatMap((g) => g.categories.map((c) => c.name));
