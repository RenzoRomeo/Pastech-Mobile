import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StackParamList } from "./ScreenStack";
import { Box, Button, Divider, Heading, Icon, Modal, ScrollView, Select, View } from "native-base";
import { ActivityIndicator, Alert, Dimensions, Text, TouchableHighlight, TouchableOpacity } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { useCallback, useEffect, useState } from "react";
import { getLocation } from "../../features/location/location";
import { LocationObject } from "expo-location";
import { Measurement, Paddock } from "../../features/store/types";
import { calculateByHeight } from "../../features/statistics/WeightCalculus";
import { Entypo, FontAwesome5 } from '@expo/vector-icons';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import DatePicker from "react-native-date-picker";
import { CalibrationLocalDB, SectorLocalDB } from "../../features/localDB/types";
import FormatUtils from "../../features/utils/FormatUtils";
import PolyHelper from "../../features/utils/GeometricHelper";

import { getCalibrations, getCalibrationsFromMeasurementExtended } from "../../features/localDB/calibrations";
import { getMeasurements, getMeasurementsBetween, insertMeasurement } from "../../features/localDB/measurements";
import { themeNavigation } from "../../theme";
import { CommonActions, useFocusEffect } from "@react-navigation/native";
import { useTypedSelector } from "../../features/store/storeHooks";
import { getSectorByID, getSectors, getSectorsBetween } from "../../features/localDB/sectors";
import { getLocales } from "expo-localization";
import { getPaddockByID } from "../../features/localDB/paddocks";
import { LatLng } from "react-native-maps";

const screenWidth = Dimensions.get("window").width;
const Tab = createMaterialTopTabNavigator();

type Props = NativeStackScreenProps<StackParamList, 'StatisticsHome'>;

