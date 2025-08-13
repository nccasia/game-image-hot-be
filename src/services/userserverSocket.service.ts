import { io, Socket } from "socket.io-client";
import dotenv from "dotenv";

dotenv.config();

// === Optional: Define server/client event types ===
interface ServerToClientEvents {
  // Example: server sends this event to client
  balance: (data: { userId: string; balance: number, pendingBalance: number }) => void;
}

interface ClientToServerEvents {
  addBalance: (
    data: { user: string; value: number; hash: string },
    callback: (response: IOReturn) => void
  ) => void;
  deductBalance: (
    data: { user: string; value: number; hash: string },
    callback: (response: IOReturn) => void
  ) => void;
  getBalance: (
    data: { user: string; hash: string },
    callback: (response: IOReturn) => void
  ) => void;
  swapToken: (
    data: { user: string; value: number; hash: string },
    callback: (response: IOReturn) => void
  ) => void;
  startGame: (
    data: { gameId: string; players: string[]; playerBets: number[]; game: string; hash: string },
    callback: (response: IOReturn) => void
  ) => void;
  endGame: (
    data: { gameId: string; winner: string; game: string; hash: string },
    callback: (response: IOReturn) => void
  ) => void;
}

// === Response DTO ===
export class IOReturn {
  status: Status = Status.Fail;
  data: { user: string; balance: number, pendingBalance: number } = { user: "", balance: 0, pendingBalance: 0 };
  message: string = "";
}

export enum Status {
  Success = 0,
  Fail = 1,
  Warning = 2,
}

// === Socket Interaction Class ===
export class UserServerSocket {
  private static _instance: UserServerSocket = new UserServerSocket();
  public static get instance(): UserServerSocket {
    return this._instance;
  }

  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
  private readonly hash = process.env.USER_SERVER_VERIFY_HASH;
  private readonly serverUrl = process.env.USER_SERVER_SOCKET_URL;
  private readonly gameName = "BestGuess";

  public connect(): void {
    if (!this.socket && this.serverUrl) {
      this.socket = io(this.serverUrl, {
        secure: true,
        transports: ["websocket"],
      });

      this.socket.on("connect_error", (error) => {
        if (this.socket!.active) {
          console.warn("Temporary connection error:", error.message);
        } else {
          console.error("Connection denied:", error.message);
        }
      });

      this.socket.on("connect", () => {
        console.log("✅ Socket connected:", this.socket!.id);
      });

      this.socket.on("disconnect", () => {
        console.log("⚠️ Socket disconnected:", this.socket!.id);
      });
    }
  }

  private emitEvent<T>(
    event: keyof ClientToServerEvents,
    payload: any,
    onSuccess: (response: IOReturn) => void
  ): void {
    if (!this.socket) {
      console.error("Socket is not connected.");
      return;
    }
    this.socket.emit(event, { ...payload, hash: this.hash, game: this.gameName }, onSuccess);
  }

  public addBalance(user: string, value: number, onSuccess: (response: IOReturn) => void): void {
    this.emitEvent("addBalance", { user, value }, onSuccess);
  }

  public deductBalance(user: string, value: number, onSuccess: (response: IOReturn) => void): void {
    this.emitEvent("deductBalance", { user, value }, onSuccess);
  }

  public getBalance(user: string, onSuccess: (response: IOReturn) => void): void {
    this.emitEvent("getBalance", { user }, onSuccess);
  }

  public swapToken(user: string, value: number, onSuccess: (response: IOReturn) => void): void {
    this.emitEvent("swapToken", { user, value }, onSuccess);
  }

  public startGame(gameId: string, players: string[], playerBets: number[], onSuccess: (response: IOReturn) => void): void {
    this.emitEvent("startGame", { gameId, players, playerBets }, onSuccess);
  }

  public endGame(gameId: string, winner: string, onSuccess: (response: IOReturn) => void): void {
    this.emitEvent("endGame", { gameId, winner }, onSuccess);
  }

  public getBalanceAsync(mezonId: string): Promise<IOReturn> {
    return new Promise((resolve, reject) => {
      UserServerSocket.instance.getBalance(mezonId, (response: IOReturn) => {
        resolve(response);
      });
    });
  }

  public startGameAsync(gameId: string, players: string[], playerBets: number[]): Promise<IOReturn> {
    return new Promise((resolve, reject) => {
      UserServerSocket.instance.startGame(gameId, players, playerBets, (response: IOReturn) => {
        resolve(response);
      });
    });
  }

  public endGameAsync(gameId: string, winner: string): Promise<IOReturn> {
    return new Promise((resolve, reject) => {
      UserServerSocket.instance.endGame(gameId, winner, (response: IOReturn) => {
        resolve(response);
      });
    });
  }
}
