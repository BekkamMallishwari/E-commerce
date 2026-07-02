const db = require("../config/db");
const { INTERACTION_TYPES } = require("../constants/interactionTypes");

const recommendationService = {
  getRecommendations: async (userId, limit = 8) => {
    try {
      // 1. Fetch recent interactions for the user
      // We weight purchases higher than views
      const [interactions] = await db.query(
        `
        SELECT ui.interaction_type, p.category
        FROM user_interactions ui
        JOIN products p ON ui.product_id = p.id
        WHERE ui.user_id = ?
        ORDER BY ui.created_at DESC
        LIMIT 100
      `,
        [userId]
      );

      if (!interactions || interactions.length === 0) {
        // Fallback: Return best-selling or high rated featured products
        const [fallbackProducts] = await db.query(
          `
          SELECT * FROM products
          WHERE stock > 0
          ORDER BY rating DESC, num_reviews DESC
          LIMIT ?
        `,
          [limit]
        );
        return fallbackProducts;
      }

      // 2. Calculate category weights using shared interaction type constants
      const weights = {
        [INTERACTION_TYPES.PURCHASE]: 5,
        [INTERACTION_TYPES.CART_ADD]: 3,
        [INTERACTION_TYPES.WISHLIST_ADD]: 2,
        [INTERACTION_TYPES.VIEW]: 1,
      };

      const categoryScores = {};
      interactions.forEach((item) => {
        if (!item.category) return;

        const weight = weights[item.interaction_type] || 1;
        categoryScores[item.category] =
          (categoryScores[item.category] || 0) + weight;
      });

      // Sort categories by score descending
      const topCategories = Object.entries(categoryScores)
        .sort((a, b) => b[1] - a[1])
        .map((entry) => entry[0]);

      if (topCategories.length === 0) {
        // Fallback
        const [fallbackProducts] = await db.query(
          `
          SELECT * FROM products
          WHERE stock > 0
          ORDER BY rating DESC
          LIMIT ?
        `,
          [limit]
        );
        return fallbackProducts;
      }

      // 3. Exclude purchased products from recommendations
      const [purchased] = await db.query(
        `
        SELECT product_id
        FROM user_interactions
        WHERE user_id = ? AND interaction_type = ?
      `,
        [userId, INTERACTION_TYPES.PURCHASE]
      );

      const purchasedIds = purchased.map((p) => p.product_id);

      // Create placeholders for categories
      const categoryPlaceholders = topCategories.map(() => "?").join(",");

      let query = `
        SELECT * FROM products
        WHERE category IN (${categoryPlaceholders})
        AND stock > 0
      `;

      const queryParams = [...topCategories];

      if (purchasedIds.length > 0) {
        const idPlaceholders = purchasedIds.map(() => "?").join(",");
        query += ` AND id NOT IN (${idPlaceholders})`;
        queryParams.push(...purchasedIds);
      }

      query += ` ORDER BY rating DESC LIMIT ?`;
      queryParams.push(limit);

      const [recommendedProducts] = await db.query(query, queryParams);

      return recommendedProducts;
    } catch (error) {
      console.error("Error generating recommendations:", error);
      throw error;
    }
  },
};

module.exports = recommendationService;