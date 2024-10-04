// Name could be changed

import base64 from "react-native-base64";
import { getLocation } from "../location/location";

//==== Types ====================
import { Measurement } from "../store/types";
import { BleError, BleErrorCode, Characteristic } from "react-native-ble-plx";

//==== Store =============================
import store from "../store/store";
import { setBattery } from "../store/bleSlice";
import {
  setCalibrationMeasurementID,
  setLastMeasurement,
} from "../store/measurementSlice";
import {
  insertCalibrationMeasurement,
  insertMeasurement,
} from "../localDB/measurements";

import { setUpdateMeasures } from "../store/filterSlice";

//==== LocalDB =================================================

// On updates ==============================================================================================

const onCharacteristicUpdate = async (
  error: BleError | null,
  characteristic: Characteristic | null,
) => {
  try {
    if (!characteristicError(error, characteristic) && characteristic?.value) {
      const rawData = base64.decode(characteristic.value);

      const data = await rawDataToMeasurement(rawData);
      if (data) {
        const { battery, measurement } = data;

        store.dispatch(setLastMeasurement(measurement));
        store.dispatch(setBattery(battery));

        const measurementID = await insertMeasurement(measurement); //TODO call bleSlice and measurementSlice
        store.dispatch(setUpdateMeasures({ update: true }));

        if (store.getState().measurement.calibrationMode) {
          console.log(store.getState().measurement);
          const calibrationID = store.getState().measurement.calibrationID;
          const id = await insertCalibrationMeasurement(
            calibrationID,
            measurementID,
          );

          store.dispatch(setCalibrationMeasurementID(id));

          // TODO verify code
        }
      }
      //ELSE problem with measurement, rawDataToMeasurement returned undefined
    }
  } catch (error) {
    console.log(error);
  }
};

// We received a string with values separated by ;
//With this format pasturometro-00e5;20221206123456;null;23;22.0000;68.0000;4;44.6500;46.0600;46.0600;47.4700
//the filds are:
//ID, timeStamp, GPS(currently null), batery,temperature, humity, sensorsQuantity, and N measures(one by sensor)
const stringFields = {
  DEVICE_ID: 0,
  BATERY: 3,
  TEMPERATURE: 4,
  HUMIDITY: 5,
  SENSORS_QUANTITY: 6,
  MEASUREMENTS: 7,
} as const;

/** It process the raw data from the device and returns a Measurement object and the battery level if it succeed, it returns undefined if a problems ocurred */
async function rawDataToMeasurement(
  value: string,
): Promise<{ battery: number; measurement: Measurement } | undefined> {
  //TODO catch if i received empty
  const values = value.split(";");
  const measurementsQuantity = parseFloat(
    values[stringFields.SENSORS_QUANTITY],
  );

  const measurements = values
    .slice(
      stringFields.MEASUREMENTS,
      stringFields.MEASUREMENTS + measurementsQuantity,
    )
    .map((measurement) => parseFloat(measurement));

  const measurementValue = verifyMeasurements(measurements);
  if (measurementValue) {
    const battery = parseFloat(values[stringFields.BATERY]);
    const location = await getLocation();
    const measurement: Measurement = {
      height: measurementValue,
      timestamp: Date.now(),
      latitude: location!.coords.latitude,
      longitude: location!.coords.longitude,
    };

    return { battery: battery, measurement: measurement };
  } else return undefined;
}

const TOLERANCE = 3.5;
const verifyMeasurements = (measurements: number[]) => {
  let sum = 0;
  let validNumbers = 0;

  if (measurements.length > 0) {
    const median = measurements.sort()[Math.floor(measurements.length / 2)];
    measurements.forEach((number) => {
      if (Math.abs(number - median) < TOLERANCE) {
        sum += number;
        validNumbers++;
      }
    });
  }

  // if (validNumbers < measurements.length)
  //   pushNotification(TS.t("obstructed_sensor"), "warning");
  if (validNumbers > 1) return sum / validNumbers;
  else {
    // pushNotification(TS.t("failed_measurement"), "error");
    return undefined;
  }
};

//===================== Utils =============================================================
const characteristicError = (error: BleError | null, characteristic: any) => {
  error && console.error("Characteristic", error, error.errorCode);
  if (error?.errorCode == BleErrorCode.DeviceDisconnected) {
    console.log("It was disconnected");
    // I think that this is enough, the real disconnection is already handled by ble
    //store.dispatch(setConnectedDevice(null))
    // https://github.com/dotintent/react-native-ble-plx/blob/master/src/BleError.js
  }

  return error || !characteristic?.value;
};

export { onCharacteristicUpdate };
