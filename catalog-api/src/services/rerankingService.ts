const rerankingService = async () => {};

const shouldResultsBeReranked = (
  results: Movie[],
  threshold: number,
): boolean => {
  if (results.length < 2) {
    return false;
  }
};

export default rerankingService;
