export const products = [
  //MODELO DE PRODUTO PARA REFERÊNCIA
  //MODELO DE PRODUTO PARA REFERÊNCIA
  //MODELO DE PRODUTO PARA REFERÊNCIA
  // {
  //   id: "id-unico-em-texto", // usado para URL e identificação, sem espaços ou caracteres especiais
  //   name: "Nome do Produto",
  //   price: 1500, // preço em número, sem formatação (ex: 1500 para $1,500)
  //   category: "living", // categoria (living, bedroom, etc)
  //   thumbnail: "url-da-imagem-miniatura",
  //   images: ["url1", "url2"], // array de imagens
  //   description: "Descrição do produto",
  //   materials: [{ color: "#hex", name: "Cor" }],
  //   dimensions: {
  //     largura: '20"',
  //     profundidade: '22"',
  //     altura: '34"',
  //   },
  //   care: "Instruções de cuidado",
  //   shipping: "Informações de entrega",
  //   modelPath: "nome_do_movel", // ← mesmo nome da pasta
  // },
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
];

export function getProductById(id) {
  return products.find((p) => p.id === id);
}

export function getProductsByCategory(category) {
  return products.filter((p) => p.category === category);
}
