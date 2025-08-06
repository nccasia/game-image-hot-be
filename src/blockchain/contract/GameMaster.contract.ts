import { Logger } from '../../logger/winston-logger.config';
import GameMaster from '../abi/GameMaster.json';
import { CONTRACT_EVENT } from '../../config/constant';
import { OnEventReceived } from '../../services/transaction.service';
import { ethers } from 'ethers';

const RPC_URL = process.env.RPC_URL!;
const CHAIN_ID = parseInt(process.env.CHAIN_ID!);
const MASTER_CONTRACT_ADDRESS = process.env.MASTER_CONTRACT_ADDRESS!;
const GAME_WALLET_PRIVATE_KEY = process.env.GAME_WALLET_PRIVATE_KEY!;

let provider: ethers.providers.StaticJsonRpcProvider;
let wallet: ethers.Wallet;
let gameMasterContract: ethers.Contract;
const reconnectDelay = 5000;

function createProvider() {
  Logger.info('Creating new provider...');
  return new ethers.providers.StaticJsonRpcProvider(RPC_URL, CHAIN_ID);
}

function createWallet(provider: ethers.providers.StaticJsonRpcProvider) {
  Logger.info('Creating wallet instance...');
  return new ethers.Wallet(GAME_WALLET_PRIVATE_KEY, provider);
}

function createContract(provider: ethers.providers.StaticJsonRpcProvider) {
  Logger.info('Creating contract instance...');
  return new ethers.Contract(MASTER_CONTRACT_ADDRESS, GameMaster.abi, provider);
}

function createContractWithSigner(wallet: ethers.Wallet) {
  Logger.info('Creating contract instance...');
  return new ethers.Contract(MASTER_CONTRACT_ADDRESS, GameMaster.abi, wallet);
}

function attachListeners(contract: ethers.Contract) {
  Logger.info('Attaching contract event listeners...');

  contract.on(CONTRACT_EVENT.DEPOSITED, (user_address, amount, timestamp, event) => {
    const transactionHash = event.transactionHash;
    const eventName = event.event;
    const data: any = {
      contract: event.address,
      event: eventName,
      tx_hash: transactionHash,
      chain_id: CHAIN_ID,
      user_address: user_address.toLowerCase(),
      amount: parseFloat(ethers.utils.formatEther(amount)),
      timestamp: parseInt(timestamp)
    };
    Logger.info(`Event ${eventName} data: ${JSON.stringify(data)}`);
    OnEventReceived(data);
  });

  contract.on(CONTRACT_EVENT.WITHDRAWN, (user_address, amount, timestamp, event) => {
    const transactionHash = event.transactionHash;
    const eventName = event.event;
    const data: any = {
      contract: event.address,
      event: eventName,
      tx_hash: transactionHash,
      chain_id: CHAIN_ID,
      user_address: user_address.toLowerCase(),
      amount: parseFloat(ethers.utils.formatEther(amount)),
      timestamp: parseInt(timestamp)
    };
    Logger.info(`Event ${eventName} data: ${JSON.stringify(data)}`);
    OnEventReceived(data);
  });

  contract.on(CONTRACT_EVENT.WITHDRAWN_WITH_SIGNATURE, (user_address, itx, amount, timestamp, event) => {
    const transactionHash = event.transactionHash;
    const eventName = event.event;
    const data: any = {
      contract: event.address,
      event: eventName,
      tx_hash: transactionHash,
      chain_id: CHAIN_ID,
      user_address: user_address.toLowerCase(),
      itx,
      amount: parseFloat(ethers.utils.formatEther(amount)),
      timestamp: parseInt(timestamp)
    };
    Logger.info(`Event ${eventName} data: ${JSON.stringify(data)}`);
    OnEventReceived(data);
  });

  contract.on(CONTRACT_EVENT.BET_GAME, (itx, gameId, timestamp, event) => {
    const transactionHash = event.transactionHash;
    const eventName = event.event;
    const data: any = {
      contract: event.address,
      event: eventName,
      tx_hash: transactionHash,
      chain_id: CHAIN_ID,
      //user_address: user_address.toLowerCase(),
      itx,
      game_id: gameId,
      timestamp: parseInt(timestamp)
    };
    Logger.info(`Event ${eventName} data: ${JSON.stringify(data)}`);
    OnEventReceived(data);
  });

  contract.on(CONTRACT_EVENT.GAME_ENDED, (itx, gameId, winner, amount, timestamp, event) => {
    const transactionHash = event.transactionHash;
    const eventName = event.event;
    const data: any = {
      contract: event.address,
      event: eventName,
      tx_hash: transactionHash,
      chain_id: CHAIN_ID,
      //user_address: user_address.toLowerCase(),
      //amount: parseFloat(ethers.utils.formatEther(amount)),
      itx,
      game_id: gameId,
      winner: winner.toLowerCase(),
      winner_amount: parseFloat(ethers.utils.formatEther(amount)),
      timestamp: parseInt(timestamp)
    };
    Logger.info(`Event ${eventName} data: ${JSON.stringify(data)}`);
    OnEventReceived(data);
  });

  contract.on(CONTRACT_EVENT.BET_CLEARED, (user_address, amount, timestamp, event) => {
    const transactionHash = event.transactionHash;
    const eventName = event.event;
    const data: any = {
      contract: event.address,
      event: eventName,
      tx_hash: transactionHash,
      chain_id: CHAIN_ID,
      user_address: user_address.toLowerCase(),
      amount: parseFloat(ethers.utils.formatEther(amount)),
      timestamp: parseInt(timestamp)
    };
    Logger.info(`Event ${eventName} data: ${JSON.stringify(data)}`);
    OnEventReceived(data);
  });
}

function setupListenersWithAutoReconnect() {
  provider = createProvider();
  //gameMasterContract = createContract(provider);
  wallet = createWallet(provider);
  gameMasterContract = createContractWithSigner(wallet);
  attachListeners(gameMasterContract);

  provider.on('error', (error) => {
    Logger.error('Provider error: ' + error.message);
    reconnect();
  });

  (provider as any)._websocket?.once('close', (code: number) => {
    Logger.warn(`WebSocket closed with code: ${code}`);
    reconnect();
  });
}

function reconnect() {
  Logger.info(`Reconnecting in ${reconnectDelay / 1000} seconds...`);
  cleanupListeners();

  setTimeout(() => {
    try {
      setupListenersWithAutoReconnect();
    } catch (error) {
      Logger.error('Failed to reconnect: ' + error);
      reconnect(); // retry again
    }
  }, reconnectDelay);
}

function cleanupListeners() {
  if (gameMasterContract) {
    Logger.info('Removing all listeners from contract.');
    gameMasterContract.removeAllListeners();
  }
}

export async function initGameMasterContract() {
  setupListenersWithAutoReconnect();
}
export { gameMasterContract };