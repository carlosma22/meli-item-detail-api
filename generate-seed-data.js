// Script para generar 210 items mock para el seed
const fs = require('fs');

const categories = [
  { id: 'MLA1652', name: 'Notebooks' },
  { id: 'MLA1055', name: 'Celulares' },
  { id: 'MLA1002', name: 'Televisores' },
  { id: 'MLA1144', name: 'Consolas' },
  { id: 'MLA1000', name: 'Electrónica' },
  { id: 'MLA1574', name: 'Hogar' },
  { id: 'MLA1430', name: 'Ropa' },
  { id: 'MLA1132', name: 'Deportes' },
];

const brands = ['Samsung', 'Apple', 'HP', 'Dell', 'LG', 'Sony', 'Xiaomi', 'Motorola', 'Lenovo', 'Asus'];
const conditions = ['new', 'used'];
const sellers = [
  { id: 123456789, nickname: 'TECHSTORE_OFICIAL', permalink: 'https://www.mercadolibre.com.ar/perfil/TECHSTORE' },
  { id: 234567890, nickname: 'SAMSUNG_OFICIAL', permalink: 'https://www.mercadolibre.com.ar/perfil/SAMSUNG' },
  { id: 345678901, nickname: 'ELECTROHOGAR_AR', permalink: 'https://www.mercadolibre.com.ar/perfil/ELECTROHOGAR' },
  { id: 456789012, nickname: 'APPLE_STORE', permalink: 'https://www.mercadolibre.com.ar/perfil/APPLE' },
  { id: 567890123, nickname: 'GAMING_ZONE', permalink: 'https://www.mercadolibre.com.ar/perfil/GAMING' },
];

const products = [
  'Notebook', 'Celular', 'Smart TV', 'Tablet', 'Auriculares', 'Mouse', 'Teclado', 
  'Monitor', 'Impresora', 'Cámara', 'Consola', 'Smartwatch', 'Parlante', 'Micrófono'
];

const items = [];

for (let i = 0; i < 210; i++) {
  const baseId = 1100000000;
  const id = `MLA${baseId + (i * 1000)}`;
  
  const brand = brands[Math.floor(Math.random() * brands.length)];
  const product = products[Math.floor(Math.random() * products.length)];
  const category = categories[Math.floor(Math.random() * categories.length)];
  const seller = sellers[Math.floor(Math.random() * sellers.length)];
  const condition = conditions[Math.floor(Math.random() * conditions.length)];
  
  const price = Math.floor(Math.random() * 1000000) + 10000;
  const quantity = Math.floor(Math.random() * 50) + 1;
  
  const item = {
    id: id,
    title: `${brand} ${product} ${Math.floor(Math.random() * 100) + 1}GB`,
    price: price,
    currencyId: 'ARS',
    availableQuantity: quantity,
    condition: condition,
    thumbnail: `https://http2.mlstatic.com/D_NQ_NP_2X_${Math.floor(Math.random() * 999999)}-MLA.webp`,
    pictures: [
      `https://http2.mlstatic.com/D_NQ_NP_2X_${Math.floor(Math.random() * 999999)}-MLA.webp`,
      `https://http2.mlstatic.com/D_NQ_NP_2X_${Math.floor(Math.random() * 999999)}-MLA.webp`
    ],
    seller: seller,
    attributes: [
      { id: 'BRAND', name: 'Marca', valueName: brand },
      { id: 'MODEL', name: 'Modelo', valueName: `${product}-${i}` },
      { id: 'CONDITION', name: 'Condición', valueName: condition === 'new' ? 'Nuevo' : 'Usado' }
    ],
    categoryId: category.id,
    permalink: `https://www.mercadolibre.com.ar/${product.toLowerCase()}-${id.toLowerCase()}`,
    description: `${brand} ${product} de alta calidad. ${condition === 'new' ? 'Producto nuevo en caja sellada.' : 'Producto usado en excelente estado.'} Incluye garantía y envío gratis a todo el país.`
  };
  
  items.push(item);
}

// Guardar en archivo JSON
const outputPath = './src/infrastructure/data/items-seed.json';
fs.writeFileSync(outputPath, JSON.stringify(items, null, 2));

console.log(`✅ Generated ${items.length} items`);
console.log(`📁 Saved to: ${outputPath}`);
console.log(`📊 File size: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`);
