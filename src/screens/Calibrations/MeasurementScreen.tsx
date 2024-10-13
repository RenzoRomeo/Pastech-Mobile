import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";

//=========== Components ========================================
import { Button, ScrollView, Text, View } from "native-base";

import {
  setCalibrationModeOff,
  setCalibrationModeOn,
} from "../../features/store/measurementSlice";

//======= Navigation Props =========================
import { PropsCalibrationMeasurement } from "./Stack.types";

import {
  useTypedDispatch,
  useTypedSelector,
} from "../../features/store/storeHooks";

import React from "react";
import {
  calibrationExists,
  getCalibrationsMeasurements,
} from "../../features/localDB/calibrations";
import { MeasurementLocalDB } from "../../features/localDB/types";
import TS from "../../../TS";
import { sendCalibration } from "../../features/backend/calibrations";

type CustomMeasurement = MeasurementLocalDB & { ID: number };

function CalibrationMeasurement({
  navigation,
  route,
}: PropsCalibrationMeasurement) {
  const SPACE_BETWEEN_TEXT = 5;
  const [measurements, setMeasurements] = useState<CustomMeasurement[]>([]);

  const dispatch = useTypedDispatch();
  const lastMeasurement = useTypedSelector(
    (state) => state.measurement.lastMeasurement,
  );
  const calibrationId = useTypedSelector(
    (state) => state.measurement.calibrationID,
  );

  async function fetchMeasurements() {
    const measurements = await getCalibrationsMeasurements(
      route.params.calibrationID,
    );
    setMeasurements(measurements.reverse());
  }

  useEffect(() => {
    const timeout = setTimeout(fetchMeasurements, 100);
    return () => {
      clearTimeout(timeout);
    };
  }, [lastMeasurement]);

  useFocusEffect(
    useCallback(() => {
      dispatch(setCalibrationModeOn(route.params.calibrationID));

      return () => {
        dispatch(setCalibrationModeOff());
      }; //Unsubscribe
    }, []),
  );

  async function handleSendCalibration() {
    if (!calibrationId || measurements.length === 0) {
      return;
    }
    try {
      await sendCalibration(calibrationId);
      navigation.navigate("CalibrationsList");
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <View
      style={{ flex: 1, flexDirection: "column", marginBottom: 20 }}
      width="full"
    >
      <View
        width="full"
        backgroundColor="muted.50"
        style={{ paddingHorizontal: 30 }}
      >
        <Text marginY={SPACE_BETWEEN_TEXT} fontSize="lg" fontWeight="bold">
          Realice las mediciones de la calibración.
        </Text>
      </View>
      <ScrollView
        style={{
          marginVertical: 50,
        }}
        width="1/2"
      >
        {measurements.map((measurement) => (
          <View
            key={measurement.timestamp}
            style={{
              flex: 1,
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Text fontSize="2xl">{measurement.ID}</Text>
            <View
              style={{
                backgroundColor: "#dddddd",
                marginTop: 5,
                marginLeft: 5,
                borderRadius: 4,
                alignSelf: "flex-start",
                paddingTop: 1,
                paddingBottom: 1,
                paddingLeft: 5,
                paddingRight: 5,
                width: 120,
              }}
            >
              <Text fontSize="2xl">{measurement.height.toFixed(1)} cm</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {measurements.length > 0 && (
        <Button onPress={handleSendCalibration}>
          {TS.t("calibration_send_button")}
        </Button>
      )}
    </View>
  );
}

export default CalibrationMeasurement;
