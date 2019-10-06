import React, { Component } from 'react';
import { View, Alert } from 'react-native';
import { createAppContainer, createSwitchNavigator, createDrawerNavigator, createStackNavigator } from 'react-navigation'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Notifications } from 'expo';

import LoginScreen from './screens/LoginScreen';
import MyShiftScreen from './screens/MyShiftScreen';
import ShiftScreen from './screens/ShiftScreen';
import TaskShiftScreen from './screens/TaskShiftScreen';
import TimeTableScreen from './screens/TimeTableScreen';
import ManualListScreen from './screens/ManualListScreen';
import MemberListScreen from './screens/MemberListScreen';
import ContactScreen from './screens/ContactScreen';
import MapScreen from './screens/MapScreen';
import SettingScreen from './screens/SettingScreen';


export default class App extends Component {
  componentDidMount() {
    this._notificationSubscription = Notifications.addListener(this._handleNotification);
  }
  _handleNotification = async (notification) => {
    if (notification.origin === 'received') {
      Alert.alert(notification.data.title, notification.data.body);
    }
  }
  render() {
    const ShiftStack = createStackNavigator({
      shift: { screen: ShiftScreen, navigationOptions: { header: null } },
      task_shift: { screen: TaskShiftScreen, navigationOptions: { header: null } },
    })

    const MainDrawer = createDrawerNavigator({
      myshift: { screen: MyShiftScreen, navigationOptions: { drawerLabel: "個人シフト", drawerIcon: <Icon name='view-sequential' size={20} /> } },
      shift: { screen: ShiftStack, navigationOptions: { drawerLabel: "全体シフト", drawerIcon: (<Icon name='view-dashboard-variant' size={20}/>) } },
      time_table: { screen: TimeTableScreen, navigationOptions: { drawerLabel: "タイムテーブル", drawerIcon: (<Icon name='view-dashboard' size={20}/>) } },
      manual: { screen: ManualListScreen, navigationOptions: { drawerLabel: "技大祭マニュアル", drawerIcon: (<Icon name='view-list' size={20}/>) } },
      member: { screen: MemberListScreen, navigationOptions: { drawerLabel: "名簿", drawerIcon: (<Icon name='account-details' size={20}/>) } },
      contact: { screen: ContactScreen, navigationOptions: { drawerLabel: "全体連絡", drawerIcon: (<Icon name='content-paste' size={20}/>) } },
      map: { screen: MapScreen, navigationOptions: { drawerLabel: "会場マップ", drawerIcon: (<Icon name='map' size={20}/>) }},
      setting: { screen: SettingScreen, navigationOptions: { drawerLabel: "設定", drawerIcon: (<Icon name='settings' size={20}/>) } },
    }, {
      contentOptions: {
        activeTintColor: 'mediumseagreen',
      },
    });

    const NavigatorTab = createAppContainer(
      createSwitchNavigator({
        login: LoginScreen,
        main: MainDrawer,
      })
    );
    return (
      <View style={{ flex: 1 }}>
        <NavigatorTab />
      </View>
    );
  }
}
