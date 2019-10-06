import React from 'react';
import { StyleSheet, Text, View, Alert, ScrollView, Image, Dimensions, Linking, TouchableOpacity } from 'react-native';
import {Divider } from 'react-native-elements'
import HTMLView from 'react-native-htmlview';
import axios from 'axios';
import CommonHeader from '../common/CommonHeader';
import CommonActivityIndicator from '../common/CommonActivityIndicator';

const env = require('../env.json').PRODUCTION;
const SCREEN_WIDTH = Dimensions.get('window').width;


class ContactScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            contactData: null,
        }
    }
    componentDidMount() {
        this.setContactData();
    }
    setContactData() {
        this.setState({ contactData: null });
        const request = axios.create({
            baseURL: env.CONTACT_API_URL,
            responseType: 'json',
        });
        request.get()
            .then(res => {
                this.setState({ contactData: res.data });
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
    renderNode(node, index, siblings, parent, defaultRenderer) {
        if (node.name == 'img') {
            const a = node.attribs;
            return (
                <Image
                    key={index}
                    style={{ width: SCREEN_WIDTH * 0.5, height: SCREEN_WIDTH * 0.4 }}
                    source={{ uri: env.DOMAIN + a.src }}
                />
            );
        }
    }
    renderContactScrollView() {
        let views = [];
        this.state.contactData.forEach((contact, i) => {
            let link = env.CONTACT_PAGE_URL_BASE + contact.id;
            views.push(
                <View key={i}>
                    <TouchableOpacity onPress={() => this.openLink(link)}>
                        <Text style={styles.title}>{contact.title}</Text>
                    </TouchableOpacity>
                    <HTMLView
                        value={contact.text}
                        renderNode={this.renderNode}
                        stylesheet={styles}
                        onLinkPress={(url) => this.openLink(url)}
                        paragraphBreak=''
                        lineBreak=''
                    />
                    <Text style={styles.date}>作成:{contact.created_at} 更新:{contact.updated_at}</Text>
                    <Divider style={{ marginBottom: 20 }}/>
                </View>
            );
        })
        return (
            <ScrollView>
                <View style={{ paddingBottom: 300, padding: 16 }}>
                    {views}
                </View>
            </ScrollView>
        )
    }
    render() {
        if (this.state.contactData === null) {
            return <CommonActivityIndicator/>;
        }
        return (
            <View>
                <CommonHeader
                    title="全体連絡"
                    onPress={() => this.props.navigation.openDrawer()}
                    onRefreshPress={() => this.setContactData()}
                />
                {this.renderContactScrollView()}
            </View>
        );
    }
}


const styles = StyleSheet.create({
    ul: {
        marginTop: -40,
        marginBottom: -40,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    date: {
        fontSize: 10,
        textAlign: 'right',
        marginTop: 20,
        marginBottom: 20,
    }
})

export default ContactScreen;
