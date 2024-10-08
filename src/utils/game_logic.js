const MAX_ATTEMPTS = 3;
const CORRECT_GUESSES = 5;

const generateScoresArray = (guesses, solution_map) => {

    const temp_scores = [];
  
    for (let i = 0; i < guesses.length; i++) {
        const currPlayerId = guesses[i].PLAYER_ID;
        // console.log(`curr player id: ${currPlayerId}`)
        const currPlayerCorrectIdx = solution_map.get(currPlayerId);
        // console.log(`curr player correct idx: ${currPlayerCorrectIdx}`)
        let diff = Math.abs(i - currPlayerCorrectIdx);
        if (diff > 0) {
            diff = 1;
        }
        temp_scores.push(diff);
    }

    // console.log(temp_scores);
    
    return temp_scores;
};

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {

      const j = Math.floor(Math.random() * (i + 1));
  
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }


export {
    generateScoresArray,
    MAX_ATTEMPTS, 
    CORRECT_GUESSES,
    shuffleArray,
};