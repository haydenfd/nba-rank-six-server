import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
    user_id: { type: String, required: true }, 
    session_id: { type: String, required: true},
    session_status: { type: Number, default: 0 }, // 0 -> active; 1 -> won; -1 -> lost
    players: { type: [{
      PLAYER_NAME: { type: String, required: true }, 
      PLAYER_ID: { type: String, required: true, },
      FROM_YEAR: { type: Number, required: true },
      TO_YEAR: {type: Number, required: true},
      PPG: {type: Number, required: true},
      GP: {type: Number, required: true},
      EXP: {type: Number, required: true},
    }],
  },
  attempts: { type: Number, default: 0},
  solution_map: {
    type: Map,
    of: String,
  }
  }, { collection: 'rank-five-sessions' });
  
const Session = mongoose.model('Session', sessionSchema);

export default Session;