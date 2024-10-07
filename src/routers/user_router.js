import express from 'express';
import User from '../schemas/user_schema.js';
import Session from '../schemas/session_schema.js';
import Players from '../schemas/players_schema.js';

const router = express.Router();

// Utility funcs
async function fetchRandomPlayers() {
    try {

        const randomPlayers = await Players.aggregate([
            { $sample: { size: 5 } },
            { $project: { _id: 0, __v: 0 } } 

        ]);
      return randomPlayers;

    } catch (error) {
      console.error('Error fetching random players:', error);
      throw error;
    }
  }

function createSolutionMapping(players) {
    players.sort((a, b) => b.PPG - a.PPG);
    const map = {};
    players.forEach((player, idx) => {
        map[player.PLAYER_ID] = idx;
    });

    return map;
}

const createNewUserId = () => {
    const dateString = Date.now().toString();
    const randomPrefix = Math.floor(Math.random() * 100) + 1;
    const randomSuffix = Math.floor(Math.random() * 100) + 1;

    return `${randomPrefix}${dateString}${randomSuffix}`
}

async function checkIfUserExists(user_id) {
      const user = await User.findOne({ user_id });
      if (user) {
        return true; 
      } else {
        return false;
      }
}

const createNewSessionId = () => {
    return Math.random().toString(36).slice(2, 15); 
}

const initiateSession = async (user_id) => {
    const newSessionId = createNewSessionId();

    try {

        let randomPlayers = await fetchRandomPlayers();
        const solutionMap = createSolutionMapping(randomPlayers);


        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {

              const j = Math.floor(Math.random() * (i + 1));
          
              [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
          }
        
        randomPlayers = shuffleArray(randomPlayers);

        const newSessionObject = {
            user_id: user_id,
            session_id: newSessionId,
            session_status: 0,
            attempts: 0,
            players: randomPlayers,
            solution_map: solutionMap,
        };

        console.log(newSessionObject);
        const newSession = new Session(newSessionObject);

        // console.log(newSession);
        await newSession.save();

        return { newSessionId, randomPlayers, solutionMap }
    } catch(e) {
        return false;
    }
}

async function addUser(user_id) {
    try {
        const newUser = new User({
            user_id: user_id
        });
        
        await newUser.save();

        return true;
    } catch (error) {
        return false; // Will this ever run?
    }


}

router.post('/create', async (req, res) => {

    const newId = createNewUserId();
    const doesIdExist = await checkIfUserExists(newId);

    if (!doesIdExist) {
        const userAdded = await addUser(newId); 
        if (userAdded) {
            const {newSessionId, randomPlayers, solutionMap} = await initiateSession(newId);
            if (newSessionId) {
                return res.status(201).json({ "user_id": newId, "session_id": newSessionId, "players": randomPlayers, "solution_map": solutionMap});
            }

            return res.status(500).json({message: 'Could not initiate session'});
        } else {
            return res.status(500).json({ message: 'Error adding user' });
        }
    } else {
        return res.status(409).json({ message: 'User already exists' }); 
    }
})

export default router;

