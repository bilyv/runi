import { query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getGeneralReport = query({
    args: {
        startDate: v.number(),
        endDate: v.number(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const products = await ctx.db
            .query("products")
            .withIndex("by_user", (q) => q.eq("user_id", userId))
            .collect();

        const sales = await ctx.db
            .query("sales")
            .withIndex("by_user", (q) => q.eq("user_id", userId))
            .collect();

        const damaged = await ctx.db
            .query("damaged_products")
            .withIndex("by_user", (q) => q.eq("user_id", userId))
            .collect();

        const restocks = await ctx.db
            .query("restock")
            .withIndex("by_user", (q) => q.eq("user_id", userId))
            .collect();

        const reportData = products.map(product => {
            const productSales = sales.filter(s => s.product_id === product._id && s.updated_at >= args.startDate && s.updated_at <= args.endDate);
            const productDamaged = damaged.filter(d => d.product_id === product._id && d.updated_at >= args.startDate && d.updated_at <= args.endDate);
            const productRestocks = restocks.filter(r => r.product_id === product._id && r.updated_at >= args.startDate && r.updated_at <= args.endDate);

            // Period Sales
            const boxesSold = productSales.reduce((sum, s) => sum + s.boxes_quantity, 0);
            const kgSold = productSales.reduce((sum, s) => sum + s.kg_quantity, 0);
            const salesAmount = productSales.reduce((sum, s) => sum + s.total_amount, 0);

            // Unpaid Sales (Partial/Pending)
            const unpaidSales = productSales.filter(s => s.payment_status !== "completed");
            const unpaidBoxes = unpaidSales.reduce((sum, s) => sum + s.boxes_quantity, 0);
            const unpaidKg = unpaidSales.reduce((sum, s) => sum + s.kg_quantity, 0);
            const unpaidAmount = unpaidSales.reduce((sum, s) => sum + s.remaining_amount, 0);

            // Damaged
            const boxesDamaged = productDamaged.reduce((sum, d) => sum + d.damaged_boxes, 0);
            const kgDamaged = productDamaged.reduce((sum, d) => sum + d.damaged_kg, 0);
            const damageAmount = productDamaged.reduce((sum, d) => sum + d.loss_value, 0);

            // New Stock
            const boxesAdded = productRestocks.reduce((sum, r) => sum + r.boxes_added, 0);
            const kgAdded = productRestocks.reduce((sum, r) => sum + r.kg_added, 0);

            // Stock levels (Rough calculation: Current - Late Movements + Early Movements is complex)
            // For this report, we'll use current as closing and work backwards for opening
            const closingBoxes = product.quantity_box;
            const closingKg = product.quantity_kg;

            const openingBoxes = closingBoxes - (boxesAdded - boxesSold - boxesDamaged);
            const openingKg = closingKg - (kgAdded - kgSold - kgDamaged);

            return {
                productName: product.name,
                openingStock: { boxes: openingBoxes, kg: openingKg },
                newStock: { boxes: boxesAdded, kg: kgAdded },
                damagedStock: { boxes: boxesDamaged, kg: kgDamaged, amount: damageAmount },
                closingStock: { boxes: closingBoxes, kg: closingKg },
                unpaidSales: { boxes: unpaidBoxes, kg: unpaidKg, amount: unpaidAmount },
                sales: { boxes: boxesSold, kg: kgSold, amount: salesAmount },
                unitPrice: { box: product.cost_per_box, kg: product.cost_per_kg },
                sellingPrice: { box: product.price_per_box, kg: product.price_per_kg },
                profit: {
                    box: product.profit_per_box,
                    kg: product.profit_per_kg,
                    total: (boxesSold * product.profit_per_box) + (kgSold * product.profit_per_kg)
                }
            };
        });

        return reportData;
    },
});

export const getDetailedSalesReport = query({
    args: {
        startDate: v.number(),
        endDate: v.number(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const sales = await ctx.db
            .query("sales")
            .withIndex("by_user", (q) => q.eq("user_id", userId))
            .collect();

        const products = await ctx.db
            .query("products")
            .withIndex("by_user", (q) => q.eq("user_id", userId))
            .collect();

        const productMap = new Map(products.map(p => [p._id, p.name]));

        const filteredSales = sales.filter(s => s.updated_at >= args.startDate && s.updated_at <= args.endDate);

        return filteredSales.map(s => ({
            date: s.updated_at,
            productName: productMap.get(s.product_id) || "Unknown",
            quantitySold: `${s.boxes_quantity} boxes, ${s.kg_quantity.toFixed(2)} kg`,
            clientName: s.client_name,
            unitPrice: `$${s.box_price.toFixed(2)}/box, $${s.kg_price.toFixed(2)}/kg`,
            sellingPrice: `$${s.box_price.toFixed(2)}/box, $${s.kg_price.toFixed(2)}/kg`,
            profit: (s.boxes_quantity * s.profit_per_box) + (s.kg_quantity * s.profit_per_kg),
            total: s.total_amount,
            seller: "System User", // We'd need to join with users/staff table for real names
            paymentStatus: s.payment_status.charAt(0).toUpperCase() + s.payment_status.slice(1),
            saleDate: s.updated_at,
            paymentMethod: s.payment_method
        }));
    },
});

export const getTopSellingReport = query({
    args: {
        startDate: v.number(),
        endDate: v.number(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const sales = await ctx.db
            .query("sales")
            .withIndex("by_user", (q) => q.eq("user_id", userId))
            .collect();

        const damaged = await ctx.db
            .query("damaged_products")
            .withIndex("by_user", (q) => q.eq("user_id", userId))
            .collect();

        const products = await ctx.db
            .query("products")
            .withIndex("by_user", (q) => q.eq("user_id", userId))
            .collect();

        const report = products.map(product => {
            const productSales = sales.filter(s => s.product_id === product._id && s.updated_at >= args.startDate && s.updated_at <= args.endDate);
            const productDamaged = damaged.filter(d => d.product_id === product._id && d.updated_at >= args.startDate && d.updated_at <= args.endDate);

            const totalSoldBoxes = productSales.reduce((sum, s) => sum + s.boxes_quantity, 0);
            const totalSoldKg = productSales.reduce((sum, s) => sum + s.kg_quantity, 0);
            const totalRevenue = productSales.reduce((sum, s) => sum + s.total_amount, 0);

            const totalDamagedKg = productDamaged.reduce((sum, d) => sum + d.damaged_kg, 0);
            const totalHandledKg = (product.quantity_kg + totalSoldKg + totalDamagedKg);
            const damageRate = totalHandledKg > 0 ? (totalDamagedKg / totalHandledKg) * 100 : 0;

            return {
                product: product.name,
                totalSold: `${totalSoldBoxes} boxes + ${totalSoldKg.toFixed(2)} kg`,
                totalRevenue,
                damageRate: damageRate.toFixed(2) + "%"
            };
        });

        return report.sort((a, b) => parseFloat(b.totalSold) - parseFloat(a.totalSold));
    },
});

export const getDebtorReport = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const sales = await ctx.db
            .query("sales")
            .withIndex("by_user", (q) => q.eq("user_id", userId))
            .collect();

        const debtors = sales.filter(s => s.payment_status !== "completed");

        // Group by client
        const clientMap = new Map();
        debtors.forEach(s => {
            const existing = clientMap.get(s.client_id) || {
                clientName: s.client_name,
                amountOwed: 0,
                amountPaid: 0,
                phoneNumber: s.phone_number || "N/A",
                email: "N/A"
            };
            existing.amountOwed += s.remaining_amount;
            existing.amountPaid += s.amount_paid;
            clientMap.set(s.client_id, existing);
        });

        return Array.from(clientMap.values());
    },
});

export const getProfitLossReport = query({
    args: {
        startDate: v.number(),
        endDate: v.number(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const sales = await ctx.db.query("sales").withIndex("by_user", (q) => q.eq("user_id", userId)).collect();
        const expenses = await ctx.db.query("expenses").withIndex("by_user", (q) => q.eq("userId", userId)).collect();
        const damaged = await ctx.db.query("damaged_products").withIndex("by_user", (q) => q.eq("user_id", userId)).collect();
        const deposits = await ctx.db.query("deposit").withIndex("by_user_id", (q) => q.eq("user_id", userId.toString())).collect();
        const products = await ctx.db.query("products").withIndex("by_user", (q) => q.eq("user_id", userId)).collect();

        const filteredSales = sales.filter(s => s.updated_at >= args.startDate && s.updated_at <= args.endDate);
        const filteredExpenses = expenses.filter(e => e.date >= args.startDate && e.date <= args.endDate);
        const filteredDamaged = damaged.filter(d => d.updated_at >= args.startDate && d.updated_at <= args.endDate);
        const filteredDeposits = deposits.filter(d => d.updated_at >= args.startDate && d.updated_at <= args.endDate);

        const totalRevenue = filteredSales.reduce((sum, s) => sum + s.total_amount, 0);
        const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
        const totalDeposits = filteredDeposits.reduce((sum, d) => sum + d.amount, 0);
        const damagedValue = filteredDamaged.reduce((sum, d) => sum + d.loss_value, 0);

        // Calc cost of stock sold
        const costOfStock = filteredSales.reduce((sum, s) => {
            return sum + (s.boxes_quantity * (s.box_price - s.profit_per_box)) + (s.kg_quantity * (s.kg_price - s.profit_per_kg));
        }, 0);

        const paymentMethods: Record<string, { count: number, total: number }> = {};
        filteredSales.forEach(s => {
            const method = s.payment_method || "Unknown";
            if (!paymentMethods[method]) paymentMethods[method] = { count: 0, total: 0 };
            paymentMethods[method].count++;
            paymentMethods[method].total += s.total_amount;
        });

        const productSales: Record<string, { name: string, qty: number, revenue: number }> = {};
        filteredSales.forEach(s => {
            if (!productSales[s.product_id]) {
                const p = products.find(p => p._id === s.product_id);
                productSales[s.product_id] = { name: p?.name || "Unknown", qty: 0, revenue: 0 };
            }
            productSales[s.product_id].qty += s.boxes_quantity;
            productSales[s.product_id].revenue += s.total_amount;
        });

        const topSelling = Object.entries(productSales)
            .map(([id, data]) => ({ id, ...data }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

        return {
            period: `${new Date(args.startDate).toLocaleDateString()} to ${new Date(args.endDate).toLocaleDateString()}`,
            totalRevenue,
            totalExpenses,
            totalDeposits,
            netProfit: totalRevenue - totalExpenses - costOfStock - damagedValue,
            salesCount: filteredSales.length,
            expenseCount: filteredExpenses.length,
            depositCount: filteredDeposits.length,
            avgSaleAmount: filteredSales.length > 0 ? totalRevenue / filteredSales.length : 0,
            topSellingProducts: topSelling,
            salesByPaymentMethod: Object.entries(paymentMethods).map(([method, data]) => ({ method, ...data })),
            costOfStock,
            damagedValue
        };
    },
});
