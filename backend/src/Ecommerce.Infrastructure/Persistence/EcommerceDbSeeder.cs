using Microsoft.EntityFrameworkCore;
using Ecommerce.Modules.Catalog.Domain;
using Ecommerce.Modules.Inventory.Domain;
using Ecommerce.Modules.Identity.Domain;
using Ecommerce.Modules.Identity.Services;

namespace Ecommerce.Infrastructure.Persistence;

public static class EcommerceDbSeeder
{
    private static Guid DeterministicGuid(string key)
    {
        var hash = System.Security.Cryptography.SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(key));
        return new Guid(hash.AsSpan(0, 16));
    }

    public static async Task SeedAsync(EcommerceDbContext context, IPasswordHasher passwordHasher, CancellationToken ct = default)
    {
        // 1. Seed Roles & Admin User (usr_*)
        var adminRole = await context.Roles.FirstOrDefaultAsync(r => r.Name == "Admin", ct);
        if (adminRole == null)
        {
            adminRole = new Role("Admin", "Full administrative access to the platform")
            {
                Id = DeterministicGuid("role:Admin")
            };
            context.Roles.Add(adminRole);
            await context.SaveChangesAsync(ct);
        }

        var adminUser = await context.Users.FirstOrDefaultAsync(u => u.Email == "admin@gmail.com", ct);
        if (adminUser == null)
        {
            var oldAdmin = await context.Users.FirstOrDefaultAsync(u => u.Email == "admin@ecommerce.local", ct);
            if (oldAdmin != null)
            {
                oldAdmin.Email = "admin@gmail.com";
                oldAdmin.PasswordHash = passwordHasher.HashPassword("AdminPassword123!");
                oldAdmin.FailedLoginAttempts = 0;
                oldAdmin.LockoutEndUtc = null;
                oldAdmin.IsActive = true;
                await context.SaveChangesAsync(ct);
                adminUser = oldAdmin;
            }
            else
            {
                adminUser = new User(
                    "admin@gmail.com",
                    passwordHasher.HashPassword("AdminPassword123!"),
                    "Store Administrator"
                )
                {
                    Id = DeterministicGuid("usr:admin@gmail.com")
                };
                context.Users.Add(adminUser);
                await context.SaveChangesAsync(ct);

                context.UserRoles.Add(new UserRole(adminUser.Id, adminRole.Id));
                await context.SaveChangesAsync(ct);
            }
        }
        else
        {
            adminUser.PasswordHash = passwordHasher.HashPassword("AdminPassword123!");
            adminUser.FailedLoginAttempts = 0;
            adminUser.LockoutEndUtc = null;
            adminUser.IsActive = true;
            await context.SaveChangesAsync(ct);
        }

        // Seed Customer Role & Demo Customer User
        var customerRole = await context.Roles.FirstOrDefaultAsync(r => r.Name == "Customer", ct);
        if (customerRole == null)
        {
            customerRole = new Role("Customer", "Registered customer account")
            {
                Id = DeterministicGuid("role:Customer")
            };
            context.Roles.Add(customerRole);
            await context.SaveChangesAsync(ct);
        }

        var demoUser = await context.Users.FirstOrDefaultAsync(u => u.Email == "user@gmail.com", ct);
        if (demoUser == null)
        {
            demoUser = new User(
                "user@gmail.com",
                passwordHasher.HashPassword("UserPassword123!"),
                "Tanvir Ahmed",
                "01712345678"
            )
            {
                Id = DeterministicGuid("usr:user@gmail.com")
            };
            context.Users.Add(demoUser);
            await context.SaveChangesAsync(ct);

            context.UserRoles.Add(new UserRole(demoUser.Id, customerRole.Id));
            await context.SaveChangesAsync(ct);
        }
        else
        {
            demoUser.PasswordHash = passwordHasher.HashPassword("UserPassword123!");
            demoUser.FailedLoginAttempts = 0;
            demoUser.LockoutEndUtc = null;
            demoUser.IsActive = true;
            await context.SaveChangesAsync(ct);
        }

        // 2. Seed Categories (cat_*)
        var apparel = await context.Categories.FirstOrDefaultAsync(c => c.Slug == "apparel-fashion", ct);
        if (apparel == null)
        {
            apparel = new Category("Apparel & Fashion", "apparel-fashion", "Premium clothing and everyday lifestyle apparel", "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=80", 1)
            {
                Id = DeterministicGuid("cat:apparel-fashion")
            };
            context.Categories.Add(apparel);
        }

        var electronics = await context.Categories.FirstOrDefaultAsync(c => c.Slug == "electronics-gadgets", ct);
        if (electronics == null)
        {
            electronics = new Category("Electronics & Gadgets", "electronics-gadgets", "Audio, accessories, and smart devices", "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80", 2)
            {
                Id = DeterministicGuid("cat:electronics-gadgets")
            };
            context.Categories.Add(electronics);
        }

        var footwear = await context.Categories.FirstOrDefaultAsync(c => c.Slug == "footwear-leather", ct);
        if (footwear == null)
        {
            footwear = new Category("Footwear & Leather", "footwear-leather", "Handcrafted leather shoes, wallets, and bags", "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80", 3)
            {
                Id = DeterministicGuid("cat:footwear-leather")
            };
            context.Categories.Add(footwear);
        }

        var home = await context.Categories.FirstOrDefaultAsync(c => c.Slug == "home-living", ct);
        if (home == null)
        {
            home = new Category("Home & Living", "home-living", "Modern essentials for the contemporary home", "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80", 4)
            {
                Id = DeterministicGuid("cat:home-living")
            };
            context.Categories.Add(home);
        }

        var ip16Cat = await context.Categories.FirstOrDefaultAsync(c => c.Slug == "iphone-16-series", ct);
        if (ip16Cat == null)
        {
            ip16Cat = new Category("iPhone 16 Series", "iphone-16-series", "Certified pre-owned iPhone 16 & 16 Pro Max with A18 Pro & Camera Control", "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80", 5)
            {
                Id = DeterministicGuid("cat:iphone-16-series")
            };
            context.Categories.Add(ip16Cat);
        }

        var ip15Cat = await context.Categories.FirstOrDefaultAsync(c => c.Slug == "iphone-15-series", ct);
        if (ip15Cat == null)
        {
            ip15Cat = new Category("iPhone 15 Series", "iphone-15-series", "Certified pre-owned iPhone 15 & 15 Pro Max with Titanium & USB-C", "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80", 6)
            {
                Id = DeterministicGuid("cat:iphone-15-series")
            };
            context.Categories.Add(ip15Cat);
        }

        var ip14Cat = await context.Categories.FirstOrDefaultAsync(c => c.Slug == "iphone-14-series", ct);
        if (ip14Cat == null)
        {
            ip14Cat = new Category("iPhone 14 Series", "iphone-14-series", "Certified pre-owned iPhone 14 & 14 Pro Max with ProMotion 120Hz", "https://images.unsplash.com/photo-1663499482523-1c0c1bae4ce1?auto=format&fit=crop&w=800&q=80", 7)
            {
                Id = DeterministicGuid("cat:iphone-14-series")
            };
            context.Categories.Add(ip14Cat);
        }

        var ip13Cat = await context.Categories.FirstOrDefaultAsync(c => c.Slug == "iphone-13-series", ct);
        if (ip13Cat == null)
        {
            ip13Cat = new Category("iPhone 13 Series", "iphone-13-series", "Value flagship bestseller with A15 Bionic & Cinematic video", "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80", 8)
            {
                Id = DeterministicGuid("cat:iphone-13-series")
            };
            context.Categories.Add(ip13Cat);
        }

        var budgetCat = await context.Categories.FirstOrDefaultAsync(c => c.Slug == "budget-flagships", ct);
        if (budgetCat == null)
        {
            budgetCat = new Category("Budget Flagships", "budget-flagships", "Affordable used iPhones under ৳45,000 with 100% Face ID verified", "https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&w=800&q=80", 9)
            {
                Id = DeterministicGuid("cat:budget-flagships")
            };
            context.Categories.Add(budgetCat);
        }

        await context.SaveChangesAsync(ct);

        // 3. Helper to Seed a Product Idempotently
        async Task SeedProductIfMissingAsync(
            string name,
            string slug,
            decimal basePrice,
            decimal? originalPrice,
            string description,
            Guid categoryId,
            bool isFeatured,
            (string sku, string variantName, decimal priceAdj, int stock)[] variants,
            (string url, string altText, int order, bool isPrimary)[] images)
        {
            if (await context.Products.AnyAsync(p => p.Slug == slug, ct))
            {
                return;
            }

            var product = new Product(name, slug, basePrice, description, categoryId, originalPrice, isFeatured)
            {
                Id = DeterministicGuid("prod:" + slug)
            };
            var stockToCreate = new List<(ProductVariant variant, int initialStock)>();

            foreach (var (sku, variantName, priceAdj, stock) in variants)
            {
                var v = new ProductVariant(product.Id, sku, variantName, priceAdj)
                {
                    Id = DeterministicGuid("var:" + sku)
                };
                product.Variants.Add(v);
                stockToCreate.Add((v, stock));
            }

            foreach (var (url, altText, order, isPrimary) in images)
            {
                var img = new ProductImage(product.Id, url, altText, order, isPrimary)
                {
                    Id = DeterministicGuid($"img:{slug}:{order}")
                };
                product.Images.Add(img);
            }

            context.Products.Add(product);
            await context.SaveChangesAsync(ct);

            foreach (var (v, initialStock) in stockToCreate)
            {
                var stockItem = new StockItem(v.Id, initialStock)
                {
                    Id = DeterministicGuid("stock:" + v.Sku)
                };
                stockItem.Logs.Add(new StockLog(stockItem.Id, v.Id, initialStock, initialStock, "Initial catalog inventory intake"));
                context.StockItems.Add(stockItem);
            }

            await context.SaveChangesAsync(ct);
        }

        // --- Product 1: Classic Oxford Cotton Shirt ---
        await SeedProductIfMissingAsync(
            "Classic Oxford Cotton Shirt",
            "classic-oxford-cotton-shirt",
            1450.00m,
            1800.00m,
            "Tailored from 100% breathable organic cotton. Features a structured button-down collar, durable pearlescent buttons, and a comfortable regular fit suitable for both business casual and weekend leisure.",
            apparel.Id,
            isFeatured: true,
            [
                ("OXF-BLU-S", "Sky Blue / S", 0m, 25),
                ("OXF-BLU-M", "Sky Blue / M", 0m, 40),
                ("OXF-BLU-L", "Sky Blue / L", 0m, 35),
                ("OXF-WHT-M", "Pure White / M", 0m, 30),
                ("OXF-WHT-L", "Pure White / L", 0m, 30)
            ],
            [
                ("https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80", "Front view of Classic Oxford Cotton Shirt in light blue", 1, true),
                ("https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80", "Collar detail of Classic Oxford Cotton Shirt", 2, false)
            ]
        );

        // --- Product 2: Premium Silk Panjabi ---
        await SeedProductIfMissingAsync(
            "Premium Hand-Loom Silk Panjabi",
            "premium-hand-loom-silk-panjabi",
            3250.00m,
            3800.00m,
            "Exquisitely tailored from premium Rajshahi silk blend featuring minimalist zari-thread embroidery along the mandarin collar and placket. Designed for festive celebrations, weddings, and formal Eid gatherings.",
            apparel.Id,
            isFeatured: true,
            [
                ("PANJ-MRN-40", "Royal Maroon / 40", 0m, 20),
                ("PANJ-MRN-42", "Royal Maroon / 42", 0m, 30),
                ("PANJ-MRN-44", "Royal Maroon / 44", 100m, 15),
                ("PANJ-NVY-40", "Midnight Navy / 40", 0m, 20),
                ("PANJ-NVY-42", "Midnight Navy / 42", 0m, 25)
            ],
            [
                ("https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80", "Traditional Silk Panjabi front view", 1, true)
            ]
        );

        // --- Product 3: Salwar Suit ---
        await SeedProductIfMissingAsync(
            "Georgette Embroidered 3-Piece Salwar Suit",
            "georgette-embroidered-salwar-suit",
            3850.00m,
            4500.00m,
            "Luxurious 3-piece festive ensemble featuring delicate resham thread embroidery on fine faux georgette kameez, accompanied by a matching santoon bottom and an intricately scalloped organza dupatta.",
            apparel.Id,
            isFeatured: true,
            [
                ("SLW-EMR-M", "Emerald Green / M", 0m, 15),
                ("SLW-EMR-L", "Emerald Green / L", 0m, 20),
                ("SLW-ROSE-M", "Dusty Rose / M", 0m, 15),
                ("SLW-ROSE-L", "Dusty Rose / L", 0m, 18)
            ],
            [
                ("https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80", "Embroidered festive salwar suit", 1, true)
            ]
        );

        // --- Product 4: Handcrafted Leather Wallet ---
        await SeedProductIfMissingAsync(
            "Handcrafted Top-Grain Leather Bifold Wallet",
            "handcrafted-top-grain-leather-wallet",
            1200.00m,
            1500.00m,
            "Handcrafted by local artisans using vegetable-tanned top-grain cowhide. Includes 6 card slots, a full-length cash compartment, and RFID-blocking lining to keep personal cards secure.",
            footwear.Id,
            isFeatured: true,
            [
                ("WLT-LTH-BLK", "Obsidian Black", 0m, 45),
                ("WLT-LTH-BRN", "Saddle Brown", 0m, 50),
                ("WLT-LTH-TAN", "Vintage Tan", 0m, 30)
            ],
            [
                ("https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80", "Top-grain leather bifold wallet in saddle brown", 1, true)
            ]
        );

        // --- Product 5: Executive Derby Shoes ---
        await SeedProductIfMissingAsync(
            "Executive Full-Grain Leather Derby Shoes",
            "executive-full-grain-leather-derby-shoes",
            4200.00m,
            5000.00m,
            "Crafted from hand-burnished full-grain cow leather with a Goodyear-welted construction and anti-skid rubberized heel sole. The quintessential formal footwear for corporate boardroom meetings and formal dinners.",
            footwear.Id,
            isFeatured: true,
            [
                ("SHOE-DRB-BLK-41", "Onyx Black / Size 41", 0m, 15),
                ("SHOE-DRB-BLK-42", "Onyx Black / Size 42", 0m, 20),
                ("SHOE-DRB-BRN-41", "Dark Chestnut / Size 41", 0m, 18),
                ("SHOE-DRB-BRN-42", "Dark Chestnut / Size 42", 0m, 22)
            ],
            [
                ("https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=800&q=80", "Hand-burnished leather formal derby shoes", 1, true)
            ]
        );

        // --- Product 6: Urban Runner Sneakers ---
        await SeedProductIfMissingAsync(
            "Urban Runner Breathable Knit Sneakers",
            "urban-runner-breathable-knit-sneakers",
            2250.00m,
            2800.00m,
            "Ultra-lightweight high-density knit mesh upper paired with an ergonomic high-rebound EVA foam midsole. Designed for all-day comfort during daily commutes or light athletic training.",
            footwear.Id,
            isFeatured: false,
            [
                ("SNK-WHT-41", "Arctic White / Size 41", 0m, 25),
                ("SNK-WHT-42", "Arctic White / Size 42", 0m, 35),
                ("SNK-BLK-41", "Triple Black / Size 41", 0m, 30),
                ("SNK-BLK-42", "Triple Black / Size 42", 0m, 40)
            ],
            [
                ("https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80", "Urban breathable red and white runner sneakers", 1, true)
            ]
        );

        // --- Product 7: SonicPro Earbuds ---
        await SeedProductIfMissingAsync(
            "SonicPro Active ANC Wireless Earbuds",
            "sonicpro-active-anc-wireless-earbuds",
            2850.00m,
            3500.00m,
            "Engineered with hybrid Active Noise Cancellation up to 35dB, 10mm dynamic titanium drivers, IPX5 water resistance, and up to 32 hours total playtime with the compact wireless charging case.",
            electronics.Id,
            isFeatured: true,
            [
                ("EAR-ANC-BLK", "Matte Black", 0m, 40),
                ("EAR-ANC-WHT", "Ceramic White", 0m, 35)
            ],
            [
                ("https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80", "SonicPro wireless earbuds in open charging case", 1, true)
            ]
        );

        // --- Product 8: Horizon Ultra Smartwatch ---
        await SeedProductIfMissingAsync(
            "Horizon Ultra AMOLED Smartwatch 2.0",
            "horizon-ultra-amoled-smartwatch",
            3450.00m,
            4200.00m,
            "Features a vibrant 1.96-inch AMOLED display with Always-On support, real-time heart rate and SpO2 tracking, clear Bluetooth calling with dual-mic noise reduction, and up to 10 days battery endurance.",
            electronics.Id,
            isFeatured: true,
            [
                ("WATCH-HRZ-GRY", "Space Grey Titanium", 0m, 30),
                ("WATCH-HRZ-BLK", "Midnight Obsidian", 50m, 35)
            ],
            [
                ("https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80", "Horizon Ultra Smartwatch on sleek surface", 1, true)
            ]
        );

        // --- Product 9: GaN Fast Charger ---
        await SeedProductIfMissingAsync(
            "HyperCharge 65W GaN III Dual-Port Fast Charger",
            "hypercharge-65w-gan-fast-charger",
            1650.00m,
            2100.00m,
            "Next-generation Gallium Nitride (GaN III) fast wall charger with dual USB-C Power Delivery 3.0 ports and one USB-A QuickCharge 4.0 port. Capable of charging a laptop and smartphone simultaneously at full speed.",
            electronics.Id,
            isFeatured: false,
            [
                ("CHG-65W-WHT", "Glacier White", 0m, 60),
                ("CHG-65W-BLK", "Stealth Black", 0m, 50)
            ],
            [
                ("https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80", "Compact high-speed GaN fast charger", 1, true)
            ]
        );

        // --- Product 10: Daily Backpack ---
        await SeedProductIfMissingAsync(
            "Minimalist Waterproof Daily Backpack 20L",
            "minimalist-waterproof-daily-backpack-20l",
            1950.00m,
            2400.00m,
            "Constructed with weatherproof 600D recycled polyester, padded ergonomic shoulder straps, dedicated 15.6-inch padded laptop sleeve, and a hidden anti-theft passport pocket.",
            home.Id,
            isFeatured: true,
            [
                ("BPK-20L-CHR", "Charcoal Gray", 0m, 35),
                ("BPK-20L-OLV", "Tactical Olive", 50m, 25)
            ],
            [
                ("https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80", "Minimalist waterproof daily backpack in charcoal gray", 1, true)
            ]
        );

        // --- Product 11: Stainless Steel Thermal Flask ---
        await SeedProductIfMissingAsync(
            "Double-Walled Vacuum Thermal Flask 750ml",
            "double-walled-vacuum-thermal-flask-750ml",
            950.00m,
            1250.00m,
            "Food-grade 18/8 pro-stainless steel with double-wall copper vacuum insulation. Keeps beverages ice cold for up to 24 hours or piping hot for up to 12 hours. Zero condensation exterior with leakproof spout cap.",
            home.Id,
            isFeatured: false,
            [
                ("FLK-750-BLK", "Matte Black", 0m, 45),
                ("FLK-750-GRN", "Forest Pine", 0m, 35),
                ("FLK-750-STL", "Brushed Steel", 0m, 30)
            ],
            [
                ("https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80", "Insulated stainless steel thermal water bottle", 1, true)
            ]
        );

        // --- Product 12: Sylhet Organic Black Tea ---
        await SeedProductIfMissingAsync(
            "Organic Hand-Picked Sylhet Black Tea 250g",
            "organic-sylhet-black-tea-250g",
            450.00m,
            550.00m,
            "Single-origin Golden Orange Pekoe whole black tea leaves harvested from premium micro-lot tea gardens in Sreemangal, Sylhet. Distinct malty aroma with rich honey undertones and vibrant amber liqueur.",
            home.Id,
            isFeatured: true,
            [
                ("TEA-250-TIN", "Whole Leaf Tin 250g", 0m, 60),
                ("TEA-500-PCH", "Whole Leaf Pouch 500g", 380m, 40)
            ],
            [
                ("https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80", "Artisanal organic whole leaf black tea in bowl", 1, true)
            ]
        );

        // --- Product 13: iPhone 16 Pro Max 256GB Desert Titanium ---
        await SeedProductIfMissingAsync(
            "iPhone 16 Pro Max 256GB - Desert Titanium (Grade A+)",
            "iphone-16-pro-max-256gb-desert-titanium",
            148000.00m,
            165000.00m,
            "Certified Pre-Owned Grade A+ (Pristine 10/10). Features authentic 100% battery health, A18 Pro chip, 5x telephoto camera, and 100% 3uTools score. ZA/A Dual Physical SIM. Backed by 7-day replacement guarantee and 2-year free service warranty.",
            ip16Cat.Id,
            isFeatured: true,
            [
                ("IP16PM-256-DT-ZAA", "Desert Titanium / 256GB / ZA/A Dual SIM", 0m, 5),
                ("IP16PM-256-NT-ZAA", "Natural Titanium / 256GB / ZA/A Dual SIM", 0m, 4)
            ],
            [
                ("https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80", "iPhone 16 Pro Max Desert Titanium", 1, true)
            ]
        );

        // --- Product 14: iPhone 15 Pro 128GB Natural Titanium ---
        await SeedProductIfMissingAsync(
            "iPhone 15 Pro 128GB - Natural Titanium (Grade A+)",
            "iphone-15-pro-128gb-natural-titanium",
            94500.00m,
            118000.00m,
            "Certified Pre-Owned Grade A+ with 96% original battery health. Titanium frame, USB-C 3.0, and 120Hz ProMotion Super Retina XDR OLED. 100% iCloud clean with 70-point diagnostics passed.",
            ip15Cat.Id,
            isFeatured: true,
            [
                ("IP15P-128-NT-LLA", "Natural Titanium / 128GB / LL/A", 0m, 6),
                ("IP15P-128-WT-LLA", "White Titanium / 128GB / LL/A", 0m, 4)
            ],
            [
                ("https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80", "iPhone 15 Pro Natural Titanium", 1, true)
            ]
        );

        // --- Product 15: iPhone 14 Pro Max 128GB Deep Purple ---
        await SeedProductIfMissingAsync(
            "iPhone 14 Pro Max 128GB - Deep Purple (Grade A)",
            "iphone-14-pro-max-128gb-deep-purple",
            89000.00m,
            125000.00m,
            "Certified Pre-Owned Grade A with 91% original battery health. Dynamic Island, 48MP Photonic camera, and A16 Bionic. True Tone and Face ID 100% functional.",
            ip14Cat.Id,
            isFeatured: true,
            [
                ("IP14PM-128-PUR-LLA", "Deep Purple / 128GB / LL/A", 0m, 8),
                ("IP14PM-128-SPB-ZAA", "Space Black / 128GB / ZA/A Dual SIM", 2000m, 5)
            ],
            [
                ("https://images.unsplash.com/photo-1663499482523-1c0c1bae4ce1?auto=format&fit=crop&w=800&q=80", "iPhone 14 Pro Max Deep Purple", 1, true)
            ]
        );

        // --- Product 16: iPhone 13 128GB Midnight ---
        await SeedProductIfMissingAsync(
            "iPhone 13 128GB - Midnight (Grade A+)",
            "iphone-13-128gb-midnight",
            49500.00m,
            68000.00m,
            "Best value flagship in Bangladesh! Certified Pre-Owned Grade A+ with 90% battery health, A15 Bionic chip, and Cinematic mode. Comes with original box and store cash memo.",
            ip13Cat.Id,
            isFeatured: true,
            [
                ("IP13-128-MID-LLA", "Midnight / 128GB / LL/A", 0m, 12),
                ("IP13-128-STR-LLA", "Starlight / 128GB / LL/A", 0m, 10)
            ],
            [
                ("https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80", "iPhone 13 Midnight", 1, true)
            ]
        );

        // --- Product 17: iPhone 12 128GB Blue ---
        await SeedProductIfMissingAsync(
            "iPhone 12 128GB - Pacific Navy (Grade B+ Value)",
            "iphone-12-128gb-blue",
            36500.00m,
            52000.00m,
            "Budget champion flagship under ৳40k. Clean Super Retina display, 86% battery health, 5G cellular, and dual 12MP cameras. 100% True Tone and Face ID verified.",
            budgetCat.Id,
            isFeatured: false,
            [
                ("IP12-128-BLU-LLA", "Pacific Blue / 128GB / LL/A", 0m, 8)
            ],
            [
                ("https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&w=800&q=80", "iPhone 12 Pacific Blue", 1, true)
            ]
        );

        // 4. Seed Bulk Diverse Catalog Products up to 10,000 items
        await SeedBulkCatalogProductsAsync(context, targetTotal: 10000, ct: ct);
    }

    private sealed record ProductTemplate(
        string CategorySlug,
        string Name,
        string SlugPrefix,
        string SkuPrefix,
        decimal BasePrice,
        decimal OriginalPrice,
        string Description,
        string[] ImageUrls,
        (string VariantSuffix, string VariantName, decimal PriceAdj)[] VariantOptions
    );

    public static async Task<int> SeedBulkCatalogProductsAsync(EcommerceDbContext context, int targetTotal = 10000, CancellationToken ct = default)
    {
        var existingCount = await context.Products.CountAsync(ct);
        if (existingCount >= targetTotal)
        {
            return existingCount;
        }

        var needed = targetTotal - existingCount;

        // Ensure 10 diverse categories exist
        var categoryDefs = new[]
        {
            ("laptops-workstations", "Laptops & Workstations", "MacBooks, ThinkPads, Dell XPS, and creator workstations with certified hardware verification.", "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=80", 10),
            ("smartphones-flagships", "Smartphones & Flagships", "Apple iPhones, Samsung Galaxy Ultra, Google Pixel & flagship smartphones certified with genuine batteries and displays.", "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1000&q=80", 11),
            ("tablets-ipads", "Tablets & iPads", "Apple iPad Pro, iPad Air, Galaxy Tab AMOLED, and digital illustration tablets with verified stylus digitizers.", "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=1000&q=80", 12),
            ("audio-headphones", "Audio & Studio Acoustics", "Active noise-canceling headphones, audiophile monitors, and studio microphones with acoustic lab verification.", "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80", 13),
            ("smartwatches-wearables", "Smartwatches & Wearables", "Apple Watch Ultra, Garmin outdoor multisport watches, and health sensors with sensor-accuracy testing.", "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=1000&q=80", 14),
            ("cameras-photography", "Cameras & Optics", "Full-frame mirrorless camera bodies, prime G-Master lenses, and 4K cinema cameras with sensor calibration.", "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=80", 15),
            ("monitors-displays", "Monitors & Displays", "5K Retina displays, 240Hz OLED gaming ultrawides, and factory color-calibrated creator monitors.", "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1000&q=80", 16),
            ("mechanical-keyboards", "Keyboards & Peripherals", "Custom hot-swappable mechanical keyboards, CNC aluminum frames, and ergonomic precision mice.", "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1000&q=80", 17),
            ("gaming-consoles", "Gaming & Consoles", "PlayStation 5, Xbox Series X, Nintendo Switch OLED, and portable gaming handhelds with hardware thermal audits.", "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=1000&q=80", 18),
            ("chargers-accessories", "Docks, Cables & Power", "GaN fast chargers, 40Gbps Thunderbolt 4 hubs, and MagSafe charging stations certified for safe power delivery.", "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=1000&q=80", 19)
        };

        var categoryMap = new Dictionary<string, Category>(StringComparer.OrdinalIgnoreCase);
        foreach (var (cSlug, cName, cDesc, cImg, cOrder) in categoryDefs)
        {
            var cat = await context.Categories.FirstOrDefaultAsync(c => c.Slug == cSlug, ct);
            if (cat == null)
            {
                cat = new Category(cName, cSlug, cDesc, cImg, cOrder)
                {
                    Id = DeterministicGuid("cat:" + cSlug)
                };
                context.Categories.Add(cat);
            }
            categoryMap[cSlug] = cat;
        }
        await context.SaveChangesAsync(ct);

        var templates = new[]
        {
            // Laptops & Workstations
            new ProductTemplate("laptops-workstations", "MacBook Pro 16-inch M3 Max", "macbook-pro-16-m3-max", "MBP16M3", 335000m, 385000m,
                "The ultimate workstation with 16-core CPU, 40-core GPU, Liquid Retina XDR display with ProMotion, and all-day battery life. Certified 100% battery cycle & thermal audit verified.",
                [
                    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=80",
                    "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=1000&q=80"
                ],
                [
                    ("36GB-1TB", "36GB RAM / 1TB SSD / Space Black", 0m),
                    ("48GB-2TB", "48GB RAM / 2TB SSD / Silver", 45000m)
                ]),
            new ProductTemplate("laptops-workstations", "MacBook Pro 14-inch M3 Pro", "macbook-pro-14-m3-pro", "MBP14M3", 225000m, 260000m,
                "Portable powerhouse with M3 Pro silicon, 120Hz ProMotion XDR display, MagSafe 3, and HDMI port. Tested with zero thermal throttling under sustained load.",
                [
                    "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=1000&q=80"
                ],
                [
                    ("18GB-512GB", "18GB RAM / 512GB SSD / Space Black", 0m),
                    ("36GB-1TB", "36GB RAM / 1TB SSD / Silver", 38000m)
                ]),
            new ProductTemplate("laptops-workstations", "MacBook Air 15-inch M3", "macbook-air-15-m3", "MBA15M3", 155000m, 178000m,
                "Impossibly thin 15-inch Liquid Retina display with silent fanless thermal architecture, 1080p FaceTime HD camera, and MagSafe 3.",
                [
                    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=80"
                ],
                [
                    ("16GB-512GB-MID", "16GB RAM / 512GB SSD / Midnight", 0m),
                    ("16GB-512GB-SLV", "16GB RAM / 512GB SSD / Starlight", 0m)
                ]),
            new ProductTemplate("laptops-workstations", "Dell XPS 15 9530 3.5K OLED", "dell-xps-15-oled", "XPS15", 215000m, 250000m,
                "Stunning 15.6-inch 3.5K OLED touch display with 100% DCI-P3 color gamut, CNC machined aluminum chassis, and carbon fiber palm rest.",
                [
                    "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=1000&q=80"
                ],
                [
                    ("I7-16GB-1TB", "Intel i7 / 16GB / 1TB SSD / RTX 4060", 0m),
                    ("I9-32GB-2TB", "Intel i9 / 32GB / 2TB SSD / RTX 4070", 35000m)
                ]),
            new ProductTemplate("laptops-workstations", "Lenovo ThinkPad X1 Carbon Gen 11", "thinkpad-x1-carbon-gen11", "TPX1C", 175000m, 210000m,
                "Ultralight enterprise standard weighing just 1.12kg with military-spec durability (MIL-STD 810H), legendary ThinkPad keyboard, and Dolby Atmos audio.",
                [
                    "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=1000&q=80"
                ],
                [
                    ("16GB-512GB", "16GB RAM / 512GB SSD", 0m),
                    ("32GB-1TB", "32GB RAM / 1TB SSD", 25000m)
                ]),
            new ProductTemplate("laptops-workstations", "ASUS ROG Zephyrus G16 OLED Gaming Laptop", "asus-rog-zephyrus-g16", "ROG-G16", 245000m, 290000m,
                "Ultra-slim 240Hz OLED gaming laptop with Intel Core Ultra 9, NVIDIA GeForce RTX 4080, and vapor chamber cooling.",
                [
                    "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=1000&q=80"
                ],
                [
                    ("RTX4070-1TB", "RTX 4070 / 32GB / 1TB SSD", 0m),
                    ("RTX4080-2TB", "RTX 4080 / 32GB / 2TB SSD", 45000m)
                ]),

            // Smartphones & Flagships
            new ProductTemplate("smartphones-flagships", "Samsung Galaxy S24 Ultra 5G", "samsung-galaxy-s24-ultra", "SGS24U", 135000m, 165000m,
                "Titanium frame flagship with 200MP Quad Tele camera, Snapdragon 8 Gen 3, integrated S Pen, and Galaxy AI live translation.",
                [
                    "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=1000&q=80"
                ],
                [
                    ("256GB-GRAY", "Titanium Gray / 256GB", 0m),
                    ("512GB-BLK", "Titanium Black / 512GB", 18000m)
                ]),
            new ProductTemplate("smartphones-flagships", "Google Pixel 9 Pro 5G", "google-pixel-9-pro", "PIX9PRO", 115000m, 138000m,
                "Google Tensor G4 processor with Super Actua OLED display, pro triple camera system, and 7 years of official Android OS updates.",
                [
                    "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1000&q=80"
                ],
                [
                    ("128GB-PORC", "Porcelain / 128GB", 0m),
                    ("256GB-OBS", "Obsidian / 256GB", 12000m)
                ]),
            new ProductTemplate("smartphones-flagships", "iPhone 16 Pro Max - Grade A+ Pristine", "iphone-16-pro-max-certified", "IP16PMX", 155000m, 185000m,
                "Grade A+ Certified Pre-Owned with A18 Pro chip, 5x telephoto camera, Camera Control button, and titanium grade unibody.",
                [
                    "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1000&q=80"
                ],
                [
                    ("256GB-NAT", "Natural Titanium / 256GB", 0m),
                    ("512GB-DES", "Desert Titanium / 512GB", 22000m)
                ]),
            new ProductTemplate("smartphones-flagships", "iPhone 15 Pro - Titanium Grade A", "iphone-15-pro-certified", "IP15PRO", 108000m, 135000m,
                "Certified pre-owned with 92% battery health, A17 Pro chip, 120Hz ProMotion, and USB-C 10Gbps data transfer.",
                [
                    "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=1000&q=80"
                ],
                [
                    ("128GB-NAT", "Natural Titanium / 128GB", 0m),
                    ("256GB-BLU", "Blue Titanium / 256GB", 14000m)
                ]),
            new ProductTemplate("smartphones-flagships", "OnePlus 12 5G Hasselblad Edition", "oneplus-12-flagship", "OP12", 82000m, 98000m,
                "Snapdragon 8 Gen 3 with 5400mAh battery, 100W SUPERVOOC charging, and 4th Gen Hasselblad Camera System.",
                [
                    "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=1000&q=80"
                ],
                [
                    ("256GB-SILKY", "Silky Black / 256GB", 0m),
                    ("512GB-FLOW", "Flowy Emerald / 512GB", 10000m)
                ]),

            // Tablets & iPads
            new ProductTemplate("tablets-ipads", "iPad Pro 13-inch M4 Ultra Retina XDR", "ipad-pro-13-m4", "IPD13M4", 158000m, 185000m,
                "Breakthrough tandem OLED Ultra Retina XDR display with Apple M4 silicon, Apple Pencil Pro support, and studio quality mics.",
                [
                    "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=1000&q=80"
                ],
                [
                    ("256GB-WIFI", "256GB Wi-Fi / Space Black", 0m),
                    ("512GB-CELL", "512GB Wi-Fi + Cellular", 28000m)
                ]),
            new ProductTemplate("tablets-ipads", "iPad Air 11-inch M2", "ipad-air-11-m2", "IPDAIR11", 78000m, 92000m,
                "Powered by Apple M2 chip with Liquid Retina display, Touch ID in top button, and landscape front camera.",
                [
                    "https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=1000&q=80"
                ],
                [
                    ("128GB-BLU", "128GB / Blue", 0m),
                    ("256GB-PUR", "256GB / Purple", 14000m)
                ]),
            new ProductTemplate("tablets-ipads", "Samsung Galaxy Tab S9 Ultra AMOLED", "samsung-galaxy-tab-s9-ultra", "TABS9U", 112000m, 135000m,
                "Massive 14.6-inch Dynamic AMOLED 2X 120Hz display with IP68 water resistance and bundled ultra-low-latency S Pen.",
                [
                    "https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?auto=format&fit=crop&w=1000&q=80"
                ],
                [
                    ("256GB-GRAPH", "256GB / Graphite / S-Pen", 0m),
                    ("512GB-5G", "512GB 5G / Graphite", 22000m)
                ]),

            // Audio & Studio Acoustics
            new ProductTemplate("audio-headphones", "Apple AirPods Max Wireless ANC - USB-C", "airpods-max-usbc", "APMAX", 64500m, 78000m,
                "Computational audio with Apple H1 chips, personalized spatial audio with dynamic head tracking, and lossless audio over USB-C.",
                [
                    "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1000&q=80"
                ],
                [
                    ("MID", "Midnight / USB-C", 0m),
                    ("SLV", "Silver / USB-C", 0m),
                    ("SKY", "Sky Blue / USB-C", 0m)
                ]),
            new ProductTemplate("audio-headphones", "Sony WH-1000XM5 Wireless Noise-Canceling", "sony-wh1000xm5", "WH1000XM5", 36500m, 44000m,
                "Industry-leading active noise cancellation with 8 microphones, Auto NC Optimizer, and 30-hour battery life with quick charge.",
                [
                    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80"
                ],
                [
                    ("BLK", "Black / 30h Battery", 0m),
                    ("SLV", "Silver / 30h Battery", 0m)
                ]),
            new ProductTemplate("audio-headphones", "Bose QuietComfort Ultra Wireless Headphones", "bose-qc-ultra", "BQCULT", 42500m, 49000m,
                "World-class noise cancellation with Bose Immersive Audio, CustomTune technology, and plush protein leather earcups.",
                [
                    "https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?auto=format&fit=crop&w=1000&q=80"
                ],
                [
                    ("BLK", "Black / Spatial Audio", 0m),
                    ("WHT", "White Smoke", 0m)
                ]),
            new ProductTemplate("audio-headphones", "Apple AirPods Pro 2 MagSafe USB-C", "airpods-pro-2-usbc", "APPRO2", 25500m, 32000m,
                "Up to 2x more Active Noise Cancellation with Apple H2 chip, Adaptive Audio, Conversation Awareness, and IP54 dust/water resistance.",
                [
                    "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1000&q=80"
                ],
                [
                    ("USBC-WHT", "White / USB-C MagSafe Case", 0m)
                ]),

            // Smartwatches & Wearables
            new ProductTemplate("smartwatches-wearables", "Apple Watch Ultra 2 Titanium 49mm", "apple-watch-ultra-2", "AWU2", 92000m, 115000m,
                "Aerospace-grade 49mm titanium case with 3000 nit display, dual-frequency precision GPS, Depth gauge, and 36-hour battery life.",
                [
                    "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=1000&q=80"
                ],
                [
                    ("ALP-ORG", "Orange Alpine Loop", 0m),
                    ("TRL-BLK", "Black Trail Loop", 0m)
                ]),
            new ProductTemplate("smartwatches-wearables", "Apple Watch Series 10 OLED 46mm", "apple-watch-series-10", "AWS10", 54000m, 65000m,
                "Apple's thinnest watch with wide-angle OLED display, sleep apnea notifications, faster charging, and S10 SiP.",
                [
                    "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=1000&q=80"
                ],
                [
                    ("JET-BLK", "Jet Black Aluminum", 0m),
                    ("ROSE-GLD", "Rose Gold Aluminum", 0m)
                ]),
            new ProductTemplate("smartwatches-wearables", "Garmin Fenix 7 Pro Sapphire Solar", "garmin-fenix-7-pro", "FENIX7", 98000m, 120000m,
                "Ultimate multisport GPS watch with scratch-resistant Power Sapphire solar charging lens, built-in LED flashlight, and topo maps.",
                [
                    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80"
                ],
                [
                    ("SLATE-47MM", "Slate Gray Titanium / 47mm", 0m),
                    ("BLACK-51MM", "Black DLC / 51mm", 12000m)
                ]),

            // Cameras & Photography
            new ProductTemplate("cameras-photography", "Sony Alpha A7 IV Full-Frame Mirrorless Body", "sony-alpha-a7-iv", "ILCE-7M4", 225000m, 265000m,
                "33MP full-frame Exmor R CMOS sensor, 4K60p 10-bit 4:2:2 video, real-time eye autofocus, and 5.5-stop in-body stabilization.",
                [
                    "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=80"
                ],
                [
                    ("BODY", "Body Only", 0m),
                    ("KIT-2870", "With 28-70mm OSS Lens", 25000m)
                ]),
            new ProductTemplate("cameras-photography", "Fujifilm X-T5 Mirrorless Camera Body", "fujifilm-x-t5", "FUJI-XT5", 185000m, 220000m,
                "40.2MP X-Trans CMOS 5 HR sensor with classic tactile dial operation, 7.0-stop 5-axis IBIS, and 6.2K/30p video.",
                [
                    "https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?auto=format&fit=crop&w=1000&q=80"
                ],
                [
                    ("SLV", "Classic Silver Body", 0m),
                    ("BLK", "Matte Black Body", 0m)
                ]),
            new ProductTemplate("cameras-photography", "DJI Osmo Pocket 3 Creator Combo 4K60p", "dji-osmo-pocket-3-creator-combo", "DJIPKT3", 72000m, 85000m,
                "Pocket-sized 1-inch CMOS gimbal camera with 2-inch rotatable OLED touchscreen, 4K120p slow-motion, and DJI Mic 2 transmitter.",
                [
                    "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=1000&q=80"
                ],
                [
                    ("CREATOR-COMBO", "Complete Creator Combo Bundle", 0m)
                ]),

            // Monitors & Displays
            new ProductTemplate("monitors-displays", "Apple Studio Display 27-inch 5K Retina", "apple-studio-display-5k", "STDDSP", 185000m, 225000m,
                "27-inch 5K Retina display with 600 nits brightness, 12MP Ultra Wide camera with Center Stage, and studio-quality 6-speaker array.",
                [
                    "https://images.unsplash.com/photo-1547119957-637f8679db1e?auto=format&fit=crop&w=1000&q=80"
                ],
                [
                    ("STD-GLASS", "Standard Glass / Tilt-Adjustable", 0m),
                    ("NANO-GLASS", "Nano-Texture Glass / Height-Tilt", 48000m)
                ]),
            new ProductTemplate("monitors-displays", "Dell UltraSharp 32-inch 4K USB-C Hub (U3223QE)", "dell-ultrasharp-32-4k-u3223qe", "U3223QE", 98000m, 120000m,
                "World's first 31.5-inch 4K monitor with IPS Black technology (2000:1 contrast), built-in RJ45 Ethernet, and 90W USB-C power delivery.",
                [
                    "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1000&q=80"
                ],
                [
                    ("U3223QE-IPS", "32-inch IPS Black / 90W PD", 0m)
                ]),
            new ProductTemplate("monitors-displays", "Samsung Odyssey OLED G9 49-inch Curved (240Hz)", "samsung-odyssey-oled-g9", "ODYSSEY-G9", 175000m, 210000m,
                "49-inch Dual QHD curved gaming monitor with OLED panel, 0.03ms response time, 240Hz refresh rate, and Neo Quantum Processor Pro.",
                [
                    "https://images.unsplash.com/photo-1585792180666-f7347c490ee2?auto=format&fit=crop&w=1000&q=80"
                ],
                [
                    ("OLED-240HZ", "49-inch Dual QHD 0.03ms", 0m)
                ]),

            // Keyboards & Peripherals
            new ProductTemplate("mechanical-keyboards", "Keychron Q1 Pro Wireless Custom Mechanical Keyboard", "keychron-q1-pro", "KEY-Q1PRO", 21500m, 26000m,
                "Full CNC aluminum body with double-gasket design, QMK/VIA programmable keys, hot-swappable switches, and Bluetooth 5.1 wireless.",
                [
                    "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1000&q=80"
                ],
                [
                    ("RED-SW", "Gateron Jupiter Red (Linear)", 0m),
                    ("BRN-SW", "Gateron Jupiter Brown (Tactile)", 0m)
                ]),
            new ProductTemplate("mechanical-keyboards", "Logitech MX Master 3S Performance Wireless Mouse", "logitech-mx-master-3s", "MXM3S", 11500m, 14000m,
                "Quiet clicks with 8000 DPI track-on-glass sensor, MagSpeed electromagnetic scroll wheel, and ergonomic thumb rest.",
                [
                    "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=1000&q=80"
                ],
                [
                    ("GRAPH", "Graphite / 8000 DPI", 0m),
                    ("PALE-GRY", "Pale Gray / 8000 DPI", 0m)
                ]),
            new ProductTemplate("mechanical-keyboards", "NuPhy Air75 V2 Ultra-Slim Wireless Keyboard", "nuphy-air75-v2", "NUPHY-AIR75", 16500m, 19500m,
                "Thinnest mechanical keyboard with 1000Hz polling rate, PBT keycaps, and ultra-low-profile Gateron switches.",
                [
                    "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=1000&q=80"
                ],
                [
                    ("COW-LIN", "Cowberry Linear Switches", 0m),
                    ("MOSS-TAC", "Moss Tactile Switches", 0m)
                ]),

            // Gaming & Consoles
            new ProductTemplate("gaming-consoles", "Sony PlayStation 5 Slim Console 1TB", "playstation-5-slim-1tb", "PS5SLIM", 62000m, 75000m,
                "Slim design with 1TB ultra-high-speed SSD, Tempest 3D AudioTech, ray tracing support, and haptic feedback DualSense controller.",
                [
                    "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=1000&q=80"
                ],
                [
                    ("DISC-1TB", "Disc Edition / 1TB SSD", 0m),
                    ("DIG-1TB", "Digital Edition / 1TB SSD", -9000m)
                ]),
            new ProductTemplate("gaming-consoles", "Nintendo Switch OLED Model Console", "nintendo-switch-oled", "NSWTCH", 38500m, 46000m,
                "Vibrant 7-inch OLED screen with wide adjustable stand, enhanced audio, 64GB internal storage, and wired LAN dock.",
                [
                    "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?auto=format&fit=crop&w=1000&q=80"
                ],
                [
                    ("WHT-JOY", "White Joy-Con Edition", 0m),
                    ("NEON-JOY", "Neon Blue / Red Edition", 0m)
                ]),
            new ProductTemplate("gaming-consoles", "Valve Steam Deck OLED 512GB Gaming Handheld", "steam-deck-oled-512gb", "STMDK512", 68000m, 82000m,
                "7.4-inch 90Hz HDR OLED display with customized AMD APU, Wi-Fi 6E, longer 50Wh battery life, and premium carrying case.",
                [
                    "https://images.unsplash.com/photo-1605901309584-818e25960a8f?auto=format&fit=crop&w=1000&q=80"
                ],
                [
                    ("512GB-OLED", "512GB NVMe / 90Hz HDR OLED", 0m),
                    ("1TB-ETCHED", "1TB Anti-Glare Etched Glass", 16000m)
                ]),

            // Chargers & Accessories
            new ProductTemplate("chargers-accessories", "CalDigit TS4 Thunderbolt 4 Dock 18-Port (98W PD)", "caldigit-ts4-thunderbolt-4-dock", "CALTS4", 44000m, 52000m,
                "18 ports of extreme connectivity: Dual 6K display support, 2.5 Gigabit Ethernet, UHS-II SD/microSD slots, and 98W host charging.",
                [
                    "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1000&q=80"
                ],
                [
                    ("TS4-STD", "18 Ports / 40Gbps / Dual 6K", 0m)
                ]),
            new ProductTemplate("chargers-accessories", "Anker Prime 20,000mAh Power Bank (200W Output)", "anker-prime-20000-200w", "ANKP200W", 14500m, 18000m,
                "Two ultra-fast USB-C ports delivering up to 200W combined power with smart digital display showing live voltage & battery health.",
                [
                    "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=1000&q=80"
                ],
                [
                    ("200W-BLK", "200W Output / Smart Digital Display", 0m)
                ]),
            new ProductTemplate("chargers-accessories", "Belkin BoostCharge Pro 3-in-1 MagSafe 15W Stand", "belkin-boostcharge-pro-3in1", "BELK3IN1", 18500m, 23000m,
                "Official Apple MagSafe certified 15W wireless charging stand for iPhone, Apple Watch fast charging, and AirPods tray.",
                [
                    "https://images.unsplash.com/photo-1622445262464-84b1456045b6?auto=format&fit=crop&w=1000&q=80"
                ],
                [
                    ("BLK-15W", "Black / 15W Fast Charge", 0m),
                    ("WHT-15W", "White / 15W Fast Charge", 0m)
                ])
        };

        var conditionTiers = new[]
        {
            ("Brand New Sealed", "Authentic manufacturer sealed packaging with full warranty."),
            ("Open Box - Like New", "Inspected open box unit with 100% cosmetic perfection & all accessories."),
            ("Certified Pre-Owned (Grade A+)", "Laboratory inspected unit with 95%+ battery health and pristine casing."),
            ("Refurbished - Certified", "Thoroughly tested and restored with certified original components.")
        };

        // Disable change tracking auto-detection for maximum bulk insertion performance
        context.ChangeTracker.AutoDetectChangesEnabled = false;

        const int batchSize = 500;
        var productsBatch = new List<Product>(batchSize);
        var stockBatch = new List<StockItem>(batchSize * 2);

        for (int i = 0; i < needed; i++)
        {
            var itemIndex = existingCount + i + 1;
            var tpl = templates[i % templates.Length];
            var cond = conditionTiers[(i / templates.Length) % conditionTiers.Length];
            var cat = categoryMap[tpl.CategorySlug];

            var name = $"{tpl.Name} - {cond.Item1} (#{itemIndex:D5})";
            var slug = $"{tpl.SlugPrefix}-unit-{itemIndex:D5}";
            var priceVariation = ((itemIndex % 11) * 350m) - ((itemIndex % 7) * 150m);
            var basePrice = Math.Max(1200m, tpl.BasePrice + priceVariation);
            var originalPrice = tpl.OriginalPrice + ((itemIndex % 5) * 500m);
            var isFeatured = (itemIndex % 40) == 0;

            var description = $"{tpl.Description}\n\n[Diagnostic Certification #{itemIndex:D5}]\n" +
                              $"• Condition: {cond.Item1} ({cond.Item2})\n" +
                              $"• Verification: Passed comprehensive hardware test & diagnostic check\n" +
                              $"• Guarantee: 7-Day Instant Replacement + 2-Year Store Service Care\n" +
                              $"• In the Box: Device, certified accessories, and cash invoice memo.";

            var product = new Product(name, slug, basePrice, description, cat.Id, originalPrice, isFeatured)
            {
                Id = DeterministicGuid("bulk-prod:" + slug)
            };

            // Add images
            for (int imgIdx = 0; imgIdx < tpl.ImageUrls.Length; imgIdx++)
            {
                var img = new ProductImage(product.Id, tpl.ImageUrls[imgIdx], $"{tpl.Name} View {imgIdx + 1}", imgIdx + 1, imgIdx == 0)
                {
                    Id = DeterministicGuid($"bulk-img:{slug}:{imgIdx}")
                };
                product.Images.Add(img);
            }

            // Add variants & stock
            for (int vIdx = 0; vIdx < tpl.VariantOptions.Length; vIdx++)
            {
                var opt = tpl.VariantOptions[vIdx];
                var vSku = $"{tpl.SkuPrefix}-{itemIndex:D5}-{opt.VariantSuffix}";
                var variant = new ProductVariant(product.Id, vSku, opt.VariantName, opt.PriceAdj)
                {
                    Id = DeterministicGuid("bulk-var:" + vSku)
                };
                product.Variants.Add(variant);

                var initialStock = 5 + (itemIndex % 35);
                var stockItem = new StockItem(variant.Id, initialStock)
                {
                    Id = DeterministicGuid("bulk-stock:" + variant.Id)
                };
                stockBatch.Add(stockItem);
            }

            productsBatch.Add(product);

            if (productsBatch.Count >= batchSize)
            {
                context.Products.AddRange(productsBatch);
                context.StockItems.AddRange(stockBatch);
                await context.SaveChangesAsync(ct);
                context.ChangeTracker.Clear();
                productsBatch.Clear();
                stockBatch.Clear();
            }
        }

        if (productsBatch.Count > 0)
        {
            context.Products.AddRange(productsBatch);
            context.StockItems.AddRange(stockBatch);
            await context.SaveChangesAsync(ct);
            context.ChangeTracker.Clear();
        }

        context.ChangeTracker.AutoDetectChangesEnabled = true;

        return await context.Products.CountAsync(ct);
    }
}
