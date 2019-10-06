import React from 'react';
import { StyleSheet, Text, View, Alert, ActivityIndicator, Dimensions, ScrollView } from 'react-native';
import { Divider, Button, ButtonGroup } from 'react-native-elements'
import Icon from 'react-native-vector-icons/Feather';
import axios from 'axios';
import CommonHeader from '../common/CommonHeader';
import CommonActivityIndicator from '../common/CommonActivityIndicator';


const env = require('../env.json').PRODUCTION;
const SCREEN_WIDTH = Dimensions.get('window').width;
const SHEETS = {
    0: '一日目晴れ',
    1: '一日目雨',
    2: '二日目晴れ',
    3: '二日目雨'
}
const TIMES = {
    '09:00': 1, '09:15': 2, '09:30': 3, '09:45': 4,
    '10:00': 5, '10:15': 6, '10:30': 7, '10:45': 8,
    '11:00': 9, '11:15': 10, '11:30': 11, '11:45': 12,
    '12:00': 13, '12:15': 14, '12:30': 15, '12:45': 16,
    '13:00': 17, '13:15': 18, '13:30': 19, '13:45': 20,
    '14:00': 21, '14:15': 22, '14:30': 23, '14:45': 24,
    '15:00': 25, '15:15': 26, '15:30': 27, '15:45': 28,
    '16:00': 29, '16:15': 30, '16:30': 31, '16:45': 32,
    '17:00': 33, '17:15': 34, '17:30': 35, '17:45': 36,
    '18:00': 37, '18:15': 38, '18:30': 39, '18:45': 40,
    '19:00': 41, '19:15': 42, '19:30': 43, '19:45': 44,
    '20:00': 45
}


class TimeTableScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            timetableData: null,
            sheetID: 0,
            sheetButtonVisible: false,
            currentTimeID: null,
            weather: null,
        };
    }
    componentDidMount() {
        this.setSheetID();
        this.setTimetableData();
        this.setCurrentTime();
    }
    async setSheetID() {
        // weatherを取得
        const request = axios.create({
            baseURL: env.WEATHER_API_URL,
            responseType: 'json',
        });
        await request.get()
            .then(res => {
                this.setState({ weather: res.data });
            })
            .catch(error => {
                Alert.alert('Error', 'APIの呼び出しに失敗しました');
                console.log(error);
            })

        // 現在の日付に応じてsheetIDを変更
        const date = new Date().getDate();
        const month = new Date().getMonth() + 1;
        let sheetID = this.state.weather === '晴' ? 0 : 1; // デフォルトで1日目を表示
        if (month === 9) {
            switch (date) {
                case 14:
                    sheetID = this.state.weather === '晴' ? 0 : 1; // 1日目
                    break;
                case 15:
                    sheetID = this.state.weather === '晴' ? 2 : 3; // 2日目
                    break;
            }
        }
        this.setState({ sheetID: sheetID });
    }
    setTimetableData() {
        this.setState({ timetableData: null });
        const request = axios.create({
            baseURL: env.TIME_TABLE_API_URL,
            responseType: 'json',
        });
        request.get()
            .then(res => {
                this.setState({ timetableData: res.data });
            })
            .catch(error => {
                Alert.alert('Error', 'APIの呼び出しに失敗しました');
                console.log(error);
            });
    }
    setCurrentTime() {
        setInterval(() => {
            let now = new Date();
            let hour = ('0' + now.getHours().toString()).slice(-2);
            let minutes = now.getMinutes() < 30 ? '00' : '30';
            let currentTime = hour + ':' + minutes;
            currentTimeID = currentTime in TIMES ? TIMES[currentTime] : 0;
            this.setState({ currentTimeID: currentTimeID });
        }, 5000)
    }
    renderTimeViews() {
        let views = [];
        views.push(
            <Text key={0} style={styles.emptyCell}></Text>
        );
        for (let time in TIMES) {
            let timeCellStyle = [styles.timeCell];
            if (this.state.currentTimeID === TIMES[time]){
                timeCellStyle.push(styles.currentTimeCell);
            }
            views.push(
                <Text key={TIMES[time]} style={timeCellStyle}>{time}</Text>
            );
        }
        return views
    }
    renderTimetableScrollView() {
        const timetableData = this.state.timetableData.find((item) => item.sheet_name === SHEETS[this.state.sheetID]).data;
        let columns = [];
        timetableData.forEach((data, i) => {
            let columnViews = [];
            columnViews.push(
                <Text key={i} style={styles.placeCell}>{data.place}</Text>,
                <Divider key={i+1} />,
            );
            data.events.forEach((event, j) => {
                let paddingTop = 18 * (event.n_cell - 1) / 2 + 3;
                let eventCellStyle = [styles.eventCell, { height: 20 * event.n_cell, paddingTop: paddingTop, backgroundColor: event.color }];
                if (event.name && this.state.currentTimeID >= TIMES[event.start_time] && this.state.currentTimeID < TIMES[event.end_time]) {
                    eventCellStyle.push(styles.currentTimeCell);
                }
                columnViews.push(
                    <Text key={i+2+j} style={eventCellStyle}>{event.name}</Text>
                );
            })
            columns.push(
                <View key={i}>{columnViews}</View>
            );
        })
        return (
            <ScrollView horizontal>
                {columns}
            </ScrollView>
        )
    }
    renderSheetSelectButton() {
        if (this.state.sheetButtonVisible === true) {
            const buttons = Object.values(SHEETS).map(sheetName => <Text style={{ fontSize: 10 }}>{sheetName}</Text>);
            return (
                <ButtonGroup
                    onPress={(sheetID) => {
                        if (sheetID === this.state.sheetID) {
                            this.setState({ sheetButtonVisible: false });
                        } else {
                            this.setState({ sheetID, sheetButtonVisible: false });
                        }
                    }}
                    selectedIndex={this.state.sheetID}
                    buttons={buttons}
                    containerStyle={{ marginBottom: 20, height: 30 }}
                    selectedButtonStyle={{ backgroundColor: 'mediumseagreen' }}
                />
            )
        }
    }
    render() {
        if (this.state.timetableData === null) {
            return <CommonActivityIndicator/>;
        }
        const title = (
            <Button
                title={SHEETS[this.state.sheetID]}
                type='clear'
                onPress={() => this.setState({ sheetButtonVisible: !this.state.sheetButtonVisible })}
                titleStyle={{ color: 'black', fontSize: 16 }}
                icon={
                    <Icon
                        style={{ marginLeft: 3 }}
                        name={this.state.sheetButtonVisible ? 'chevron-up' : 'chevron-down'}
                        size={15}
                        color='black'
                    />
                }
                iconRight
                containerStyle={{ paddingLeft: 20 }}
            />
        )
        return (
            <View>
                <CommonHeader
                    title={title}
                    onPress={() => this.props.navigation.openDrawer()}
                    onRefreshPress={() => {this.setSheetID(); this.setTimetableData();}}
                />
                {this.renderSheetSelectButton()}
                <ScrollView>
                    <View style={{ flex: 1, flexDirection: 'row', marginBottom: 100}}>
                        <View style={{ width: 40, alignItems: 'center' }}>
                            {this.renderTimeViews()}
                        </View>
                        <View style={{ width: SCREEN_WIDTH - 40}}>
                            {this.renderTimetableScrollView()}
                        </View>
                    </View>
                </ScrollView>
            </View>
        );
    }
}


const styles = StyleSheet.create({
    eventCell: {
        width: 100,
        height: 20,
        fontSize: 10,
        textAlign: 'center',
        borderColor: '#F2F2F2',
        borderWidth: 1,
    },
    placeCell: {
        width: 100,
        height: 30,
        fontSize: 10,
        textAlign: 'center',
        fontWeight: 'bold',
        paddingTop: 10,
    },
    emptyCell: {
        width: 30,
        height: 30,
        fontSize: 10,
    },
    timeCell: {
        width: 40,
        height: 20,
        fontSize: 10,
        textAlign: 'center',
        borderWidth: 1,
        borderColor: '#F2F2F2',
    },
    currentTimeCell: {
        borderWidth: 1,
        borderColor: 'red',
    }
})

export default TimeTableScreen;
