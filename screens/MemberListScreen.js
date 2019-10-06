import React from 'react';
import { StyleSheet, Text, View, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { ListItem, Divider } from 'react-native-elements'
import { FlatList } from 'react-native-gesture-handler';
import axios from 'axios';
import CommonHeader from '../common/CommonHeader';
import CommonActivityIndicator from '../common/CommonActivityIndicator';

const env = require('../env.json').PRODUCTION;


class MemberListScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            memberData: null,
        }
    }
    componentDidMount() {
        this.setMemberData();
    }
    setMemberData() {
        this.setState({ memberData: null });
        const request = axios.create({
            baseURL: env.MEMBER_LIST_API_URL,
            responseType: 'json',
        });
        request.get()
            .then(res => {
                this.setState({ memberData: res.data });
            })
            .catch(error => {
                Alert.alert('Error', 'APIの呼び出しに失敗しました');
                console.log(error);
            });
    }
    renderItem = ({ item }) => {
        let nameStyle = [{ flex: 2, fontSize: 12 }];
        if (item.is_leader || item.is_subleader) {
            nameStyle.push({ textDecorationLine: 'underline' });
        }
        return (
            <ListItem
                title={
                    <View style={{ flex: 1, flexDirection: 'row' }}>
                        <Text style={{ flex: 2, fontSize: 12, paddingLeft: 20 }}>{item.belong_subcategory}</Text>
                        <Text style={{ flex: 1, fontSize: 12 }}>{item.grade}</Text>
                        <Text style={nameStyle}>{item.name}</Text>
                    </View>
                }
                containerStyle={{ marginTop: -8, marginBottom: -8 }}
            />
        );
    }
    renderMemberScrollView() {
        let categories = this.state.memberData.map((item) => {return item.belong_category});
        categories = Array.from(new Set(categories));
        let views = [];
        categories.forEach((category, i) => {
            let data = this.state.memberData.filter(item => item.belong_category === category);
            let color = data[0].color;
            views.push(
                <Text key={i*4} style={[styles.categoryView, { color: color }]}>{category}</Text>,
                <Divider key={i*4+1} />,
                <FlatList
                    key={i*4+2}
                    keyExtractor={(_, index) => index.toString()}
                    data={data}
                    renderItem={this.renderItem}
                />,
                <Divider key={i*4+3}/>
            )
        })
        return (
            <ScrollView>
                <View style={{ flex: 1, marginBottom: 100 }}>
                    {views}
                </View>
            </ScrollView>
        );
    }
    render() {
        if (this.state.memberData === null) {
            return <CommonActivityIndicator/>;
        }
        return (
            <View>
                <CommonHeader
                    title="局員名簿"
                    onPress={() => this.props.navigation.openDrawer()}
                    onRefreshPress={() => this.setMemberData()}
                />
                {this.renderMemberScrollView()}
            </View>
        )
    }
}


const styles = StyleSheet.create({
    categoryView: {
        marginTop: 10,
        paddingTop: 10,
        paddingLeft: 13,
        paddingBottom: 10,
        fontSize: 14,
        fontWeight: 'bold',
    }
})

export default MemberListScreen;
