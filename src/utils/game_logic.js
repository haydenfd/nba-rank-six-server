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

    return temp_scores;
};


export { generateScoresArray };
