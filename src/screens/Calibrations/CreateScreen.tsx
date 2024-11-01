import { useState } from "react";

//==== Components ===========================================
import { Heading, VStack, Input, Icon, Button } from "native-base";
import { NewCalibrationModal } from "../../components/CalibrationsModals";

//==== Navigation ==============================================
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import BlockButton from "../../components/BlockButton";
type Props = NativeStackScreenProps<StackParamList, "CreateCalibration">;

//==== Icons ===============================
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { calibrationExists } from "../../features/localDB/calibrations";
import { StackParamList } from "./Stack.types";
import TS from "../../../TS";
import { pushNotification } from "../../features/pushNotification";

// TODO set Type
export default function CreateCalibration({ navigation }: Props) {
  //Value represents id in database

  const [calibrationName, setCalibrationName] = useState<string>();

  const [
    showModalCalibrationFromMeasurement,
    setShowModalCalibrationFromMeasurement,
  ] = useState(false);

  /**Function used by onPressCreateFromFunction and onPressCreateFrom */
  function onPressCreate(callback: () => void) {
    if (calibrationName) {
      calibrationExists(calibrationName)
        .then((exists) => {
          if (!exists) callback();
          else pushNotification(TS.t("calibration_already_exists"), "error");
        })
        .catch((e) => console.error(e));
    } else console.error("Shouldnt happen, calibration name empty");
  }

  function onPressCreateFromMeasurement() {
    onPressCreate(() => setShowModalCalibrationFromMeasurement(true));
  }

  return (
    <>
      <VStack
        flex={1}
        alignItems="end"
        bg="white"
        _dark={{ bg: "black" }}
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <VStack style={{ marginTop: 80, alignItems: "center" }}>
          <Heading size="xl" fontWeight="light" marginBottom={4}>
            {TS.t("calibrations_name")}
          </Heading>
          <Input
            fontSize={calibrationName ? "xl" : "lg"}
            value={calibrationName}
            size="2xl"
            onChangeText={setCalibrationName}
            placeholder={TS.t("write_calibrations_name")}
          />
        </VStack>

        <Button
          height={50}
          width={200}
          marginBottom={10}
          isDisabled={!calibrationName}
          onPress={onPressCreateFromMeasurement}
        >
          {TS.t("create_calibration")}
        </Button>
      </VStack>
      <NewCalibrationModal
        showModal={showModalCalibrationFromMeasurement}
        setShowModal={setShowModalCalibrationFromMeasurement}
        calibrationName={calibrationName}
        onCreateGoTo={() => {
          navigation.navigate("CalibrationsList");
        }}
      />
    </>
  );
}
