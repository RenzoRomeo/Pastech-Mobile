import { SendStatus, setSending } from "../localDB/localDB";
import { getMeasurementsForBack } from "../localDB/measurements";
import { pushNotification } from "../pushNotification";
import { mobileAPI } from "./config";
import Permission from "./permission";
import { MeasurementForBack } from "./types";
import { createPayload } from "./utils";
import TS from "../../../TS";

export async function synchronizeMeasurements(
  foreground?: boolean,
): Promise<boolean> {
  if (Permission.postMeasurements()) {
    return updateMeasurements(foreground);
  }
  return true;
}

/**
 *
 * @param foreground If it is true it will push a notification if it succed or fails
 */
export async function updateMeasurements(
  foreground?: boolean,
): Promise<boolean> {
  try {
    const measurements = await getMeasurementsForBack();
    if (measurements.length > 0 && Permission.postMeasurements()) {
      const res = await postMeasurements(measurements);
      if (res.code) throw new Error(res);
      else {
        setSending(SendStatus.SENT, "measurements");
        foreground &&
          pushNotification(TS.t("calibrations_synchronized"), "success");
      }
    }
    return true;
  } catch (e) {
    setSending(SendStatus.NOT_SENT, "measurements");
    console.log(e);
    foreground && pushNotification(TS.t("calibrations_synchronized"), "error");
    return false;
  }
}

/** Post the given measurements and returns a promise with the parsed json response from the server */
async function postMeasurements(
  measurements: (MeasurementForBack & { sectorId: number | null })[],
) {
  return fetch(
    `${mobileAPI}/measurements`,
    createPayload("POST", { measurements }),
  ).then(async (res) => {
    const resObject = await res.json();
    console.log("Response from Server on postMeasurement", resObject);
    return resObject;
  });
}
