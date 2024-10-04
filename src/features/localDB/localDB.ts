import * as SQLite from "expo-sqlite";
import { SendableTables } from "./types";
import { TablesNames } from "./tablesDefinition";

const db = SQLite.openDatabase("1pastar.db");

//We declare foreigns key, for that, we should import a pragma module
//with a query
db.exec([{ sql: "PRAGMA foreign_keys = ON;", args: [] }], false, () => {
  // resetDB();
  createTables();
});

function resetDB() {
  console.log("RESETTING DB");
  dropTables(TablesNames.MEASUREMENTS);
  dropTables(TablesNames.CALIBRATIONS);
  dropTables(TablesNames.CALIBRATIONS_FROM_FUNCTIONS);
  dropTables(TablesNames.CALIBRATIONS_FROM_FUNCTIONS_FROM_SERVER);
  dropTables(TablesNames.CALIBRATIONS_FROM_MEASUREMENTS);
  dropTables(TablesNames.PADDOCKS);
  dropTables(TablesNames.SECTORS);
  dropTables(TablesNames.USER);
}

//Does it work?
db.exec(
  [{ sql: 'SELECT load_extension("libspatialite.so")', args: [] }],
  false,
  (error) => {
    console.log(error);
  },
);

//========= Create and Delete tables =============================================

function dropTables(tableName: TablesNames): void {
  execQuery(`DROP TABLE ${tableName};`, []);
}

function createTables() {
  execTransaction(createTableQueries);
}

//======== Query Wrapper ==========================================================

export async function execQuery(query: string, values: Array<any> = []) {
  return execTransaction([query], [values]).then((result) => result[0]);
}

/** Executes a transaction with the given queries. Return an array */
export async function execTransaction(
  queries: string[],
  values: Array<any>[] = [[]],
) {
  return new Promise<SQLite.SQLResultSet[]>((resolve, reject) => {
    let result: SQLite.SQLResultSet[] = Array<SQLite.SQLResultSet>(
      queries.length,
    );
    db.transaction(
      (tx) => {
        queries.map((query, index) => {
          tx.executeSql(query, values[index], (_, _result) => {
            // console.log('Executed', query);
            result[index] = _result;
          });
        });
      },
      (error) => {
        console.error("SQLite Error", error);
        reject(error);
      },
      () => {
        // console.log('Query succed result:', result);
        resolve(result);
      },
    );
  });
}

export enum SendStatus {
  NOT_SENT,
  SENT,
  SENDING,
  FOR_SENDING,
}

/** Set all rows which are marked as sending to SENT if success is true, and to NOT_SENT if it is false,   */
export async function setSending(
  sendStatus: SendStatus,
  table: SendableTables,
) {
  // const measurements = new Array<MeasurementForFront>()
  const query = `UPDATE ${table} SET sendStatus = ${sendStatus} WHERE sendStatus = ${SendStatus.SENDING}`;
  return execQuery(query);
}

export async function setSendStatus(
  sendStatus: SendStatus,
  table: SendableTables,
  rowID: number,
) {
  const query = `UPDATE ${table} SET sendStatus = ${sendStatus} WHERE ID = ${rowID}`;
  return execQuery(query);
}

const createTableQueries = [
  `CREATE TABLE IF NOT EXISTS measurements (
        ID INTEGER PRIMARY KEY,
        height REAL,
        latitude REAL,
        longitude REAL,
        timestamp INTEGER,
        sendStatus INTEGER
      );`,
  `UPDATE measurements
      SET height = ABS(height)
      WHERE height < 0`,
  `CREATE TABLE IF NOT EXISTS calibrations (
        ID INTEGER PRIMARY KEY,
        name TEXT,
        function TEXT
      );`,
  `CREATE TABLE IF NOT EXISTS calibrationsFromMeasurements (
        ID INTEGER PRIMARY KEY,
        sendStatus INTEGER,
        FOREIGN KEY (ID) REFERENCES calibrations(ID) ON DELETE CASCADE

      );`,
  `CREATE TABLE IF NOT EXISTS calibrationsFromFunction (
        ID INTEGER PRIMARY KEY,
        FOREIGN KEY (ID) REFERENCES calibrations(ID) ON DELETE CASCADE

      );`,
  `CREATE TABLE IF NOT EXISTS calibrationsMeasurements (
        ID INTEGER PRIMARY KEY ,
        calibrationID INTEGER,
        weight REAL,
        FOREIGN KEY (calibrationID) REFERENCES calibrationsFromMeasurements(ID) ON DELETE CASCADE,
        FOREIGN KEY (ID) REFERENCES measurements(ID) ON DELETE CASCADE
      );`,
  `CREATE TABLE IF NOT EXISTS user (
        localId INTEGER PRIMARY KEY ,
        id TEXT,
        firstName TEXT,
        lastName TEXT,
        email TEXT,
        groupUid TEXT,
        roles TEXT,
        accessToken TEXT,
        refreshToken TEXT,
        timestamp INTEGER,
        refreshExpiresIn INTEGER,
        expiresIn INTEGER,
        signedIn INTEGER
      );`,
  `CREATE TABLE IF NOT EXISTS calibrationsFromFunctionFromBackend (
        ID INTEGER PRIMARY KEY,
        updateTimestamp INTEGER,
        uid TEXT,
        FOREIGN KEY (ID) REFERENCES calibrationsFromFunction(ID) ON DELETE CASCADE
      );`,
  `CREATE TABLE IF NOT EXISTS devices (
        id TEXT PRIMARY KEY,
        name TEXT,
        alias TEXT,
        baseHeight REAL,
        model TEXT
      );`,
  `CREATE TABLE IF NOT EXISTS paddocks (
        ID INTEGER PRIMARY KEY,
        name TEXT,
        vertices_list TEXT,
        color TEXT
      );`,
  `CREATE TABLE IF NOT EXISTS paddocksFromServer (
        ID INTEGER PRIMARY KEY,
        updateTimestamp INTEGER,
        uid TEXT,
        FOREIGN KEY (ID) REFERENCES paddocks(ID) ON DELETE CASCADE
      );`,
  `CREATE TABLE IF NOT EXISTS sectors (
        ID INTEGER PRIMARY KEY,
        start_date INTEGER,
        finish_date INTEGER
      );`,
];
