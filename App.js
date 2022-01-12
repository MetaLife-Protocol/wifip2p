import React, {PureComponent} from 'react';
import {
  StyleSheet,
  View,
  Button,
  NativeModules,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import {Divider} from 'react-native-elements';
import {
  initialize,
  startDiscoveringPeers,
  stopDiscoveringPeers,
  unsubscribeFromPeersUpdates,
  unsubscribeFromThisDeviceChanged,
  unsubscribeFromConnectionInfoUpdates,
  subscribeOnConnectionInfoUpdates,
  subscribeOnThisDeviceChanged,
  subscribeOnPeersUpdates,
  connect,
  cancelConnect,
  createGroup,
  removeGroup,
  getAvailablePeers,
  sendFile,
  receiveFile,
  getConnectionInfo,
  getGroupInfo,
  receiveMessage,
  sendMessage,
} from 'react-native-wifi-p2p';
import {PermissionsAndroid} from 'react-native';

function Item({item}) {
  return (
    <View style={styles.listItem}>
      <Image
        source={{uri: item.photo}}
        style={{width: 60, height: 60, borderRadius: 30}}
      />
      <View style={{alignItems: 'center', flex: 1}}>
        <Text style={{fontWeight: 'bold'}}>{item.name}</Text>
        <Text>{item.status}</Text>
      </View>
      <TouchableOpacity
        style={{
          height: 50,
          width: 50,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Text style={{color: 'green'}}>Call</Text>
      </TouchableOpacity>
    </View>
  );
}

const devinfo = {
  name: 'Sasha Ho',
  status: 'Administrative Assistant',
  photo:
    'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?h=350&auto=compress&cs=tinysrgb',
};

const devInfo = () => {
  return (
    <View style={styles.devinfo}>
      <Image
        source={{uri: devinfo.photo}}
        style={{width: 60, height: 60, borderRadius: 30}}
      />
      <View style={{alignItems: 'center', flex: 1}}>
        <Text style={{fontWeight: 'bold'}}>{devinfo.name}</Text>
        <Text>{devinfo.status}</Text>
      </View>
    </View>
  );
};

const ItemDivider = () => {
  return (
    <View
      style={{
        height: 1,
        width: '100%',
        backgroundColor: '#607D8B',
      }}
    />
  );
};

const activityStarter = NativeModules.ActivityStarter;
const eventEmitterModule = NativeModules.EventEmitter;

type Props = {};
export default class App extends PureComponent<Props> {
  state = {
    devices: [],
    data: [
      {
        name: 'Miyah Myles',
        email: 'miyah.myles@gmail.com',
        status: 'Data Entry Clerk',
        photo:
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&fit=max&s=707b9c33066bf8808c934c8ab394dff6',
      },
      {
        name: 'June Cha',
        email: 'june.cha@gmail.com',
        status: 'Sales Manager',
        photo: 'https://randomuser.me/api/portraits/women/44.jpg',
      },
      {
        name: 'Iida Niskanen',
        email: 'iida.niskanen@gmail.com',
        status: 'Sales Manager',
        photo: 'https://randomuser.me/api/portraits/women/68.jpg',
      },
    ],
  };

  async componentDidMount() {
    try {
      await initialize();
      // since it's required in Android >= 6.0
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        {
          title: 'Access to wi-fi P2P mode',
          message: 'ACCESS_COARSE_LOCATION',
        },
      );

      console.log(
        granted === PermissionsAndroid.RESULTS.GRANTED
          ? ' MTL: You can use the p2p mode'
          : ' MTL: Permission denied: p2p mode will not work',
      );

      subscribeOnPeersUpdates(this.handleNewPeers);
      subscribeOnConnectionInfoUpdates(this.handleNewInfo);
      subscribeOnThisDeviceChanged(this.handleThisDeviceChanged);

      const status = await startDiscoveringPeers();
      status.promise
        .then(() => {
          console.log(' MTL: startDiscoveringPeers ok: ');
        })
        .catch((err: any) => {
          console.log(' MTL: startDiscoveringPeers err: ', err);
        });
      console.log(' MTL: startDiscoveringPeers status: ', status);
    } catch (e) {
      console.error(e);
    }
  }

  componentWillUnmount() {
    unsubscribeFromConnectionInfoUpdates(this.handleNewInfo);
    unsubscribeFromPeersUpdates(this.handleNewPeers);
    unsubscribeFromThisDeviceChanged(this.handleThisDeviceChanged);
  }

  beginFindPeers = async () => {
    const status = await startDiscoveringPeers();
    status.promise
      .then(() => {
        console.log(' MTL: startDiscoveringPeers ok: ');
      })
      .catch((err: any) => {
        console.log(' MTL: startDiscoveringPeers err: ', err);
      });
    console.log(' MTL: startDiscoveringPeers status: ', status);
  };

  handleNewInfo = info => {
    console.log(' MTL: OnConnectionInfoUpdated', info);
  };

  handleNewPeers = ({devices}) => {
    console.log(' MTL: OnPeersUpdated', devices);
    this.setState({devices: devices});
  };

  handleThisDeviceChanged = groupInfo => {
    console.log(' MTL: THIS_DEVICE_CHANGED_ACTION', groupInfo);
  };

  connectToFirstDevice = () => {
    console.log(' MTL: Connect to: ', this.state.devices[0]);
    connect(this.state.devices[0].deviceAddress)
      .then(() => console.log(' MTL: Successfully connected'))
      .catch(err =>
        console.error(' MTL: Something gone wrong. Details: ', err),
      );
  };

  onCancelConnect = () => {
    cancelConnect()
      .then(() =>
        console.log(' MTL: cancelConnect', 'Connection successfully canceled'),
      )
      .catch(err =>
        console.error(
          ' MTL: cancelConnect',
          'Something gone wrong. Details: ',
          err,
        ),
      );
  };

  onCreateGroup = () => {
    createGroup()
      .then(() => console.log(' MTL: Group created successfully!'))
      .catch(err =>
        console.error(' MTL: Something gone wrong. Details: ', err),
      );
  };

  onRemoveGroup = () => {
    removeGroup()
      .then(() => console.log("Currently you don't belong to group!"))
      .catch(err =>
        console.error(' MTL: Something gone wrong. Details: ', err),
      );
  };

  onStopInvestigation = () => {
    stopDiscoveringPeers()
      .then(() => console.log(' MTL: Stopping of discovering was successful'))
      .catch(err =>
        console.error(
          ' MTL: Something is gone wrong. Maybe your WiFi is disabled? Error details',
          err,
        ),
      );
  };

  onStartInvestigate = () => {
    startDiscoveringPeers()
      .then(status =>
        console.log(
          ' MTL: startDiscoveringPeers',
          `Status of discovering peers: ${status}`,
        ),
      )
      .catch(err =>
        console.error(
          ` MTL: Something is gone wrong. Maybe your WiFi is disabled? Error details: ${err}`,
        ),
      );
  };

  onGetAvailableDevices = () => {
    getAvailablePeers().then(peers => console.log(` MTL: ${peers}`));
  };

  onSendFile = () => {
    //const url = '/storage/sdcard0/Music/Rammstein:Amerika.mp3';
    const url =
      '/storage/emulated/0/Music/Bullet For My Valentine:Letting You Go.mp3';
    PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      {
        title: 'Access to read',
        message: 'READ_EXTERNAL_STORAGE',
      },
    )
      .then(granted => {
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log(' MTL: You can use the storage');
        } else {
          console.log(' MTL: Storage permission denied');
        }
      })
      .then(() => {
        return PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Access to write',
            message: 'WRITE_EXTERNAL_STORAGE',
          },
        );
      })
      .then(() => {
        return sendFile(url)
          .then(metaInfo =>
            console.log(' MTL: File sent successfully', metaInfo),
          )
          .catch(err => console.log(' MTL: Error while file sending', err));
      })
      .catch(err => console.log(` MTL: ${err}`));
  };

  onReceiveFile = () => {
    PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      {
        title: 'Access to read',
        message: 'READ_EXTERNAL_STORAGE',
      },
    )
      .then(granted => {
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log(' MTL: You can use the storage');
        } else {
          console.log(' MTL: Storage permission denied');
        }
      })
      .then(() => {
        return PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Access to write',
            message: 'WRITE_EXTERNAL_STORAGE',
          },
        );
      })
      .then(() => {
        return receiveFile(
          '/storage/emulated/0/Music/',
          'BFMV:Letting You Go.mp3',
        )
          .then(() => console.log(' MTL: File received successfully'))
          .catch(err => console.log(' MTL: Error while file receiving', err));
      })
      .catch(err => console.log(` MTL: ${err}`));
  };

  onSendMessage = () => {
    sendMessage('Hello world!')
      .then(metaInfo =>
        console.log(' MTL: Message sent successfully', metaInfo),
      )
      .catch(err => console.log(' MTL: Error while message sending', err));
  };

  onReceiveMessage = () => {
    receiveMessage()
      .then(msg => console.log(' MTL: Message received successfully', msg))
      .catch(err => console.log(' MTL: Error while message receiving', err));
  };

  onGetConnectionInfo = () => {
    getConnectionInfo().then(info =>
      console.log(' MTL: getConnectionInfo', info),
    );
  };

  onGetGroupInfo = () => {
    getGroupInfo().then(info => console.log(' MTL: getGroupInfo', info));
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.buttonDirection}>
          <Button
            title={'settings'}
            onPress={() => {
              activityStarter.navigateToSetting();
            }}
          />
          <View style={{width: 50}} />
          <Button
            title={'discoverPeers'}
            onPress={() => {
              console.log('MTL: discoverPeers clicked.');
            }}
          />
        </View>

        <Text>{'ME'}</Text>
        {ItemDivider()}
        {devInfo()}

        <Text> {'PEERS'} </Text>
        {ItemDivider()}
        <FlatList
          style={{flex: 1}}
          data={this.state.data}
          renderItem={({item}) => <Item item={item} />}
          keyExtractor={item => item.email}
        />
      </View>
    );

    /*return (
      <View style={styles.container}>
        <Button title="beginFindPeers" onPress={this.beginFindPeers} />
        <View style={styles.button} />
        <Button title="Connect" onPress={this.connectToFirstDevice} />
        <View style={styles.button} />
        <Button title="Cancel connect" onPress={this.onCancelConnect} />
        <View style={styles.button} />
        <Button title="Create group" onPress={this.onCreateGroup} />
        <View style={styles.button} />
        <Button title="Remove group" onPress={this.onRemoveGroup} />
        <View style={styles.button} />
        <Button title="Investigate" onPress={this.onStartInvestigate} />
        <View style={styles.button} />
        <Button
          title="Prevent Investigation"
          onPress={this.onStopInvestigation}
        />
        <View style={styles.button} />
        <Button
          title="Get Available Devices"
          onPress={this.onGetAvailableDevices}
        />
        <View style={styles.button} />
        <Button
          title="Get connection Info"
          onPress={this.onGetConnectionInfo}
        />
        <View style={styles.button} />
        <Button title="Get group info" onPress={this.onGetGroupInfo} />
        <View style={styles.button} />
        <Button title="Send file" onPress={this.onSendFile} />
        <View style={styles.button} />
        <Button title="Receive file" onPress={this.onReceiveFile} />
        <View style={styles.button} />
        <Button title="Send message" onPress={this.onSendMessage} />
        <View style={styles.button} />
        <Button title="Receive message" onPress={this.onReceiveMessage} />
      </View>
    );*/
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
    marginTop: 20,
  },
  button: {
    height: 1,
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },

  buttonDirection: {
    flexDirection: 'row',
    justifyContent: 'center',
  },

  buttonPad: {
    marginRight: 50,
  },
  listItem: {
    margin: 10,
    padding: 10,
    backgroundColor: '#FFF',
    width: '80%',
    flex: 1,
    alignSelf: 'center',
    flexDirection: 'row',
    borderRadius: 5,
  },
  devinfo: {
    margin: 10,
    padding: 10,
    backgroundColor: '#FFF',
    width: '80%',
    alignSelf: 'center',
    flexDirection: 'row',
    borderRadius: 5,
  },
});
