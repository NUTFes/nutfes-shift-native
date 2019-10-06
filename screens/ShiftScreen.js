import React from 'react';
import { StyleSheet, Text, View, ScrollView,
         Alert, Dimensions, Linking, AsyncStorage, TouchableOpacity } from 'react-native';
import { Button, ButtonGroup, Overlay, Divider } from 'react-native-elements'
import Icon from 'react-native-vector-icons/Feather';
import axios from 'axios';
import CommonHeader from '../common/CommonHeader';
import CommonActivityIndicator from '../common/CommonActivityIndicator';

const env = require('../env.json').PRODUCTION;
const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const SHEET_DIC = {
    1: '準備日晴れ',
    2: '準備日雨',
    3: '1日目晴れ',
    4: '1日目雨',
    5: '2日目晴れ',
    6: '2日目雨',
    7: '片付け日晴れ',
    8: '片付け日雨',
}
const TIMES = {
    '06:00': 1, '06:30': 2, '07:00': 3, '07:30': 4,
    '08:00': 5, '08:30': 6, '09:00': 7, '09:30': 8,
    '10:00': 9, '10:30': 10, '11:00': 11, '11:30': 12,
    '12:00': 13, '12:30': 14, '13:00': 15, '13:30': 16,
    '14:00': 17, '14:30': 18, '15:00': 19, '15:30': 20,
    '16:00': 21, '16:30': 22, '17:00': 23, '17:30': 24,
    '18:00': 25, '18:30': 26, '19:00': 27, '19:30': 28,
    '20:00': 29, '20:30': 30, '21:00': 31, '21:30': 32,
    '22:00': 33, '22:30': 34, '23:00': 35, '23:30': 36,
}

let currentUserXOffset = 0;
let currentUserColor = 'black';


class ShiftScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            shiftData: null,
            sheetID: null,
            sheetButtonVisible: false,
            taskDetailVisible: false,
            taskDetails: {
                name: '',
                belong: '',
                task: '',
                description: '',
                time: '',
                place: '',
                manualURL: '',
                members: null,
                start_time_id: null,
                end_time_id: null,
            },
            currentTimeID: null,
            username: null,
            weather: null,
        };
    }
    componentDidMount() {
        this.setUserName();
        this.setSheetID();
        this.setCurrentTime();
        this.setShiftData();
    }
    async setUserName() {
        let username = await AsyncStorage.getItem('username');
        if (username) {
            this.setState({ username: username });
        }
    }
    async setSheetID () {
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
        let sheetID = this.state.weather === '晴' ? 3 : 4; // デフォルトで1日目を表示
        if (month === 9) {
            switch (date) {
                case 13:
                    sheetID = this.state.weather === '晴' ? 1 : 2;  // 準備日
                    break;
                case 14:
                    sheetID = this.state.weather === '晴' ? 3 : 4; // 1日目
                    break;
                case 15:
                    sheetID = this.state.weather === '晴' ? 5 : 6; // 2日目
                    break;
                case 16:
                    sheetID = this.state.weather === '晴' ? 7 : 8; // 片付け日
                    break;
            }
        }
        this.setState({ sheetID: sheetID });
    }
    setCurrentTime() {
        setInterval(() => {
            let now = new Date();
            let hour = ('0' + now.getHours().toString()).slice(-2);
            let minutes = now.getMinutes() < 30 ? '00' : '30';
            let currentTime = hour + ':' + minutes;
            let currentTimeID = currentTime in TIMES ? TIMES[currentTime] : 0;
            this.setState({ currentTimeID: currentTimeID });
        }, 5000)
    }
    async setShiftData() {
        this.setState({ shiftData: null });
        let shiftData = [];
        for (sheetID in SHEET_DIC) {
            const request = axios.create({
                baseURL: `${env.SHIFT_DATA_API_BASE_URL}/${sheetID}`,
                responseType: 'json',
            });
            await request.get()
                .then(res => {
                    shiftData.push(res.data);
                })
                .catch(error => {
                    Alert.alert('Error', 'APIの呼び出しに失敗しました');
                    console.log(error);
                });
        }
        this.setState({ shiftData: shiftData });
    }
    setSameTimeMembers(sheet_name, task_name, start_time_id, end_time_id) {
        if (this.state.taskDetailVisible) {
            if (!task_name) {
                this.setState({
                    taskDetails: {
                        ...this.state.taskDetails,
                        members: []
                    }
                });
                return
            }
            const request = axios.create({
                baseURL: `${env.SAME_TIME_MEMBERS_API_BASE_URL}/${sheet_name}/${task_name}/${start_time_id}/${end_time_id}`,
                responseType: 'json',
            });
            request.get()
                .then(res => {
                    this.setState({
                        taskDetails: {
                            ...this.state.taskDetails,
                            members: res.data
                        }
                    });
                })
                .catch(error => {
                    Alert.alert('Error', 'APIの呼び出しに失敗しました');
                    console.log(error);
                })
        }
    }
    renderTimeColumnView() {
        let Cells = [];
        Cells.push(
            <View key={0} style={[styles.timeCellBase, styles.emptyCell]}>
                <Icon
                    name='user'
                    size={18}
                    color={currentUserColor}
                    onPress={() => this.refs.scrollView.scrollTo({ x: currentUserXOffset })}
                />
            </View>
        );
        for (let k in TIMES) {
            let timeCellStyle = [styles.timeCellBase, styles.timeCell];
            if (this.state.currentTimeID === TIMES[k]) {
                timeCellStyle.push(styles.currectTimeCell);
            }
            Cells.push(
                <Text key={TIMES[k]} style={timeCellStyle}>{k}</Text>
            );
        }
        return Cells;
    }
    renderShiftScrollView() {
        const shifts = this.state.shiftData[this.state.sheetID-1].data;
        let columns = [];
        shifts.forEach((data, i) => {
            let columnViews = [];
            columnViews.push(
                <Divider key={i} style={{ backgroundColor: data.belong.color, height: 2, marginBottom: 1 }} />,
                <Text key={i+1} style={[styles.cellBase, styles.belongCell]}>{data.belong.category_name}</Text>,
                <Text key={i+2} style={[styles.cellBase, styles.nameCell]}> {data.name} </Text>
            );
            data.tasks.forEach((task, j) => {
                let taskCellStyle = [
                    styles.cellBase, styles.taskCell, { height: TASK_CELL_HEIGHT * task.n_cell, backgroundColor: task.color || 'white' }
                ];
                // 現在時刻を強調
                if (this.state.currentTimeID >= task.start_time_id && this.state.currentTimeID <= task.end_time_id && task.name && task.name !== '×') {
                    taskCellStyle.push(styles.currectTimeCell);
                }
                columnViews.push(
                    <TouchableOpacity
                        key={i+3+j}
                        onPress={() => this.setState({
                            taskDetailVisible: true,
                            taskDetails: {
                                name: data.name,
                                belong: data.belong.category_name + '/' + data.belong.subcategory_name,
                                task: task.name,
                                description: task.description,
                                place: task.place,
                                time: task.time,
                                manualURL: task.manual_url,
                                members: task.members,
                                start_time_id: task.start_time_id,
                                end_time_id: task.end_time_id,
                            }
                        })}
                    >
                        <Text style={taskCellStyle}>{task.name}</Text>
                    </TouchableOpacity>
                );
            })
            let currentUserStyle = {};
            if (data.name === this.state.username) {
                currentUserStyle = { borderWidth: 1, borderColor: data.belong.color, marginTop: -1 }
                currentUserXOffset = 70 * i - SCREEN_WIDTH / 2 + 40 + 35;
                currentUserColor = data.belong.color;
            }
            columns.push(
                <View key={i} style={currentUserStyle}>{columnViews}</View>
            );
        })
        return (
            <ScrollView
                horizontal
                contentOffset={{ x: currentUserXOffset }}
                ref='scrollView'
            >
                {columns}
            </ScrollView>
        );
    }
    renderSheetSelectButtons() {
        if (this.state.sheetButtonVisible === true) {
            const buttons = Object.values(SHEET_DIC).map(sheetName => <Text style={styles.sheetButtonGroupText}>{sheetName}</Text>);
            return (
                <ButtonGroup
                    onPress={ async(sheetID) => {
                        if (sheetID+1 === this.state.sheetID) {
                            this.setState({ sheetButtonVisible: false });
                        } else {
                            await this.setState({
                                sheetID: sheetID+1,
                                sheetButtonVisible: false,
                            });
                            this.renderShiftScrollView();
                        }
                    }}
                    selectedIndex={this.state.sheetID-1}
                    buttons={buttons}
                    containerStyle={styles.sheetButtonGroup}
                    selectedButtonStyle={{ backgroundColor: 'mediumseagreen' }}
                />
            );
        }
    }
    openLink(url) {
        if (url) {
            Linking.canOpenURL(url)
                .then(_ => { Linking.openURL(url) })
                .catch(error => {
                    Alert.alert('Error', '無効なURLです');
                    console.log(error);
                })
        }
    }
    renderTaskDetailOverlay() {
        if (this.state.taskDetailVisible === false) {
            return
        }
        // 同じ時間帯のメンバーを取得
        if (this.state.taskDetails.members.length === 0) {
            this.setSameTimeMembers(
                SHEET_DIC[this.state.sheetID], this.state.taskDetails.task, this.state.taskDetails.start_time_id, this.state.taskDetails.end_time_id
            );
        }
        let memberView = [];
        const members = this.state.taskDetails.members;
        if (members.length === 0) {
            memberView = [<Text key={0} style={{ fontSize: 10 }}>loading...</Text>];
        } else {
            for (let i = 0; i < members.length; i += 2) {
                memberView.push(
                    <View key={i} style={{ flex: 1, flexDirection: 'row' }}>
                        <View style={{ flex: 1, flexDirection: 'row' }}>
                            <Text style={{ flex: 5, fontSize: 10, color: 'darkslategray' }}>{members[i].belong} {members[i].grade} </Text>
                            <Text style={{ flex: 6, fontSize: 12 }}>{members[i].name}</Text>
                        </View>
                        <View style={{ flex: 1, flexDirection: 'row' }}>
                            <Text style={{ flex: 5, fontSize: 10, color: 'darkslategray' }}>{members[i + 1].belong} {members[i + 1].grade} </Text>
                            <Text style={{ flex: 6, fontSize: 12 }}>{members[i + 1].name}</Text>
                        </View>
                    </View>
                )
            }
        }

        return (
            <Overlay
                isVisible={this.state.taskDetailVisible}
                onBackdropPress={() => this.setState({ taskDetailVisible: false})}
                width={SCREEN_WIDTH*0.8}
                height={SCREEN_HEIGHT*0.9}
            >
                <ScrollView>
                    <View style={{ height: 30, alignItems: 'center', justifyContent: 'center' }}>
                        <TouchableOpacity
                            onPress={() => {
                                this.setState({ taskDetailVisible: false });
                                this.props.navigation.navigate(
                                    'task_shift',
                                    { taskName: this.state.taskDetails.task, sheetID: this.state.sheetID }
                                );
                            }}
                        >
                            <Text style={{ fontSize: 16, color: 'mediumseagreen', fontWeight: 'bold' }}>
                                {this.state.taskDetails.task}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ height: 16 }}>
                        <Text style={{ fontSize: 12 }}>
                            場所：{this.state.taskDetails.place}
                        </Text>
                    </View>
                    <View style={{ height: 16 }}>
                        <Text style={{ fontSize: 12 }}>
                            時間：{this.state.taskDetails.time}
                        </Text>
                    </View>
                    <View style={{ flexDirection: 'row', height: 16 }}>
                        <Text style={{ fontSize: 12 }}>
                            マニュアル：
                        </Text>
                        <Text
                            style={{ fontSize: 12, color: 'royalblue' }}
                            onPress={() => this.openLink(this.state.taskDetails.manualURL)}
                        >
                            {this.state.taskDetails.manualURL}
                        </Text>
                    </View>
                    <View style={{ marginTop: 5, marginBottom: 5, padding: 10, backgroundColor: 'honeydew' }}>
                        <Text style={{ fontSize: 12 }}>
                            {this.state.taskDetails.description}
                        </Text>
                    </View>
                    <View style={{ alignItems: 'center', height: 12, marginTop: 10 }}>
                        <Text style={{ fontSize: 12 }}>
                            同じ時間帯のメンバー
                        </Text>
                    </View>
                    <View style={{ marginTop: 5, marginBottom: 5, padding: 10, backgroundColor: 'beige'}}>
                        {memberView}
                    </View>
                </ScrollView>
            </Overlay>
        )
    }
    render() {
        if (this.state.username === null || this.state.shiftData === null) {
            return <CommonActivityIndicator/>;
        }
        const title = (
            <Button
                title={SHEET_DIC[this.state.sheetID]}
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
        );
        return (
            <View>
                <CommonHeader
                    title={title}
                    onPress={() => this.props.navigation.openDrawer()}
                    onRefreshPress={() => {this.setSheetID(); this.setShiftData();}}
                />
                {this.renderSheetSelectButtons()}
                {this.renderTaskDetailOverlay()}
                <ScrollView maximumZoomScale={2.0}>
                    <View style={{ flex: 1, flexDirection: 'row', marginBottom: 200 }}>
                        <View style={{ width: 40, alignItems: 'center'}}>
                            {this.renderTimeColumnView()}
                        </View>
                        <View style={{ width: SCREEN_WIDTH - 50 }}>
                            {this.renderShiftScrollView()}
                        </View>
                    </View>
                </ScrollView>
            </View>
        );
    }
}

