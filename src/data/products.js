export const products = [
  {
    id: "sofa-verde",
    name: "Elysian Green Velvet Sofa",
    price: 3450,
    category: "living",
    thumbnail:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=500&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&h=1000&fit=crop",
    ],
    description:
      "Sofá de veludo verde esmeralda, feito com velvet orgânico de alta qualidade.",
    materials: [
      { color: "#1b3022", name: "Verde" },
      { color: "#f5f5dc", name: "Creme" },
      { color: "#1a237e", name: "Azul" },
    ],
    dimensions: {
      largura: '92"',
      profundidade: '38"',
      altura: '31"',
      altura_assento: '18"',
    },
    care: "Aspire regularmente com escova macia.",
    shipping: "Entrega white glove inclusa.",
    modelPath: "sofa/sofa_03",
  },
  {
    id: "cadeira-moderna",
    name: "Modern Side Chair",
    price: 450,
    category: "living",
    thumbnail:
      "https://images.unsplash.com/photo-1503602642458-232111445657?w=400&h=500&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1503602642458-232111445657?w=800&h=1000&fit=crop",
    ],
    description: "Cadeira minimalista que combina simplicidade escandinava.",
    materials: [
      { color: "#c4a35a", name: "Carvalho" },
      { color: "#5d4037", name: "Noz" },
    ],
    dimensions: { largura: '20"', profundidade: '22"', altura: '34"' },
    care: "Limpe com pano úmido.",
    shipping: "Entrega em 2-4 semanas.",
    modelPath: "side_chair",
  },
  {
    id: "cama-agape",
    name: "Agape Bed",
    price: 2450,
    category: "bedroom",
    thumbnail:
      "https://www.arqhys.com/wp-content/fotos/2014/03/decorar-camas.jpg",
    images: [
      "https://blog.jamar.com/wp-content/uploads/cama-marbella-01.webp",
      "https://blog.colchoneseldorado.com/wp-content/uploads/2025/04/Camas-Modernas_1500x898.jpg",
    ],
    description: "Cama de madeira com colchão de alta qualidade.",
    materials: [
      { color: "#1b3022", name: "Verde" },
      { color: "#f5f5dc", name: "Creme" },
      { color: "#1a237e", name: "Azul" },
    ],
    dimensions: {
      largura: '92"',
      profundidade: '38"',
      altura: '31"',
      altura_assento: '18"',
    },
    care: "Aspire regularmente com escova macia.",
    shipping: "Entrega white glove inclusa.",
    modelPath: "bed_agape",
  },
  {
    id: "luminaria-chao",
    name: "Aura Floor Lamp",
    price: 280,
    category: "living",
    thumbnail:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=500&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&h=1000&fit=crop",
    ],
    description: "Luminária de chão moderna com iluminação LED dimerizável e acabamento fosco.",
    materials: [
      { color: "#000000", name: "Preto Fosco" },
      { color: "#d4af37", name: "Latão" },
    ],
    dimensions: {
      largura: '12"',
      profundidade: '12"',
      altura: '65"',
    },
    care: "Limpe com pano seco. Evite produtos químicos.",
    shipping: "Entrega em 1-2 semanas.",
    modelPath: "lamp",
  },
  {
    id: "estante-metal",
    name: "Industrial Metal Shelf",
    price: 890,
    category: "living",
    thumbnail:
      "https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?w=400&h=500&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?w=800&h=1000&fit=crop",
    ],
    description: "Estante de metal estilo industrial com prateleiras de madeira maciça.",
    materials: [
      { color: "#2c2c2c", name: "Aço Carbono" },
      { color: "#8b5a2b", name: "Madeira Rústica" },
    ],
    dimensions: {
      largura: '48"',
      profundidade: '16"',
      altura: '72"',
    },
    care: "Limpe a estrutura de metal com pano úmido e a madeira com lustra-móveis.",
    shipping: "Entrega agendada. Montagem necessária.",
    modelPath: "metal_shelf",
  },
  {
    id: "escrivaninha-madeira",
    name: "Solid Oak Writing Desk",
    price: 1250,
    category: "office",
    thumbnail:
      "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&h=500&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&h=1000&fit=crop",
    ],
    description: "Escrivaninha ergonômica e espaçosa, ideal para home office, feita em carvalho maciço.",
    materials: [
      { color: "#c4a35a", name: "Carvalho Claro" },
    ],
    dimensions: {
      largura: '55"',
      profundidade: '28"',
      altura: '30"',
    },
    care: "Hidrate a madeira a cada 6 meses com óleo apropriado.",
    shipping: "Entrega white glove inclusa.",
    modelPath: "wooden_desk",
  },
  {
    id: "conjunto-mesa-jantar",
    name: "Classic Dining Table Set",
    price: 4200,
    category: "dining",
    thumbnail:
      "https://images.unsplash.com/photo-1604578762246-41134e37f9cc?w=400&h=500&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1604578762246-41134e37f9cc?w=800&h=1000&fit=crop",
    ],
    description: "Conjunto de mesa de jantar em madeira maciça com 6 cadeiras estofadas.",
    materials: [
      { color: "#5d4037", name: "Nogueira" },
      { color: "#e0e0e0", name: "Tecido Cinza Claro" },
    ],
    dimensions: {
      largura: '78"',
      profundidade: '39"',
      altura: '30"',
    },
    care: "Limpe respingos imediatamente. Use porta-copos.",
    shipping: "Entrega com montagem inclusa no local.",
    modelPath: "wooden_table_set",
  }
];

export function getProductById(id) {
  return products.find((p) => p.id === id);
}

export function getProductsByCategory(category) {
  return products.filter((p) => p.category === category);
}