export default function PaddockScreen(props: Props) {
    const [location, setLocation] = useState<LocationObject>();
    const [measurements, setMeasurements] = useState<Measurement[]>([]);
    const [weight, setWeight] = useState(0);
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [modalFrom, setModalFrom] = useState(false);
    const [modalUntil, setModalUntil] = useState(false);
    const [selectedCalibration, setSelectedCalibration] = useState(-1);
    const [selectedSector, setSelectedSector] = useState(-1);
    const [calibrations, setCalibrations] = useState<CalibrationLocalDB[]>([])
    const [sectors, setSectors] = useState<SectorLocalDB[]>([]);
    const filterState = useTypedSelector(state => state.filter);
    const paddockList = useTypedSelector((state) => state.paddock.paddocks);

    useEffect(() => {
        // setFrom(new Date(filterState.from_stats));
        // setUntil(new Date(filterState.until_stats));
        readMeasurements();

        readCalibrations();
        readSectors(filterState.from_stats, filterState.until_stats);
    }, [filterState])

    // useFocusEffect(
    //     useCallback(() => {
    //         console.log('Focused');
    //         // setFrom(new Date(filterState.from_stats));
    //         // setUntil(new Date(filterState.until_stats));
    //         readMeasurements(filterState.from_stats, filterState.until_stats)
    //         return () => {

    //         }
    //     }, []))

    const readMeasurements = async (calibration?: number) => {
        let date = new Date(); date.setDate(date.getDate() - 2);
        let f = filterState.from_stats;
        let u = filterState.until_stats;
        if (f == undefined || u == undefined) {
            f = date.getTime(); u = (new Date).getTime();
        }
        if (!!filterState.filteredSector) {
            let tmpSector = await getSectorByID(filterState.filteredSector);
            if (tmpSector.start_date > f) f = tmpSector.start_date;
            if (tmpSector.finish_date < u) u = tmpSector.finish_date;
        }
        let mes: Measurement[] = (await getMeasurementsBetween(f, u)).rows._array;

        if (filterState.filteredPaddock != undefined) {
            let foundedPaddock = (await getPaddockByID(filterState.filteredPaddock));
            let vertices: LatLng[] = JSON.parse(foundedPaddock.vertices_list!)

            let points = mes.map((m) => { return { latitude: m.latitude, longitude: m.longitude } });
            let results = PolyHelper.getPointsInsidePoly(points, vertices);
            mes = mes.filter((m) => { return results.some((r) => { return m.latitude == r.latitude }) });
        }
        setMeasurements(mes);
        if (calibration) setWeight(await calculateByHeight(parseFloat(meanHeight(mes)), calibration));
        else if (selectedCalibration) setWeight(await calculateByHeight(parseFloat(meanHeight(mes)), selectedCalibration));
    }

    const readCalibrations = () => {
        getCalibrations()
            .then((calibrations) => {
                if (calibrations) setCalibrations(calibrations)
            })
    }

    const readSectors = (_from?: number, _until?: number) => {
        if (_from == undefined || _until == undefined) {
            getSectors().then((s) => {
                if (s) setSectors(s.filter((ss) => { return !!ss.finish_date && !!ss.start_date }))
                else setSectors([])
            })
        }
        else {
            getSectorsBetween(_from, _until).then((s) => {
                if (s) setSectors(s)
                else setSectors([])
            })
        }
    }

    const meanHeight = (_measurements: Measurement[]) => {
        let sum = 0;
        _measurements.forEach(e => { sum += e.height });
        return (sum != 0) ? (sum / (_measurements.length * 1.0)).toFixed(3) : '0.0';
    }



    const FilterButton = () => {
        return (
            <View rounded={'full'} style={{ flex: 1, position: 'absolute', bottom: 15, right: 15, padding: 0 }}>
                <TouchableOpacity activeOpacity={0.8} onPress={() => {
                    props.navigation.dispatch(CommonActions.navigate({ name: 'FiltersScreen', params: { paddockId: 1, paddockList: paddockList.map(p => { return { name: p.name, id: p.ID } }) } }))
                }}>
                    <View flexDirection={'row'} rounded={'full'} background={'#ffa726'} height={70} width={70} borderWidth={4} borderColor={'#fff'} padding={4}>
                        <Icon color={'#fff'} as={FontAwesome5} name={'filter'} size={'2xl'} marginTop={1}></Icon>
                    </View>
                </TouchableOpacity>
            </View>
        );
    }

    function FilterModal() {
        return (
            <Modal isOpen={filterModalVisible} backdropVisible padding={10} onClose={() => { setFilterModalVisible(false) }}>
                <Modal.Content width={'100%'}>
                    <Modal.Header>Filtrar Estadisticas</Modal.Header>
                    <TouchableHighlight underlayColor={'#00000055'} style={{ position: 'absolute', top: 10, right: 10, borderRadius: 6 }} onPress={() => { setFilterModalVisible(false) }}>
                        <View rounded={'md'} style={{ backgroundColor: 'red', height: 35, width: 35, paddingLeft: 7, elevation: 4 }}>
                            <Icon as={FontAwesome5} name="times" size={'lg'} color={'#fff'} />
                        </View>
                    </TouchableHighlight>
                    <Modal.Body>
                        <Heading size='md' fontWeight='light'>Desde</Heading>
                        <Button
                            isDisabled={false}
                            flexDirection={'row'}
                            variant={'subtle'}
                            colorScheme={'trueGray'}
                            endIcon={<Icon as={FontAwesome5} name="chevron-down" size="md" />}
                            marginBottom={5}
                            onPress={() => { setModalFrom(!modalFrom); }}
                        >
                            {(new Date(filterState.from_stats)).toDateString()}
                        </Button>
                        <Heading size='md' fontWeight='light'>Hasta</Heading>
                        <Button
                            isDisabled={false}
                            flexDirection={'row'}
                            variant={'subtle'}
                            colorScheme={'trueGray'}
                            endIcon={<Icon as={FontAwesome5} name="chevron-down" size="md" />}
                            onPress={() => { setModalUntil(!modalUntil); }}
                        >
                            {(new Date(filterState.until_stats)).toDateString()}
                        </Button>
                        <Divider marginTop={5} marginBottom={5} />
                        <Button
                            flexDirection={'row'}
                            colorScheme={'primary'}
                            endIcon={<Icon as={FontAwesome5} name="check" size="md" />}
                            onPress={() => { setFilterModalVisible(false); readMeasurements(); readMeasurements(); }}
                        >
                            {'Aplicar'}
                        </Button>
                    </Modal.Body>
                </Modal.Content>
            </Modal>
        );
    }

    //setSelectedSector
    //readMeasurements(sectors[item].start_date, sectors[item].finish_date)

    function MainScreen() {
        return (
            <ScrollView flex={1} contentContainerStyle={{ alignItems: 'center' }}>

                <Box shadow={3} justifyContent='space-evenly' marginTop={15} alignItems={'center'} backgroundColor={'#7a7b87'}
                    rounded={'lg'} height={220} width={'95%'} borderWidth={1} borderColor={'coolGray.200'}>
                    <Heading size='lg' marginTop={2} marginBottom={2} color={'#fff'}>Mediciones</Heading>
                    {measurements.length == 0 ?
                        <>
                            <Heading size='lg' marginBottom={2}>No registra en periodo</Heading>
                        </>
                        :
                        <LineChart
                            data={{
                                labels: measurements.map((e, i) => { return (i + 1) + '' }),
                                datasets: [
                                    {
                                        data: measurements.map(e => { return e.height })
                                    }
                                ]
                            }}
                            width={screenWidth * 0.90} // from react-native
                            height={170}
                            yAxisSuffix=" cm"
                            yAxisInterval={1} // optional, defaults to 1
                            chartConfig={{
                                backgroundColor: "#e26a00",
                                backgroundGradientFrom: "#7a7b87",
                                backgroundGradientTo: "#7a7b87",
                                decimalPlaces: 2, // optional, defaults to 2dp
                                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                                style: {
                                    borderRadius: 16
                                },
                                propsForDots: {
                                    r: "6",
                                    strokeWidth: "2",
                                    stroke: "#ffa726"
                                }
                            }}
                            bezier
                            style={{
                                marginVertical: 8,
                                borderRadius: 16
                            }}
                        />
                    }
                </Box>
                <Box shadow={3} justifyContent='space-evenly' marginTop={2} alignItems={'center'} backgroundColor={'#fff'}
                    rounded={'lg'} height={90} width={'95%'} borderWidth={1} borderColor={'coolGray.200'}>
                    <>
                        <Heading size='lg' >{'Desde: ' + FormatUtils.formatBasicDate(new Date(filterState.from_stats))}</Heading>
                        <Divider />
                        <Heading size='lg' >{'Hasta: ' + FormatUtils.formatBasicDate(new Date(filterState.until_stats))}</Heading>
                    </>
                </Box>
                <View margin={2} />
                <Box shadow={3} paddingTop={3} paddingBottom={3} justifyContent='space-evenly' alignItems={'center'} backgroundColor={'#fff'}
                    rounded={'lg'} width={'95%'} borderWidth={1} borderColor={'coolGray.200'}>
                    <Box justifyContent='space-evenly' alignItems={'center'} backgroundColor={'#fff'}
                        rounded={'lg'} height={90} width={'95%'} borderWidth={1} borderColor={'coolGray.200'}>

                        {measurements.length > 0 ?
                            <>
                                <Heading color={'trueGray.300'} size='lg' marginTop={3}>Altura Media  (cm)</Heading>
                                <Divider marginTop={3} />
                                <Heading size='3xl' marginBottom={2}>{meanHeight(measurements)}</Heading>
                            </>
                            :
                            <>
                                <Heading color={'trueGray.300'} size='lg' marginTop={3}>Altura Media  (cm)</Heading>
                                <Divider marginTop={3} />
                                <Heading size='lg' marginBottom={2}>No registra en periodo</Heading>
                            </>
                        }
                    </Box>

                    <Box justifyContent='space-evenly' marginTop={2} alignItems={'center'} backgroundColor={'#fff'}
                        rounded={'lg'} height={90} width={'95%'} borderWidth={1} borderColor={'coolGray.200'}>
                        {measurements.length > 0 ?
                            <>
                                <Heading color={'trueGray.300'} size='lg' marginTop={3}>Mediciones</Heading>
                                <Divider marginTop={3} />
                                <Heading size='3xl' marginBottom={2}>{measurements.length}</Heading>
                            </>
                            :
                            <>
                                <Heading color={'trueGray.300'} size='lg' marginTop={3}>Mediciones</Heading>
                                <Divider marginTop={3} />
                                <Heading size='lg' marginBottom={2}>No registra en periodo</Heading>
                            </>
                        }
                    </Box>
                </Box>
                <View margin={2} />
                <Box shadow={3} paddingTop={3} paddingBottom={3} justifyContent='space-evenly' alignItems={'center'} backgroundColor={'#fff'}
                    rounded={'lg'} width={'95%'} borderWidth={1} borderColor={'coolGray.200'}>

                    <Select width={screenWidth} placeholderTextColor={'#fff'}
                        borderColor={themeNavigation.colors.primary} color={'#fff'}
                        backgroundColor={themeNavigation.colors.primary} borderWidth={0}
                        selectedValue={selectedCalibration + ''}
                        onValueChange={itemValue => {
                            setSelectedCalibration(Number.parseInt(itemValue));
                            readMeasurements(Number.parseInt(itemValue));
                        }}
                        placeholder="Elegir Calibración" >
                        {calibrations.map((calibration) => {
                            return <Select.Item
                                key={calibration.ID}
                                label={calibration.name}
                                value={calibration.ID.toString()} />
                        })}
                    </Select>
                    <Box justifyContent='space-evenly' marginTop={2} alignItems={'center'} backgroundColor={'#fff'}
                        rounded={'lg'} height={90} width={'95%'} borderWidth={1} borderColor={'coolGray.200'}>
                        {measurements.length > 0 ?
                            <>
                                <Heading color={'trueGray.300'} size='lg' marginTop={3}>Peso Medio  (kgMS/ha)</Heading>
                                <Divider marginTop={3} />
                                <Heading size={selectedCalibration >= 0 ? '3xl' : 'lg'} marginBottom={2} marginRight={5}>{selectedCalibration >= 0 ? weight.toFixed(1) : 'Seleccione una calibración'}</Heading>
                            </>
                            :
                            <>
                                <Heading color={'trueGray.300'} size='lg' marginTop={3}>Peso Medio  (kgMS/ha)</Heading>
                                <Divider marginTop={3} />
                                <Heading size='lg' marginBottom={2}>No registra en periodo</Heading>
                            </>
                        }
                    </Box>
                </Box>
                <View height={25} />
                <View rounded={'full'} height={5} width={5} backgroundColor={'trueGray.300'} marginBottom={2} />
                <View rounded={'full'} height={2} width={2} backgroundColor={'trueGray.300'} marginBottom={10} />
            </ScrollView>
        );
    }

    return <>
        <MainScreen />
        <FilterButton />
    </>;

}