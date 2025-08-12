import { Logger } from "../logger/winston-logger.config";
import { ethers, utils } from "ethers";
import { SIGNATURE_TYPE } from "../config/constant";

const wallet = new ethers.Wallet(process.env.GAME_WALLET_PRIVATE_KEY!);

/**
 * Create a signature for given parameters.
 * @param {Record<string, any>} params - Object containing parameters.
 * @return {Promise<string>} Returns a signed message.
 */
export async function createSignature(params: Record<string, any>): Promise<string> {
  return signData(params);
}

/**
 * Create a game-specific signature for given parameters.
 * @param {Record<string, any>} params - Object containing parameters.
 * @return {Promise<string>} Returns a signed message.
 */
export async function createGameSignature(params: Record<string, any>): Promise<string> {
  return signData(params);
}

/**
 * Hash the parameters and sign the hash.
 * @param {Record<string, any>} params - Object containing parameters.
 * @return {Promise<string>} Signed message.
 */
async function signData(params: Record<string, any>): Promise<string> {
  try {
    const { paramValues, paramTypes } = getListValuesAndTypes(params);
    const hash = utils.solidityKeccak256(paramTypes, paramValues);
    const hashBytes = utils.arrayify(hash);
    return await wallet.signMessage(hashBytes);
  } catch (error) {
    Logger.error(`Error signing data: ${error}`);
    throw error;
  }
}

/**
 * Create a hash byte array from parameters.
 * @param {Record<string, any>} params - Object containing parameters.
 * @return {Promise<Uint8Array>} Returns hashed byte array.
 */
export function createHashByte(params: Record<string, any>): Uint8Array {
  const { paramValues, paramTypes } = getListValuesAndTypes(params);
  const hash = utils.solidityKeccak256(paramTypes, paramValues);
  return utils.arrayify(hash);
}

/**
 * Extract parameter values and their corresponding types.
 * @param {Record<string, any>} params - Object containing parameters.
 * @return {Promise<{ paramValues: any[], paramTypes: string[] }>} Returns arrays of values and types.
 */
function getListValuesAndTypes(params: Record<string, any>): { paramValues: any[], paramTypes: string[] } {
  if (!params || typeof params !== 'object') {
    throw new Error('Invalid parameters: Expected an object.');
  }

  const paramValues: any[] = [];
  const paramTypes: string[] = [];

  for (const key of Object.keys(params)) {
    if (!(key in SIGNATURE_TYPE)) {
      throw new Error(`Invalid parameter: '${key}' is not defined in SIGNATURE_TYPE`);
    }
    paramValues.push(params[key]);
    paramTypes.push(SIGNATURE_TYPE[key]);
  }

  return { paramValues, paramTypes };
}

/**
 * Hash a string input (e.g., itx) using keccak256.
 * @param {string} itx - The input string to hash.
 * @returns {string} - The keccak256 hash (txId).
 */
export function generateTxId(itx: string): string {
  const txId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(itx));
  return txId;
}