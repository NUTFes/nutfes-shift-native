import React from 'react';
import { StyleSheet, Text, View, Alert, ActivityIndicator, Linking, ScrollView } from 'react-native';
import { ListItem, Divider } from 'react-native-elements'
import { FlatList } from 'react-native-gesture-handler';
import axios from 'axios';
import CommonHeader from '../common/CommonHeader';
import CommonActivityIndicator from '../common/CommonActivityIndicator';

const env = require('../env.json').PRODUCTION;


class ManualListScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            manualData: null,
        };
    }
    componentDidMount() {
        this.setManualData();
    }
    setManualData() {
        this.setState({ manualData: null });
        const request = axios.create({
            baseURL: env.MANUAL_API_URL,
            responseType: 'json',
        });
        request.get()
            .then(res => {
                const manualData = res.data.sort((a, b) => {
                    if (a.order === null && b.order === null) return 0;
                    if (a.order === null) return 1;
                    if (b.order === null) return -1;
                    if (a.order < b.order) return -1;
                    if (a.order > b.order) return 1;
                    return 0;
                })
                this.setState({ manualData: manualData });
            })
            .catch(error => {
                Alert.alert('Error', 'APIの呼び出しに失敗しました');
                console.log(error);
            });
    }
    openLink(url) {
        if (url) {
            Linking.canOpenURL(url)
                .then(_ => {
                    Linking.openURL(url);
                })
                .catch(error => {
                    Alert.alert('Error', '無効なURLです');
                    console.log(error);
                })
        }
    }
    renderItem = ({ item }) => (
        <ListItem
            title={item.title}
            titleStyle={{ fontSize: 14 }}
            containerStyle={{ marginTop: -8, marginBottom: -8 }}
            onPress={() => {this.openLink(item.url)}}
            leftIcon={{ name: 'link', size: 20 }}
        />
    )
    renderManualScrollView() {
        const categories = this.state.manualData.map((item) => {return item.category});
        const categorySet = Array.from(new Set(categories));
        let views = [];
        categorySet.forEach((category, index) => {
            views.push(
                <Text key={index*3} style={styles.categoryView}>{category}</Text>,
                <Divider key={index*3+1}/>,
                <FlatList
                    key={index*3+2}
                    keyExtractor={(_, index) => index.toString()}
                    data={this.state.manualData.filter(item => item.category === category)}
                    renderItem={this.renderItem}
                />,
            )
        })
        return (
            <ScrollView>
                <View style={{ flex: 1, marginBottom: 200 }}>
                    {views}
                </View>
            </ScrollView>
        );
    }
    render() {
        if (this.state.manualData === null) {
            return <CommonActivityIndicator/>;
        }
        return (
            <View>
                <CommonHeader
                    title="技大祭マニュアル"
                    onPress={() => this.props.navigation.openDrawer()}
                    onRefreshPress={() => this.setManualData()}
                />
                {this.renderManualScrollView()}
            </View>
        );
    }
}


const styles = StyleSheet.create({
    categoryView: {
        marginTop: 10,
        paddingTop: 10,
        paddingLeft: 10,
        paddingBottom: 3,
        fontSize: 14,
        fontWeight: 'bold',
    }
})

export default ManualListScreen;
