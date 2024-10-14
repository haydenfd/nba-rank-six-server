const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

const createSolutionMap = (sorted_players) => {
    const map = {};
    sorted_players.forEach((player, idx) => {
        map[player.PLAYER_ID] = idx;
    });
    return map;
};

const sortPlayersByDescPPG = (players) => {
    let clonedPlayers = structuredClone(players);
    clonedPlayers = clonedPlayers.sort((a, b) => b.PPG - a.PPG);
    return clonedPlayers;
}

export { shuffleArray, createSolutionMap, sortPlayersByDescPPG };