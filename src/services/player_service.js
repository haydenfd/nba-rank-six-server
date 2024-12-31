import Players from "../models/players_schema.js";
import { CORRECT_GUESSES } from "../utils/globals.js";
import { shuffleArray, sortPlayersByDescPPG, createSolutionMap } from "../utils/player_utils.js";

function generateBiasedK() {
    const random = Math.random(); // Random number between 0 and 1

    if (random < 0.2) {
        // 20% chance for a negative value
        return -1.3 + Math.random() * 0.5; // Random number between -1.8 and -1.0
    } else if (random < 0.7) {
        // 50% chance for a small positive value
        return 0.01 + Math.random() * 1.0; // Random number between 0.01 and 1.0
    } else {
        // 30% chance for a larger positive value
        return 1.0 + Math.random() * 2.0; // Random number between 1.0 and 3.0
    }
}


async function fetchPlayersService() {
    try {
        const meanPPG = 9.31;
        const stdDevPPG = 5.07;

        // Generate a biased `k` value and calculate the target PPG
        const k = generateBiasedK();
        const targetPPG = meanPPG + k * stdDevPPG;

        // Define the range around the target
        const rangeMin = targetPPG - 0.25 * stdDevPPG;
        const rangeMax = targetPPG + 0.25 * stdDevPPG;

        console.log(`Biased k: ${k.toFixed(2)}, Target PPG: ${targetPPG.toFixed(2)}, Range: [${rangeMin.toFixed(2)}, ${rangeMax.toFixed(2)}]`);

        // Filter players in the range and sample 6 random players
        let players = await Players.aggregate([
            {
                $match: {
                    PPG: { $gte: rangeMin, $lte: rangeMax },
                },
            },
            {
                $sample: { size: CORRECT_GUESSES }, 
            },
            {
                $project: { _id: 0, __v: 0 },
            },
        ]);

        console.log(players);
        const sorted_players = sortPlayersByDescPPG(players);
        const solution_map = createSolutionMap(sorted_players);
        
        players = shuffleArray(players);
        const result = {
            players: players,
            sorted_players: sorted_players,
            solution_map: solution_map,
        }

        return result;
        
    } catch (error) {
        console.error('Error fetching random players:', error);
        return null;
    }
}

export {
    fetchPlayersService,
};