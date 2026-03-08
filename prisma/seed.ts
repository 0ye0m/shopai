import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create Categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'electronics' },
      update: {},
      create: {
        name: 'Electronics',
        slug: 'electronics',
        description: 'Gadgets, devices, and tech accessories',
        image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'fashion' },
      update: {},
      create: {
        name: 'Fashion',
        slug: 'fashion',
        description: 'Clothing, shoes, and accessories',
        image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'home-living' },
      update: {},
      create: {
        name: 'Home & Living',
        slug: 'home-living',
        description: 'Furniture, decor, and home essentials',
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'sports-outdoors' },
      update: {},
      create: {
        name: 'Sports & Outdoors',
        slug: 'sports-outdoors',
        description: 'Sports equipment and outdoor gear',
        image: 'https://images.unsplash.com/photo-1461896836934-759a2b8b9c92?w=400',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'beauty-health' },
      update: {},
      create: {
        name: 'Beauty & Health',
        slug: 'beauty-health',
        description: 'Skincare, makeup, and wellness products',
        image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'books-media' },
      update: {},
      create: {
        name: 'Books & Media',
        slug: 'books-media',
        description: 'Books, music, and entertainment',
        image: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'pet-supplies' },
      update: {},
      create: {
        name: 'Pet Supplies',
        slug: 'pet-supplies',
        description: 'Pet food, toys, and accessories',
        image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'grocery' },
      update: {},
      create: {
        name: 'Grocery',
        slug: 'grocery',
        description: 'Fresh food and groceries',
        image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'automotive' },
      update: {},
      create: {
        name: 'Automotive',
        slug: 'automotive',
        description: 'Car accessories and automotive parts',
        image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'toys-games' },
      update: {},
      create: {
        name: 'Toys & Games',
        slug: 'toys-games',
        description: 'Toys, games, and hobbies',
        image: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=400',
      },
    }),
  ]);

  console.log(`✅ Created ${categories.length} categories`);

  // Create Admin User
  const passwordHash = await bcrypt.hash('XOtgMoqMcbEVUY4J', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@shopai.com' },
    update: {},
    create: {
      email: 'admin@shopai.com',
      name: 'Admin User',
      passwordHash,
      role: 'admin',
    },
  });
  console.log(`✅ Created admin user: ${admin.email}`);

  // Create Products
  const productsData = [
    // Electronics
    { name: 'Wireless Bluetooth Headphones', slug: 'wireless-bluetooth-headphones', description: 'Premium wireless headphones with active noise cancellation, 30-hour battery life, and crystal-clear audio.', price: 149.99, comparePrice: 199.99, stock: 50, sku: 'ELEC-001', categoryId: categories[0].id, images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600', 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600'], tags: ['wireless', 'headphones', 'bluetooth', 'audio'], rating: 4.5, reviewCount: 120, isFeatured: true },
    { name: 'Smart Watch Pro', slug: 'smart-watch-pro', description: 'Advanced smartwatch with health monitoring, GPS, and 7-day battery life. Water resistant to 50m.', price: 299.99, comparePrice: 349.99, stock: 30, sku: 'ELEC-002', categoryId: categories[0].id, images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600', 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600'], tags: ['smartwatch', 'fitness', 'health', 'wearable'], rating: 4.7, reviewCount: 85, isFeatured: true },
    { name: '4K Action Camera', slug: '4k-action-camera', description: 'Ultra HD action camera with 60fps recording, waterproof case included. Perfect for adventures.', price: 249.99, comparePrice: 299.99, stock: 40, sku: 'ELEC-003', categoryId: categories[0].id, images: ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600', 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600'], tags: ['camera', '4k', 'action', 'waterproof'], rating: 4.3, reviewCount: 67, isFeatured: false },
    { name: 'Wireless Earbuds Pro', slug: 'wireless-earbuds-pro', description: 'True wireless earbuds with ANC, transparency mode, and premium sound quality. 24h total battery.', price: 179.99, comparePrice: 229.99, stock: 100, sku: 'ELEC-004', categoryId: categories[0].id, images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600', 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=600'], tags: ['earbuds', 'wireless', 'anc', 'audio'], rating: 4.6, reviewCount: 203, isFeatured: true },
    { name: 'Portable Power Bank 20000mAh', slug: 'portable-power-bank-20000mah', description: 'High capacity power bank with fast charging. Charge 3 devices simultaneously.', price: 49.99, comparePrice: 69.99, stock: 200, sku: 'ELEC-005', categoryId: categories[0].id, images: ['https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600'], tags: ['power-bank', 'portable', 'fast-charge', 'accessory'], rating: 4.4, reviewCount: 156, isFeatured: false },

    // Fashion
    { name: 'Classic Leather Jacket', slug: 'classic-leather-jacket', description: 'Premium genuine leather jacket with quilted lining. Timeless style for any occasion.', price: 299.99, comparePrice: 399.99, stock: 25, sku: 'FASH-001', categoryId: categories[1].id, images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600', 'https://images.unsplash.com/photo-1520975954732-35dd22299614?w=600'], tags: ['leather', 'jacket', 'outerwear', 'premium'], rating: 4.8, reviewCount: 89, isFeatured: true },
    { name: 'Running Shoes Ultra', slug: 'running-shoes-ultra', description: 'Lightweight running shoes with responsive cushioning. Perfect for marathon training.', price: 129.99, comparePrice: 159.99, stock: 75, sku: 'FASH-002', categoryId: categories[1].id, images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600', 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=600'], tags: ['running', 'shoes', 'sports', 'athletic'], rating: 4.6, reviewCount: 234, isFeatured: true },
    { name: 'Designer Sunglasses', slug: 'designer-sunglasses', description: 'UV400 protection with polarized lenses. Includes premium case and cleaning cloth.', price: 159.99, comparePrice: 199.99, stock: 60, sku: 'FASH-003', categoryId: categories[1].id, images: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600', 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600'], tags: ['sunglasses', 'designer', 'uv400', 'accessory'], rating: 4.4, reviewCount: 78, isFeatured: false },
    { name: 'Casual Cotton T-Shirt Pack', slug: 'casual-cotton-tshirt-pack', description: 'Pack of 3 premium cotton t-shirts in classic colors. Soft, breathable, and durable.', price: 39.99, comparePrice: 49.99, stock: 150, sku: 'FASH-004', categoryId: categories[1].id, images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600'], tags: ['tshirt', 'cotton', 'casual', 'pack'], rating: 4.3, reviewCount: 312, isFeatured: false },
    { name: 'Slim Fit Denim Jeans', slug: 'slim-fit-denim-jeans', description: 'Classic slim fit jeans with stretch comfort. Perfect fit for everyday wear.', price: 79.99, comparePrice: 99.99, stock: 100, sku: 'FASH-005', categoryId: categories[1].id, images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=600', 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600'], tags: ['jeans', 'denim', 'slim-fit', 'casual'], rating: 4.5, reviewCount: 167, isFeatured: false },

    // Home & Living
    { name: 'Smart LED Light Bulb Set', slug: 'smart-led-light-bulb-set', description: 'Pack of 4 smart LED bulbs with 16 million colors. Voice control compatible.', price: 49.99, comparePrice: 69.99, stock: 300, sku: 'HOME-001', categoryId: categories[2].id, images: ['https://images.unsplash.com/photo-1558171813-4c088753af8f?w=600'], tags: ['smart', 'led', 'lighting', 'voice-control'], rating: 4.5, reviewCount: 89, isFeatured: false },
    { name: 'Memory Foam Pillow Set', slug: 'memory-foam-pillow-set', description: 'Set of 2 ergonomic memory foam pillows. Hypoallergenic and machine washable.', price: 59.99, comparePrice: 79.99, stock: 150, sku: 'HOME-002', categoryId: categories[2].id, images: ['https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600'], tags: ['pillow', 'memory-foam', 'bedding', 'comfort'], rating: 4.7, reviewCount: 145, isFeatured: true },
    { name: 'Stainless Steel Cookware Set', slug: 'stainless-steel-cookware-set', description: '10-piece professional cookware set with non-stick coating. Dishwasher safe.', price: 199.99, comparePrice: 279.99, stock: 45, sku: 'HOME-003', categoryId: categories[2].id, images: ['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600', 'https://images.unsplash.com/photo-1584990347449-a2d4c2c044a8?w=600'], tags: ['cookware', 'kitchen', 'stainless-steel', 'professional'], rating: 4.6, reviewCount: 78, isFeatured: false },
    { name: 'Cozy Throw Blanket', slug: 'cozy-throw-blanket', description: 'Ultra-soft microfiber throw blanket. Perfect for couch or bed. Machine washable.', price: 34.99, comparePrice: 44.99, stock: 200, sku: 'HOME-004', categoryId: categories[2].id, images: ['https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?w=600'], tags: ['blanket', 'throw', 'cozy', 'bedding'], rating: 4.8, reviewCount: 234, isFeatured: false },

    // Sports & Outdoors
    { name: 'Yoga Mat Premium', slug: 'yoga-mat-premium', description: 'Extra thick eco-friendly yoga mat with alignment lines. Non-slip surface.', price: 39.99, comparePrice: 54.99, stock: 250, sku: 'SPRT-001', categoryId: categories[3].id, images: ['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600'], tags: ['yoga', 'mat', 'fitness', 'eco-friendly'], rating: 4.6, reviewCount: 189, isFeatured: false },
    { name: 'Camping Tent 4-Person', slug: 'camping-tent-4-person', description: 'Waterproof 4-person tent with easy setup. Perfect for family camping trips.', price: 149.99, comparePrice: 199.99, stock: 35, sku: 'SPRT-002', categoryId: categories[3].id, images: ['https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600', 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=600'], tags: ['tent', 'camping', 'outdoor', 'waterproof'], rating: 4.5, reviewCount: 67, isFeatured: false },
    { name: 'Adjustable Dumbbell Set', slug: 'adjustable-dumbbell-set', description: 'Space-saving adjustable dumbbells from 5-52.5 lbs. Quick change weight system.', price: 299.99, comparePrice: 399.99, stock: 20, sku: 'SPRT-003', categoryId: categories[3].id, images: ['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600', 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600'], tags: ['dumbbell', 'fitness', 'weights', 'adjustable'], rating: 4.7, reviewCount: 45, isFeatured: true },
    { name: 'Insulated Water Bottle', slug: 'insulated-water-bottle', description: '32oz stainless steel water bottle. Keeps drinks cold 24h or hot 12h.', price: 34.99, comparePrice: 44.99, stock: 500, sku: 'SPRT-004', categoryId: categories[3].id, images: ['https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600'], tags: ['water-bottle', 'insulated', 'stainless-steel', 'eco-friendly'], rating: 4.8, reviewCount: 456, isFeatured: true },

    // Beauty & Health
    { name: 'Vitamin C Serum', slug: 'vitamin-c-serum', description: 'Brightening vitamin C serum with hyaluronic acid. Anti-aging formula.', price: 29.99, comparePrice: 39.99, stock: 300, sku: 'BEAU-001', categoryId: categories[4].id, images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600'], tags: ['skincare', 'serum', 'vitamin-c', 'anti-aging'], rating: 4.6, reviewCount: 267, isFeatured: false },
    { name: 'Electric Toothbrush Pro', slug: 'electric-toothbrush-pro', description: 'Sonic electric toothbrush with 5 cleaning modes. Includes 4 brush heads.', price: 89.99, comparePrice: 119.99, stock: 150, sku: 'BEAU-002', categoryId: categories[4].id, images: ['https://images.unsplash.com/photo-1559467010-c8c3f8b5ad6a?w=600'], tags: ['toothbrush', 'electric', 'dental', 'sonic'], rating: 4.7, reviewCount: 178, isFeatured: true },
    { name: 'Organic Face Moisturizer', slug: 'organic-face-moisturizer', description: 'Lightweight daily moisturizer with SPF 30. Organic ingredients, all skin types.', price: 34.99, comparePrice: 44.99, stock: 200, sku: 'BEAU-003', categoryId: categories[4].id, images: ['https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600'], tags: ['moisturizer', 'organic', 'skincare', 'spf'], rating: 4.5, reviewCount: 134, isFeatured: false },
    { name: 'Essential Oils Set', slug: 'essential-oils-set', description: 'Set of 6 therapeutic grade essential oils. Lavender, peppermint, eucalyptus and more.', price: 24.99, comparePrice: 34.99, stock: 180, sku: 'BEAU-004', categoryId: categories[4].id, images: ['https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600'], tags: ['essential-oils', 'aromatherapy', 'natural', 'wellness'], rating: 4.4, reviewCount: 98, isFeatured: false },

    // Books & Media
    { name: 'Bestseller Book Collection', slug: 'bestseller-book-collection', description: 'Set of 5 current bestselling fiction novels. Hardcover editions.', price: 59.99, comparePrice: 79.99, stock: 100, sku: 'BOOK-001', categoryId: categories[5].id, images: ['https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600'], tags: ['books', 'bestseller', 'fiction', 'hardcover'], rating: 4.6, reviewCount: 67, isFeatured: false },
    { name: 'Wireless Bluetooth Speaker', slug: 'wireless-bluetooth-speaker', description: 'Portable speaker with 360° sound and 12-hour battery. Waterproof design.', price: 79.99, comparePrice: 99.99, stock: 180, sku: 'BOOK-002', categoryId: categories[5].id, images: ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600'], tags: ['speaker', 'bluetooth', 'portable', 'waterproof'], rating: 4.5, reviewCount: 189, isFeatured: false },
    { name: 'Vinyl Record Player', slug: 'vinyl-record-player', description: 'Retro style vinyl turntable with built-in speakers. Bluetooth output included.', price: 149.99, comparePrice: 189.99, stock: 50, sku: 'BOOK-003', categoryId: categories[5].id, images: ['https://images.unsplash.com/photo-1539185441755-769473a23570?w=600', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600'], tags: ['vinyl', 'record-player', 'turntable', 'retro'], rating: 4.7, reviewCount: 78, isFeatured: true },

    // Pet Supplies
    { name: 'Dog Bed Premium', slug: 'dog-bed-premium', description: 'Orthopedic memory foam dog bed for large dogs. Removable washable cover.', price: 89.99, comparePrice: 119.99, stock: 25, sku: 'PET-001', categoryId: categories[6].id, images: ['https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600'], tags: ['dog', 'bed', 'pet', 'comfort'], rating: 4.2, reviewCount: 53, isFeatured: false },
    { name: 'Cat Scratching Post', slug: 'cat-scratching-post', description: 'Large cat scratching post with sisal rope and plush sleeping area.', price: 59.99, comparePrice: 79.99, stock: 35, sku: 'PET-002', categoryId: categories[6].id, images: ['https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=600'], tags: ['cat', 'scratching-post', 'pet', 'furniture'], rating: 4.5, reviewCount: 30, isFeatured: false },

    // Grocery
    { name: 'Organic Coffee Beans 2kg', slug: 'organic-coffee-beans-2kg', description: 'Premium organic coffee beans, medium roast. Rich flavor, ethically sourced.', price: 35.99, comparePrice: 45.99, stock: 200, sku: 'GROC-001', categoryId: categories[7].id, images: ['https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600'], tags: ['coffee', 'organic', 'beverage', 'breakfast'], rating: 4.3, reviewCount: 41, isFeatured: false },
    { name: 'Premium Olive Oil', slug: 'premium-olive-oil', description: 'Cold-pressed extra virgin olive oil from Italy. 1L bottle.', price: 29.99, comparePrice: 39.99, stock: 120, sku: 'GROC-002', categoryId: categories[7].id, images: ['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600'], tags: ['olive-oil', 'organic', 'cooking', 'italian'], rating: 4.6, reviewCount: 81, isFeatured: false },

    // Automotive
    { name: 'Car Phone Mount', slug: 'car-phone-mount', description: 'Universal car phone mount with 360° rotation. Strong magnetic hold.', price: 24.99, comparePrice: 34.99, stock: 150, sku: 'AUTO-001', categoryId: categories[8].id, images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600'], tags: ['phone-mount', 'car-accessories', 'smartphone', 'holder'], rating: 4.3, reviewCount: 95, isFeatured: false },
    { name: 'Jump Starter Portable', slug: 'jump-starter-portable', description: 'Portable car jump starter with 2000A peak current. Also works as power bank.', price: 99.99, comparePrice: 129.99, stock: 30, sku: 'AUTO-002', categoryId: categories[8].id, images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600'], tags: ['jump-starter', 'car-emergency', 'portable', 'safety'], rating: 4.7, reviewCount: 78, isFeatured: true },

    // Toys & Games
    { name: 'Board Game Collection', slug: 'board-game-collection', description: 'Set of 5 classic board games for family game night. Ages 8+.', price: 49.99, comparePrice: 69.99, stock: 80, sku: 'TOYS-001', categoryId: categories[9].id, images: ['https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=600'], tags: ['board-games', 'family', 'games', 'collection'], rating: 4.6, reviewCount: 56, isFeatured: false },
    { name: 'Remote Control Car', slug: 'remote-control-car', description: 'High-speed RC car with 4WD. Rechargeable battery included.', price: 59.99, comparePrice: 79.99, stock: 60, sku: 'TOYS-002', categoryId: categories[9].id, images: ['https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=600'], tags: ['rc-car', 'remote-control', 'toys', 'outdoor'], rating: 4.4, reviewCount: 89, isFeatured: false },
  ];

  let createdCount = 0;
  for (const product of productsData) {
    try {
      await prisma.product.upsert({
        where: { slug: product.slug },
        update: {},
        create: {
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: product.price,
          comparePrice: product.comparePrice,
          stock: product.stock,
          sku: product.sku,
          categoryId: product.categoryId,
          images: JSON.stringify(product.images),
          tags: JSON.stringify(product.tags),
          rating: product.rating,
          reviewCount: product.reviewCount,
          isFeatured: product.isFeatured,
          isActive: true,
        },
      });
      createdCount++;
    } catch (e) {
      console.log(`Product ${product.slug} already exists or error:`, e);
    }
  }
  console.log(`✅ Created ${createdCount} products`);

  // Create Coupons
  await prisma.coupon.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: {
      code: 'WELCOME10',
      type: 'percent',
      value: 10,
      minOrder: 50,
      usageLimit: 1000,
      isActive: true,
    },
  });

  await prisma.coupon.upsert({
    where: { code: 'SAVE20' },
    update: {},
    create: {
      code: 'SAVE20',
      type: 'percent',
      value: 20,
      minOrder: 100,
      usageLimit: 500,
      isActive: true,
    },
  });

  await prisma.coupon.upsert({
    where: { code: 'FLAT15' },
    update: {},
    create: {
      code: 'FLAT15',
      type: 'flat',
      value: 15,
      minOrder: 75,
      usageLimit: 200,
      isActive: true,
    },
  });
  console.log(`✅ Created 3 coupons`);

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - Categories: ${categories.length}`);
  console.log(`   - Products: ${createdCount}`);
  console.log(`   - Coupons: 3`);
  console.log(`   - Admin: admin@shopai.com / XOtgMoqMcbEVUY4J`);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
