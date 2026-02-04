/**
 * Two-Tower Recommendation Engine
 *
 * This implements a simplified two-tower neural network architecture for recommendations:
 * - User Tower: Encodes user preferences from behavior signals
 * - Item Tower: Encodes content features
 *
 * The towers produce embeddings that are compared using cosine similarity.
 *
 * In production, this would use TensorFlow.js or similar for actual neural network inference.
 */

interface BehaviorSignal {
  type: 'view' | 'like' | 'share' | 'skip' | 'complete' | 'search' | 'follow' | 'report';
  itemId?: string;
  timestamp: Date;
  duration?: number;
  weight?: number;
  metadata?: Record<string, unknown>;
}

interface UserProfile {
  categoryWeights: Record<string, number>;
  tagWeights: Record<string, number>;
  embedding: number[];
  diversityFactor: number;
  recencyBias: number;
}

// Content category embeddings (pre-computed in production)
const CATEGORY_EMBEDDINGS: Record<string, number[]> = {
  Entertainment: [0.8, 0.6, 0.3, 0.5],
  Food: [0.3, 0.2, 0.9, 0.4],
  Sports: [0.5, 0.4, 0.3, 0.9],
  Technology: [0.9, 0.3, 0.4, 0.2],
  Comedy: [0.7, 0.8, 0.4, 0.3],
  Fashion: [0.4, 0.7, 0.5, 0.6],
  Music: [0.6, 0.9, 0.2, 0.4],
  Education: [0.8, 0.2, 0.6, 0.3],
};

// Tag embeddings (simplified)
const TAG_EMBEDDINGS: Record<string, number[]> = {
  dance: [0.2, 0.9, 0.3, 0.4],
  food: [0.3, 0.2, 0.9, 0.3],
  football: [0.4, 0.3, 0.2, 0.9],
  music: [0.5, 0.9, 0.2, 0.3],
  comedy: [0.6, 0.8, 0.3, 0.2],
  tech: [0.9, 0.2, 0.3, 0.4],
  fashion: [0.3, 0.6, 0.5, 0.5],
  viral: [0.7, 0.7, 0.7, 0.7],
  africa: [0.5, 0.5, 0.5, 0.5],
  recipe: [0.4, 0.3, 0.8, 0.2],
};

// Behavior type weights
const BEHAVIOR_WEIGHTS: Record<string, number> = {
  view: 1.0,
  like: 3.0,
  share: 5.0,
  complete: 2.0,
  follow: 4.0,
  search: 2.5,
  skip: -1.0,
  report: -5.0,
};

export class TwoTowerRecommendationEngine {
  private embeddingDim = 4;
  private userEmbeddingCache = new Map<string, number[]>();

  constructor() {
    // Initialize with default embeddings
  }

