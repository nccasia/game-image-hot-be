import mongoose, { Schema, Document } from 'mongoose';

export interface ITransactionHistory extends Document {
  tx_hash: string;
  contract: string;
  event: string;
  chain_id: number;
  user_address: string;
  itx: string;
  game_id: string;
  user_id: string;
  total_reward: number;
  amount: number;
  players: string[];
  player_wallets: string[];
  player_bets: number[];
  winner: string;
  winner_amount: number;
  currency_type: string;
  timestamp: number;
  status: boolean;
  signature: string;

  getInfo(): Omit<ITransactionHistory, '_id' | '__v' | 'getInfo'>;
}

const TransactionHistorySchema: Schema<ITransactionHistory> = new Schema(
  {
    tx_hash: { type: String, default: '' },
    contract: { type: String, default: '' },
    event: { type: String, default: '' },
    chain_id: { type: Number, default: 0 },
    user_address: { type: String, default: '' },
    itx: { type: String, default: '' },
    game_id: { type: String, default: '' },
    user_id: { type: String, default: '' },
    amount: { type: Number, default: 0 },
    players: { type: [String], default: [] }, 
    player_wallets: { type: [String], default: [] }, 
    player_bets: { type: [Number], default: [] },
    winner: { type: String, default: '' }, 
    winner_amount: { type: Number, default: 0 },
    currency_type: { type: String, default: '' },
    timestamp: { type: Number, default: 0 },
    status: { type: Boolean, default: false },
    signature: { type: String, default: '' },
  },
  { timestamps: true }
);

TransactionHistorySchema.methods.getInfo = function () {
  return {
    tx_hash: this.tx_hash,
    contract: this.contract,
    event: this.event,
    chain_id: this.chain_id,
    user_address: this.user_address,
    itx: this.itx,
    game_id: this.game_id,
    user_id: this.user_id,
    amount: this.amount,
    players: this.players,
    player_wallets: this.player_wallets,
    player_bets: this.player_bets,
    winner: this.winner,
    winner_amount: this.winner_amount,
    currency_type: this.currency_type,
    timestamp: this.timestamp,
    status: this.status,
  };
};

const TransactionHistory = mongoose.model<ITransactionHistory>('TransactionHistory', TransactionHistorySchema);
export default TransactionHistory;
