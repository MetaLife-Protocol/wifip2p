import React, {PureComponent} from 'react';
import {StyleSheet, View, Button} from 'react-native';
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

type Props = {};
export default class App extends PureComponent<Props> {
  state = {
    devices: [],
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
          ? 'You can use the p2p mode'
          : 'Permission denied: p2p mode will not work',
      );

      subscribeOnPeersUpdates(this.handleNewPeers);
      subscribeOnConnectionInfoUpdates(this.handleNewInfo);
      subscribeOnThisDeviceChanged(this.handleThisDeviceChanged);

      const status = await startDiscoveringPeers();
      status.promise
        .then(() => {
          console.log('startDiscoveringPeers ok: ');
        })
        .catch((err: any) => {
          console.log('startDiscoveringPeers err: ', err);
        });
      console.log('startDiscoveringPeers status: ', status);
    } catch (e) {
      console.error(e);
    }
  }

  componentWillUnmount() {
    unsubscribeFromConnectionInfoUpdates(this.handleNewInfo);
    unsubscribeFromPeersUpdates(this.handleNewPeers);
    unsubscribeFromThisDeviceChanged(this.handleThisDeviceChanged);
  }

  handleNewInfo = info => {
    console.log('OnConnectionInfoUpdated', info);
  };

  handleNewPeers = ({devices}) => {
    console.log('OnPeersUpdated', devices);
    this.setState({devices: devices});
  };

  handleThisDeviceChanged = groupInfo => {
    console.log('THIS_DEVICE_CHANGED_ACTION', groupInfo);
  };

  connectToFirstDevice = () => {
    console.log('Connect to: ', this.state.devices[0]);
    connect(this.state.devices[0].deviceAddress)
      .then(() => console.log('Successfully connected'))
      .catch(err => console.error('Something gone wrong. Details: ', err));
  };

  onCancelConnect = () => {
    cancelConnect()
      .then(() =>
        console.log('cancelConnect', 'Connection successfully canceled'),
      )
      .catch(err =>
        console.error('cancelConnect', 'Something gone wrong. Details: ', err),
      );
  };

  onCreateGroup = () => {
    createGroup()
      .then(() => console.log('Group created successfully!'))
      .catch(err => console.error('Something gone wrong. Details: ', err));
  };

  onRemoveGroup = () => {
    removeGroup()
      .then(() => console.log("Currently you don't belong to group!"))
      .catch(err => console.error('Something gone wrong. Details: ', err));
  };

  onStopInvestigation = () => {
    stopDiscoveringPeers()
      .then(() => console.log('Stopping of discovering was successful'))
      .catch(err =>
        console.error(
          'Something is gone wrong. Maybe your WiFi is disabled? Error details',
          err,
        ),
      );
  };

  onStartInvestigate = () => {
    startDiscoveringPeers()
      .then(status =>
        console.log(
          'startDiscoveringPeers',
          `Status of discovering peers: ${status}`,
        ),
      )
      .catch(err =>
        console.error(
          `Something is gone wrong. Maybe your WiFi is disabled? Error details: ${err}`,
        ),
      );
  };

  onGetAvailableDevices = () => {
    getAvailablePeers().then(peers => console.log(peers));
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
          console.log('You can use the storage');
        } else {
          console.log('Storage permission denied');
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
          .then(metaInfo => console.log('File sent successfully', metaInfo))
          .catch(err => console.log('Error while file sending', err));
      })
      .catch(err => console.log(err));
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
          console.log('You can use the storage');
        } else {
          console.log('Storage permission denied');
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
          .then(() => console.log('File received successfully'))
          .catch(err => console.log('Error while file receiving', err));
      })
      .catch(err => console.log(err));
  };

  onSendMessage = () => {
    sendMessage('Hello world!')
      .then(metaInfo => console.log('Message sent successfully', metaInfo))
      .catch(err => console.log('Error while message sending', err));
  };

  onReceiveMessage = () => {
    receiveMessage()
      .then(msg => console.log('Message received successfully', msg))
      .catch(err => console.log('Error while message receiving', err));
  };

  onGetConnectionInfo = () => {
    getConnectionInfo().then(info => console.log('getConnectionInfo', info));
  };

  onGetGroupInfo = () => {
    getGroupInfo().then(info => console.log('getGroupInfo', info));
  };

  render() {
    return (
      <View style={styles.container}>
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
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
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
});