const NAME_CELL_HEIGHT = 18;
const TASK_CELL_HEIGHT = 20;

const styles = StyleSheet.create({
    timeColumn: {
        position: 'absolute',
        left: 0,
    },
    cellBase: {
        width: 70,
        textAlign: 'center',
        fontSize: 10,
    },
    belongCell: {
        backgroundColor: 'white',
        height: NAME_CELL_HEIGHT,
        paddingTop: 5,
    },
    nameCell: {
        backgroundColor: 'white',
        height: NAME_CELL_HEIGHT,
        paddingTop: 3,
        fontWeight: 'bold'
    },
    taskCell: {
        margin: 0,
        paddingTop: 5,
        borderColor: '#F2F2F2',
        borderWidth: 1,
    },
    timeCellBase: {
        width: 40,
        fontSize: 10,
        textAlign: 'center',
    },
    emptyCell: {
        height: NAME_CELL_HEIGHT*2 + 3,
        alignItems: 'center',
        justifyContent: 'center',
    },
    timeCell: {
        height: TASK_CELL_HEIGHT,
        borderWidth: 1,
        borderColor: '#F2F2F2',
    },
    sheetButtonGroup: {
        marginBottom: 20,
        height: 30,
    },
    sheetButtonGroupText: {
        fontSize: 7,
    },
    currectTimeCell: {
        borderWidth: 1,
        borderColor: 'red',
    },
})

export default ShiftScreen;
