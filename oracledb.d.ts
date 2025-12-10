// Type declarations for oracledb module
declare module 'oracledb' {
  export interface IConnection {
    execute(
      sql: string,
      binds?: any[] | Record<string, any>,
      options?: IExecuteOptions
    ): Promise<IExecuteReturn>;
    close(): Promise<void>;
    commit(): Promise<void>;
    rollback(): Promise<void>;
  }

  export interface IExecuteOptions {
    outFormat?: number;
    autoCommit?: boolean;
    fetchInfo?: Record<string, any>;
    maxRows?: number;
    resultSet?: boolean;
  }

  export interface IExecuteReturn {
    rows?: any[];
    outBinds?: any;
    rowsAffected?: number;
    metaData?: IMetaData[];
    resultSet?: any;
  }

  export interface IMetaData {
    name: string;
  }

  export interface IPoolAttributes {
    user: string;
    password: string;
    connectString: string;
    poolMin?: number;
    poolMax?: number;
    poolIncrement?: number;
    poolTimeout?: number;
  }

  export interface IPool {
    getConnection(): Promise<IConnection>;
    close(drainTime?: number): Promise<void>;
  }

  export function createPool(poolAttrs: IPoolAttributes): Promise<IPool>;
  export function getConnection(connAttrs: {
    user: string;
    password: string;
    connectString: string;
  }): Promise<IConnection>;

  export const OBJECT: number;
  export const ARRAY: number;
  export const OUT_FORMAT_OBJECT: number;
  export const OUT_FORMAT_ARRAY: number;
  export const STRING: number;
  export const NUMBER: number;
  export const DATE: number;
  export const CURSOR: number;
  export const BUFFER: number;
  export const CLOB: number;
  export const BLOB: number;
}
