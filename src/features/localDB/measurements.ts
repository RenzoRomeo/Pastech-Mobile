import { MeasurementForBack } from "../backend/types";
import { Measurement } from "../store/types";
import { SendStatus, execQuery, execTransaction } from "./localDB";
import { TablesNames } from "./tablesDefinition";
import { MeasurementLocalDB } from "./types";

/** Get the unsent measurements from localDB, and marks them as sending  */
export async function getMeasurementsForBack(): Promise<
  (MeasurementForBack & { sectorId: number | null })[]
> {
  const res = await execTransaction([
    `SELECT * FROM ${TablesNames.MEASUREMENTS} WHERE sendStatus = ${SendStatus.NOT_SENT} AND ID NOT IN (SELECT ID FROM ${TablesNames.CALIBRATIONS_MEASUREMENTS})`,
    `UPDATE ${TablesNames.MEASUREMENTS} SET sendStatus = ${SendStatus.SENDING} WHERE sendStatus = ${SendStatus.NOT_SENT}`,
  ]);
  const measurements = res[0].rows._array;
  const forBackMeasurements = measurements.map((row) => {
    return measurementToBackendFormat(row);
  });

  const output = await Promise.all(
    forBackMeasurements.map(async (measurement) => {
      const result = await execQuery(
        `SELECT ID FROM ${TablesNames.SECTORS} WHERE start_date <= ${new Date(
          measurement.timestamp,
        ).getTime()} AND ${new Date(
          measurement.timestamp,
        ).getTime()} <= finish_date`,
      );
      const sectorId =
        result.rows._array.length > 0 ? result.rows._array[0].ID : null;
      return { ...measurement, sectorId };
    }),
  );

  return output;
}

export function measurementToBackendFormat(row: any): MeasurementForBack {
  return {
    timestamp: new Date(row.timestamp).toISOString(),
    height: row.height as number,
    location: [row.longitude, row.latitude] as [number, number],
  };
}

/** Get last measurement from localdb */
export async function getLastMeasurement() {
  return execQuery(
    `SELECT * FROM ${TablesNames.MEASUREMENTS} WHERE timestamp = (SELECT MAX(timestamp) FROM ${TablesNames.MEASUREMENTS})`,
  ).then((result) => result.rows._array[0] as undefined | MeasurementLocalDB);
}

/** Get the n last measurement from localdb */
export async function getNLastMeasurements(
  n: number,
): Promise<MeasurementLocalDB[]> {
  return execQuery(
    `SELECT * FROM ${TablesNames.MEASUREMENTS} 
    WHERE ID NOT IN (SELECT DISTINCT ID FROM ${TablesNames.CALIBRATIONS_MEASUREMENTS})
    ORDER BY timestamp DESC
    LIMIT ? ;`,
    [n],
  ).then((result) => result.rows._array as MeasurementLocalDB[]);
}

//** ==========================  INSERTS ==========================================  */

/** Insert a measurement in de localDB with the column sent set to false(0)
 *  @param measurement A measurement struct which will be inserted into measurements table
 *  @returns Promise<number> A promise which solves to the measurementID within the measurments table
 */
export async function insertMeasurement(measurement: Measurement) {
  // TODO improve
  let keys = "";
  let placeHolder = "";
  Object.keys(measurement).forEach((key) => {
    keys = keys + key + ",";
    placeHolder = placeHolder + "?,";
  });
  const values = [...Object.values(measurement), 0];

  return execQuery(
    `INSERT INTO measurements (${keys}sendStatus) values (${placeHolder}?)`,
    values,
  ).then((result) => result.insertId as number);
}

/** Insert a measurement in de localDB with the column sent set to false(0)
 *
 *  @param calibrationID The calibration's row ID
 *  @param measurementID The measurement's row ID
 *  @precondition A measurement with the given ID and a calibration with the given ID must be created
 *  @returns Promise<string> with the calibrationMeasurementID within the measurments table
 */
export async function insertCalibrationMeasurement(
  calibrationID: number,
  measurementID: number,
) {
  return execQuery(
    `INSERT INTO calibrationsMeasurements (ID,calibrationID,weight) values (?,?,?)`,
    [measurementID, calibrationID, 0],
  ).then((result) => result.insertId as number);
}

//=== GETTERS =================================================

export async function getMeasurements() {
  return execQuery(`SELECT * FROM measurements `, []);
}

export async function getMeasurementsBetween(
  from: number,
  until: number = new Date().getTime(),
) {
  return execQuery(
    `SELECT * FROM measurements WHERE timestamp BETWEEN (?) AND (?)`,
    [from, until],
  );
}

export async function deleteMeasurement(measurement: MeasurementLocalDB) {
  console.log("Deleting", measurement);

  return execQuery(`DELETE FROM measurements WHERE ID=?`, [measurement.ID]);
}
