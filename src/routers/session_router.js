import express from 'express';
import Session from '../schemas/session_schema.js';
import Players from '../schemas/players_schema.js';

const router = express.Router();

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
            session_active: true,
            players: randomPlayers,
            solution_map: solutionMap,
        };

        const newSession = new Session(newSessionObject);

        // console.log(newSession);
        await newSession.save();

        return { newSessionId, randomPlayers, solutionMap }
    } catch(e) {
        return false;
    }
}



router.get('/retrieve/:user_id/:session_id', async (req, res) => {

    const user_id = req.params.user_id;
    const session_id = req.params.session_id;

    try {
        const session = await Session.findOne({ user_id, session_id });
        
        if (!session) {
          return res.status(404).send('Session not found');
        }

        res.status(200).json(session);

      } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
      }    

})

router.post('/create', async (req, res) => {

    // return res.json({user_id: req.body.user_id});
    const user_id = req.body.user_id;

    const new_id = createNewSessionId();
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
        session_id: new_id,
        players: randomPlayers,
        solution_map: solutionMap,
    };

    const newSession = new Session(newSessionObject);
    await newSession.save();

    res.status(201).json(newSession);
    // const {newSessionId, randomPlayers, solutionMap} = await initiateSession(user_id);
    // console.log("POOPOO");
    // if (newSessionId) {
    //     const data = {"session_id": newSessionId, "session_active": true, "players": randomPlayers, "solution_map": solutionMap};
    //     console.log(data);
    //     res.status(201).json(data);
    // }

    // return res.status(500).json({message: 'Could not initiate session'});
})


// router.put('/update/:user_id/:session_id', async (req, res) => {

//     const {user_id, session_id} = req.params;
//     const updatedSessionData = req.body;
//     console.log(updatedSessionData);

//     try {

//         const session = await Session.findOneAndUpdate(
//           { user_id: user_id, session_id: session_id }, 
//           { $set: updatedSessionData }, 
//           { new: true }
//         );
    
//         if (!session) {
//           return res.status(404).json({ message: 'Session not found' });
//         }
    
//         res.status(200).json(session);
//       } catch (error) {
//         res.status(500).json({ message: 'Error updating session', error });
//       }
// })

export default router;