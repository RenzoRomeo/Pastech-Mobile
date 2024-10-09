import { useEffect, useState } from "react";

import {
  Button,
  FlatList,
  HStack,
  Heading,
  Icon,
  Input,
  Modal,
  Spinner,
  Text,
  VStack,
} from "native-base";

import { MaterialIcons } from "@expo/vector-icons";

import { MeasurementLocalDB } from "../../../../features/localDB/types";
import TS from "../../../../../TS";
import { formatDate, formatTime } from "../../../../utils/time";
import { SendStatus } from "../../../../features/localDB/localDB";

export default function MeasurementModal(props: {
  measurement?: MeasurementLocalDB;
  setMeasurement: (measurement?: MeasurementLocalDB) => void;
  onDelete: () => void;
}) {
  const { measurement } = props;

  return (
    <Modal isOpen={!!props.measurement} onClose={() => props.setMeasurement()}>
      {measurement && (
        <Modal.Content maxWidth="400px">
          {/*  For some reason this makes all Explode <Modal.CloseButton /> */}
          <Modal.Header
            flexDir="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Heading>{TS.t("measurement")}</Heading>
            {/* <Modal.CloseButton /> */}
          </Modal.Header>
          <Modal.Body style={{ marginLeft: 10 }}>
            <VStack>
              <Text fontSize={"lg"}>{TS.t("date")}</Text>
              <HStack justifyContent={"space-between"}>
                <Text fontSize={"2xl"}>
                  {formatDate(measurement?.timestamp)}
                </Text>
                <Text fontSize={"2xl"}>
                  {formatTime(measurement?.timestamp)}
                </Text>
              </HStack>
            </VStack>

            <VStack>
              <VStack paddingTop={4}>
                <Text fontSize={"lg"}>{TS.t("measurement")}</Text>
                <Text fontSize={"2xl"}>{measurement.height.toFixed(1)}cm</Text>
              </VStack>
              <VStack paddingY={4}>
                <Text fontSize={"lg"}>{TS.t("localization")}</Text>
                <HStack justifyContent={"space-between"}>
                  <Text fontSize={"2xl"}>
                    {measurement.latitude.toFixed(7)}
                  </Text>
                  <Text fontSize={"2xl"}>
                    {measurement.longitude.toFixed(7)}
                  </Text>
                </HStack>
              </VStack>
              <Text fontSize={"xl"}>
                {TS.t(SendStatus[measurement.sendStatus])}
              </Text>
            </VStack>
          </Modal.Body>
          <Modal.Footer>
            <Button.Group space={2}>
              <Button
                _text={{ color: "white" }}
                size="lg"
                colorScheme="info"
                onPress={() => {
                  props.setMeasurement();
                }}
              >
                {TS.t("cancel")}
              </Button>
              <Button
                leftIcon={<Icon as={MaterialIcons} name="delete" />}
                _text={{ color: "white" }}
                size="lg"
                colorScheme="danger"
                onPress={() => {
                  props.onDelete();
                  // props.setShowModal(false);
                  // props.measurement?.ID && props.onDelete(props.info?.ID);
                }}
              >
                {TS.t("delete")}
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      )}
    </Modal>
  );
}
