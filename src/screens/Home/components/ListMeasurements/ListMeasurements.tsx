import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";

//==== Icons ==================================================

import { FlashList } from "@shopify/flash-list";

//==== Components ===========================================
import { Heading, VStack, Divider, Spinner, useTheme } from "native-base";

//==== LocalDB ==========================================
import { MeasurementLocalDB } from "../../../../features/localDB/types";
import {
  deleteMeasurement,
  getNLastMeasurements,
} from "../../../../features/localDB/measurements";
import { useTypedSelector } from "../../../../features/store/storeHooks";
import TS from "../../../../../TS";
import MeasurementModal from "./MeasurementModal";
import Item, { ITEM_HEIGHT } from "./ListItemMeasurement";
import useSound from "../../../../components/hooks/useSound";
//==== Navigation ==============================================

const LIST_SIZE = 50;

export default function MeasurementsList() {
  //Value represents id in database
  const theme = useTheme();
  const [measurements, setMeasurements] = useState<MeasurementLocalDB[]>();
  const [selectedMeasurement, setSelectedMeasurement] =
    useState<MeasurementLocalDB>();

  const lastMeasurement = useTypedSelector(
    (state) => state.measurement.lastMeasurement,
  );

  const refreshList = useCallback(() => {
    getNLastMeasurements(LIST_SIZE).then((measurements) => {
      setMeasurements(measurements);
    });
  }, [setMeasurements]);

  const { playSound } = useSound();

  useEffect(() => {
    const timeout = setTimeout(() => {
      refreshList();
    }, 100);
    if (Date.now() - lastMeasurement.timestamp <= 5000) {
      playSound();
    }
    return () => {
      clearTimeout(timeout);
    };
  }, [lastMeasurement]);

  const onDelete = useCallback(() => {
    if (selectedMeasurement)
      deleteMeasurement(selectedMeasurement).then(() => {
        setSelectedMeasurement(undefined);
        refreshList();
      });
  }, [selectedMeasurement]);

  return measurements ? (
    measurements.length > 0 ? (
      <VStack alignItems="center" flex={1} width="100%">
        <MeasurementModal
          onDelete={onDelete}
          setMeasurement={setSelectedMeasurement}
          measurement={selectedMeasurement}
        />
        <Heading paddingBottom={2}>{TS.t("last_measurements")}</Heading>
        <View
          style={{
            borderRadius: 30,
            overflow: "hidden",
            width: "100%",
            flex: 1,
            borderColor: theme.colors.muted[300],
            borderWidth: 2,
          }}
        >
          <FlashList
            extraData={setSelectedMeasurement}
            data={measurements}
            estimatedItemSize={ITEM_HEIGHT}
            renderItem={Item}
            ItemSeparatorComponent={ListDivider}
          />
        </View>
      </VStack>
    ) : null
  ) : (
    <VStack alignItems="center" width="100%" flex={1}>
      <Spinner size={90} />
    </VStack>
  );
}

const ListDivider = () => <Divider width={"85%"} alignSelf={"center"} />;