  /**
   * Build user profile from behavior signals
   */
  buildUserProfile(signals: BehaviorSignal[]): UserProfile {
    const categoryWeights: Record<string, number> = {};
    const tagWeights: Record<string, number> = {};
    let embedding = new Array(this.embeddingDim).fill(0);
    let totalWeight = 0;

    // Process signals with time decay
    const now = Date.now();

    for (const signal of signals) {
      const age = now - new Date(signal.timestamp).getTime();
      const timeDecay = Math.exp(-age / (7 * 24 * 60 * 60 * 1000)); // 7-day half-life

      const baseWeight = BEHAVIOR_WEIGHTS[signal.type] || 1;
      const weight = baseWeight * timeDecay * (signal.weight || 1);

      // Extract item features (in production, lookup from database)
      const itemCategory = this.getItemCategory(signal.itemId);
      const itemTags = this.getItemTags(signal.itemId);

      // Update category weights
      if (itemCategory) {
        categoryWeights[itemCategory] = (categoryWeights[itemCategory] || 0) + weight;

        // Add category embedding to user embedding
        const catEmb = CATEGORY_EMBEDDINGS[itemCategory];
        if (catEmb) {
          embedding = embedding.map((v, i) => v + catEmb[i] * weight);
          totalWeight += Math.abs(weight);
        }
      }

      // Update tag weights
      for (const tag of itemTags) {
        tagWeights[tag] = (tagWeights[tag] || 0) + weight;

        const tagEmb = TAG_EMBEDDINGS[tag];
        if (tagEmb) {
          embedding = embedding.map((v, i) => v + tagEmb[i] * weight * 0.5);
        }
      }
    }

    // Normalize embedding
    if (totalWeight > 0) {
      embedding = embedding.map((v) => v / totalWeight);
    } else {
      // Default embedding for new users (exploration-focused)
      embedding = [0.5, 0.5, 0.5, 0.5];
    }

    // Normalize to unit vector
    const norm = Math.sqrt(embedding.reduce((sum, v) => sum + v * v, 0));
    if (norm > 0) {
      embedding = embedding.map((v) => v / norm);
    }

    // Calculate diversity factor (higher = user likes variety)
    const uniqueCategories = Object.keys(categoryWeights).length;
    const diversityFactor = Math.min(uniqueCategories / 5, 1);

    // Calculate recency bias (how much user prefers recent content)
    const recencyBias = signals.length > 0 ? 0.7 : 0.5;

    return {
      categoryWeights,
      tagWeights,
      embedding,
      diversityFactor,
      recencyBias,
    };
  }

  /**
   * Compute recommendation score between user and item
   */
  computeScore(userProfile: UserProfile, itemEmbedding: number[]): number {
    // Base similarity from embeddings
    const embeddingSimilarity = this.cosineSimilarity(userProfile.embedding, itemEmbedding);

    // Exploration bonus for diverse users
    const explorationBonus = userProfile.diversityFactor * 0.1 * Math.random();

    // Combine scores
    const score = embeddingSimilarity * 0.8 + explorationBonus;

    // Add small random factor for serendipity
    return score + Math.random() * 0.05;
  }

  /**
   * Cosine similarity between two vectors
   */
  cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    if (denominator === 0) return 0;

    return dotProduct / denominator;
  }

  /**
   * Update model from new behavior signal
   */
  updateFromBehavior(signal: BehaviorSignal): void {
    // In production, this would update online learning models
    // For now, we just log it
    console.log(`Behavior recorded: ${signal.type} on ${signal.itemId}`);
  }

  /**
   * Generate item embedding from features
   */
  generateItemEmbedding(category: string, tags: string[]): number[] {
    let embedding = new Array(this.embeddingDim).fill(0);
    let count = 0;

    // Add category embedding
    if (CATEGORY_EMBEDDINGS[category]) {
      embedding = CATEGORY_EMBEDDINGS[category].slice();
      count++;
    }

    // Add tag embeddings
    for (const tag of tags) {
      if (TAG_EMBEDDINGS[tag]) {
        embedding = embedding.map((v, i) => v + TAG_EMBEDDINGS[tag][i]);
        count++;
      }
    }

    // Average
    if (count > 0) {
      embedding = embedding.map((v) => v / count);
    }

    // Normalize
    const norm = Math.sqrt(embedding.reduce((sum, v) => sum + v * v, 0));
    if (norm > 0) {
      embedding = embedding.map((v) => v / norm);
    }

    return embedding;
  }

  /**
   * Mock functions for item feature lookup
   * In production, these would query a database
   */
  private getItemCategory(itemId?: string): string | null {
    if (!itemId) return null;
    const categories = ['Entertainment', 'Food', 'Sports', 'Comedy', 'Technology', 'Fashion'];
    const index = parseInt(itemId.split('-')[0], 10) % categories.length;
    return categories[index];
  }

  private getItemTags(itemId?: string): string[] {
    if (!itemId) return [];
    const allTags = Object.keys(TAG_EMBEDDINGS);
    const baseId = parseInt(itemId.split('-')[0], 10);
    return [
      allTags[baseId % allTags.length],
      allTags[(baseId + 1) % allTags.length],
    ];
  }
}
