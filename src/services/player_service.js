import Players from "../models/players_schema.js";
import { CORRECT_GUESSES } from "../utils/globals.js";
import { shuffleArray, sortPlayersByDescPPG, createSolutionMap } from "../utils/player_utils.js";

async function fetchPlayersService() {
    try {
        let players = await Players.aggregate([{ $sample: { size: CORRECT_GUESSES } }, { $project: { _id: 0, __v: 0 } }]);

        // console.log(players);
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