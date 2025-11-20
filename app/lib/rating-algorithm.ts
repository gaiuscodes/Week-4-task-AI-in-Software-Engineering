// app/lib/rating-algorithm.ts
// Rating calculation algorithm

interface RatingData {
  safetyScore: number;
  cleanlinessScore: number;
  comfortScore?: number | null;
  punctualityScore?: number | null;
}

interface CalculatedRating {
  avgRating: number;
  ratingCount: number;
  safetyScore: number;
  cleanlinessScore: number;
}

export function calculateVehicleRating(ratings: RatingData[]): CalculatedRating {
  if (ratings.length === 0) {
    return {
      avgRating: 0,
      ratingCount: 0,
      safetyScore: 0,
      cleanlinessScore: 0,
    };
  }

  const ratingCount = ratings.length;
  
  // Calculate averages
  const safetySum = ratings.reduce((sum, r) => sum + r.safetyScore, 0);
  const cleanlinessSum = ratings.reduce((sum, r) => sum + r.cleanlinessScore, 0);
  
  // Calculate comfort and punctuality (optional scores)
  const comfortRatings = ratings.filter(r => r.comfortScore !== null && r.comfortScore !== undefined);
  const punctualityRatings = ratings.filter(r => r.punctualityScore !== null && r.punctualityScore !== undefined);
  
  const comfortSum = comfortRatings.reduce((sum, r) => sum + (r.comfortScore || 0), 0);
  const punctualitySum = punctualityRatings.reduce((sum, r) => sum + (r.punctualityScore || 0), 0);
  
  // Calculate individual averages
  const safetyScore = safetySum / ratingCount;
  const cleanlinessScore = cleanlinessSum / ratingCount;
  const comfortScore = comfortRatings.length > 0 ? comfortSum / comfortRatings.length : 0;
  const punctualityScore = punctualityRatings.length > 0 ? punctualitySum / punctualityRatings.length : 0;
  
  // Calculate overall average (weighted)
  // Safety and cleanliness are mandatory, comfort and punctuality are optional
  let totalScore = safetyScore + cleanlinessScore;
  let scoreCount = 2;
  
  if (comfortScore > 0) {
    totalScore += comfortScore;
    scoreCount++;
  }
  
  if (punctualityScore > 0) {
    totalScore += punctualityScore;
    scoreCount++;
  }
  
  const avgRating = totalScore / scoreCount;
  
  return {
    avgRating: Math.round(avgRating * 100) / 100, // Round to 2 decimal places
    ratingCount,
    safetyScore: Math.round(safetyScore * 100) / 100,
    cleanlinessScore: Math.round(cleanlinessScore * 100) / 100,
  };
}
