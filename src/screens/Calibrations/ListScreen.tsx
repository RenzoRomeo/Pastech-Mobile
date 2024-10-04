import React, { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";

//==== Icons ==================================================
import { Entypo } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";

//==== Components ===========================================
import {
  Heading,
  HStack,
  VStack,
  FlatList,
  IconButton,
  Divider,
  Pressable,
  Spinner,
} from "native-base";
import {
  DeleteCalibrationModal,
  InfoCalibrationModal,
} from "../../components/CalibrationsModals";

//==== LocalDB ==========================================
import { CalibrationLocalDBExtended } from "../../features/localDB/types";
import {
  deleteCalibration,
  getCalibrations,
} from "../../features/localDB/calibrations";

//==== Navigation ==============================================
import { PropsCalibrationList } from "./Stack.types";

type CustomCalibration = CalibrationLocalDBExtended & { sent: boolean };

function incompleteCalibration(calibration: CustomCalibration) {
  const func = calibration.function;
  return !func || func?.split(",").every((value) => value === "0");
}

export default function CalibrationsList({ navigation }: PropsCalibrationList) {
  //Value represents id in database
  const [calibrations, setCalibrations] = useState<CustomCalibration[]>();

  const [selectedCalibration, setSelectedCalibration] =
    useState<CustomCalibration>();
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const refreshList = useCallback(() => {
    getCalibrations().then((calibrations) => {
      setCalibrations(calibrations);
    });
  }, []);

  useFocusEffect(refreshList);

  function onDelete(ID: number) {
    deleteCalibration(ID).then(() => {
      refreshList();
    });
  }

  const Item = useCallback(
    (props: { item: CustomCalibration }) => {
      const { item } = props;
      return (
        <Pressable
          onPress={() => {
            setSelectedCalibration(item);
            setShowInfoModal(true);
          }}
        >
          <HStack
            style={{
              height: 60,
              flex: 1,
              paddingHorizontal: 30,
            }}
            backgroundColor="white"
            justifyContent="space-between"
            alignItems="center"
          >
            <Heading>{item.name}</Heading>
            {incompleteCalibration(item) && !item.sent ? (
              <IconButton
                _icon={{
                  as: Entypo,
                  name: "plus",
                  size: "md",
                }}
                rounded="md"
                variant="solid"
                style={{ width: 40, height: 40 }}
                onPress={() => {
                  navigation.navigate("CalibrationMeasurement", {
                    calibrationID: item.ID,
                    calibrationName: item.name,
                  });
                }}
              />
            ) : null}
          </HStack>
          <Divider />
        </Pressable>
      );
    },
    [setSelectedCalibration, setShowDeleteModal],
  );

  return (
    <>
      <DeleteCalibrationModal
        setShowModal={setShowDeleteModal}
        info={selectedCalibration}
        showModal={showDeleteModal}
        onDelete={onDelete}
      />
      <InfoCalibrationModal
        setShowModal={setShowInfoModal}
        info={selectedCalibration}
        showModal={showInfoModal}
      />

      <VStack alignItems="center" backgroundColor="white" flex={1}>
        {calibrations ? (
          <FlatList
            maxHeight="85%"
            minHeight="10%"
            width="100%"
            data={[
              ...calibrations.filter((calibration) =>
                incompleteCalibration(calibration),
              ),
              ...calibrations.filter(
                (calibration) => !incompleteCalibration(calibration),
              ),
            ]}
            renderItem={Item}
          />
        ) : (
          <VStack height={500} justifyContent="center">
            <Spinner size={90} />
          </VStack>
        )}
        <IconButton
          _icon={{
            as: Entypo,
            name: "plus",
            size: "4xl",
          }}
          rounded="full"
          variant="solid"
          style={{ width: 60, height: 60 }}
          onPress={() => {
            navigation.navigate("CreateCalibration");
          }}
        ></IconButton>
      </VStack>
    </>
  );
}
