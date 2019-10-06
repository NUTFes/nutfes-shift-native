import React from 'react';
import {
  StyleSheet, Text, View, ScrollView,
  Alert, Dimensions, Linking, AsyncStorage, TouchableOpacity
} from 'react-native';
import { Button, ButtonGroup, Overlay } from 'react-native-elements'
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


class MyShiftScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      shiftData: null,
      sheetID: 3,
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
  async componentDidMount() {
    await this.setUserName();
    await this.setCurrentTime();
    await this.setSheetID();
    await this.setShiftData();
  }
  async setUserName() {
    let username = await AsyncStorage.getItem('username');
    if (username) {
      this.setState({ username: username });
    } else {
      Alert.alert('Error', 'ログインしてください');
      this.props.navigation.navigate('login');
    }
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
    const request = axios.create({
      baseURL: `${env.MY_SHIFT_DATA_API_BASE_URL}/${this.state.username}`,
      responseType: 'json',
    });
    await request.get()
      .then(res => {
        this.setState({ shiftData: res.data });
      })
      .catch(error => {
        Alert.alert('Error', 'APIの呼び出しに失敗しました');
        console.log(error);
      });
  }
  renderTimeViews() {
    let views = [];
    for (let time in TIMES) {
      let timeCellStyle = [styles.timeCell];
      if (this.state.currentTimeID === TIMES[time]) {
        timeCellStyle.push(styles.currentTimeCell);
      }
      views.push(
        <Text key={TIMES[time]} style={timeCellStyle}>{time}</Text>
      );
    }
    return views;
  }
  renderShiftScrollView() {
    const data = this.state.shiftData;
    const sheetData = data.find((item) => item.sheet_name === SHEET_DIC[this.state.sheetID]);
    let views = [];
    sheetData.tasks.forEach((task, i) => {
      let taskCellStyle = [
        styles.taskCell, {
          height: TASK_CELL_HEIGHT * task.n_cell,
          paddingTop: TASK_CELL_HEIGHT * (task.n_cell - 1) / 2 + 3,
          backgroundColor: task.color || 'white' }
      ];
      if (this.state.currentTimeID >= task.start_time_id && this.state.currentTimeID <= task.end_time_id && task.name && task.name !== '×') {
        taskCellStyle.push(styles.currentTimeCell);
      }
      views.push(
        <TouchableOpacity
          key={i}
          onPress={() => this.setState({
            taskDetailVisible: true,
            taskDetails: {
              name: data.name,
              belong: data.category_name + '/' + data.subcategory_name,
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
    return (
      <ScrollView>{views}</ScrollView>
    )
  }
  renderSheetSelectButtons() {
    if (this.state.sheetButtonVisible === true) {
      const buttons = Object.values(SHEET_DIC).map(sheetName => <Text style={{ fontSize: 7 }}>{sheetName}</Text>);
      return (
        <ButtonGroup
          onPress={async (sheetID) => {
            if (sheetID + 1 === this.state.sheetID) {
              this.setState({ sheetButtonVisible: false });
            } else {
              await this.setState({ sheetID: sheetID + 1, sheetButtonVisible: false });
              this.renderShiftScrollView();
            }
          }}
          selectedIndex={this.state.sheetID - 1}
          buttons={buttons}
          containerStyle={{ marginBottom: 20, height: 30 }}
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
      for (let i = 0; i <= members.length / 2; i += 2) {
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
        onBackdropPress={() => this.setState({ taskDetailVisible: false })}
        width={SCREEN_WIDTH * 0.8}
        height={SCREEN_HEIGHT * 0.9}
      >
        <ScrollView>
          <View style={{ height: 30, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
              {this.state.taskDetails.task}
            </Text>
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
          <View style={{ marginTop: 5, marginBottom: 5, padding: 10, backgroundColor: 'beige' }}>
            {memberView}
          </View>
        </ScrollView>
      </Overlay>
    )
  }
  render() {
    if (this.state.shiftData === null) {
      return <CommonActivityIndicator />;
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
    )
    return (
      <View>
        <CommonHeader
          title={title}
          onPress={() => this.props.navigation.openDrawer()}
          onRefreshPress={() => this.setShiftData()}
        />
        {this.renderSheetSelectButtons()}
        {this.renderTaskDetailOverlay()}
        <ScrollView maximumZoomScale={2.0}>
          <View style={{ flex: 1, flexDirection: 'row', marginBottom: 200 }}>
            <View style={{ width: TIME_CELL_WIDTH, alignItems: 'center' }}>
              {this.renderTimeViews()}
            </View>
            <View style={{ width: SCREEN_WIDTH - TIME_CELL_WIDTH }}>
              {this.renderShiftScrollView()}
            </View>
          </View>
        </ScrollView>
      </View>
    )
  }
}

const TASK_CELL_HEIGHT = 26;
const TIME_CELL_WIDTH = 40;

const styles = StyleSheet.create({
  taskCell: {
    width: SCREEN_WIDTH - TIME_CELL_WIDTH - 5,
    fontSize: 14,
    textAlign: 'center',
    borderColor: '#F2F2F2',
    borderWidth: 1,
    justifyContent: 'center',
  },
  timeCell: {
    width: TIME_CELL_WIDTH,
    height: TASK_CELL_HEIGHT,
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

export default MyShiftScreen;
