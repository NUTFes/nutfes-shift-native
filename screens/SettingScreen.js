import React from 'react';
import { Text, View, AsyncStorage, Alert } from 'react-native';
import { Button } from 'react-native-elements';
import CommonHeader from '../common/CommonHeader';


class SettingScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            username: null,
        };
    }
    componentDidMount() {
        this.setUserName();
    }
    async setUserName() {
        let username = await AsyncStorage.getItem('username');
        if (username) {
            this.setState({ username: username });
        }
    }
    async onLogoutButtonPress() {
        await AsyncStorage.removeItem('isInitialized');
        await AsyncStorage.removeItem('username');
        Alert.alert('ログアウトしました');
        this.props.navigation.navigate('login');
    }
    render() {
        return (
            <View style={{ flex: 1 }}>
                <CommonHeader title="設定" onPress={() => this.props.navigation.openDrawer()} />
                <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
                    <Text style={{ height: 30, textAlign: 'center' }}>
                        ログインユーザ: {this.state.username}
                    </Text>
                    <Button
                        title="ログアウト"
                        buttonStyle={{ backgroundColor: 'red' }}
                        onPress={() => this.onLogoutButtonPress()}
                    />
                </View>
            </View>
        );
    }
}

export default SettingScreen;
